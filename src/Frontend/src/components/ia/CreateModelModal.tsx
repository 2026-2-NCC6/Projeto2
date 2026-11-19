import React, { useEffect, useState } from 'react';
import { Modal, Text, TextInput, View } from 'react-native';

import { styles } from '@/components/ia/CreateModelModal.styles';
import { PrimaryButton } from '@/components/ui/GlassCard';
import { GlassSelectBox } from '@/components/ui/GlassSelectBox';
import { useCriarProjetoModeloIA, useEsportesDataLab } from '@/hooks';
import type { ProjetoModelo } from '@/types/api';

interface CreateModelModalProps {
  visivel: boolean;
  onFechar: () => void;
  onCriado: (novoProjeto: ProjetoModelo) => void;
}

export function CreateModelModal({
  visivel,
  onFechar,
  onCriado,
}: CreateModelModalProps) {
  const { data: esportes } = useEsportesDataLab();
  const criarMutation = useCriarProjetoModeloIA();

  const [nome, setNome] = useState('');
  const [esporteId, setEsporteId] = useState('tenis');
  const [modeloId, setModeloId] = useState('');
  const [descricao, setDescricao] = useState('');

  // Sincroniza o primeiro esporte disponível
  useEffect(() => {
    if (esportes && esportes.length > 0 && !esportes.some((e) => e.id === esporteId)) {
      setEsporteId(esportes[0].id);
    }
  }, [esportes, esporteId]);

  // Limpa campos ao abrir
  useEffect(() => {
    if (visivel) {
      setNome('');
      setModeloId('');
      setDescricao('');
    }
  }, [visivel]);

  function gerarSlug(texto: string, esp: string): string {
    const limpo = texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    if (!limpo) return `flux_${esp}`;
    return limpo.startsWith('flux_') ? limpo : `flux_${limpo}`;
  }

  function handleNomeChange(novoNome: string) {
    setNome(novoNome);
    setModeloId(gerarSlug(novoNome, esporteId));
  }

  function handleEsporteChange(novoEsporte: string) {
    setEsporteId(novoEsporte);
    if (!nome.trim()) {
      setModeloId(`flux_${novoEsporte}`);
    } else {
      setModeloId(gerarSlug(nome, novoEsporte));
    }
  }

  async function handleSalvar() {
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) return;

    const idFinal = modeloId.trim() || gerarSlug(nomeLimpo, esporteId);

    try {
      const res = await criarMutation.mutateAsync({
        modelo_id: idFinal,
        nome: nomeLimpo,
        esporte_id: esporteId,
        descricao: descricao.trim() || `Classificador de movimentos para ${esporteId}`,
        classes_alvo: [],
      });
      onCriado(res);
      onFechar();
    } catch {
      // Falha tratada pela UI
    }
  }

  const opcoesEsporte = (esportes && esportes.length > 0
    ? esportes.map((e) => ({ label: `${e.icone ? `${e.icone} ` : ''}${e.nome}`, value: e.id }))
    : [
        { label: '🎾 Tênis', value: 'tenis' },
        { label: '🏸 Padel', value: 'padel' },
        { label: '🏓 Beach Tennis', value: 'beach_tennis' },
      ]);

  return (
    <Modal
      visible={visivel}
      transparent
      animationType="fade"
      onRequestClose={onFechar}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <Text style={styles.tag}>{'NOVO MODELO DE IA'}</Text>
            <Text style={styles.title}>{'Criar Projeto de Modelo'}</Text>
            <Text style={styles.subtitle}>
              {'Configure o esporte e identificador do modelo para receber dados.'}
            </Text>
          </View>

          {/* NOME DO MODELO */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>{'Nome do Modelo:'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Classificador de Padel Pro"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              value={nome}
              onChangeText={handleNomeChange}
              autoFocus
            />
          </View>

          {/* SELEÇÃO DO ESPORTE */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>{'Esporte / Modalidade:'}</Text>
            <GlassSelectBox
              valor={esporteId}
              opcoes={opcoesEsporte}
              onSelect={handleEsporteChange}
              placeholder="Selecione o esporte"
            />
          </View>

          {/* SLUG / ID DO MODELO */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>{'Identificador do Modelo (ID / Pasta):'}</Text>
            <TextInput
              style={styles.input}
              placeholder="flux_padel_v1"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              value={modeloId}
              onChangeText={setModeloId}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.idPreviewRow}>
              <Text style={styles.idPreviewText}>
                {'Diretório MLOps: '}
                <Text style={styles.idHighlight}>{`storage/models/${modeloId || '...'}/`}</Text>
              </Text>
            </View>
          </View>

          {/* DESCRIÇÃO OPCIONAL */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>{'Descrição / Propósito (opcional):'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Reconhece golpes como Bandeja, Vibora e Smash"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              value={descricao}
              onChangeText={setDescricao}
            />
          </View>

          {/* AÇÕES */}
          <View style={styles.actionsRow}>
            <View style={styles.actionCol}>
              <PrimaryButton
                label="Cancelar"
                variant="ghost"
                onPress={onFechar}
              />
            </View>
            <View style={styles.actionCol}>
              <PrimaryButton
                label={criarMutation.isPending ? 'Criando...' : 'Criar Modelo'}
                variant="primary"
                disabled={!nome.trim() || criarMutation.isPending}
                loading={criarMutation.isPending}
                onPress={handleSalvar}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}


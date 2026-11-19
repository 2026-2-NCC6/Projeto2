import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AddAgentModal } from '@/components/ia/AddAgentModal';
import { AddOptionModal } from '@/components/ia/AddOptionModal';
import { styles } from '@/components/ia/DataLabSetupCard.styles';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassSelectBox } from '@/components/ui/GlassSelectBox';
import {
  useAgentesDataLab,
  useArticulacoesDataLab,
  useCriarAgenteDataLab,
  useCriarMovimentoDataLab,
  useEsportesDataLab,
  useMovimentosDataLab,
} from '@/hooks';
import type { AgenteTesteCreate } from '@/types/api';

interface DataLabSetupCardProps {
  estaConectado: boolean;
  estaConectando?: boolean;
  onConectarDispositivo?: () => void;
  esporteId?: string;
  setEsporteId?: (id: string) => void;
  agenteId?: string;
  setAgenteId?: (id: string) => void;
  articulacaoId?: string;
  setArticulacaoId?: (id: string) => void;
  posicaoLateralidade?: 'direita' | 'esquerda' | 'central';
  setPosicaoLateralidade?: (pos: 'direita' | 'esquerda' | 'central') => void;
  movimentoId?: string;
  setMovimentoId?: (id: string) => void;
  modo?: 'pontual' | 'continuo';
  setModo?: (modo: 'pontual' | 'continuo') => void;
  duracaoMs?: number;
  setDuracaoMs?: (duracao: number) => void;
  onIniciarGravacao?: () => void;
}

const OPCOES_DURACAO = [
  { label: '1.0 segundo (20 frames @ 20Hz)', value: '1000' },
  { label: '1.5 segundos (30 frames @ 20Hz)', value: '1500' },
  { label: '2.0 segundos (40 frames @ 20Hz)', value: '2000' },
  { label: '3.0 segundos (60 frames @ 20Hz)', value: '3000' },
];

export function DataLabSetupCard({
  estaConectado,
  estaConectando,
  onConectarDispositivo,
  esporteId: esporteIdProp,
  setEsporteId: setEsporteIdProp,
  agenteId: agenteIdProp,
  setAgenteId: setAgenteIdProp,
  articulacaoId: articulacaoIdProp,
  setArticulacaoId: setArticulacaoIdProp,
  posicaoLateralidade: posicaoLateralidadeProp,
  setPosicaoLateralidade: setPosicaoLateralidadeProp,
  movimentoId: movimentoIdProp,
  setMovimentoId: setMovimentoIdProp,
  modo: modoProp,
  setModo: setModoProp,
  duracaoMs: duracaoMsProp,
  setDuracaoMs: setDuracaoMsProp,
  onIniciarGravacao,
}: DataLabSetupCardProps) {
  const router = useRouter();

  // Estado de recolher/expandir o painel
  const [expandido, setExpandido] = useState(true);

  // Queries
  const { data: listaEsportes } = useEsportesDataLab();
  const { data: listaArticulacoes } = useArticulacoesDataLab();
  const { data: listaAgentes } = useAgentesDataLab();

  // Estados locais
  const [localEsporteId, setLocalEsporteId] = useState('tenis');
  const esporteId = esporteIdProp !== undefined ? esporteIdProp : localEsporteId;
  const setEsporteId = setEsporteIdProp || setLocalEsporteId;

  const { data: listaMovimentos } = useMovimentosDataLab(esporteId);

  const [localAgenteId, setLocalAgenteId] = useState('dev-agente-01');
  const agenteId = agenteIdProp !== undefined ? agenteIdProp : localAgenteId;
  const setAgenteId = setAgenteIdProp || setLocalAgenteId;

  const [localArticulacaoId, setLocalArticulacaoId] = useState('pulso');
  const articulacaoId = articulacaoIdProp !== undefined ? articulacaoIdProp : localArticulacaoId;
  const setArticulacaoId = setArticulacaoIdProp || setLocalArticulacaoId;

  const [localPosicao, setLocalPosicao] = useState<'direita' | 'esquerda' | 'central'>('direita');
  const posicaoLateralidade = posicaoLateralidadeProp !== undefined ? posicaoLateralidadeProp : localPosicao;
  const setPosicaoLateralidade = setPosicaoLateralidadeProp || setLocalPosicao;

  const [localMovimentoId, setLocalMovimentoId] = useState('tenis_forehand');
  const movimentoId = movimentoIdProp !== undefined ? movimentoIdProp : localMovimentoId;
  const setMovimentoId = setMovimentoIdProp || setLocalMovimentoId;

  const [localModo, setLocalModo] = useState<'pontual' | 'continuo'>('continuo');
  const modo = modoProp !== undefined ? modoProp : localModo;
  const setModo = setModoProp || setLocalModo;

  const [localDuracao, setLocalDuracao] = useState(1500);
  const duracaoMs = duracaoMsProp !== undefined ? duracaoMsProp : localDuracao;
  const setDuracaoMs = setDuracaoMsProp || setLocalDuracao;

  // Controle de camadas das selectboxes
  const [selectAbertoId, setSelectAbertoId] = useState<string | null>(null);

  // Modais de criação rápida
  const [modalTipo, setModalTipo] = useState<'movimento' | 'agente' | null>(null);

  // Mutations
  const criarMovimentoMutation = useCriarMovimentoDataLab();
  const criarAgenteMutation = useCriarAgenteDataLab();

  // Sincroniza primeiro agente
  useEffect(() => {
    if (listaAgentes && listaAgentes.length > 0 && !agenteId) {
      setAgenteId(listaAgentes[0].id);
    }
  }, [listaAgentes, agenteId]);

  // Sincroniza primeiro movimento ao trocar de esporte
  useEffect(() => {
    if (listaMovimentos && listaMovimentos.length > 0) {
      const primeiro = listaMovimentos[0];
      setMovimentoId(primeiro.id);
    }
  }, [listaMovimentos]);

  // Regra de lateralidade
  useEffect(() => {
    const art = listaArticulacoes?.find((a) => a.id === articulacaoId);
    if (art && !art.possui_lateralidade) {
      setPosicaoLateralidade('central');
    } else if (posicaoLateralidade === 'central') {
      setPosicaoLateralidade('direita');
    }
  }, [articulacaoId, listaArticulacoes, posicaoLateralidade]);

  async function handleCriarMovimento(nome: string) {
    try {
      const novo = await criarMovimentoMutation.mutateAsync({
        nome,
        esporte_id: esporteId,
        articulacao_padrao_id: articulacaoId,
      });
      setMovimentoId(novo.id);
      setModalTipo(null);
    } catch {
      setModalTipo(null);
    }
  }

  async function handleCriarAgente(dados: AgenteTesteCreate) {
    try {
      const novo = await criarAgenteMutation.mutateAsync(dados);
      setAgenteId(novo.id);
      setModalTipo(null);
    } catch {
      setModalTipo(null);
    }
  }

  // Prepara opções normalizadas
  const opcoesAgentes = (listaAgentes || []).map((ag) => ({
    label: `${ag.nome} (${ag.altura_cm}cm, ${ag.peso_kg}kg)`,
    value: ag.id,
  }));

  const opcoesArticulacoes = (listaArticulacoes || []).map((art) => ({
    label: `${art.icone ? `${art.icone} ` : ''}${art.nome}`,
    value: art.id,
  }));

  const articulacaoAtual = listaArticulacoes?.find((a) => a.id === articulacaoId);
  const temLateralidade = articulacaoAtual ? articulacaoAtual.possui_lateralidade : true;

  const opcoesLateralidade = [
    { label: 'Direita (Destro / Lado Direito)', value: 'direita' },
    { label: 'Esquerda (Canhoto / Lado Esquerdo)', value: 'esquerda' },
    { label: 'Central (Sem lateralidade)', value: 'central' },
  ];

  const opcoesMovimentos = (listaMovimentos || []).map((m) => ({
    label: m.nome,
    value: m.id,
  }));

  const esporteNome =
    listaEsportes?.find((e) => e.id === esporteId)?.nome ||
    (esporteId === 'tenis'
      ? 'Tênis'
      : esporteId === 'padel'
        ? 'Padel'
        : esporteId === 'beach_tennis'
          ? 'Beach Tennis'
          : esporteId.toUpperCase());

  const movimentoNome = listaMovimentos?.find((m) => m.id === movimentoId)?.nome || 'Golpe';
  const agenteNome = listaAgentes?.find((a) => a.id === agenteId)?.nome || 'Atleta Teste';

  return (
    <GlassCard highlighted style={styles.card}>
      {/* CABEÇALHO CLICÁVEL (RETRÁTIL) */}
      <Pressable
        onPress={() => setExpandido(!expandido)}
        style={styles.headerPressable}
        accessibilityRole="button"
        accessibilityLabel="Recolher ou expandir configurador de amostras biomecânicas">
        <View style={styles.headerLeft}>
          <Text style={styles.sectionTitle}>⚙️ CONFIGURADOR DE AMOSTRAS BIOMECÂNICAS</Text>
        </View>

        <View style={styles.headerRight}>
          {!expandido ? (
            <Text style={styles.collapsedSummary} numberOfLines={1}>
              {`${esporteNome} • ${movimentoNome}`}
            </Text>
          ) : null}

          <View style={styles.toggleBadge}>
            <Text style={styles.toggleBadgeText}>
              {expandido ? '▲' : '▼'}
            </Text>
          </View>
        </View>
      </Pressable>

      {/* CORPO EXPANSÍVEL */}
      {expandido ? (
        <View style={styles.bodyContainer}>
          <Text style={styles.descriptionText}>
            {'Defina os parâmetros fixos corporais e do golpe para alimentar a sessão de gravação.'}
          </Text>

          {/* INDICADOR DO ESPORTE VINCULADO AO MODELO (NÃO EDITÁVEL AQUI, POIS VEM DO MODELO ATIVO) */}
          <View style={styles.sportLockedBadge}>
            <View style={styles.sportLockedLeft}>
              <Text style={styles.sportLockedIcon}>
                {esporteId === 'tenis'
                  ? '🎾'
                  : esporteId === 'padel'
                    ? '🏸'
                    : esporteId === 'beach_tennis'
                      ? '🏓'
                      : '⚽'}
              </Text>
              <Text style={styles.sportLockedLabel}>{'Modalidade Esportiva:'}</Text>
              <Text style={styles.sportLockedValue}>{esporteNome}</Text>
            </View>
            <Text style={styles.sportLockedHint}>{'🔒 Vinculado ao modelo de IA ativo'}</Text>
          </View>

          {/* Tipo de Modo de Gravação */}
          <View style={styles.modeSelectionContainer}>
            <Text style={styles.modeLabel}>MODALIDADE DA SESSÃO DE GRAVAÇÃO</Text>
            <View style={styles.modeButtonsRow}>
              <Pressable
                onPress={() => setModo('continuo')}
                style={[styles.modeButton, modo === 'continuo' && styles.modeButtonActive]}>
                <Text
                  style={[
                    styles.modeButtonText,
                    modo === 'continuo' && styles.modeButtonTextActive,
                  ]}>
                  🌊 Fluxo Contínuo & Osciloscópio
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setModo('pontual')}
                style={[styles.modeButton, modo === 'pontual' && styles.modeButtonActive]}>
                <Text
                  style={[
                    styles.modeButtonText,
                    modo === 'pontual' && styles.modeButtonTextActive,
                  ]}>
                  ⏱️ Janela Fixa (1s a 3s)
                </Text>
              </Pressable>
            </View>
          </View>

          {/* SelectBoxes em Coluna Vertical (Agente, Articulação, Lateralidade, Golpe, Duração) */}
          <View style={styles.selectStack}>
            {/* 1. Agente de Teste */}
            <View
              style={[
                styles.selectItemWrapper,
                selectAbertoId === 'agente' ? styles.selectItemElevated : styles.selectItem1,
              ]}>
              <GlassSelectBox
                label="AGENTE DE TESTE / PERFIL CORPORAL"
                valor={agenteId}
                opcoes={opcoesAgentes}
                icone="👤"
                onSelect={setAgenteId}
                aberto={selectAbertoId === 'agente'}
                onToggleAberto={(open) => setSelectAbertoId(open ? 'agente' : null)}
                onAdicionarNovo={() => setModalTipo('agente')}
                labelAdicionarNovo="Novo Agente (Ficha Corporal)"
              />
            </View>

            {/* 2. Articulação */}
            <View
              style={[
                styles.selectItemWrapper,
                selectAbertoId === 'articulacao' ? styles.selectItemElevated : styles.selectItem2,
              ]}>
              <GlassSelectBox
                label="LOCAL DO WEARABLE (ARTICULAÇÃO)"
                valor={articulacaoId}
                opcoes={opcoesArticulacoes}
                icone="📍"
                onSelect={setArticulacaoId}
                aberto={selectAbertoId === 'articulacao'}
                onToggleAberto={(open) => setSelectAbertoId(open ? 'articulacao' : null)}
              />
            </View>

            {/* 3. Lateralidade */}
            <View
              style={[
                styles.selectItemWrapper,
                selectAbertoId === 'lateralidade' ? styles.selectItemElevated : styles.selectItem3,
              ]}>
              <GlassSelectBox
                label={temLateralidade ? 'POSIÇÃO / LATERALIDADE' : 'POSIÇÃO CORPORAL (FIXO)'}
                valor={posicaoLateralidade}
                opcoes={opcoesLateralidade}
                icone="✋"
                onSelect={(val) => setPosicaoLateralidade(val as any)}
                aberto={selectAbertoId === 'lateralidade'}
                onToggleAberto={(open) => setSelectAbertoId(open ? 'lateralidade' : null)}
                disabled={!temLateralidade}
              />
            </View>

            {/* 4. Movimento / Golpe */}
            <View
              style={[
                styles.selectItemWrapper,
                selectAbertoId === 'movimento' ? styles.selectItemElevated : styles.selectItem4,
              ]}>
              <GlassSelectBox
                label={`GOLPE / MOVIMENTO (${esporteNome.toUpperCase()})`}
                valor={movimentoId}
                opcoes={opcoesMovimentos}
                icone="⚡"
                onSelect={setMovimentoId}
                aberto={selectAbertoId === 'movimento'}
                onToggleAberto={(open) => setSelectAbertoId(open ? 'movimento' : null)}
                onAdicionarNovo={() => setModalTipo('movimento')}
                labelAdicionarNovo={`Novo Golpe em ${esporteNome}`}
              />
            </View>

            {/* 5. Janela Temporal (apenas no modo pontual) */}
            {modo === 'pontual' ? (
              <View
                style={[
                  styles.selectItemWrapper,
                  selectAbertoId === 'duracao' ? styles.selectItemElevated : styles.selectItem5,
                ]}>
                <GlassSelectBox
                  label="JANELA TEMPORAL"
                  valor={String(duracaoMs)}
                  opcoes={OPCOES_DURACAO}
                  icone="⏱️"
                  onSelect={(val) => setDuracaoMs(Number(val))}
                  aberto={selectAbertoId === 'duracao'}
                  onToggleAberto={(open) => setSelectAbertoId(open ? 'duracao' : null)}
                />
              </View>
            ) : null}
          </View>

          {/* Resumo Dinâmico do Alvo */}
          <View style={styles.summaryFooter}>
            <Text style={styles.summaryTitle}>RESUMO DO SETUP:</Text>
            <Text style={styles.summaryText}>
              {`${agenteNome} • ${esporteNome} • ${articulacaoAtual?.nome || 'Pulso'} (${posicaoLateralidade}) ➔ ${movimentoNome} (${modo === 'continuo' ? 'Fluxo Contínuo Livre' : `${duracaoMs} ms`})`}
            </Text>
          </View>

          {/* Modais de Cadastro Rápido */}
          <AddAgentModal
            visivel={modalTipo === 'agente'}
            onConfirmar={handleCriarAgente}
            onFechar={() => setModalTipo(null)}
            salvando={criarAgenteMutation.isPending}
          />

          <AddOptionModal
            visivel={modalTipo === 'movimento'}
            tag={`NOVO GOLPE / MOVIMENTO (${esporteNome.toUpperCase()})`}
            titulo={`Adicionar Movimento em ${esporteNome}`}
            subtitulo={`Cadastre uma classe de golpe para o esporte ${esporteNome}.`}
            placeholder="Nome do movimento"
            onConfirmar={handleCriarMovimento}
            onFechar={() => setModalTipo(null)}
          />
        </View>
      ) : null}
    </GlassCard>
  );
}

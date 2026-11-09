import React, { useEffect, useState } from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';

import { styles } from '@/components/treino/CreateCircuitModal.styles';
import type { CircuitoSessaoAtiva } from '@/components/treino/SessionCircuitsList';
import { GlassCard, PrimaryButton } from '@/components/ui/GlassCard';
import { TimeUnitSelect, type UnidadeTempo } from '@/components/ui/TimeUnitSelect';
import { FluxColors } from '@/constants/theme';

export type ModoCircuito = 'numero_golpes' | 'tempo_frequencia';

interface CreateCircuitModalProps {
  visivel: boolean;
  proximoNumeroRodada: number;
  circuitoEditando?: CircuitoSessaoAtiva | null;
  onFechar: () => void;
  onAdicionarAoPlano: (circuitoPlanejado: CircuitoSessaoAtiva) => void;
  onSalvarEdicao?: (circuitoAtualizado: CircuitoSessaoAtiva) => void;
  onClicarSequenciaPreDefinida: () => void;
}

export function CreateCircuitModal({
  visivel,
  proximoNumeroRodada,
  circuitoEditando = null,
  onFechar,
  onAdicionarAoPlano,
  onSalvarEdicao,
  onClicarSequenciaPreDefinida,
}: CreateCircuitModalProps) {
  const [modo, setModo] = useState<ModoCircuito>('numero_golpes');
  const [qtdGolpesInput, setQtdGolpesInput] = useState('10');
  const [tempoValorInput, setTempoValorInput] = useState('30');
  const [unidadeTempo, setUnidadeTempo] = useState<UnidadeTempo>('seg');
  const [frequenciaMinInput, setFrequenciaMinInput] = useState('20');
  const [erroValidacao, setErroValidacao] = useState<string | null>(null);

  useEffect(() => {
    if (!visivel) return;
    setErroValidacao(null);

    if (circuitoEditando) {
      setModo(circuitoEditando.modo_definicao);
      if (circuitoEditando.modo_definicao === 'numero_golpes') {
        setQtdGolpesInput(String(circuitoEditando.meta_golpes ?? 10));
      } else {
        const segTotais = circuitoEditando.meta_tempo_segundos ?? 30;
        if (
          circuitoEditando.meta_tempo_rotulo?.endsWith('min') ||
          (segTotais >= 60 && segTotais % 60 === 0)
        ) {
          setUnidadeTempo('min');
          setTempoValorInput(String(Math.round(segTotais / 60)));
        } else {
          setUnidadeTempo('seg');
          setTempoValorInput(String(segTotais));
        }
        setFrequenciaMinInput(String(circuitoEditando.meta_frequencia_min ?? 20));
      }
    } else {
      setModo('numero_golpes');
      setQtdGolpesInput('10');
      setTempoValorInput('30');
      setUnidadeTempo('seg');
      setFrequenciaMinInput('20');
    }
  }, [visivel, circuitoEditando]);

  if (!visivel) return null;

  const isEdicao = Boolean(circuitoEditando);
  const numeroExibido = circuitoEditando
    ? circuitoEditando.numero_rodada
    : proximoNumeroRodada;

  function handleConfirmarPlano() {
    setErroValidacao(null);

    let metaGolpes: number | undefined;
    let metaTempoSegundos: number | undefined;
    let metaTempoRotulo: string | undefined;
    let metaFrequenciaMin: number | undefined;

    if (modo === 'numero_golpes') {
      const nGolpes = parseInt(qtdGolpesInput, 10);
      if (isNaN(nGolpes) || nGolpes <= 0 || nGolpes > 200) {
        setErroValidacao('Informe um número válido de golpes (entre 1 e 200).');
        return;
      }
      metaGolpes = nGolpes;
    } else {
      const valorTempo = parseInt(tempoValorInput, 10);
      const freqMin = parseInt(frequenciaMinInput, 10);

      if (isNaN(valorTempo) || valorTempo <= 0) {
        setErroValidacao('Informe um valor de tempo válido para o circuito.');
        return;
      }

      const tempoSeg = unidadeTempo === 'min' ? valorTempo * 60 : valorTempo;
      if (tempoSeg < 5 || tempoSeg > 3600) {
        setErroValidacao('O tempo do circuito deve ficar entre 5 seg e 60 min.');
        return;
      }
      if (isNaN(freqMin) || freqMin <= 0 || freqMin > 120) {
        setErroValidacao(
          'Informe uma frequência válida (entre 1 e 120 golpes/min).'
        );
        return;
      }

      metaTempoSegundos = tempoSeg;
      metaTempoRotulo = `${valorTempo} ${unidadeTempo}`;
      metaFrequenciaMin = freqMin;
      metaGolpes = Math.max(1, Math.round((tempoSeg / 60) * freqMin));
    }

    if (circuitoEditando && onSalvarEdicao) {
      onSalvarEdicao({
        ...circuitoEditando,
        modo_definicao: modo,
        meta_golpes: metaGolpes,
        meta_tempo_segundos: metaTempoSegundos,
        meta_tempo_rotulo: metaTempoRotulo,
        meta_frequencia_min: metaFrequenciaMin,
      });
      return;
    }

    const circuitoPlanejado: CircuitoSessaoAtiva = {
      id: `circ-${proximoNumeroRodada}-${Date.now()}`,
      numero_rodada: proximoNumeroRodada,
      status: 'planejado',
      modo_definicao: modo,
      meta_golpes: metaGolpes,
      meta_tempo_segundos: metaTempoSegundos,
      meta_tempo_rotulo: metaTempoRotulo,
      meta_frequencia_min: metaFrequenciaMin,
      hora_inicio: '',
      hora_fim: '',
      tempo_total_segundos: 0,
      total_golpes: 0,
      frequencia_golpes_min: 0,
      percentual_acerto: 0,
      pontuacao: 0,
      golpes: [],
    };

    onAdicionarAoPlano(circuitoPlanejado);
  }

  return (
    <Modal
      visible={visivel}
      transparent
      animationType="fade"
      onRequestClose={onFechar}>
      <Pressable style={styles.backdrop} onPress={onFechar}>
        <Pressable
          style={styles.modalContainer}
          onPress={(e) => e.stopPropagation()}>
          <GlassCard highlighted style={styles.modalCard}>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.tag}>
                  PLANO DE TREINO • CIRCUITO #{numeroExibido}
                </Text>
                <Text style={styles.modalTitle}>
                  {isEdicao ? 'Editar Circuito' : 'Planejar Circuito'}
                </Text>
              </View>
              <Pressable onPress={onFechar} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </Pressable>
            </View>

            {/* Seletor das 2 Modalidades de Definição do Circuito */}
            <Text style={styles.fieldLabel}>MODO DE DEFINIÇÃO DO CIRCUITO</Text>
            <View style={styles.modeSelectorRow}>
              <Pressable
                onPress={() => {
                  setModo('numero_golpes');
                  setErroValidacao(null);
                }}
                style={[
                  styles.modeOption,
                  modo === 'numero_golpes' && styles.modeOptionActive,
                ]}>
                <Text style={styles.modeEmoji}>🎯</Text>
                <Text
                  style={[
                    styles.modeOptionTitle,
                    modo === 'numero_golpes' && styles.modeOptionTitleActive,
                  ]}>
                  Número de Golpes
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setModo('tempo_frequencia');
                  setErroValidacao(null);
                }}
                style={[
                  styles.modeOption,
                  modo === 'tempo_frequencia' && styles.modeOptionActive,
                ]}>
                <Text style={styles.modeEmoji}>⏱️</Text>
                <Text
                  style={[
                    styles.modeOptionTitle,
                    modo === 'tempo_frequencia' && styles.modeOptionTitleActive,
                  ]}>
                  Tempo + Frequência
                </Text>
              </Pressable>
            </View>

            {/* Campos Dinâmicos conforme a modalidade escolhida */}
            {modo === 'numero_golpes' ? (
              <View style={styles.inputsGroup}>
                <Text style={styles.fieldLabel}>META DE GOLPES DO CIRCUITO</Text>
                <TextInput
                  value={qtdGolpesInput}
                  onChangeText={setQtdGolpesInput}
                  keyboardType="numeric"
                  placeholder="Ex.: 10"
                  placeholderTextColor={FluxColors.textMuted}
                  style={styles.input}
                />
              </View>
            ) : (
              <View style={styles.tempoFreqGroup}>
                <View style={styles.timeFieldGroup}>
                  <Text style={styles.fieldLabel}>TEMPO DO CIRCUITO</Text>
                  <View style={styles.timeValueAndUnitRow}>
                    <TextInput
                      value={tempoValorInput}
                      onChangeText={setTempoValorInput}
                      keyboardType="numeric"
                      placeholder="Ex.: 30"
                      placeholderTextColor={FluxColors.textMuted}
                      style={[styles.input, styles.flexInput]}
                    />
                    <TimeUnitSelect
                      value={unidadeTempo}
                      onChange={setUnidadeTempo}
                    />
                  </View>
                </View>

                <View style={styles.freqFieldGroup}>
                  <Text style={styles.fieldLabel}>FREQUÊNCIA (GOLPES/MIN)</Text>
                  <TextInput
                    value={frequenciaMinInput}
                    onChangeText={setFrequenciaMinInput}
                    keyboardType="numeric"
                    placeholder="Ex.: 20"
                    placeholderTextColor={FluxColors.textMuted}
                    style={styles.input}
                  />
                </View>
              </View>
            )}

            {/* Opção futura: Adicionar Sequência Pré-definida */}
            <Pressable
              onPress={onClicarSequenciaPreDefinida}
              style={styles.presetSequenceBox}>
              <View style={styles.presetLeft}>
                <Text style={styles.presetIcon}>📋</Text>
                <View style={styles.presetTexts}>
                  <Text style={styles.presetTitle}>
                    Adicionar Sequência Pré-definida
                  </Text>
                  <Text style={styles.presetSub}>
                    Banco de sequências de golpes da plataforma e pessoal
                  </Text>
                </View>
              </View>
              <View style={styles.soonBadge}>
                <Text style={styles.soonBadgeText}>EM BREVE</Text>
              </View>
            </Pressable>

            {erroValidacao ? (
              <Text style={styles.errorText}>{erroValidacao}</Text>
            ) : null}

            <View style={styles.actionsRow}>
              <PrimaryButton
                label="Cancelar"
                variant="ghost"
                onPress={onFechar}
                style={styles.halfButton}
              />
              <PrimaryButton
                label={isEdicao ? 'Salvar Alterações' : 'Adicionar ao Plano'}
                variant="primary"
                onPress={handleConfirmarPlano}
                style={styles.halfButton}
              />
            </View>
          </GlassCard>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

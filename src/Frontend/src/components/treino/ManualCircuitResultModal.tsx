import React, { useEffect, useState } from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';

import { styles } from '@/components/treino/ManualCircuitResultModal.styles';
import type { CircuitoSessaoAtiva } from '@/components/treino/SessionCircuitsList';
import { GlassCard, PrimaryButton } from '@/components/ui/GlassCard';
import { TimeUnitSelect, type UnidadeTempo } from '@/components/ui/TimeUnitSelect';
import { FluxColors } from '@/constants/theme';

const TIPOS_GOLPE_OPCOES = [
  'Forehand',
  'Backhand',
  'Saque',
  'Smash',
  'Sequência Mista',
];

export interface DadosRegistroManualCiclo {
  totalGolpes: number;
  tempoTotalSegundos: number;
  tipoGolpePredominante: string;
  percentualAcerto: number;
  golpesAcertados?: number;
}

interface ManualCircuitResultModalProps {
  visivel: boolean;
  circuito: CircuitoSessaoAtiva | null;
  onFechar: () => void;
  onConfirmarRegistroManual: (
    idCircuito: string,
    dados: DadosRegistroManualCiclo
  ) => void;
}

export function ManualCircuitResultModal({
  visivel,
  circuito,
  onFechar,
  onConfirmarRegistroManual,
}: ManualCircuitResultModalProps) {
  const [golpesInput, setGolpesInput] = useState('10');
  const [tempoValorInput, setTempoValorInput] = useState('30');
  const [unidadeTempo, setUnidadeTempo] = useState<UnidadeTempo>('seg');
  const [tipoGolpe, setTipoGolpe] = useState('Forehand');
  const [informarAcertos, setInformarAcertos] = useState(false);
  const [golpesAcertadosInput, setGolpesAcertadosInput] = useState('8');
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!visivel || !circuito) return;
    setErro(null);

    const golpesIniciais =
      circuito.total_golpes > 0
        ? circuito.total_golpes
        : (circuito.meta_golpes ?? 10);
    setGolpesInput(String(golpesIniciais));

    const segBase =
      circuito.tempo_total_segundos > 0
        ? circuito.tempo_total_segundos
        : (circuito.meta_tempo_segundos ?? Math.max(15, golpesIniciais * 3));

    if (segBase >= 60 && segBase % 60 === 0) {
      setUnidadeTempo('min');
      setTempoValorInput(String(Math.round(segBase / 60)));
    } else {
      setUnidadeTempo('seg');
      setTempoValorInput(String(segBase));
    }

    if (circuito.percentual_acerto > 0 && circuito.total_golpes > 0) {
      setInformarAcertos(true);
      const acertosEstimados = Math.round(
        (circuito.percentual_acerto / 100) * circuito.total_golpes
      );
      setGolpesAcertadosInput(String(acertosEstimados));
    } else {
      setInformarAcertos(false);
      setGolpesAcertadosInput(
        String(Math.max(0, Math.round(golpesIniciais * 0.85)))
      );
    }

    setTipoGolpe(circuito.golpes[0]?.tipo_movimento ?? 'Forehand');
  }, [visivel, circuito]);

  if (!visivel || !circuito) return null;

  const tituloMeta =
    circuito.modo_definicao === 'numero_golpes'
      ? `Meta planejada: ${circuito.meta_golpes ?? 0} golpes`
      : `Meta planejada: ${
          circuito.meta_tempo_rotulo ?? `${circuito.meta_tempo_segundos ?? 0} seg`
        } • ${circuito.meta_frequencia_min ?? 0} golpes/min`;

  const totalGolpesPreview = Math.max(0, parseInt(golpesInput, 10) || 0);
  const acertosPreview = Math.max(0, parseInt(golpesAcertadosInput, 10) || 0);
  const excedeuLimiteGolpes =
    informarAcertos &&
    totalGolpesPreview > 0 &&
    acertosPreview > totalGolpesPreview;
  const percentualCalculadoPreview =
    informarAcertos && totalGolpesPreview > 0
      ? Math.min(100, Math.round((acertosPreview / totalGolpesPreview) * 100))
      : 0;

  function handleSalvar() {
    if (!circuito) return;
    setErro(null);

    const totalGolpes = parseInt(golpesInput, 10);
    const valorTempo = parseInt(tempoValorInput, 10);

    if (isNaN(totalGolpes) || totalGolpes <= 0 || totalGolpes > 500) {
      setErro('Informe o número de rodadas/golpes executados (entre 1 e 500).');
      return;
    }

    if (isNaN(valorTempo) || valorTempo <= 0) {
      setErro('Informe o tempo realizado válido para este ciclo.');
      return;
    }

    let percentualAcerto = 0;
    let golpesAcertados: number | undefined;

    if (informarAcertos) {
      const qtdAcertos = parseInt(golpesAcertadosInput, 10);
      if (isNaN(qtdAcertos) || qtdAcertos < 0) {
        setErro('Informe um valor válido de golpes acertados (0 ou mais).');
        return;
      }
      if (qtdAcertos > totalGolpes) {
        setErro(
          `O número de acertos (${qtdAcertos}) não pode exceder o limite de golpes totais (${totalGolpes}).`
        );
        return;
      }
      golpesAcertados = qtdAcertos;
      percentualAcerto = Math.round((qtdAcertos / totalGolpes) * 100);
    }

    const tempoTotalSegundos =
      unidadeTempo === 'min' ? valorTempo * 60 : valorTempo;

    onConfirmarRegistroManual(circuito.id, {
      totalGolpes,
      tempoTotalSegundos,
      tipoGolpePredominante: tipoGolpe,
      percentualAcerto,
      golpesAcertados,
    });
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
                <Text style={styles.tag}>REGISTRO MANUAL DO CICLO</Text>
                <Text style={styles.modalTitle}>Cadastrar Dados Executados</Text>
                <Text style={styles.metaSubtitle}>{tituloMeta}</Text>
              </View>
              <Pressable onPress={onFechar} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </Pressable>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                RODADAS / GOLPES TOTAIS EXECUTADOS
              </Text>
              <TextInput
                value={golpesInput}
                onChangeText={setGolpesInput}
                keyboardType="numeric"
                placeholder="Ex.: 80"
                placeholderTextColor={FluxColors.textMuted}
                style={styles.input}
              />
            </View>

            <View style={styles.timeFieldGroup}>
              <Text style={styles.fieldLabel}>TEMPO REALIZADO NO CICLO</Text>
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

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>GOLPE PREDOMINANTE EXECUTADO</Text>
              <View style={styles.strokeTypeRow}>
                {TIPOS_GOLPE_OPCOES.map((opcao) => {
                  const ativo = tipoGolpe === opcao;
                  return (
                    <Pressable
                      key={opcao}
                      onPress={() => setTipoGolpe(opcao)}
                      style={[
                        styles.strokeChip,
                        ativo && styles.strokeChipActive,
                      ]}>
                      <Text
                        style={[
                          styles.strokeChipText,
                          ativo && styles.strokeChipTextActive,
                        ]}>
                        {opcao}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Campo Opcional de Acertos com Checkbox e Valor Absoluto (ex.: 70 de 80) */}
            <View style={styles.fieldGroup}>
              <Pressable
                onPress={() => {
                  setInformarAcertos((prev) => !prev);
                  setErro(null);
                }}
                style={styles.optionalCheckboxRow}>
                <View style={styles.checkboxLeft}>
                  <View
                    style={[
                      styles.checkboxBox,
                      informarAcertos && styles.checkboxBoxChecked,
                    ]}>
                    {informarAcertos ? (
                      <Text style={styles.checkboxCheckmark}>✓</Text>
                    ) : null}
                  </View>
                  <Text style={styles.fieldLabel}>
                    INFORMAR GOLPES ACERTADOS (OPCIONAL)
                  </Text>
                </View>

                {informarAcertos && totalGolpesPreview > 0 ? (
                  <View style={styles.hitsRatioBadge}>
                    <Text style={styles.hitsRatioText}>
                      {acertosPreview} de {totalGolpesPreview} (
                      {percentualCalculadoPreview}%)
                    </Text>
                  </View>
                ) : null}
              </Pressable>

              <TextInput
                value={golpesAcertadosInput}
                onChangeText={setGolpesAcertadosInput}
                editable={informarAcertos}
                keyboardType="numeric"
                placeholder={
                  totalGolpesPreview > 0
                    ? `Ex.: ${Math.round(totalGolpesPreview * 0.85)} (máx. ${totalGolpesPreview})`
                    : 'Ex.: 70'
                }
                placeholderTextColor={FluxColors.textMuted}
                style={[
                  styles.input,
                  !informarAcertos && styles.inputDisabled,
                  excedeuLimiteGolpes && styles.inputInvalid,
                ]}
              />

              <Text
                style={[
                  styles.limitNoticeText,
                  excedeuLimiteGolpes && styles.limitNoticeDanger,
                ]}>
                ⚠️ O valor de acertos não pode exceder o limite de golpes totais
                ({totalGolpesPreview} golpes).
              </Text>
            </View>

            {erro ? <Text style={styles.errorText}>{erro}</Text> : null}

            <View style={styles.actionsRow}>
              <PrimaryButton
                label="Cancelar"
                variant="ghost"
                onPress={onFechar}
                style={styles.halfButton}
              />
              <PrimaryButton
                label="Salvar Ciclo"
                variant="primary"
                onPress={handleSalvar}
                style={styles.halfButton}
              />
            </View>
          </GlassCard>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

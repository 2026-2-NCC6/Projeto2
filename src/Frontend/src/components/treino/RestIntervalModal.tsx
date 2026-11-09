import React, { useState } from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';

import { styles } from '@/components/treino/RestIntervalModal.styles';
import { GlassCard, PrimaryButton } from '@/components/ui/GlassCard';
import { TimeUnitSelect, type UnidadeTempo } from '@/components/ui/TimeUnitSelect';
import { FluxColors } from '@/constants/theme';

interface RestIntervalModalProps {
  visivel: boolean;
  numeroCircuitoAnterior: number;
  onFechar: () => void;
  onSalvarIntervalo: (duracaoSegundos: number, textoFormatado: string) => void;
}

export function RestIntervalModal({
  visivel,
  numeroCircuitoAnterior,
  onFechar,
  onSalvarIntervalo,
}: RestIntervalModalProps) {
  const [valorTempo, setValorTempo] = useState('30');
  const [unidade, setUnidade] = useState<UnidadeTempo>('seg');
  const [erro, setErro] = useState<string | null>(null);

  if (!visivel) return null;

  function handleConfirmar() {
    setErro(null);
    const num = parseInt(valorTempo, 10);
    if (isNaN(num) || num <= 0) {
      setErro('Informe um tempo de descanso válido.');
      return;
    }

    const totalSegundos = unidade === 'min' ? num * 60 : num;
    if (totalSegundos > 3600) {
      setErro('O intervalo máximo é de 60 minutos (3600 seg).');
      return;
    }

    const textoFormatado = `${num} ${unidade}`;
    onSalvarIntervalo(totalSegundos, textoFormatado);
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
                  DESCANSO APÓS CIRCUITO #{numeroCircuitoAnterior}
                </Text>
                <Text style={styles.modalTitle}>Adicionar Intervalo</Text>
              </View>
              <Pressable onPress={onFechar} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </Pressable>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>TEMPO DE INTERVALO</Text>
              <View style={styles.timeInputRow}>
                <TextInput
                  value={valorTempo}
                  onChangeText={setValorTempo}
                  keyboardType="numeric"
                  placeholder="Ex.: 30"
                  placeholderTextColor={FluxColors.textMuted}
                  style={styles.timeInput}
                />
                <TimeUnitSelect value={unidade} onChange={setUnidade} />
              </View>
            </View>

            {erro ? <Text style={styles.errorText}>{erro}</Text> : null}

            <View style={styles.actionsRow}>
              <PrimaryButton
                label="Cancelar"
                variant="ghost"
                onPress={onFechar}
                style={styles.halfBtn}
              />
              <PrimaryButton
                label="Salvar Intervalo"
                variant="primary"
                onPress={handleConfirmar}
                style={styles.halfBtn}
              />
            </View>
          </GlassCard>
        </Pressable>
      </Pressable>
    </Modal>
  );
}


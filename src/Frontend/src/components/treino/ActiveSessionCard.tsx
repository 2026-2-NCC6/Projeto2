import React from 'react';
import { Text, View } from 'react-native';

import { styles } from '@/components/treino/ActiveSessionCard.styles';
import { GlassCard, PrimaryButton } from '@/components/ui/GlassCard';
import type { WearableDeviceInfo } from '@/hooks';

interface ActiveSessionCardProps {
  dispositivo: WearableDeviceInfo | null;
  processando: boolean;
  onSolicitarEncerrar: () => void;
  onSolicitarDescartar: () => void;
}

export function ActiveSessionCard({
  dispositivo,
  processando,
  onSolicitarEncerrar,
  onSolicitarDescartar,
}: ActiveSessionCardProps) {
  return (
    <GlassCard highlighted style={styles.sessionCard}>
      <View style={styles.liveRow}>
        <View style={styles.liveDot} />
        <Text style={styles.liveBadgeText}>MONITORAMENTO BIOMECÂNICO ATIVO</Text>
      </View>

      <Text style={styles.sessionTitle}>🎾 Smart Tennis</Text>
      <Text style={styles.sessionSub}>
        {dispositivo
          ? `Recebendo telemetria de ${dispositivo.nome} (${dispositivo.modeloPlaca})`
          : 'Capturando movimentos da sessão em tempo real'}
      </Text>

      <View style={styles.actionsStack}>
        <PrimaryButton
          label="Encerrar Sessão"
          variant="primary"
          disabled={processando}
          onPress={onSolicitarEncerrar}
        />
        <PrimaryButton
          label="Descartar Sessão"
          variant="danger"
          disabled={processando}
          onPress={onSolicitarDescartar}
        />
      </View>
    </GlassCard>
  );
}

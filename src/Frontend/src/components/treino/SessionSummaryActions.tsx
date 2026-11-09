import React from 'react';
import { Text, View } from 'react-native';

import { styles } from '@/components/treino/SessionSummaryActions.styles';
import { GlassCard, PrimaryButton } from '@/components/ui/GlassCard';

interface SessionSummaryActionsProps {
  processando: boolean;
  onPublicarSessao: () => void;
  onApenasConcluirSessao: () => void;
}

export function SessionSummaryActions({
  processando,
  onPublicarSessao,
  onApenasConcluirSessao,
}: SessionSummaryActionsProps) {
  return (
    <GlassCard style={styles.footerCard}>
      <Text style={styles.footerHint}>
        A sessão será salva no seu histórico de desempenho. Escolha se deseja
        também publicar este template no Feed da comunidade:
      </Text>

      <View style={styles.buttonsCol}>
        <PrimaryButton
          label="🚀 Publicar Sessão no Feed"
          variant="primary"
          loading={processando}
          onPress={onPublicarSessao}
        />

        <PrimaryButton
          label="✓ Apenas Concluir Sessão"
          variant="ghost"
          loading={processando}
          onPress={onApenasConcluirSessao}
        />
      </View>
    </GlassCard>
  );
}


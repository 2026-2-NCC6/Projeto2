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
        Toda sessão é registrada com seu card de desempenho. Escolha se deseja
        publicá-la como Pública no Feed da Comunidade ou deixá-la Privada
        (visível somente para você no seu Perfil):
      </Text>

      <View style={styles.buttonsCol}>
        <PrimaryButton
          label="🌐 Publicar Sessão (Pública no Feed)"
          variant="primary"
          loading={processando}
          onPress={onPublicarSessao}
        />

        <PrimaryButton
          label="🔒 Apenas Concluir (Privada no Perfil)"
          variant="ghost"
          loading={processando}
          onPress={onApenasConcluirSessao}
        />
      </View>
    </GlassCard>
  );
}


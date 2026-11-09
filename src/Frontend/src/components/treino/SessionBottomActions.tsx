import React from 'react';
import { View } from 'react-native';

import { styles } from '@/components/treino/SessionBottomActions.styles';
import { PrimaryButton } from '@/components/ui/GlassCard';

interface SessionBottomActionsProps {
  processando: boolean;
  onSolicitarEncerrar: () => void;
  onSolicitarDescartar: () => void;
}

export function SessionBottomActions({
  processando,
  onSolicitarEncerrar,
  onSolicitarDescartar,
}: SessionBottomActionsProps) {
  return (
    <View style={styles.actionsFooter}>
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
  );
}


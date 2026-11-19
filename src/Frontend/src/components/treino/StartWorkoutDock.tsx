import React from 'react';
import { View } from 'react-native';

import { styles } from '@/components/treino/StartWorkoutDock.styles';
import { PrimaryButton } from '@/components/ui/GlassCard';

interface StartWorkoutDockProps {
  estaConectado: boolean;
  carregando?: boolean;
  onIniciarTreino: () => void;
  label?: string;
}

export function StartWorkoutDock({
  estaConectado,
  carregando = false,
  onIniciarTreino,
  label,
}: StartWorkoutDockProps) {
  const rotuloPadrao = estaConectado
    ? '🎾 Iniciar Treino (Sensor Conectado)'
    : '🎾 Iniciar Treino Sem Dispositivo';

  return (
    <View style={styles.dockWrapper}>
      <View style={styles.dockContainer}>
        <PrimaryButton
          label={label || rotuloPadrao}
          variant="primary"
          loading={carregando}
          onPress={onIniciarTreino}
          style={styles.startButton}
        />
      </View>
    </View>
  );
}

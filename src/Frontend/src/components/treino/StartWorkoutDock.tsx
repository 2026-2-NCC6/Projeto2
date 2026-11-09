import React from 'react';
import { View } from 'react-native';

import { styles } from '@/components/treino/StartWorkoutDock.styles';
import { PrimaryButton } from '@/components/ui/GlassCard';

interface StartWorkoutDockProps {
  estaConectado: boolean;
  carregando?: boolean;
  onIniciarTreino: () => void;
}

export function StartWorkoutDock({
  estaConectado,
  carregando = false,
  onIniciarTreino,
}: StartWorkoutDockProps) {
  return (
    <View style={styles.dockWrapper}>
      <View style={styles.dockContainer}>
        <PrimaryButton
          label={
            estaConectado
              ? '🎾 Iniciar Treino (Sensor Conectado)'
              : '🎾 Iniciar Treino Sem Dispositivo'
          }
          variant="primary"
          loading={carregando}
          onPress={onIniciarTreino}
          style={styles.startButton}
        />
      </View>
    </View>
  );
}

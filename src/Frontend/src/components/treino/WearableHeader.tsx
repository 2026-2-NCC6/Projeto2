import React from 'react';
import { Text, View } from 'react-native';

import { styles } from '@/components/treino/WearableHeader.styles';

interface WearableHeaderProps {
  estaConectado: boolean;
  estaConectando: boolean;
}

export function WearableHeader({
  estaConectado,
  estaConectando,
}: WearableHeaderProps) {
  return (
    <View style={styles.topBar}>
      <View>
        <Text style={styles.tag}>CONTROLE DE SESSÕES • SMART TENNIS</Text>
        <Text style={styles.screenTitle}>Treinos e Circuitos</Text>
      </View>

      <View
        style={[
          styles.bleBadge,
          estaConectado ? styles.bleBadgeConnected : styles.bleBadgeDisconnected,
        ]}>
        <View
          style={[
            styles.bleDot,
            estaConectado ? styles.bleDotConnected : styles.bleDotDisconnected,
          ]}
        />
        <Text
          style={[
            styles.bleText,
            estaConectado ? styles.bleTextConnected : styles.bleTextDisconnected,
          ]}>
          {estaConectado
            ? 'CONECTADO'
            : estaConectando
              ? 'PAREANDO...'
              : 'DESCONECTADO'}
        </Text>
      </View>
    </View>
  );
}


import React from 'react';
import { Text, View } from 'react-native';

import { styles } from '@/components/treino/WearableHeader.styles';

interface WearableHeaderProps {
  estaConectado: boolean;
  estaConectando: boolean;
  tag?: string;
  titulo?: string;
}

export function WearableHeader({
  estaConectado,
  estaConectando,
  tag = 'CONTROLE DE SESSÕES • SMART TENNIS',
  titulo = 'Treinos e Circuitos',
}: WearableHeaderProps) {
  return (
    <View style={styles.topBar}>
      <View>
        <Text style={styles.tag}>{tag}</Text>
        <Text style={styles.screenTitle}>{titulo}</Text>
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


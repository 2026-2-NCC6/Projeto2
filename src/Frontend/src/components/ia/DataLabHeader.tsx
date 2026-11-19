import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { styles } from '@/components/ia/DataLabHeader.styles';

interface DataLabHeaderProps {
  estaConectado: boolean;
  estaConectando?: boolean;
  nomeDispositivo?: string;
  onConectar?: () => void;
  onDesconectar?: () => void;
}

export function DataLabHeader({
  estaConectado,
  estaConectando = false,
  nomeDispositivo,
  onConectar,
  onDesconectar,
}: DataLabHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.devBadge}>
          <Text>💻</Text>
          <Text style={styles.devBadgeText}>MODO DEV • MLOPS</Text>
        </View>

        <Pressable
          onPress={estaConectado ? onDesconectar : onConectar}
          disabled={estaConectando}
          accessibilityLabel={
            estaConectado ? 'Desconectar dispositivo' : 'Conectar Arduino BLE'
          }
          style={[
            styles.bleBadge,
            estaConectado ? styles.bleConnected : styles.bleDisconnected,
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
              ? nomeDispositivo || 'Arduino R4 Conectado'
              : estaConectando
                ? 'Conectando...'
                : '⚡ Conectar Arduino'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.titleCol}>
        <Text style={styles.tag}>GROUND TRUTH DATA LAB</Text>
        <Text style={styles.title}>Coleta de Movimentos</Text>
        <Text style={styles.subtitle}>
          Capture janelas de telemetria do sensor MPU6050 para treinar e validar o
          modelo de inteligência artificial de reconhecimento de golpes.
        </Text>
      </View>
    </View>
  );
}


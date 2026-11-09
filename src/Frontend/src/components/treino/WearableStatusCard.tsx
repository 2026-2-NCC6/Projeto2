import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { styles } from '@/components/treino/WearableStatusCard.styles';
import { GlassCard, PrimaryButton } from '@/components/ui/GlassCard';
import type { WearableDeviceInfo } from '@/hooks';

interface WearableStatusCardProps {
  estaConectado: boolean;
  dispositivo: WearableDeviceInfo | null;
  onDesconectar: () => void;
  onAcessarInfoDispositivo: () => void;
}

export function WearableStatusCard({
  estaConectado,
  dispositivo,
  onDesconectar,
  onAcessarInfoDispositivo,
}: WearableStatusCardProps) {
  const [expandido, setExpandido] = useState(false);

  if (!estaConectado || !dispositivo) {
    return null;
  }

  return (
    <GlassCard highlighted style={styles.statusCard}>
      {/* Cabeçalho retrátil: exibe apenas o nome e o percentual da bateria quando retraído */}
      <Pressable
        onPress={() => setExpandido((prev) => !prev)}
        style={styles.collapsibleHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.statusIconCircle}>
            <Text style={styles.statusEmoji}>📡</Text>
          </View>

          <View style={styles.statusInfo}>
            <Text style={styles.sectionTitle}>DISPOSITIVO CONECTADO</Text>
            <Text style={styles.statusTitle}>{dispositivo.nome}</Text>
          </View>
        </View>

        <View style={styles.headerRightGroup}>
          <View style={styles.batteryTopRightBadge}>
            <Text style={styles.batteryIcon}>🔋</Text>
            <Text style={styles.batteryValue}>{dispositivo.bateria}%</Text>
          </View>

          <View style={styles.chevronBadge}>
            <Text style={styles.chevronText}>{expandido ? '▲' : '▼'}</Text>
          </View>
        </View>
      </Pressable>

      {/* Detalhes técnicos e ações (exibidos apenas quando expandido) */}
      {expandido ? (
        <View style={styles.expandedSection}>
          <View style={styles.metaList}>
            <Text style={styles.metaText}>ID: {dispositivo.id}</Text>
            <Text style={styles.metaText}>
              Modelo: {dispositivo.modeloPlaca}
            </Text>
            <Text style={styles.metaText}>
              Versão de Software: {dispositivo.versaoSoftware}
            </Text>
          </View>

          <View style={styles.actionsColumn}>
            <PrimaryButton
              label="Informações do Dispositivo"
              variant="ghost"
              onPress={onAcessarInfoDispositivo}
            />
            <PrimaryButton
              label="Desconectar Dispositivo"
              variant="danger"
              onPress={onDesconectar}
            />
          </View>
        </View>
      ) : null}
    </GlassCard>
  );
}

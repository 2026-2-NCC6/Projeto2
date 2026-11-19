import React from 'react';
import { Text, View } from 'react-native';

import { styles } from '@/components/perfil/DevWorkspaceCard.styles';
import { GlassCard, PrimaryButton } from '@/components/ui/GlassCard';

interface DevWorkspaceCardProps {
  totalAmostras?: number;
  estaConectado?: boolean;
  onAbrirLabIA: () => void;
  onAbrirHardware: () => void;
  onAbrirConfiguracoes: () => void;
}

export function DevWorkspaceCard({
  totalAmostras = 0,
  estaConectado = false,
  onAbrirLabIA,
  onAbrirHardware,
  onAbrirConfiguracoes,
}: DevWorkspaceCardProps) {
  return (
    <GlassCard highlighted style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleCol}>
          <Text style={styles.tag}>AMBIENTE DE ENGENHARIA</Text>
          <Text style={styles.title}>Workspace do Desenvolvedor</Text>
        </View>

        <View style={styles.devBadge}>
          <Text style={styles.devBadgeText}>MLOPS ATIVO</Text>
        </View>
      </View>

      <Text style={styles.description}>
        Você está autenticado com permissões de engenheiro de IA. Utilize os atalhos
        abaixo para coletar dados, monitorar o sensor BLE ou gerenciar sua conta.
      </Text>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>AMOSTRAS ROTULADAS</Text>
          <Text style={styles.statValue}>{totalAmostras}</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>STATUS ARDUINO BLE</Text>
          <Text style={styles.statValue}>
            {estaConectado ? '🟢 Online' : '⚪ Offline'}
          </Text>
        </View>
      </View>

      <View style={styles.actionsCol}>
        <PrimaryButton
          label="🧪 Abrir Laboratório de Coleta de IA"
          variant="primary"
          onPress={onAbrirLabIA}
        />
        <PrimaryButton
          label="📡 Painel de Hardware & Telemetria"
          variant="ghost"
          onPress={onAbrirHardware}
        />
        <PrimaryButton
          label="⚙️ Configurações & Trocar Perfil"
          variant="ghost"
          onPress={onAbrirConfiguracoes}
        />
      </View>
    </GlassCard>
  );
}


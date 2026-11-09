import React from 'react';
import { Text, View } from 'react-native';

import { styles } from '@/components/treino/SessionHeader.styles';
import { GlassCard } from '@/components/ui/GlassCard';

interface SessionHeaderProps {
  tempoFormatado: string;
  relogioCompactoVisivel: boolean;
  dispositivoConectado: boolean;
}

export function SessionHeader({
  tempoFormatado,
  relogioCompactoVisivel,
  dispositivoConectado,
}: SessionHeaderProps) {
  return (
    <View
      style={[
        styles.fixedHeaderContainer,
        relogioCompactoVisivel && styles.fixedHeaderScrolled,
      ]}>
      <View style={styles.topBarInner}>
        <View style={styles.titleAndClockRow}>
          <Text style={styles.screenTitle}>Sessão de Treino</Text>

          {relogioCompactoVisivel ? (
            <View style={styles.compactClockPill}>
              <Text style={styles.compactClockIcon}>⏱</Text>
              <Text style={styles.compactClockText}>{tempoFormatado}</Text>
            </View>
          ) : null}
        </View>

        {dispositivoConectado ? (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>MONITORAMENTO BIOMECÂNICO ATIVO</Text>
          </View>
        ) : (
          <View style={styles.manualBadge}>
            <View style={styles.manualDot} />
            <Text style={styles.manualText}>
              MODO MANUAL • REGISTRO POR FORMULÁRIO
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

interface SessionClockCardProps {
  tempoFormatado: string;
}

export function SessionClockCard({ tempoFormatado }: SessionClockCardProps) {
  return (
    <GlassCard highlighted style={styles.clockCard}>
      <Text style={styles.clockLabel}>TEMPO DA SESSÃO</Text>
      <Text style={styles.clockValue}>{tempoFormatado}</Text>
    </GlassCard>
  );
}

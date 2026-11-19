import React from 'react';
import { Linking, Text, View } from 'react-native';

import { styles } from '@/components/ia/DataLabDatasetStatsCard.styles';
import { GlassCard, PrimaryButton } from '@/components/ui/GlassCard';
import { API_BASE_URL } from '@/services/api';
import type { EstatisticasDatasetResponse } from '@/types/api';

interface DataLabDatasetStatsCardProps {
  estatisticas?: EstatisticasDatasetResponse | null;
  carregando?: boolean;
}

const GOLPES_PADRAO = ['Forehand', 'Backhand', 'Saque', 'Smash', 'Slice', 'Repouso'];

export function DataLabDatasetStatsCard({
  estatisticas,
  carregando,
}: DataLabDatasetStatsCardProps) {
  const totalAmostras = estatisticas?.total_amostras ?? 0;
  const totalFrames = estatisticas?.total_frames ?? 0;
  const distribuicao = estatisticas?.distribuicao_movimentos ?? {};

  // Inclui dinamicamente qualquer nova classe adicionada ao dataset
  const todasClasses = Array.from(
    new Set([...GOLPES_PADRAO, ...Object.keys(distribuicao)])
  );

  function handleExportarCsv() {
    const url = `${API_BASE_URL}/modelos-ia/dataset/exportar/csv`;
    Linking.openURL(url);
  }

  function handleExportarJson() {
    const url = `${API_BASE_URL}/modelos-ia/dataset/exportar/json`;
    Linking.openURL(url);
  }

  return (
    <GlassCard highlighted style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.cardTitle}>📊 Dataset Consolidado (Banco Paralelo)</Text>
        <View style={styles.syncPill}>
          <Text style={styles.syncPillText}>
            {carregando ? 'Atualizando...' : 'SQLite MLOps'}
          </Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>TOTAL DE AMOSTRAS</Text>
          <Text style={styles.metricValue}>{totalAmostras}</Text>
        </View>

        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>FRAMES (TELEMETRIA)</Text>
          <Text style={styles.metricValue}>{totalFrames}</Text>
        </View>
      </View>

      <View style={styles.classesContainer}>
        <Text style={styles.classesTitle}>Distribuição por Movimento / Classe:</Text>
        <View style={styles.classesWrap}>
          {todasClasses.map((golpe) => {
            const qtd = distribuicao[golpe] ?? 0;
            return (
              <View
                key={golpe}
                style={[styles.classChip, qtd > 0 && styles.classChipActive]}>
                <Text style={styles.className}>{golpe}</Text>
                <View style={styles.classBadge}>
                  <Text style={styles.classCount}>{qtd}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* AÇÕES DE EXPORTAÇÃO PARA MACHINE LEARNING */}
      <View style={styles.exportButtonsRow}>
        <View style={styles.exportBtn}>
          <PrimaryButton
            label="📥 Exportar CSV"
            variant="ghost"
            onPress={handleExportarCsv}
          />
        </View>
        <View style={styles.exportBtn}>
          <PrimaryButton
            label="📥 Exportar JSON"
            variant="ghost"
            onPress={handleExportarJson}
          />
        </View>
      </View>
    </GlassCard>
  );
}

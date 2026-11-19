import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { styles } from '@/components/treino/WearableStatusCard.styles';
import { GlassCard, PrimaryButton } from '@/components/ui/GlassCard';
import type { TelemetriaIMUItem, WearableDeviceInfo } from '@/hooks';

interface WearableStatusCardProps {
  estaConectado: boolean;
  dispositivo: WearableDeviceInfo | null;
  telemetria?: TelemetriaIMUItem | null;
  onDesconectar: () => void;
  onAcessarInfoDispositivo: () => void;
}

export function WearableStatusCard({
  estaConectado,
  dispositivo,
  telemetria,
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

      {/* Detalhes técnicos, telemetria em tempo real e ações (exibidos quando expandido) */}
      {expandido ? (
        <View style={styles.expandedSection}>
          {/* Seção de Telemetria do Sensor MPU6050 em Tempo Real */}
          <View style={styles.telemetryContainer}>
            <View style={styles.telemetryHeader}>
              <View style={styles.telemetryHeaderLeft}>
                <View style={styles.liveDot} />
                <Text style={styles.telemetryTitle}>
                  TELEMETRIA MPU6050 AO VIVO
                </Text>
              </View>
              {telemetria ? (
                <View style={styles.rateBadge}>
                  <Text style={styles.rateBadgeText}>
                    #{telemetria.frameId} • {telemetria.frequenciaHz} Hz
                  </Text>
                </View>
              ) : null}
            </View>

            {telemetria ? (
              <>
                {/* Linha de métricas rápidas (Temperatura e Delta t) */}
                <View style={styles.quickStatsRow}>
                  <View style={styles.quickChip}>
                    <Text style={styles.quickChipLabel}>Temperatura:</Text>
                    <Text style={styles.quickChipValue}>
                      {telemetria.temperatura} °C
                    </Text>
                  </View>
                  <View style={styles.quickChip}>
                    <Text style={styles.quickChipLabel}>Intervalo Δt:</Text>
                    <Text style={styles.quickChipValue}>
                      {telemetria.deltaMs} ms
                    </Text>
                  </View>
                </View>

                {/* Bloco do Acelerômetro (m/s²) */}
                <View style={styles.sensorBlock}>
                  <View style={styles.sensorHeader}>
                    <Text style={styles.sensorName}>ACELERAÇÃO (m/s²)</Text>
                    <View style={styles.resultantBadge}>
                      <Text style={styles.resultantText}>
                        |A|: {telemetria.accel.resultante} m/s²
                      </Text>
                    </View>
                  </View>
                  <View style={styles.sensorAxisRow}>
                    <View style={styles.axisBox}>
                      <Text style={styles.axisLabel}>X</Text>
                      <Text style={styles.axisValue}>
                        {telemetria.accel.x >= 0 ? '+' : ''}
                        {telemetria.accel.x.toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.axisBox}>
                      <Text style={styles.axisLabel}>Y</Text>
                      <Text style={styles.axisValue}>
                        {telemetria.accel.y >= 0 ? '+' : ''}
                        {telemetria.accel.y.toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.axisBox}>
                      <Text style={styles.axisLabel}>Z</Text>
                      <Text style={styles.axisValue}>
                        {telemetria.accel.z >= 0 ? '+' : ''}
                        {telemetria.accel.z.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Bloco do Giroscópio (rad/s) */}
                <View style={styles.sensorBlock}>
                  <View style={styles.sensorHeader}>
                    <Text style={styles.sensorName}>GIROSCÓPIO (rad/s)</Text>
                  </View>
                  <View style={styles.sensorAxisRow}>
                    <View style={styles.axisBox}>
                      <Text style={styles.axisLabel}>Gx</Text>
                      <Text style={styles.axisValue}>
                        {telemetria.gyro.x >= 0 ? '+' : ''}
                        {telemetria.gyro.x.toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.axisBox}>
                      <Text style={styles.axisLabel}>Gy</Text>
                      <Text style={styles.axisValue}>
                        {telemetria.gyro.y >= 0 ? '+' : ''}
                        {telemetria.gyro.y.toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.axisBox}>
                      <Text style={styles.axisLabel}>Gz</Text>
                      <Text style={styles.axisValue}>
                        {telemetria.gyro.z >= 0 ? '+' : ''}
                        {telemetria.gyro.z.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.waitingContainer}>
                <Text style={styles.waitingText}>
                  Aguardando pacotes do sensor MPU6050...
                </Text>
              </View>
            )}
          </View>

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

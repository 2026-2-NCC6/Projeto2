import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  type LayoutChangeEvent,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';

import { styles } from '@/components/ia/LiveHardwareTelemetryCard.styles';
import { GlassCard, PrimaryButton } from '@/components/ui/GlassCard';
import { wearableService, type TelemetriaIMUItem } from '@/services/wearableService';

interface LiveHardwareTelemetryCardProps {
  estaConectado: boolean;
  titulo?: string;
  subtitulo?: string;
  iniciarMinimizado?: boolean;
}

const BUFFER_MAX_FRAMES = 46; // ~2.3 segundos contínuos a 20Hz

export interface SegmentoReta {
  chave: string;
  left: number;
  top: number;
  width: number;
  anguloRad: number;
  cor: string;
}

export function calcularSegmentosNativos(
  coords: Array<{ x: number; y: number }>,
  cor: string,
  espessura: number = 2
): SegmentoReta[] {
  const segmentos: SegmentoReta[] = [];
  for (let i = 0; i < coords.length - 1; i += 1) {
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const comprimento = Math.hypot(dx, dy);
    const anguloRad = Math.atan2(dy, dx);
    const meioX = (p1.x + p2.x) / 2;
    const meioY = (p1.y + p2.y) / 2;

    segmentos.push({
      chave: `seg-${cor}-${i}`,
      left: meioX - comprimento / 2,
      top: meioY - espessura / 2,
      width: comprimento,
      anguloRad,
      cor,
    });
  }
  return segmentos;
}

export interface LinhaSerie {
  id: string;
  nome: string;
  cor: string;
  valores: number[];
}

export interface PlotLinhasProps {
  series: LinhaSerie[];
  minY: number;
  maxY: number;
  altura?: number;
  temLinhaZero?: boolean;
  linhaReferenciaY?: number;
}

export function PlotLinhas({
  series,
  minY,
  maxY,
  altura = 105,
  temLinhaZero = false,
  linhaReferenciaY,
}: PlotLinhasProps) {
  const [largura, setLargura] = useState(0);

  function handleLayout(e: LayoutChangeEvent) {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && Math.abs(w - largura) > 1) {
      setLargura(w);
    }
  }

  const { caminhosSvg, segmentosNativos } = useMemo(() => {
    if (largura <= 0 || series.length === 0 || series[0].valores.length < 2) {
      return { caminhosSvg: [], segmentosNativos: [] };
    }

    const amplitude = Math.max(0.1, maxY - minY);
    const totalPontos = series[0].valores.length;

    const svgs: Array<{ id: string; d: string; cor: string }> = [];
    const nativos: SegmentoReta[] = [];

    series.forEach((serie) => {
      const coords = serie.valores.map((v, i) => {
        const x = (i / (totalPontos - 1)) * largura;
        const clampedV = Math.max(minY, Math.min(maxY, v));
        const ratio = (clampedV - minY) / amplitude;
        const y = altura - ratio * altura;
        return { x, y };
      });

      // SVG path para Web
      const d = coords
        .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
        .join(' ');
      svgs.push({ id: serie.id, d, cor: serie.cor });

      // Segmentos de view para Native
      if (Platform.OS !== 'web') {
        nativos.push(...calcularSegmentosNativos(coords, serie.cor, 2));
      }
    });

    return { caminhosSvg: svgs, segmentosNativos: nativos };
  }, [largura, series, minY, maxY, altura]);

  const posicaoLinhaZero = useMemo(() => {
    if (!temLinhaZero) return null;
    const ratio = (0 - minY) / (maxY - minY);
    return altura - ratio * altura;
  }, [temLinhaZero, minY, maxY, altura]);

  const posicaoLinhaRef = useMemo(() => {
    if (linhaReferenciaY === undefined) return null;
    const ratio = (linhaReferenciaY - minY) / (maxY - minY);
    return altura - ratio * altura;
  }, [linhaReferenciaY, minY, maxY, altura]);

  return (
    <View style={styles.plotCanvas} onLayout={handleLayout}>
      {/* Linha Zero de Referência Central */}
      {posicaoLinhaZero !== null ? (
        <View style={[styles.centerZeroLine, { top: posicaoLinhaZero }]} />
      ) : null}

      {/* Linha de Limiar / Impacto */}
      {posicaoLinhaRef !== null ? (
        <View style={[styles.referenceThresholdLine, { top: posicaoLinhaRef }]} />
      ) : null}

      {/* Renderização em Web: SVG Vetorial Fluido */}
      {Platform.OS === 'web' && largura > 0 ? (
        <svg
          width={largura}
          height={altura}
          style={{ position: 'absolute', top: 0, left: 0, overflow: 'hidden' } as any}>
          {caminhosSvg.map((c) => (
            <path
              key={c.id}
              d={c.d}
              fill="none"
              stroke={c.cor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </svg>
      ) : null}

      {/* Renderização em Mobile Native: Segmentos View com Rotação */}
      {Platform.OS !== 'web'
        ? segmentosNativos.map((seg) => (
            <View
              key={seg.chave}
              style={[
                styles.segmentReta,
                {
                  left: seg.left,
                  top: seg.top,
                  width: seg.width,
                  height: 2,
                  backgroundColor: seg.cor,
                  transform: [{ rotate: `${seg.anguloRad}rad` }],
                },
              ]}
            />
          ))
        : null}
    </View>
  );
}

export function LiveHardwareTelemetryCard({
  estaConectado,
  titulo = '📊 Osciloscópio BLE dos 6 Eixos',
  subtitulo,
  iniciarMinimizado = false,
}: LiveHardwareTelemetryCardProps) {
  const [bufferFrames, setBufferFrames] = useState<TelemetriaIMUItem[]>([]);
  const [ultimoFrame, setUltimoFrame] = useState<TelemetriaIMUItem | null>(null);
  const [pausado, setPausado] = useState(false);
  const [picoSessao, setPicoSessao] = useState(0);
  const [minimizado, setMinimizado] = useState(iniciarMinimizado);

  const pausadoRef = useRef(false);
  pausadoRef.current = pausado;

  useEffect(() => {
    if (!estaConectado) {
      setBufferFrames([]);
      setUltimoFrame(null);
      return;
    }

    const cancelar = wearableService.inscreverTelemetria((leitura) => {
      if (pausadoRef.current) return;

      const res = leitura.accel.resultante;
      setPicoSessao((prev) => Math.max(prev, res));
      setUltimoFrame(leitura);

      setBufferFrames((prev) => {
        const novo = [...prev, leitura];
        if (novo.length > BUFFER_MAX_FRAMES) {
          return novo.slice(novo.length - BUFFER_MAX_FRAMES);
        }
        return novo;
      });
    });

    return () => {
      cancelar();
    };
  }, [estaConectado]);

  function handleResetPico() {
    setPicoSessao(ultimoFrame?.accel.resultante ?? 0);
  }

  // Valores instantâneos
  const ax = ultimoFrame?.accel.x ?? 0;
  const ay = ultimoFrame?.accel.y ?? 0;
  const az = ultimoFrame?.accel.z ?? 0;

  const gx = ultimoFrame?.gyro.x ?? 0;
  const gy = ultimoFrame?.gyro.y ?? 0;
  const gz = ultimoFrame?.gyro.z ?? 0;

  const res = ultimoFrame?.accel.resultante ?? 0;
  const freq = ultimoFrame?.frequenciaHz ?? 20;
  const temp = ultimoFrame?.temperatura ?? 24;
  const bat = ultimoFrame?.bateria ?? 100;

  // Séries temporais para os gráficos
  const serieAx = bufferFrames.map((f) => f.accel.x);
  const serieAy = bufferFrames.map((f) => f.accel.y);
  const serieAz = bufferFrames.map((f) => f.accel.z);

  const serieGx = bufferFrames.map((f) => f.gyro.x);
  const serieGy = bufferFrames.map((f) => f.gyro.y);
  const serieGz = bufferFrames.map((f) => f.gyro.z);

  const serieRes = bufferFrames.map((f) => f.accel.resultante);

  return (
    <GlassCard highlighted style={styles.card}>
      {/* CABEÇALHO COM STATUS AO VIVO E BOTÃO MINIMIZAR */}
      <View style={styles.mainHeaderRow}>
        <Text style={styles.cardTitle}>{titulo}</Text>
        <View style={styles.headerActions}>
          <View style={[styles.livePill, pausado && styles.livePillPaused]}>
            <View style={[styles.liveDot, pausado && styles.liveDotPaused]} />
            <Text style={[styles.livePillText, pausado && styles.livePillTextPaused]}>
              {pausado ? 'PAUSADO' : 'AO VIVO'} • {freq.toFixed(1)} Hz
            </Text>
          </View>
          <Pressable
            onPress={() => setMinimizado((prev) => !prev)}
            style={styles.collapseToggleBtn}
            accessibilityRole="button"
            accessibilityLabel={minimizado ? 'Expandir gráficos' : 'Minimizar gráficos'}>
            <Text style={styles.collapseToggleText}>
              {minimizado ? '📈 Ver Gráficos ▼' : '▲ Ocultar'}
            </Text>
          </Pressable>
        </View>
      </View>

      {subtitulo ? <Text style={styles.cardSubtitle}>{subtitulo}</Text> : null}

      {/* BARRA RÁPIDA DE DISPOSITIVO */}
      <View style={styles.deviceQuickBar}>
        <View style={styles.quickBarItem}>
          <Text style={styles.quickBarLabel}>STATUS:</Text>
          <Text style={styles.quickBarValue}>
            {estaConectado ? '🟢 Conectado' : '⚪ Desconectado'}
          </Text>
        </View>

        <View style={styles.quickBarItem}>
          <Text style={styles.quickBarLabel}>TEMPERATURA:</Text>
          <Text style={styles.quickBarValue}>{temp.toFixed(1)} °C</Text>
        </View>

        <View style={styles.quickBarItem}>
          <Text style={styles.quickBarLabel}>BATERIA:</Text>
          <Text style={styles.quickBarValue}>{bat}%</Text>
        </View>

        <View style={styles.quickBarItem}>
          <Text style={styles.quickBarLabel}>PICO MÁX:</Text>
          <Text style={styles.quickBarValue}>{picoSessao.toFixed(1)} m/s²</Text>
        </View>
      </View>

      {!estaConectado ? (
        <View style={styles.emptyNotice}>
          <Text style={styles.emptyNoticeTitle}>Nenhum Dispositivo Conectado</Text>
          <Text style={styles.emptyNoticeText}>
            Conecte o bracelete Arduino Uno R4 WiFi via Bluetooth para visualizar as 3
            linhas de aceleração, 3 linhas de giroscópio e a resultante em tempo real.
          </Text>
        </View>
      ) : minimizado ? null : (
        /* PILHA COM OS 3 GRÁFICOS SIMULTÂNEOS, UM ABAIXO DO OUTRO */
        <View style={styles.chartsStack}>
          {/* GRÁFICO 1: ACELERAÇÃO TRIAXIAL (X, Y, Z) */}
          <View style={styles.chartBox}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>⚡ 1. Aceleração Triaxial (m/s²)</Text>
              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={styles.legendLineX} />
                  <Text style={[styles.legendText, styles.legendTextX]}>
                    Ax: {ax.toFixed(1)}
                  </Text>
                </View>

                <View style={styles.legendItem}>
                  <View style={styles.legendLineY} />
                  <Text style={[styles.legendText, styles.legendTextY]}>
                    Ay: {ay.toFixed(1)}
                  </Text>
                </View>

                <View style={styles.legendItem}>
                  <View style={styles.legendLineZ} />
                  <Text style={[styles.legendText, styles.legendTextZ]}>
                    Az: {az.toFixed(1)}
                  </Text>
                </View>
              </View>
            </View>

            <PlotLinhas
              series={[
                { id: 'ax', nome: 'Ax', cor: '#EF4444', valores: serieAx },
                { id: 'ay', nome: 'Ay', cor: '#10B981', valores: serieAy },
                { id: 'az', nome: 'Az', cor: '#38BDF8', valores: serieAz },
              ]}
              minY={-30}
              maxY={30}
              temLinhaZero={true}
            />

            <View style={styles.chartScaleFooter}>
              <Text style={styles.chartScaleFooterText}>◀ -2.3s</Text>
              <Text style={styles.chartScaleFooterText}>Escala: -30 a +30 m/s²</Text>
              <Text style={styles.chartScaleFooterText}>Agora ▶</Text>
            </View>
          </View>

          {/* GRÁFICO 2: GIROSCÓPIO TRIAXIAL (X, Y, Z) */}
          <View style={styles.chartBox}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>🌀 2. Giroscópio Triaxial (rad/s)</Text>
              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={styles.legendLineX} />
                  <Text style={[styles.legendText, styles.legendTextX]}>
                    Gx: {gx.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.legendItem}>
                  <View style={styles.legendLineY} />
                  <Text style={[styles.legendText, styles.legendTextY]}>
                    Gy: {gy.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.legendItem}>
                  <View style={styles.legendLineZ} />
                  <Text style={[styles.legendText, styles.legendTextZ]}>
                    Gz: {gz.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>

            <PlotLinhas
              series={[
                { id: 'gx', nome: 'Gx', cor: '#EF4444', valores: serieGx },
                { id: 'gy', nome: 'Gy', cor: '#10B981', valores: serieGy },
                { id: 'gz', nome: 'Gz', cor: '#38BDF8', valores: serieGz },
              ]}
              minY={-12}
              maxY={12}
              temLinhaZero={true}
            />

            <View style={styles.chartScaleFooter}>
              <Text style={styles.chartScaleFooterText}>◀ -2.3s</Text>
              <Text style={styles.chartScaleFooterText}>Escala: -12 a +12 rad/s</Text>
              <Text style={styles.chartScaleFooterText}>Agora ▶</Text>
            </View>
          </View>

          {/* GRÁFICO 3: ACELERAÇÃO RESULTANTE (|A|) */}
          <View style={styles.chartBox}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>💥 3. Aceleração Resultante |A|</Text>
              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={styles.legendLineRes} />
                  <Text style={[styles.legendText, styles.legendTextRes]}>
                    |A|: {res.toFixed(1)} m/s²
                  </Text>
                </View>
                <Text style={styles.legendText}>
                  {res > 25 ? '🔥 IMPACTO' : '⚡ 1G Gravidade'}
                </Text>
              </View>
            </View>

            <PlotLinhas
              series={[
                { id: 'res', nome: '|A|', cor: '#F59E0B', valores: serieRes },
              ]}
              minY={0}
              maxY={55}
              temLinhaZero={false}
              linhaReferenciaY={25}
            />

            <View style={styles.chartScaleFooter}>
              <Text style={styles.chartScaleFooterText}>◀ -2.3s</Text>
              <Text style={styles.chartScaleFooterText}>0 a 55 m/s² (Tracejado: 25 m/s² impacto)</Text>
              <Text style={styles.chartScaleFooterText}>Agora ▶</Text>
            </View>
          </View>

          {/* BOTÕES DE CONTROLE INFERIORES */}
          <View style={styles.footerControls}>
            <View style={styles.footerBtnCol}>
              <PrimaryButton
                label={pausado ? '▶️ Continuar Ao Vivo' : '⏸️ Congelar Gráficos'}
                variant="ghost"
                onPress={() => setPausado((prev) => !prev)}
              />
            </View>

            <View style={styles.footerBtnCol}>
              <PrimaryButton
                label="🔄 Zerar Pico Máximo"
                variant="ghost"
                onPress={handleResetPico}
              />
            </View>
          </View>
        </View>
      )}
    </GlassCard>
  );
}

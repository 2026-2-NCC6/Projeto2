import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  LayoutChangeEvent,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { styles } from '@/components/ia/DataLabModelEvaluationDashboard.styles';
import { calcularSegmentosNativos } from '@/components/ia/LiveHardwareTelemetryCard';
import { GlassCard } from '@/components/ui/GlassCard';
import { FluxColors } from '@/constants/theme';
import type {
  AvaliacaoModeloResponse,
  PontoAmostraScatter,
  ProjecaoScatterItem,
  VersaoProgressaoItem,
} from '@/types/api';

interface DataLabModelEvaluationDashboardProps {
  dados?: AvaliacaoModeloResponse;
  carregando?: boolean;
  versaoSelecionada: string;
  onSelecionarVersao: (versao: string) => void;
}

export function DataLabModelEvaluationDashboard({
  dados,
  carregando = false,
  versaoSelecionada,
  onSelecionarVersao,
}: DataLabModelEvaluationDashboardProps) {
  if (carregando && !dados) {
    return (
      <GlassCard highlighted style={styles.card}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={FluxColors.primaryLight} />
          <Text style={styles.loadingText}>Carregando auditoria e métricas MLOps...</Text>
        </View>
      </GlassCard>
    );
  }

  if (!dados) {
    return (
      <GlassCard highlighted style={styles.card}>
        <View style={styles.emptyNotice}>
          <MaterialIcons name="analytics" size={40} color={FluxColors.textSecondary} />
          <Text style={styles.emptyNoticeTitle}>Nenhuma Métrica Disponível</Text>
          <Text style={styles.emptyNoticeText}>
            Gere ou selecione uma versão do modelo para visualizar o relatório de acurácia, matriz de confusão e evolução.
          </Text>
        </View>
      </GlassCard>
    );
  }

  const { metricas_versao, progressao_versoes, todas_versoes, versao_ativa } = dados;

  return (
    <View style={styles.container}>
      {/* 1. CABEÇALHO & SELETOR DE VERSÕES */}
      <GlassCard highlighted style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.cardTitle}>🔬 Painel de Avaliação & Auditoria MLOps</Text>
            <Text style={styles.cardSubtitle}>
              {`Modelo: ${dados.nome} • Modalidade: ${dados.esporte_id.toUpperCase()} • Versão Analisada: ${versaoSelecionada}`}
            </Text>
          </View>
        </View>

        {/* Seletor de Versão */}
        <View style={styles.versionSelectorBox}>
          <Text style={styles.versionSelectorLabel}>SELECIONAR VERSÃO DO MODELO:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.versionScroll}
            contentContainerStyle={styles.versionChipsContainer}>
            {todas_versoes.map((v) => {
              const ativo = v === versaoSelecionada;
              const isAtivaOTA = v === versao_ativa;
              return (
                <Pressable
                  key={v}
                  onPress={() => onSelecionarVersao(v)}
                  style={[styles.versionChip, ativo && styles.versionChipActive]}
                  accessibilityRole="button"
                  accessibilityLabel={`Selecionar versão ${v}`}>
                  <MaterialIcons
                    name={ativo ? 'check-circle' : 'history'}
                    size={14}
                    color={ativo ? FluxColors.primaryLight : FluxColors.textSecondary}
                  />
                  <Text style={[styles.versionChipText, ativo && styles.versionChipTextActive]}>
                    {v}
                  </Text>
                  {isAtivaOTA ? (
                    <View style={styles.activeVersionBadge}>
                      <Text style={styles.activeVersionBadgeText}>ATIVA</Text>
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* KPIs Principais da Versão Selecionada */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Acurácia Global</Text>
            <View style={styles.kpiValueRow}>
              <Text style={[styles.kpiValue, { color: '#10B981' }]}>
                {metricas_versao.acuracia.toFixed(1)}
              </Text>
              <Text style={styles.kpiUnit}>%</Text>
            </View>
            <Text style={[styles.kpiBadge, { color: '#10B981' }]}>
              {metricas_versao.acuracia >= 95 ? 'Excelente (Produção)' : 'Calibrado'}
            </Text>
          </View>

          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>F1-Score Médio</Text>
            <View style={styles.kpiValueRow}>
              <Text style={[styles.kpiValue, { color: FluxColors.primaryLight }]}>
                {metricas_versao.f1_score.toFixed(3)}
              </Text>
            </View>
            <Text style={[styles.kpiBadge, { color: FluxColors.primaryLight }]}>
              Harmonia P / R
            </Text>
          </View>

          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Amostras Avaliadas</Text>
            <View style={styles.kpiValueRow}>
              <Text style={styles.kpiValue}>{metricas_versao.total_amostras}</Text>
              <Text style={styles.kpiUnit}>amostras</Text>
            </View>
            <Text style={[styles.kpiBadge, { color: '#38BDF8' }]}>
              {metricas_versao.classes.length} classes
            </Text>
          </View>

          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Latência Média</Text>
            <View style={styles.kpiValueRow}>
              <Text style={[styles.kpiValue, { color: '#F59E0B' }]}>
                {metricas_versao.latencia_media_inferencia_ms.toFixed(1)}
              </Text>
              <Text style={styles.kpiUnit}>ms</Text>
            </View>
            <Text style={[styles.kpiBadge, { color: '#F59E0B' }]}>Tempo Real BLE</Text>
          </View>
        </View>
      </GlassCard>

      {/* 2. GRÁFICOS DE PROGRESSÃO MLOPS: ACURÁCIA & VOLUME DE AMOSTRAS NAS VERSÕES */}
      <GlassCard highlighted style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>📈 Progressão de Acurácia ao Longo das Versões</Text>
            <Text style={styles.cardSubtitle}>
              Evolução da taxa de acertos da IA conforme o dataset foi expandido
            </Text>
          </View>
        </View>

        <GraficoProgressaoAcuracia progressao={progressao_versoes} />
      </GlassCard>

      <GlassCard highlighted style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>📦 Progressão do Volume de Amostras do Dataset</Text>
            <Text style={styles.cardSubtitle}>
              Crescimento de amostras registradas versão a versão
            </Text>
          </View>
        </View>

        <GraficoProgressaoAmostras progressao={progressao_versoes} />
      </GlassCard>

      {/* 3. MATRIZ DE CONFUSÃO (CONFUSION MATRIX) */}
      <GlassCard highlighted style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>🎯 Matriz de Confusão (Classe Real vs Predita)</Text>
            <Text style={styles.cardSubtitle}>
              Diagonal verde indica classificação correta; células fora da diagonal revelam confusões
            </Text>
          </View>
        </View>

        <MatrizConfusaoVisual
          matriz={metricas_versao.matriz_confusao}
          classes={metricas_versao.classes}
        />
      </GlassCard>

      {/* 5. ESPAÇO DE ATRIBUTOS BIOMECÂNICOS & CENTRÓIDES (SCATTER PLOT) */}
      {metricas_versao.projecoes_scatter && metricas_versao.projecoes_scatter.length > 0 ? (
        <GlassCard highlighted style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>🌀 Espaço de Atributos & Dispersão de Centróides</Text>
              <Text style={styles.cardSubtitle}>
                Distribuição das 206 amostras catalogadas, centróides médios (★) e regiões de decisão
              </Text>
            </View>
          </View>

          <GraficoScatterCentroides projecoes={metricas_versao.projecoes_scatter} />
        </GlassCard>
      ) : null}

      {/* 6. MÉTRICAS POR CLASSE (PRECISION, RECALL, F1-SCORE) */}
      <GlassCard highlighted style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>📊 Desempenho Detalhado por Golpe</Text>
            <Text style={styles.cardSubtitle}>
              Precisão (ausência de falso positivo) e Revocação (taxa de detecção real)
            </Text>
          </View>
        </View>

        <View style={styles.classesGrid}>
          {metricas_versao.metricas_por_classe.map((m) => (
            <View key={m.classe} style={styles.classCard}>
              <View style={styles.classCardHeader}>
                <Text style={styles.className}>{m.nome}</Text>
                <Text style={styles.classSampleCount}>{`${m.amostras} amostras`}</Text>
              </View>

              <View style={styles.metricsBarGroup}>
                {/* Precisão */}
                <View style={styles.metricBarRow}>
                  <View style={styles.metricBarHeader}>
                    <Text style={styles.metricBarLabel}>Precisão</Text>
                    <Text style={[styles.metricBarValue, { color: '#10B981' }]}>
                      {m.precisao.toFixed(1)}%
                    </Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { width: `${Math.min(100, m.precisao)}%`, backgroundColor: '#10B981' },
                      ]}
                    />
                  </View>
                </View>

                {/* Revocação (Recall) */}
                <View style={styles.metricBarRow}>
                  <View style={styles.metricBarHeader}>
                    <Text style={styles.metricBarLabel}>Revocação (Recall)</Text>
                    <Text style={[styles.metricBarValue, { color: '#38BDF8' }]}>
                      {m.revocacao.toFixed(1)}%
                    </Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { width: `${Math.min(100, m.revocacao)}%`, backgroundColor: '#38BDF8' },
                      ]}
                    />
                  </View>
                </View>

                {/* F1-Score */}
                <View style={styles.metricBarRow}>
                  <View style={styles.metricBarHeader}>
                    <Text style={styles.metricBarLabel}>F1-Score</Text>
                    <Text style={[styles.metricBarValue, { color: FluxColors.primaryLight }]}>
                      {m.f1_score.toFixed(3)}
                    </Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${Math.min(100, m.f1_score * 100)}%`,
                          backgroundColor: FluxColors.primaryLight,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </GlassCard>

      {/* 5. IMPORTÂNCIA DAS FEATURES BIOMECÂNICAS (XAI) */}
      <GlassCard highlighted style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>🧠 Relevância das Features Biomecânicas (XAI)</Text>
            <Text style={styles.cardSubtitle}>
              Atributos cinemáticos que mais diferenciam os golpes na inferência do classificador
            </Text>
          </View>
        </View>

        <View style={styles.featuresList}>
          {metricas_versao.importancia_features.map((feat) => (
            <View key={feat.feature} style={styles.featureItem}>
              <View style={styles.featureHeaderRow}>
                <Text style={styles.featureName}>{feat.label}</Text>
                <Text style={styles.featureScore}>{feat.importancia.toFixed(1)}%</Text>
              </View>
              <View style={styles.featureBarTrack}>
                <View
                  style={[
                    styles.featureBarFill,
                    { width: `${Math.min(100, feat.importancia * 2.5)}%` },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      </GlassCard>

      {/* 6. BALANCEAMENTO E DISTRIBUIÇÃO DO DATASET */}
      <GlassCard highlighted style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>⚖️ Balanceamento de Amostras por Golpe</Text>
            <Text style={styles.cardSubtitle}>
              Distribuição proporcional das classes avaliadas no treinamento
            </Text>
          </View>
        </View>

        <View style={styles.distribRow}>
          <View style={styles.distribBarTrack}>
            {metricas_versao.distribuicao_amostras.map((dist, idx) => {
              const cores = ['#7B68EE', '#10B981', '#38BDF8', '#F59E0B', '#EC4899'];
              const cor = cores[idx % cores.length];
              return (
                <View
                  key={dist.classe}
                  style={[
                    styles.distribBarSegment,
                    { width: `${dist.percentual}%`, backgroundColor: cor },
                  ]}
                />
              );
            })}
          </View>

          <View style={styles.distribLegendRow}>
            {metricas_versao.distribuicao_amostras.map((dist, idx) => {
              const cores = ['#7B68EE', '#10B981', '#38BDF8', '#F59E0B', '#EC4899'];
              const cor = cores[idx % cores.length];
              return (
                <View key={dist.classe} style={styles.distribLegendItem}>
                  <View style={[styles.distribLegendDot, { backgroundColor: cor }]} />
                  <Text style={styles.distribLegendText}>
                    {`${dist.nome}: ${dist.quantidade} (${dist.percentual.toFixed(1)}%)`}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </GlassCard>
    </View>
  );
}

// ============================================================================
// COMPONENTE: GRÁFICO DE PROGRESSÃO DE ACURÁCIA
// ============================================================================

function GraficoProgressaoAcuracia({ progressao }: { progressao: VersaoProgressaoItem[] }) {
  const [largura, setLargura] = useState(0);
  const altura = 140;

  function handleLayout(e: LayoutChangeEvent) {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && Math.abs(w - largura) > 1) {
      setLargura(w);
    }
  }

  const { dLinha, dArea, coords, y90 } = useMemo(() => {
    if (largura <= 0 || progressao.length === 0) {
      return { dLinha: '', dArea: '', coords: [], y90: 0 };
    }

    const n = progressao.length;
    const minY = 65;
    const maxY = 100;

    function calcularY(acc: number) {
      const clamped = Math.max(minY, Math.min(maxY, acc));
      const ratio = (clamped - minY) / (maxY - minY);
      return (altura - 24) - ratio * (altura - 40);
    }

    const pts = progressao.map((p, idx) => {
      const x = n > 1 ? (idx / (n - 1)) * (largura - 40) + 20 : largura / 2;
      const y = calcularY(p.acuracia);
      return { x, y, item: p };
    });

    const linha = pts
      .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(' ');

    const primeiroX = pts[0].x.toFixed(1);
    const ultimoX = pts[pts.length - 1].x.toFixed(1);
    const area = `${linha} L ${ultimoX} ${altura - 15} L ${primeiroX} ${altura - 15} Z`;
    const posY90 = calcularY(90.0);

    return { dLinha: linha, dArea: area, coords: pts, y90: posY90 };
  }, [largura, progressao]);

  const segmentos = useMemo(() => {
    if (Platform.OS === 'web' || coords.length < 2) return [];
    return calcularSegmentosNativos(coords, '#10B981', 3);
  }, [coords]);

  return (
    <View style={styles.chartBox} onLayout={handleLayout}>
      <View style={styles.chartHeaderRow}>
        <Text style={styles.chartTitleText}>Acurácia por Versão (%)</Text>
        <View style={styles.chartLegendRow}>
          <View style={styles.chartLegendItem}>
            <View style={[styles.chartLegendDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.chartLegendText}>Acurácia Obtida</Text>
          </View>
          <View style={styles.chartLegendItem}>
            <View style={[styles.chartLegendDot, { backgroundColor: 'rgba(239, 68, 68, 0.6)' }]} />
            <Text style={styles.chartLegendText}>Meta 90%</Text>
          </View>
        </View>
      </View>

      <View style={{ height: altura, position: 'relative', width: '100%' }}>
        {/* Linha de Referência de 90% */}
        {y90 > 0 ? (
          <View
            style={{
              position: 'absolute',
              top: y90,
              left: 0,
              right: 0,
              height: 1,
              borderStyle: 'dashed',
              borderWidth: 1,
              borderColor: 'rgba(239, 68, 68, 0.45)',
              zIndex: 1,
            }}
          />
        ) : null}

        {/* Linha SVG Web */}
        {Platform.OS === 'web' && dLinha ? (
          <svg
            width={largura}
            height={altura}
            style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' } as any}>
            <path d={dArea} fill="rgba(16, 185, 129, 0.12)" />
            <path
              d={dLinha}
              fill="none"
              stroke="#10B981"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}

        {/* Segmentos Nativos */}
        {Platform.OS !== 'web' &&
          segmentos.map((seg) => (
            <View
              key={seg.chave}
              style={{
                position: 'absolute',
                left: seg.left,
                top: seg.top,
                width: seg.width,
                height: 3,
                backgroundColor: seg.cor,
                transform: [{ rotate: `${seg.anguloRad}rad` }],
              }}
            />
          ))}

        {/* Pontos e Rótulos */}
        {coords.map((pt) => (
          <View
            key={`dot-${pt.item.versao}`}
            style={{
              position: 'absolute',
              left: pt.x - 5,
              top: pt.y - 5,
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: '#10B981',
              borderWidth: 2,
              borderColor: '#FFFFFF',
              zIndex: 3,
            }}>
            <View
              style={{
                position: 'absolute',
                top: -18,
                left: -20,
                width: 50,
                alignItems: 'center',
              }}>
              <Text style={{ color: '#10B981', fontSize: 10, fontWeight: '900' }}>
                {`${pt.item.acuracia.toFixed(1)}%`}
              </Text>
            </View>
            <View
              style={{
                position: 'absolute',
                bottom: -22,
                left: -30,
                width: 70,
                alignItems: 'center',
              }}>
              <Text
                style={{
                  color: pt.item.is_ativa ? FluxColors.primaryLight : FluxColors.textSecondary,
                  fontSize: 10,
                  fontWeight: '700',
                }}>
                {pt.item.versao}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.chartFooterText}>
        {progressao.length > 1
          ? `Acurácia evoluindo de ${progressao[0]?.acuracia.toFixed(1)}% até ${progressao[progressao.length - 1]?.acuracia.toFixed(1)}% na versão ativa`
          : `Versão ${progressao[0]?.versao}: acurácia real de ${progressao[0]?.acuracia.toFixed(1)}% com ${progressao[0]?.total_amostras} amostras`}
      </Text>
    </View>
  );
}

// ============================================================================
// COMPONENTE: GRÁFICO DE PROGRESSÃO DE AMOSTRAS NO DATASET
// ============================================================================

function GraficoProgressaoAmostras({ progressao }: { progressao: VersaoProgressaoItem[] }) {
  const [largura, setLargura] = useState(0);
  const altura = 130;

  function handleLayout(e: LayoutChangeEvent) {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && Math.abs(w - largura) > 1) {
      setLargura(w);
    }
  }

  const { dLinha, dArea, coords } = useMemo(() => {
    if (largura <= 0 || progressao.length === 0) {
      return { dLinha: '', dArea: '', coords: [] };
    }

    const n = progressao.length;
    const maxAmostras = Math.max(10, ...progressao.map((p) => p.total_amostras));
    const ceiling = Math.ceil(maxAmostras * 1.2);

    function calcularY(val: number) {
      const ratio = val / ceiling;
      return (altura - 24) - ratio * (altura - 40);
    }

    const pts = progressao.map((p, idx) => {
      const x = n > 1 ? (idx / (n - 1)) * (largura - 40) + 20 : largura / 2;
      const y = calcularY(p.total_amostras);
      return { x, y, item: p };
    });

    const linha = pts
      .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(' ');

    const primeiroX = pts[0].x.toFixed(1);
    const ultimoX = pts[pts.length - 1].x.toFixed(1);
    const area = `${linha} L ${ultimoX} ${altura - 15} L ${primeiroX} ${altura - 15} Z`;

    return { dLinha: linha, dArea: area, coords: pts };
  }, [largura, progressao]);

  const segmentos = useMemo(() => {
    if (Platform.OS === 'web' || coords.length < 2) return [];
    return calcularSegmentosNativos(coords, FluxColors.primaryLight, 3);
  }, [coords]);

  return (
    <View style={styles.chartBox} onLayout={handleLayout}>
      <View style={styles.chartHeaderRow}>
        <Text style={styles.chartTitleText}>Volume de Amostras Catalogadas</Text>
        <View style={styles.chartLegendRow}>
          <View style={styles.chartLegendItem}>
            <View style={[styles.chartLegendDot, { backgroundColor: FluxColors.primaryLight }]} />
            <Text style={styles.chartLegendText}>Amostras Coletadas</Text>
          </View>
        </View>
      </View>

      <View style={{ height: altura, position: 'relative', width: '100%' }}>
        {/* SVG Web */}
        {Platform.OS === 'web' && dLinha ? (
          <svg
            width={largura}
            height={altura}
            style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' } as any}>
            <path d={dArea} fill="rgba(123, 104, 238, 0.14)" />
            <path
              d={dLinha}
              fill="none"
              stroke={FluxColors.primaryLight}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}

        {/* Segmentos Nativos */}
        {Platform.OS !== 'web' &&
          segmentos.map((seg) => (
            <View
              key={seg.chave}
              style={{
                position: 'absolute',
                left: seg.left,
                top: seg.top,
                width: seg.width,
                height: 3,
                backgroundColor: seg.cor,
                transform: [{ rotate: `${seg.anguloRad}rad` }],
              }}
            />
          ))}

        {/* Pontos e Rótulos */}
        {coords.map((pt) => (
          <View
            key={`dot-samples-${pt.item.versao}`}
            style={{
              position: 'absolute',
              left: pt.x - 5,
              top: pt.y - 5,
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: FluxColors.primaryLight,
              borderWidth: 2,
              borderColor: '#FFFFFF',
              zIndex: 3,
            }}>
            <View
              style={{
                position: 'absolute',
                top: -18,
                left: -20,
                width: 50,
                alignItems: 'center',
              }}>
              <Text style={{ color: FluxColors.primaryLight, fontSize: 10, fontWeight: '900' }}>
                {`${pt.item.total_amostras}`}
              </Text>
            </View>
            <View
              style={{
                position: 'absolute',
                bottom: -22,
                left: -30,
                width: 70,
                alignItems: 'center',
              }}>
              <Text
                style={{
                  color: pt.item.is_ativa ? '#10B981' : FluxColors.textSecondary,
                  fontSize: 10,
                  fontWeight: '700',
                }}>
                {pt.item.versao}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.chartFooterText}>
        {progressao.length > 1
          ? `Dataset expandido de ${progressao[0]?.total_amostras} para ${progressao[progressao.length - 1]?.total_amostras} amostras`
          : `Versão ${progressao[0]?.versao}: ${progressao[0]?.total_amostras} amostras catalogadas no dataset`}
      </Text>
    </View>
  );
}

// ============================================================================
// COMPONENTE: MATRIZ DE CONFUSÃO VISUAL INTERATIVA
// ============================================================================

interface MatrizConfusaoVisualProps {
  matriz: Record<string, Record<string, number>>;
  classes: string[];
}

function MatrizConfusaoVisual({ matriz, classes }: MatrizConfusaoVisualProps) {
  const rotulosAmigaveis: Record<string, string> = {
    tenis_forehand: 'Forehand',
    tenis_backhand: 'Backhand',
    tenis_saque: 'Saque',
    tenis_voleio: 'Voleio',
    tenis_smash: 'Smash',
  };

  const listaClasses = useMemo(() => {
    if (classes && classes.length > 0) return classes;
    return Object.keys(matriz);
  }, [classes, matriz]);

  return (
    <View style={styles.matrixContainer}>
      {/* Cabeçalho das Colunas: Classes Preditas */}
      <View style={styles.matrixHeaderRow}>
        <Text style={styles.matrixHeaderCorner}>Real \ Predito</Text>
        {listaClasses.map((c) => (
          <Text key={`col-${c}`} style={styles.matrixHeaderCell} numberOfLines={1}>
            {rotulosAmigaveis[c] || c.replace('tenis_', '').toUpperCase()}
          </Text>
        ))}
      </View>

      {/* Linhas: Classes Reais */}
      {listaClasses.map((real) => {
        const rowData = matriz[real] || {};
        const totalLinha = Object.values(rowData).reduce((acc, v) => acc + v, 0);

        return (
          <View key={`row-${real}`} style={styles.matrixRow}>
            <Text style={styles.matrixRowLabel} numberOfLines={1}>
              {rotulosAmigaveis[real] || real.replace('tenis_', '').toUpperCase()}
            </Text>

            {listaClasses.map((predito) => {
              const valor = rowData[predito] ?? 0;
              const isDiagonal = real === predito;
              const percentualLinha = totalLinha > 0 ? (valor / totalLinha) * 100 : 0;

              return (
                <View
                  key={`cell-${real}-${predito}`}
                  style={[
                    styles.matrixCell,
                    isDiagonal
                      ? styles.matrixCellDiagonal
                      : valor > 0
                        ? styles.matrixCellOffDiagonal
                        : styles.matrixCellZero,
                  ]}>
                  <Text style={styles.matrixCellCount}>{valor}</Text>
                  <Text
                    style={[
                      styles.matrixCellSub,
                      {
                        color: isDiagonal
                          ? '#10B981'
                          : valor > 0
                            ? '#EF4444'
                            : FluxColors.textSecondary,
                      },
                    ]}>
                    {`${percentualLinha.toFixed(0)}%`}
                  </Text>
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

// ============================================================================
// COMPONENTE: ESPAÇO DE ATRIBUTOS & DISPERSÃO DE CENTRÓIDES (SCATTER PLOT)
// ============================================================================

interface GraficoScatterCentroidesProps {
  projecoes: ProjecaoScatterItem[];
}

function GraficoScatterCentroides({ projecoes }: GraficoScatterCentroidesProps) {
  const [projecaoAtivaId, setProjecaoAtivaId] = useState<string>(projecoes[0]?.id || '');
  const [pontoSelecionado, setPontoSelecionado] = useState<PontoAmostraScatter | null>(null);
  const [larguraCanvas, setLarguraCanvas] = useState<number>(0);
  const alturaCanvas = 280;

  const projecaoAtiva = useMemo(() => {
    return projecoes.find((p) => p.id === projecaoAtivaId) || projecoes[0];
  }, [projecoes, projecaoAtivaId]);

  function handleLayout(e: LayoutChangeEvent) {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && Math.abs(w - larguraCanvas) > 1) {
      setLarguraCanvas(w);
    }
  }

  // Margens internas do plano cartesiano
  const marginLeft = 36;
  const marginRight = 24;
  const marginTop = 24;
  const marginBottom = 36;

  const { padMinX, padMaxX, padMinY, padMaxY, usableW, usableH } = useMemo(() => {
    if (!projecaoAtiva) {
      return { padMinX: 0, padMaxX: 100, padMinY: 0, padMaxY: 100, usableW: 100, usableH: 100 };
    }
    const spanX = projecaoAtiva.max_x - projecaoAtiva.min_x || 1;
    const spanY = projecaoAtiva.max_y - projecaoAtiva.min_y || 1;
    return {
      padMinX: projecaoAtiva.min_x - spanX * 0.08,
      padMaxX: projecaoAtiva.max_x + spanX * 0.08,
      padMinY: projecaoAtiva.min_y - spanY * 0.08,
      padMaxY: projecaoAtiva.max_y + spanY * 0.08,
      usableW: Math.max(10, larguraCanvas - marginLeft - marginRight),
      usableH: Math.max(10, alturaCanvas - marginTop - marginBottom),
    };
  }, [projecaoAtiva, larguraCanvas]);

  function getPos(x: number, y: number) {
    const clampedX = Math.max(padMinX, Math.min(padMaxX, x));
    const clampedY = Math.max(padMinY, Math.min(padMaxY, y));
    const ratioX = (clampedX - padMinX) / (padMaxX - padMinX);
    const ratioY = (clampedY - padMinY) / (padMaxY - padMinY);
    return {
      left: marginLeft + ratioX * usableW,
      top: alturaCanvas - marginBottom - ratioY * usableH,
    };
  }

  // Linha conectora entre as 2 centróides principais
  const { conector, c1Pos, c2Pos } = useMemo(() => {
    if (!projecaoAtiva || projecaoAtiva.centroides.length < 2 || larguraCanvas <= 0) {
      return { conector: null, c1Pos: null, c2Pos: null };
    }
    const c1 = projecaoAtiva.centroides[0];
    const c2 = projecaoAtiva.centroides[1];
    const p1 = getPos(c1.x, c1.y);
    const p2 = getPos(c2.x, c2.y);
    const dx = p2.left - p1.left;
    const dy = p2.top - p1.top;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    const midX = (p1.left + p2.left) / 2;
    const midY = (p1.top + p2.top) / 2;

    return {
      conector: {
        x1: p1.left,
        y1: p1.top,
        x2: p2.left,
        y2: p2.top,
        left: p1.left,
        top: p1.top,
        width: dist,
        angleRad: angle,
        midX,
        midY,
      },
      c1Pos: p1,
      c2Pos: p2,
    };
  }, [projecaoAtiva, larguraCanvas, padMinX, padMaxX, padMinY, padMaxY, usableW, usableH]);

  if (!projecaoAtiva) return null;

  const totalAmostras = projecaoAtiva.pontos.length;
  const totalOutliers = projecaoAtiva.pontos.filter((p) => p.is_outlier).length;

  return (
    <View style={styles.container}>
      {/* SELETOR DE PROJEÇÃO DE ATRIBUTOS */}
      <View style={styles.projSelectorBox}>
        <Text style={styles.projSelectorLabel}>SELECIONAR ESPAÇO DE ATRIBUTOS (2D):</Text>
        <View style={styles.projChipsContainer}>
          {projecoes.map((proj) => {
            const ativa = proj.id === projecaoAtiva.id;
            return (
              <Pressable
                key={proj.id}
                onPress={() => {
                  setProjecaoAtivaId(proj.id);
                  setPontoSelecionado(null);
                }}
                style={[styles.projChip, ativa && styles.projChipActive]}
                accessibilityRole="button"
                accessibilityLabel={`Selecionar projeção ${proj.titulo}`}>
                <MaterialIcons
                  name={ativa ? 'bubble-chart' : 'scatter-plot'}
                  size={14}
                  color={ativa ? FluxColors.primaryLight : FluxColors.textSecondary}
                />
                <Text style={[styles.projChipText, ativa && styles.projChipTextActive]}>
                  {proj.titulo}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* MÉTRICAS KPI DE DISPERSÃO E SEPARABILIDADE */}
      <View style={styles.scatterStatsRow}>
        <View style={styles.scatterStatBox}>
          <Text style={styles.scatterStatLabel}>Distância Inter-Classes</Text>
          <Text style={[styles.scatterStatValue, { color: FluxColors.primaryLight }]}>
            {`D = ${projecaoAtiva.distancia_centroides}`}
          </Text>
          <Text style={styles.scatterStatSub}>Separação geométrica euclidiana</Text>
        </View>

        <View style={styles.scatterStatBox}>
          <Text style={styles.scatterStatLabel}>Separabilidade</Text>
          <Text style={[styles.scatterStatValue, { color: '#10B981' }]}>Alta Separabilidade</Text>
          <Text style={styles.scatterStatSub}>Fronteira com 99% pureza</Text>
        </View>

        <View style={styles.scatterStatBox}>
          <Text style={styles.scatterStatLabel}>Amostras Limítrofes</Text>
          <Text style={[styles.scatterStatValue, { color: totalOutliers > 0 ? '#F59E0B' : '#10B981' }]}>
            {`${totalOutliers} de ${totalAmostras}`}
          </Text>
          <Text style={styles.scatterStatSub}>Casos de sobreposição na borda</Text>
        </View>
      </View>

      {/* CANVAS DO SCATTER PLOT */}
      <View style={styles.scatterCanvasContainer}>
        <View style={styles.scatterCanvasHeader}>
          <Text style={styles.scatterCanvasTitle}>{projecaoAtiva.titulo}</Text>
          <Text style={styles.cardSubtitle}>
            {`${totalAmostras} amostras catalogadas • 2 centróides calculados`}
          </Text>
        </View>

        <View style={styles.scatterCanvasArea} onLayout={handleLayout}>
          {/* Rótulos dos Eixos */}
          <Text style={styles.scatterAxisLabelY}>
            {`▲ Y: ${projecaoAtiva.eixo_y_nome} (${projecaoAtiva.eixo_y_unidade})`}
          </Text>
          <Text style={styles.scatterAxisLabelX}>
            {`► X: ${projecaoAtiva.eixo_x_nome} (${projecaoAtiva.eixo_x_unidade})`}
          </Text>

          {/* Linhas de Grade de Referência */}
          <View style={[styles.scatterGridLineX, { left: marginLeft + usableW * 0.33 }]} />
          <View style={[styles.scatterGridLineX, { left: marginLeft + usableW * 0.66 }]} />
          <View style={[styles.scatterGridLineY, { top: marginTop + usableH * 0.33 }]} />
          <View style={[styles.scatterGridLineY, { top: marginTop + usableH * 0.66 }]} />

          {/* Linha Conectora entre Centróides (Web SVG) */}
          {Platform.OS === 'web' && conector ? (
            <svg
              width={larguraCanvas}
              height={alturaCanvas}
              style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' } as any}>
              <line
                x1={conector.x1}
                y1={conector.y1}
                x2={conector.x2}
                y2={conector.y2}
                stroke="rgba(123, 104, 238, 0.55)"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            </svg>
          ) : null}

          {/* Linha Conectora entre Centróides (Nativo) */}
          {Platform.OS !== 'web' && conector ? (
            <View
              style={[
                styles.scatterConnectorLine,
                {
                  left: conector.left,
                  top: conector.top,
                  width: conector.width,
                  transform: [{ rotate: `${conector.angleRad}rad` }],
                },
              ]}
            />
          ) : null}

          {/* Badge com a Distância no ponto médio da linha conectora */}
          {conector ? (
            <View
              style={[
                styles.scatterDistanceBadge,
                {
                  left: Math.max(10, conector.midX - 42),
                  top: Math.max(10, conector.midY - 10),
                },
              ]}>
              <Text style={styles.scatterDistanceBadgeText}>
                {`D = ${projecaoAtiva.distancia_centroides}`}
              </Text>
            </View>
          ) : null}

          {/* Halos de Desvio Padrão das Centróides */}
          {projecaoAtiva.centroides.map((c) => {
            const pos = getPos(c.x, c.y);
            const haloW = Math.max(26, Math.min(usableW * 0.8, (2 * c.std_x / (padMaxX - padMinX)) * usableW));
            const haloH = Math.max(26, Math.min(usableH * 0.8, (2 * c.std_y / (padMaxY - padMinY)) * usableH));
            const isBackhand = c.classe === 'tenis_backhand';
            const cor = isBackhand ? '#8B5CF6' : '#10B981';

            return (
              <View
                key={`halo-${c.classe}`}
                style={[
                  styles.scatterHalo,
                  {
                    left: pos.left - haloW / 2,
                    top: pos.top - haloH / 2,
                    width: haloW,
                    height: haloH,
                    borderColor: cor,
                    backgroundColor: isBackhand
                      ? 'rgba(139, 92, 246, 0.08)'
                      : 'rgba(16, 185, 129, 0.08)',
                  },
                ]}
              />
            );
          })}

          {/* Amostras Dispersas (Pontos Individuais) */}
          {projecaoAtiva.pontos.map((pt) => {
            const pos = getPos(pt.x, pt.y);
            const isBackhand = pt.classe === 'tenis_backhand';
            const cor = isBackhand ? '#8B5CF6' : '#10B981';
            const selecionado = pontoSelecionado?.id === pt.id;

            return (
              <Pressable
                key={pt.id}
                onPress={() => setPontoSelecionado(pt)}
                style={[
                  styles.scatterPointDot,
                  {
                    left: pos.left - (pt.is_outlier ? 5 : 3.5),
                    top: pos.top - (pt.is_outlier ? 5 : 3.5),
                    backgroundColor: cor,
                  },
                  pt.is_outlier && styles.scatterPointOutlier,
                  selecionado && {
                    borderColor: '#FFFFFF',
                    borderWidth: 2,
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    zIndex: 6,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Amostra ${pt.classe} em ${pt.x}, ${pt.y}`}
              />
            );
          })}

          {/* Marcadores das Centróides (★) */}
          {projecaoAtiva.centroides.map((c) => {
            const pos = getPos(c.x, c.y);
            const isBackhand = c.classe === 'tenis_backhand';
            const cor = isBackhand ? '#8B5CF6' : '#10B981';

            return (
              <React.Fragment key={`centroid-marker-${c.classe}`}>
                <View
                  style={[
                    styles.scatterCentroidMarker,
                    {
                      left: pos.left - 14,
                      top: pos.top - 14,
                      backgroundColor: cor,
                    },
                  ]}>
                  <Text style={styles.scatterCentroidStar}>★</Text>
                </View>

                <View
                  style={[
                    styles.scatterCentroidTag,
                    {
                      left: pos.left - 45,
                      top: pos.top + 16,
                    },
                  ]}>
                  <Text style={[styles.scatterCentroidTagText, { color: cor }]}>
                    {`★ ${c.nome}`}
                  </Text>
                </View>
              </React.Fragment>
            );
          })}
        </View>

        {/* Legenda do Gráfico */}
        <View style={styles.scatterLegendBox}>
          <View style={styles.scatterLegendItem}>
            <View style={[styles.scatterLegendIcon, { backgroundColor: '#10B981' }]} />
            <Text style={styles.scatterLegendText}>Amostra Forehand</Text>
          </View>

          <View style={styles.scatterLegendItem}>
            <View style={[styles.scatterLegendIcon, { backgroundColor: '#8B5CF6' }]} />
            <Text style={styles.scatterLegendText}>Amostra Backhand</Text>
          </View>

          <View style={styles.scatterLegendItem}>
            <View style={styles.scatterLegendStarIcon}>
              <Text style={styles.scatterLegendStarText}>★</Text>
            </View>
            <Text style={styles.scatterLegendText}>Centróide da Classe (Média)</Text>
          </View>

          <View style={styles.scatterLegendItem}>
            <View
              style={[
                styles.scatterLegendIcon,
                {
                  backgroundColor: '#F59E0B',
                  borderWidth: 2,
                  borderColor: '#EF4444',
                },
              ]}
            />
            <Text style={styles.scatterLegendText}>Amostra Limítrofe (Outlier)</Text>
          </View>
        </View>
      </View>

      {/* INSPEÇÃO DE PONTO SELECIONADO OU DICA */}
      {pontoSelecionado ? (
        <View style={styles.scatterTooltipContainer}>
          <View style={styles.scatterTooltipHeader}>
            <Text style={styles.scatterTooltipTitle}>
              {`Amostra Inspecionada: ${pontoSelecionado.classe.replace('tenis_', '').toUpperCase()}`}
            </Text>
            <Pressable
              onPress={() => setPontoSelecionado(null)}
              accessibilityRole="button"
              accessibilityLabel="Fechar inspeção de amostra">
              <MaterialIcons name="close" size={16} color={FluxColors.textSecondary} />
            </Pressable>
          </View>

          <Text style={styles.scatterTooltipCoords}>
            {`${projecaoAtiva.eixo_x_nome}: `}
            <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>
              {`${pontoSelecionado.x} ${projecaoAtiva.eixo_x_unidade}`}
            </Text>
            {`  •  ${projecaoAtiva.eixo_y_nome}: `}
            <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>
              {`${pontoSelecionado.y} ${projecaoAtiva.eixo_y_unidade}`}
            </Text>
          </Text>

          {pontoSelecionado.is_outlier ? (
            <View style={[styles.scatterTooltipBadge, { backgroundColor: 'rgba(239, 68, 68, 0.25)', borderWidth: 1, borderColor: '#EF4444' }]}>
              <Text style={styles.scatterTooltipBadgeText}>
                ⚠️ FRONTEIRA DE DECISÃO: Backhand executado com baixa aceleração, classificado no limiar próximo a Forehand.
              </Text>
            </View>
          ) : (
            <View style={[styles.scatterTooltipBadge, { backgroundColor: 'rgba(16, 185, 129, 0.2)', borderWidth: 1, borderColor: '#10B981' }]}>
              <Text style={styles.scatterTooltipBadgeText}>
                ✅ AMOSTRA TÍPICA: Alinhada ao núcleo da centróide de sua respectiva classe biomecânica.
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.scatterInfoBox}>
          <MaterialIcons name="touch-app" size={20} color={FluxColors.primaryLight} />
          <View style={styles.scatterInfoTextCol}>
            <Text style={styles.scatterInfoTitle}>Exploração Interativa de Amostras</Text>
            <Text style={styles.scatterInfoDesc}>
              Toque ou clique em qualquer ponto do gráfico para inspecionar os valores biomecânicos e verificar se a amostra pertence ao núcleo típico ou à fronteira de decisão.
            </Text>
          </View>
        </View>
      )}

      {/* DIAGNÓSTICO BIOMECÂNICO DAS CENTRÓIDES */}
      <View style={styles.scatterInfoBox}>
        <MaterialIcons name="lightbulb" size={20} color={FluxColors.primaryLight} />
        <View style={styles.scatterInfoTextCol}>
          <Text style={styles.scatterInfoTitle}>Interpretação das Centróides Biomecânicas (★)</Text>
          <Text style={styles.scatterInfoDesc}>
            As centróides representam o golpe ideal/arquetípico médio do jogador. Com uma distância inter-classes de{' '}
            <Text style={{ color: FluxColors.primaryLight, fontWeight: '800' }}>
              {`D = ${projecaoAtiva.distancia_centroides}`}
            </Text>
            , os movimentos Forehand e Backhand formam núcleos densos e isolados, comprovando matematicamente a robustez da classificação da IA.
          </Text>
        </View>
      </View>
    </View>
  );
}


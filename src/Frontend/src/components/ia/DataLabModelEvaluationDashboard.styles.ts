import { StyleSheet } from 'react-native';

import { FluxColors, Radius, Spacing } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
    width: '100%',
  },
  card: {
    padding: Spacing.four,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(12, 14, 24, 0.85)',
    gap: Spacing.three,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  cardHeaderLeft: {
    flex: 1,
    minWidth: 200,
  },
  cardTitle: {
    color: FluxColors.text,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  cardSubtitle: {
    color: FluxColors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },

  // SELETOR DE VERSÕES
  versionSelectorBox: {
    gap: 8,
    marginTop: 2,
  },
  versionSelectorLabel: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  versionScroll: {
    flexDirection: 'row',
  },
  versionChipsContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  versionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  versionChipActive: {
    backgroundColor: 'rgba(123, 104, 238, 0.22)',
    borderColor: FluxColors.primaryLight,
  },
  versionChipText: {
    color: FluxColors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  versionChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  activeVersionBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  activeVersionBadgeText: {
    color: '#064E3B',
    fontSize: 9,
    fontWeight: '900',
  },

  // GRADE DE MÉTRICAS KPI NO TOPO
  kpiGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  kpiCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: Spacing.three,
    gap: 4,
  },
  kpiLabel: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  kpiValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  kpiValue: {
    color: FluxColors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  kpiUnit: {
    color: FluxColors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  kpiBadge: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
  },

  // ÁREA DE GRÁFICOS
  chartBox: {
    backgroundColor: 'rgba(6, 8, 14, 0.95)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    padding: Spacing.three,
    gap: Spacing.two,
  },
  chartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  chartTitleText: {
    color: FluxColors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  chartLegendRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  chartLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  chartLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chartLegendText: {
    color: FluxColors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  chartFooterText: {
    color: FluxColors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },

  // MATRIZ DE CONFUSÃO
  matrixContainer: {
    marginTop: 4,
    gap: 6,
    overflow: 'hidden',
  },
  matrixHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 6,
  },
  matrixHeaderCell: {
    flex: 1,
    textAlign: 'center',
    color: FluxColors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  matrixHeaderCorner: {
    width: 85,
    color: FluxColors.textSecondary,
    fontSize: 9,
    fontWeight: '800',
  },
  matrixRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  matrixRowLabel: {
    width: 85,
    color: FluxColors.text,
    fontSize: 11,
    fontWeight: '800',
  },
  matrixCell: {
    flex: 1,
    height: 48,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  matrixCellDiagonal: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10B981',
  },
  matrixCellOffDiagonal: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  matrixCellZero: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  matrixCellCount: {
    color: FluxColors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  matrixCellSub: {
    fontSize: 9,
    fontWeight: '700',
  },

  // TABELA DE MÉTRICAS POR CLASSE (PRECISION, RECALL, F1)
  classesGrid: {
    gap: Spacing.two,
  },
  classCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: Spacing.three,
    gap: 8,
  },
  classCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  className: {
    color: FluxColors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  classSampleCount: {
    color: FluxColors.primaryLight,
    fontSize: 11,
    fontWeight: '700',
  },
  metricsBarGroup: {
    gap: 6,
  },
  metricBarRow: {
    gap: 2,
  },
  metricBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricBarLabel: {
    color: FluxColors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  metricBarValue: {
    color: FluxColors.text,
    fontSize: 10,
    fontWeight: '800',
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    marginTop: 2,
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },

  // IMPORTÂNCIA DAS FEATURES (XAI)
  featuresList: {
    gap: 10,
    marginTop: 4,
  },
  featureItem: {
    gap: 3,
  },
  featureHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featureName: {
    color: FluxColors.text,
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
  featureScore: {
    color: FluxColors.primaryLight,
    fontSize: 11,
    fontWeight: '800',
  },
  featureBarTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
  },
  featureBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#7B68EE',
  },

  // DISTRIBUIÇÃO DAS AMOSTRAS
  distribRow: {
    gap: 8,
    marginTop: 4,
  },
  distribBarTrack: {
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  distribBarSegment: {
    height: '100%',
  },
  distribLegendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 2,
  },
  distribLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  distribLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  distribLegendText: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },

  // ESPAÇO DE ATRIBUTOS E DISPERSÃO DE CENTRÓIDES (SCATTER PLOT)
  projSelectorBox: {
    gap: 8,
    marginTop: 2,
  },
  projSelectorLabel: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  projChipsContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  projChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  projChipActive: {
    backgroundColor: 'rgba(123, 104, 238, 0.22)',
    borderColor: FluxColors.primaryLight,
  },
  projChipText: {
    color: FluxColors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  projChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  scatterStatsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  scatterStatBox: {
    flex: 1,
    minWidth: 130,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    padding: Spacing.three,
    gap: 4,
  },
  scatterStatLabel: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  scatterStatValue: {
    color: FluxColors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  scatterStatSub: {
    color: FluxColors.textSecondary,
    fontSize: 10,
    fontWeight: '500',
  },

  scatterCanvasContainer: {
    width: '100%',
    borderRadius: Radius.md,
    backgroundColor: 'rgba(6, 8, 16, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 12,
    gap: 8,
  },
  scatterCanvasHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  scatterCanvasTitle: {
    color: FluxColors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  scatterCanvasArea: {
    position: 'relative',
    height: 280,
    width: '100%',
    overflow: 'hidden',
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(12, 16, 28, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  scatterAxisLabelY: {
    position: 'absolute',
    top: 8,
    left: 8,
    color: FluxColors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    backgroundColor: 'rgba(12, 14, 24, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 2,
  },
  scatterAxisLabelX: {
    position: 'absolute',
    bottom: 6,
    right: 8,
    color: FluxColors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    backgroundColor: 'rgba(12, 14, 24, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 2,
  },
  scatterGridLineX: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    borderStyle: 'dashed',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  scatterGridLineY: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  scatterConnectorLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: 'rgba(123, 104, 238, 0.45)',
    zIndex: 2,
  },
  scatterDistanceBadge: {
    position: 'absolute',
    backgroundColor: '#7B68EE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    zIndex: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  scatterDistanceBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  scatterHalo: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: 'dashed',
    zIndex: 1,
  },
  scatterCentroidMarker: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  scatterCentroidStar: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  scatterCentroidTag: {
    position: 'absolute',
    bottom: -18,
    alignItems: 'center',
    backgroundColor: 'rgba(12, 14, 24, 0.85)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  scatterCentroidTagText: {
    fontSize: 9,
    fontWeight: '800',
  },
  scatterPointDot: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 3.5,
    zIndex: 3,
  },
  scatterPointOutlier: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    borderWidth: 2,
    borderColor: '#EF4444',
    backgroundColor: '#F59E0B',
    zIndex: 4,
  },

  scatterLegendBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  scatterLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scatterLegendIcon: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scatterLegendStarIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7B68EE',
  },
  scatterLegendStarText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  scatterLegendText: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },

  scatterTooltipContainer: {
    backgroundColor: 'rgba(18, 22, 38, 0.95)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(123, 104, 238, 0.3)',
    padding: Spacing.three,
    gap: 4,
  },
  scatterTooltipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scatterTooltipTitle: {
    color: FluxColors.text,
    fontSize: 12,
    fontWeight: '800',
  },
  scatterTooltipBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  scatterTooltipBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  scatterTooltipCoords: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  scatterTooltipHint: {
    color: FluxColors.textSecondary,
    fontSize: 10,
    fontStyle: 'italic',
  },

  scatterInfoBox: {
    backgroundColor: 'rgba(123, 104, 238, 0.08)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(123, 104, 238, 0.2)',
    padding: Spacing.three,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  scatterInfoTextCol: {
    flex: 1,
    gap: 2,
  },
  scatterInfoTitle: {
    color: FluxColors.primaryLight,
    fontSize: 12,
    fontWeight: '800',
  },
  scatterInfoDesc: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
  },

  // ESTADOS DE CARREGAMENTO / VAZIO
  loadingBox: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: FluxColors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyNotice: {
    padding: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyNoticeTitle: {
    color: FluxColors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  emptyNoticeText: {
    color: FluxColors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
  },
});


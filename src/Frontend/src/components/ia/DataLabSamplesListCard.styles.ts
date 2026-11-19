import { StyleSheet } from 'react-native';

import { FluxColors, Radius, Spacing } from '@/constants/theme';

export const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
    position: 'relative',
    zIndex: 1,
    elevation: 1,
  },
  headerPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  headerLeft: {
    flex: 1,
    gap: 3,
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
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgeCount: {
    backgroundColor: 'rgba(123, 104, 238, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(123, 104, 238, 0.35)',
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeCountText: {
    color: FluxColors.primaryLight,
    fontSize: 11,
    fontWeight: '800',
  },
  toggleBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBadgeText: {
    color: FluxColors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
  },
  bodyContainer: {
    gap: Spacing.three,
  },

  // SEÇÃO DE FILTROS DINÂMICOS
  filterSection: {
    backgroundColor: 'rgba(12, 14, 26, 0.75)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(123, 104, 238, 0.25)',
    padding: Spacing.three,
    gap: 10,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterHeaderTitle: {
    color: FluxColors.text,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  filterClearBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  filterClearText: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '800',
  },
  filterRow: {
    gap: 4,
  },
  filterRowLabel: {
    color: FluxColors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  filterChipsScroll: {
    maxHeight: 34,
  },
  filterChipsContent: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  filterChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  filterChipActive: {
    backgroundColor: FluxColors.primarySoft,
    borderColor: FluxColors.primaryLight,
  },
  filterChipText: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: FluxColors.primaryLight,
    fontWeight: '900',
  },
  filterSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    gap: 8,
    flexWrap: 'wrap',
  },
  filterSummaryText: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  resetBtnDisabled: {
    opacity: 0.5,
  },
  resetBtnText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '800',
  },
  resetModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  resetModalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'rgba(18, 20, 32, 0.98)',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    padding: Spacing.four,
    gap: Spacing.three,
  },
  resetModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resetModalTitle: {
    color: FluxColors.text,
    fontSize: 15,
    fontWeight: '800',
    flex: 1,
  },
  resetModalBody: {
    color: FluxColors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
  resetModalAlertBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: Radius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  resetModalAlertText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
  },
  resetModalActions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: 4,
  },
  resetModalCancelBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: Radius.md,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetModalCancelText: {
    color: FluxColors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  resetModalConfirmBtn: {
    flex: 1,
    backgroundColor: '#EF4444',
    borderRadius: Radius.md,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetModalConfirmText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  // LISTA DE AMOSTRAS
  emptyBox: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emptyText: {
    color: FluxColors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  list: {
    gap: 10,
  },
  sampleCard: {
    backgroundColor: 'rgba(12, 14, 24, 0.7)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: FluxColors.glassBorder,
    overflow: 'hidden',
  },
  sampleCardActive: {
    borderColor: FluxColors.primaryLight,
    backgroundColor: 'rgba(16, 18, 32, 0.85)',
  },
  sampleHeaderPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    gap: 10,
  },
  sampleLeft: {
    flex: 1,
    gap: 4,
  },
  sampleTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  sampleTypeBadge: {
    backgroundColor: 'rgba(123, 104, 238, 0.22)',
    borderRadius: Radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(123, 104, 238, 0.45)',
  },
  sampleTypeText: {
    color: FluxColors.primaryLight,
    fontSize: 11,
    fontWeight: '800',
  },
  samplePositionBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: Radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  samplePositionText: {
    color: FluxColors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  sampleMetaText: {
    color: FluxColors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  sampleMetaSub: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  sampleNote: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 2,
  },
  sampleActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expandIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // CONTEÚDO EXPANDIDO (GRÁFICOS E MÉTRICAS DA AMOSTRA)
  expandedContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(123, 104, 238, 0.2)',
    backgroundColor: 'rgba(8, 10, 20, 0.75)',
    padding: 12,
    gap: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'space-between',
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: Radius.sm,
    padding: 8,
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  metricLabel: {
    color: FluxColors.textSecondary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  metricValue: {
    color: FluxColors.primaryLight,
    fontSize: 12,
    fontWeight: '900',
  },

  // GRÁFICOS DE LINHAS DA AMOSTRA
  chartSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  chartSwitchLabel: {
    color: FluxColors.text,
    fontSize: 12,
    fontWeight: '800',
  },
  chartSwitchTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: Radius.pill,
    padding: 2,
    gap: 2,
  },
  chartTabBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  chartTabBtnActive: {
    backgroundColor: FluxColors.primary,
  },
  chartTabBtnText: {
    color: FluxColors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  chartTabBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  chartBox: {
    backgroundColor: 'rgba(12, 14, 26, 0.85)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 10,
    gap: 8,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chartTitle: {
    color: FluxColors.text,
    fontSize: 11,
    fontWeight: '800',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendDotAx: {
    backgroundColor: '#EF4444',
  },
  legendDotAy: {
    backgroundColor: '#10B981',
  },
  legendDotAz: {
    backgroundColor: '#38BDF8',
  },
  legendDotRes: {
    backgroundColor: '#F59E0B',
  },
  legendDotGx: {
    backgroundColor: '#F43F5E',
  },
  legendDotGy: {
    backgroundColor: '#A855F7',
  },
  legendDotGz: {
    backgroundColor: '#06B6D4',
  },
  legendText: {
    color: FluxColors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  chartFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chartFooterText: {
    color: FluxColors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
});

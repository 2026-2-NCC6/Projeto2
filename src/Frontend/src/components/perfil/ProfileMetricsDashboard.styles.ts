import { StyleSheet } from 'react-native';

import { FluxColors, Radius } from '@/constants/theme';

export const styles = StyleSheet.create({
  stack: {
    gap: 14,
  },
  cardGap: {
    gap: 12,
  },
  sectionTitle: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.9,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 130,
    paddingTop: 18,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(10, 12, 20, 0.65)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: FluxColors.glassBorder,
    gap: 8,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
    gap: 6,
  },
  barValueText: {
    color: FluxColors.primaryLight,
    fontSize: 10,
    fontWeight: '800',
  },
  barTrack: {
    width: '100%',
    maxWidth: 34,
    height: 82,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: Radius.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: FluxColors.primary,
    borderRadius: Radius.sm,
  },
  barLabel: {
    color: FluxColors.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  nosqlHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeBtn: {
    color: FluxColors.primaryLight,
    fontWeight: '700',
    fontSize: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  movItemBlock: {
    gap: 6,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: FluxColors.glassBorder,
  },
  movRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  movType: {
    color: FluxColors.text,
    fontWeight: '800',
    fontSize: 13,
  },
  movSpeed: {
    color: FluxColors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  movPrecision: {
    color: FluxColors.success,
    fontWeight: '800',
    fontSize: 13,
  },
  precisionTrack: {
    height: 6,
    backgroundColor: 'rgba(10, 12, 20, 0.85)',
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  precisionFill: {
    height: '100%',
    backgroundColor: FluxColors.success,
    borderRadius: Radius.pill,
  },
  sessaoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessaoTitle: {
    color: FluxColors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  sessaoDate: {
    color: FluxColors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  scoreBadge: {
    backgroundColor: FluxColors.primarySoft,
    borderWidth: 1,
    borderColor: FluxColors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  scoreText: {
    color: FluxColors.primaryLight,
    fontWeight: '800',
    fontSize: 13,
  },
  circuitsStack: {
    gap: 8,
    marginTop: 4,
  },
  circuitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 12, 20, 0.65)',
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: FluxColors.glassBorder,
  },
  circuitRowActive: {
    borderColor: FluxColors.primary,
    backgroundColor: FluxColors.primarySoft,
  },
  circuitTitle: {
    color: FluxColors.text,
    fontWeight: '700',
    fontSize: 13,
  },
  circuitSub: {
    color: FluxColors.textMuted,
    fontSize: 11,
  },
  inspectText: {
    color: FluxColors.primaryLight,
    fontWeight: '700',
    fontSize: 12,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 26,
    gap: 6,
  },
  emptyTitle: {
    color: FluxColors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  emptySub: {
    color: FluxColors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
  otaDesc: {
    color: FluxColors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  otaStatusText: {
    color: FluxColors.primaryLight,
    fontSize: 13,
    fontWeight: '700',
  },
});


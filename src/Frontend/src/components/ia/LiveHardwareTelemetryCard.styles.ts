import { StyleSheet } from 'react-native';

import { FluxColors, Radius, Spacing } from '@/constants/theme';

export const styles = StyleSheet.create({
  card: {
    gap: 16,
  },
  mainHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: FluxColors.text,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  cardSubtitle: {
    color: FluxColors.textSecondary,
    fontSize: 12,
    marginTop: -10,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  collapseToggleBtn: {
    backgroundColor: 'rgba(123, 104, 238, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(123, 104, 238, 0.3)',
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  collapseToggleText: {
    color: FluxColors.primaryLight,
    fontSize: 11,
    fontWeight: '800',
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  livePillPaused: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: FluxColors.success,
  },
  liveDotPaused: {
    backgroundColor: FluxColors.warning,
  },
  livePillText: {
    color: FluxColors.success,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  livePillTextPaused: {
    color: FluxColors.warning,
  },
  deviceQuickBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quickBarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quickBarLabel: {
    color: FluxColors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  quickBarValue: {
    color: FluxColors.text,
    fontSize: 12,
    fontWeight: '800',
  },
  chartsStack: {
    gap: 14,
  },
  chartBox: {
    backgroundColor: 'rgba(12, 14, 24, 0.85)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: FluxColors.glassBorderActive,
    padding: Spacing.three,
    gap: 8,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
  },
  chartTitle: {
    color: FluxColors.text,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendLineX: {
    width: 12,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#EF4444',
  },
  legendLineY: {
    width: 12,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#10B981',
  },
  legendLineZ: {
    width: 12,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#38BDF8',
  },
  legendLineRes: {
    width: 12,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#F59E0B',
  },
  legendText: {
    fontSize: 11,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  legendTextX: {
    color: '#F87171',
  },
  legendTextY: {
    color: '#34D399',
  },
  legendTextZ: {
    color: '#38BDF8',
  },
  legendTextRes: {
    color: '#FBBF24',
  },
  plotCanvas: {
    height: 105,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    position: 'relative',
    overflow: 'hidden',
  },
  centerZeroLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  referenceThresholdLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 0.5,
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  scaleLabelTop: {
    position: 'absolute',
    left: 6,
    top: 4,
    color: FluxColors.textMuted,
    fontSize: 9,
    fontWeight: '700',
  },
  scaleLabelCenter: {
    position: 'absolute',
    left: 6,
    top: '46%',
    color: FluxColors.textMuted,
    fontSize: 9,
    fontWeight: '700',
  },
  scaleLabelBottom: {
    position: 'absolute',
    left: 6,
    bottom: 4,
    color: FluxColors.textMuted,
    fontSize: 9,
    fontWeight: '700',
  },
  segmentReta: {
    position: 'absolute',
    borderRadius: 1,
  },
  segmentX: {
    backgroundColor: '#EF4444',
  },
  segmentY: {
    backgroundColor: '#10B981',
  },
  segmentZ: {
    backgroundColor: '#38BDF8',
  },
  segmentRes: {
    backgroundColor: '#F59E0B',
  },
  chartScaleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  chartScaleFooterText: {
    color: FluxColors.textMuted,
    fontSize: 9,
    fontWeight: '600',
  },
  footerControls: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  footerBtnCol: {
    flex: 1,
  },
  emptyNotice: {
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyNoticeTitle: {
    color: FluxColors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  emptyNoticeText: {
    color: FluxColors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 340,
    lineHeight: 18,
  },
});

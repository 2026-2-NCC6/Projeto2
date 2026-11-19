import { StyleSheet } from 'react-native';

import { FluxColors, Radius } from '@/constants/theme';

export const styles = StyleSheet.create({
  card: {
    gap: 12,
    position: 'relative',
    zIndex: 1,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: FluxColors.text,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  syncPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  syncPillText: {
    color: FluxColors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricBox: {
    flex: 1,
    backgroundColor: 'rgba(12, 14, 24, 0.65)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: FluxColors.glassBorder,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 3,
  },
  metricLabel: {
    color: FluxColors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  metricValue: {
    color: FluxColors.text,
    fontSize: 22,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  classesContainer: {
    gap: 6,
  },
  classesTitle: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  classesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  classChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  classChipActive: {
    borderColor: FluxColors.primary,
    backgroundColor: FluxColors.primarySoft,
  },
  className: {
    color: FluxColors.text,
    fontSize: 11,
    fontWeight: '700',
  },
  classBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radius.pill,
  },
  classCount: {
    color: FluxColors.primaryLight,
    fontSize: 10,
    fontWeight: '800',
  },
  exportButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  exportBtn: {
    flex: 1,
  },
});


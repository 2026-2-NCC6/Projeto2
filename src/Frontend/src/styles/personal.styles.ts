import { StyleSheet } from 'react-native';

import { BottomTabInset, FluxColors, MaxContentWidth, Radius, Spacing } from '@/constants/theme';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: FluxColors.background,
  },
  glowOrb: {
    position: 'absolute',
    top: -100,
    right: -60,
    width: 270,
    height: 270,
    borderRadius: 135,
    backgroundColor: FluxColors.primaryGlow,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: BottomTabInset + 32,
    gap: Spacing.three,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  tag: {
    color: FluxColors.primaryLight,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  screenTitle: {
    color: FluxColors.text,
    fontSize: 28,
    fontWeight: '900',
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
  resultsStack: {
    gap: 8,
  },
  alunoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(12, 14, 24, 0.72)',
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: FluxColors.glassBorder,
  },
  alunoName: {
    color: FluxColors.text,
    fontWeight: '700',
    fontSize: 14,
  },
  alunoSub: {
    color: FluxColors.textSecondary,
    fontSize: 12,
  },
  addBtn: {
    backgroundColor: FluxColors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
  },
  addBtnText: {
    color: FluxColors.text,
    fontWeight: '700',
    fontSize: 12,
  },
  clientChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  clientChip: {
    backgroundColor: 'rgba(12, 14, 24, 0.72)',
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: FluxColors.glassBorder,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  clientChipActive: {
    backgroundColor: FluxColors.primary,
    borderColor: FluxColors.primaryLight,
  },
  clientChipText: {
    color: FluxColors.text,
    fontSize: 12,
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
  movRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: FluxColors.glassBorder,
  },
  movType: {
    color: FluxColors.text,
    fontWeight: '800',
    fontSize: 13,
  },
  movSpeed: {
    color: FluxColors.textSecondary,
    fontSize: 13,
  },
  movPrecision: {
    color: FluxColors.success,
    fontWeight: '800',
    fontSize: 13,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 6,
  },
  emptyTitle: {
    color: FluxColors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  emptySub: {
    color: FluxColors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
  sessaoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessaoTitle: {
    color: FluxColors.text,
    fontSize: 17,
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
});


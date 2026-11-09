import { StyleSheet } from 'react-native';

import { BottomTabInset, FluxColors, MaxContentWidth, Radius, Spacing } from '@/constants/theme';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: FluxColors.background,
  },
  glowOrb: {
    position: 'absolute',
    top: -110,
    left: -50,
    width: 260,
    height: 260,
    borderRadius: 130,
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
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(14, 16, 26, 0.8)',
    borderRadius: Radius.pill,
    padding: 4,
    borderWidth: 1,
    borderColor: FluxColors.glassBorder,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.pill,
    alignItems: 'center',
  },
  segmentBtnActive: {
    backgroundColor: FluxColors.primary,
  },
  segmentText: {
    color: FluxColors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  formCard: {
    gap: 12,
  },
  sectionTitle: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.9,
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
  arenaCard: {
    gap: 8,
  },
  arenaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  arenaTitle: {
    color: FluxColors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  arenaLocation: {
    color: FluxColors.textSecondary,
    fontSize: 13,
    marginTop: 3,
  },
  arenaPhone: {
    color: FluxColors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  favBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(12, 14, 24, 0.75)',
    borderWidth: 1,
    borderColor: FluxColors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favBtnActive: {
    backgroundColor: FluxColors.primarySoft,
    borderColor: FluxColors.primary,
  },
  favIcon: {
    color: FluxColors.primaryLight,
    fontSize: 22,
  },
});


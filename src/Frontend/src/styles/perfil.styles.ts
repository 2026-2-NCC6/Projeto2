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
    width: 280,
    height: 280,
    borderRadius: 140,
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
  internalTabsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(14, 16, 26, 0.85)',
    borderRadius: Radius.pill,
    padding: 4,
    borderWidth: 1,
    borderColor: FluxColors.glassBorderActive,
  },
  internalTabBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: Radius.pill,
    alignItems: 'center',
  },
  internalTabBtnActive: {
    backgroundColor: FluxColors.primary,
  },
  internalTabText: {
    color: FluxColors.textSecondary,
    fontSize: 13,
    fontWeight: '800',
  },
  internalTabTextActive: {
    color: FluxColors.text,
  },
  feedStack: {
    gap: 12,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 28,
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
});

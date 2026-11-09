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
  profileCard: {
    gap: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarLarge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: FluxColors.primary,
    borderWidth: 2,
    borderColor: FluxColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: FluxColors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  profileName: {
    color: FluxColors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  profileUsername: {
    color: FluxColors.primaryLight,
    fontSize: 14,
    fontWeight: '700',
  },
  profileBio: {
    color: FluxColors.textSecondary,
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  logoutIconBtn: {
    backgroundColor: FluxColors.dangerSoft,
    borderWidth: 1,
    borderColor: FluxColors.danger,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.pill,
  },
  logoutIconText: {
    color: '#FCA5A5',
    fontSize: 11,
    fontWeight: '800',
  },
  socialStatsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  xpBarBlock: {
    gap: 6,
  },
  xpLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xpLabel: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  xpValue: {
    color: FluxColors.primaryLight,
    fontSize: 12,
    fontWeight: '800',
  },
  xpTrack: {
    height: 9,
    backgroundColor: 'rgba(10, 12, 20, 0.85)',
    borderRadius: Radius.pill,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: FluxColors.glassBorder,
  },
  xpFill: {
    height: '100%',
    backgroundColor: FluxColors.primary,
    borderRadius: Radius.pill,
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

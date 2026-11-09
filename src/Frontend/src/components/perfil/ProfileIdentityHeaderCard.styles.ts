import { StyleSheet } from 'react-native';

import { FluxColors, Radius } from '@/constants/theme';

export const styles = StyleSheet.create({
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
  profileIdentityCol: {
    flex: 1,
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
  gearIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(18, 22, 36, 0.88)',
    borderWidth: 1,
    borderColor: FluxColors.glassBorderActive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearIconText: {
    fontSize: 20,
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
});


import { StyleSheet } from 'react-native';

import { BottomTabInset, FluxColors, MaxContentWidth, Radius, Spacing } from '@/constants/theme';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: FluxColors.background,
  },
  glowOrb: {
    position: 'absolute',
    top: -80,
    right: -60,
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
    paddingTop: Spacing.two,
    paddingBottom: BottomTabInset + 48,
    gap: Spacing.three,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(123, 104, 238, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(123, 104, 238, 0.3)',
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backButtonText: {
    color: FluxColors.primaryLight,
    fontSize: 13,
    fontWeight: '800',
  },
  deviceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  deviceBadgeConnected: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  deviceDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: FluxColors.danger,
  },
  deviceDotConnected: {
    backgroundColor: FluxColors.success,
  },
  deviceBadgeText: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
});


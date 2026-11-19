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
    paddingBottom: BottomTabInset + 64,
    gap: Spacing.three,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: Spacing.three,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
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
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  deviceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  deviceDotOnline: {
    backgroundColor: FluxColors.success,
  },
  deviceDotOffline: {
    backgroundColor: FluxColors.textSecondary,
  },
  deviceText: {
    color: FluxColors.text,
    fontSize: 12,
    fontWeight: '700',
  },
});


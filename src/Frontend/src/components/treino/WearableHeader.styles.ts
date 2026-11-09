import { StyleSheet } from 'react-native';

import { FluxColors, Radius } from '@/constants/theme';

export const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  bleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  bleBadgeConnected: {
    backgroundColor: FluxColors.successSoft,
    borderColor: FluxColors.success,
  },
  bleBadgeDisconnected: {
    backgroundColor: 'rgba(148, 153, 184, 0.12)',
    borderColor: FluxColors.glassBorder,
  },
  bleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bleDotConnected: {
    backgroundColor: FluxColors.success,
  },
  bleDotDisconnected: {
    backgroundColor: FluxColors.textMuted,
  },
  bleText: {
    fontSize: 10,
    fontWeight: '800',
  },
  bleTextConnected: {
    color: FluxColors.success,
  },
  bleTextDisconnected: {
    color: FluxColors.textSecondary,
  },
});


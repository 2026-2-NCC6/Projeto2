import { StyleSheet } from 'react-native';

import { FluxColors, Radius } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  devBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(123, 104, 238, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(123, 104, 238, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  devBadgeText: {
    color: FluxColors.primaryLight,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  bleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  bleConnected: {
    backgroundColor: FluxColors.successSoft,
    borderColor: FluxColors.success,
  },
  bleDisconnected: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  bleDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  bleDotConnected: {
    backgroundColor: FluxColors.success,
  },
  bleDotDisconnected: {
    backgroundColor: '#EF4444',
  },
  bleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  bleTextConnected: {
    color: FluxColors.success,
  },
  bleTextDisconnected: {
    color: '#F87171',
  },
  titleCol: {
    gap: 4,
  },
  tag: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    color: FluxColors.text,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  subtitle: {
    color: FluxColors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
});


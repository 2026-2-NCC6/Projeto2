import { StyleSheet } from 'react-native';

import { FluxColors, Radius } from '@/constants/theme';

export const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'rgba(10, 12, 20, 0.68)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: FluxColors.glassBorder,
    paddingTop: 14,
    paddingBottom: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  plotCanvas: {
    height: 132,
    width: '100%',
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  lineSegmentPrimary: {
    position: 'absolute',
    height: 2.5,
    borderRadius: 2,
    backgroundColor: FluxColors.primary,
  },
  lineSegmentSecondary: {
    position: 'absolute',
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(165, 148, 249, 0.55)',
  },
  lineSegmentSuccess: {
    position: 'absolute',
    height: 2.5,
    borderRadius: 2,
    backgroundColor: FluxColors.success,
  },
  pointDotPrimary: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: FluxColors.primary,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  pointDotSecondary: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: FluxColors.primaryLight,
    borderWidth: 1.5,
    borderColor: '#0B0E1A',
  },
  pointDotSuccess: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: FluxColors.success,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  pointValueTag: {
    position: 'absolute',
    minWidth: 44,
    alignItems: 'center',
  },
  pointValueTextPrimary: {
    color: FluxColors.primaryLight,
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },
  pointValueTextSecondary: {
    color: FluxColors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
  },
  pointValueTextSuccess: {
    color: FluxColors.success,
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },
  xAxisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  xAxisCol: {
    alignItems: 'center',
    minWidth: 36,
    gap: 1,
  },
  xAxisLabel: {
    color: FluxColors.text,
    fontSize: 10,
    fontWeight: '800',
  },
  xAxisSubLabel: {
    color: FluxColors.textMuted,
    fontSize: 9,
    fontWeight: '600',
  },
});


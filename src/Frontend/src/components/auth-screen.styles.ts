import { StyleSheet } from 'react-native';

import { FluxColors, MaxContentWidth, Radius, Spacing } from '@/constants/theme';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: FluxColors.background,
  },
  glowOrbTop: {
    position: 'absolute',
    top: -90,
    right: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: FluxColors.primaryGlow,
  },
  glowOrbBottom: {
    position: 'absolute',
    bottom: -100,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(123, 104, 238, 0.18)',
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    gap: Spacing.four,
  },
  headerBlock: {
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    backgroundColor: FluxColors.primarySoft,
    borderWidth: 1,
    borderColor: FluxColors.glassBorderActive,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  badgeText: {
    color: FluxColors.primaryLight,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  brandTitle: {
    color: FluxColors.text,
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: 3,
  },
  brandSubtitle: {
    color: FluxColors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
  },
  authCard: {
    gap: Spacing.three,
    padding: Spacing.four,
  },
  SegmentRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(10, 11, 18, 0.75)',
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
    color: FluxColors.textSecondary,
    fontWeight: '700',
    fontSize: 14,
  },
  segmentTextActive: {
    color: FluxColors.text,
  },
  formStack: {
    gap: 14,
  },
  sectionLabel: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 4,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  roleChip: {
    flex: 1,
    backgroundColor: 'rgba(12, 14, 24, 0.72)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: FluxColors.glassBorder,
    padding: 10,
    gap: 3,
  },
  roleChipActive: {
    backgroundColor: FluxColors.primarySoft,
    borderColor: FluxColors.primary,
  },
  roleTitle: {
    color: FluxColors.textSecondary,
    fontSize: 13,
    fontWeight: '800',
  },
  roleDesc: {
    color: FluxColors.textMuted,
    fontSize: 10,
  },
  errorBox: {
    backgroundColor: FluxColors.dangerSoft,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: FluxColors.danger,
    padding: 12,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 13,
    fontWeight: '600',
  },
});


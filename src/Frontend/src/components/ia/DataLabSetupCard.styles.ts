import { StyleSheet } from 'react-native';

import { FluxColors, Radius } from '@/constants/theme';

export const styles = StyleSheet.create({
  card: {
    gap: 12,
    position: 'relative',
    zIndex: 50,
    elevation: 20,
    overflow: 'visible',
  },
  headerPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  headerLeft: {
    gap: 2,
    flex: 1,
    minWidth: 180,
  },
  sectionTitle: {
    color: FluxColors.text,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  collapsedSummary: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    maxWidth: 160,
  },
  toggleBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBadgeText: {
    color: FluxColors.primaryLight,
    fontSize: 11,
    fontWeight: '900',
  },
  bodyContainer: {
    gap: 16,
    width: '100%',
    paddingTop: 4,
  },
  descriptionText: {
    color: FluxColors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  sportLockedBadge: {
    backgroundColor: 'rgba(123, 104, 238, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(123, 104, 238, 0.3)',
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sportLockedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sportLockedIcon: {
    fontSize: 16,
  },
  sportLockedLabel: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  sportLockedValue: {
    color: FluxColors.primaryLight,
    fontSize: 13,
    fontWeight: '800',
  },
  sportLockedHint: {
    color: FluxColors.textSecondary,
    fontSize: 10,
  },
  modeSelectionContainer: {
    gap: 8,
  },
  modeLabel: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  modeButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: FluxColors.glassBorder,
    backgroundColor: 'rgba(16, 18, 30, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeButtonActive: {
    borderColor: FluxColors.primary,
    backgroundColor: 'rgba(123, 104, 238, 0.18)',
  },
  modeButtonText: {
    color: FluxColors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  modeButtonTextActive: {
    color: FluxColors.primaryLight,
    fontWeight: '900',
  },
  selectStack: {
    gap: 12,
    zIndex: 50,
    position: 'relative',
    width: '100%',
    overflow: 'visible',
  },
  selectItemWrapper: {
    position: 'relative',
    width: '100%',
    overflow: 'visible',
  },
  selectItemElevated: {
    zIndex: 9999,
    elevation: 50,
  },
  selectItem1: {
    zIndex: 60,
    elevation: 60,
  },
  selectItem2: {
    zIndex: 50,
    elevation: 50,
  },
  selectItem3: {
    zIndex: 40,
    elevation: 40,
  },
  selectItem4: {
    zIndex: 30,
    elevation: 30,
  },
  selectItem5: {
    zIndex: 20,
    elevation: 20,
  },
  selectItem6: {
    zIndex: 10,
    elevation: 10,
  },
  summaryFooter: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 12,
    gap: 4,
  },
  summaryTitle: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  summaryText: {
    color: FluxColors.text,
    fontSize: 13,
    fontWeight: '700',
  },
});

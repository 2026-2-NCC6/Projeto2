import { StyleSheet } from 'react-native';

import { FluxColors, Radius } from '@/constants/theme';

export const styles = StyleSheet.create({
  statusCard: {
    gap: 14,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  statusIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: FluxColors.successSoft,
    borderWidth: 1,
    borderColor: FluxColors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusEmoji: {
    fontSize: 22,
  },
  statusInfo: {
    flex: 1,
    gap: 2,
  },
  sectionTitle: {
    color: FluxColors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.9,
  },
  statusTitle: {
    color: FluxColors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  batteryTopRightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: FluxColors.successSoft,
    borderWidth: 1,
    borderColor: FluxColors.success,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
  },
  batteryIcon: {
    fontSize: 12,
  },
  batteryValue: {
    color: FluxColors.success,
    fontSize: 12,
    fontWeight: '800',
  },
  chevronBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(12, 14, 24, 0.78)',
    borderWidth: 1,
    borderColor: FluxColors.glassBorderActive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronText: {
    color: FluxColors.primaryLight,
    fontSize: 12,
    fontWeight: '900',
  },
  expandedSection: {
    gap: 14,
    paddingTop: 2,
  },
  metaList: {
    backgroundColor: 'rgba(12, 14, 24, 0.65)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: FluxColors.glassBorder,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 3,
  },
  metaText: {
    color: FluxColors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  actionsColumn: {
    gap: 10,
  },
});

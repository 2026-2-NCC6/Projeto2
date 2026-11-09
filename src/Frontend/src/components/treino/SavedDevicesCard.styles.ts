import { StyleSheet } from 'react-native';

import { FluxColors, Radius } from '@/constants/theme';

export const styles = StyleSheet.create({
  devicesSectionCard: {
    gap: 14,
  },
  collapsibleHeaderPressable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  headerLeftGroup: {
    flex: 1,
  },
  sectionTitle: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.9,
  },
  devicesSubTitle: {
    color: FluxColors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countBadge: {
    backgroundColor: FluxColors.primarySoft,
    borderWidth: 1,
    borderColor: FluxColors.glassBorderActive,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  countBadgeText: {
    color: FluxColors.primaryLight,
    fontSize: 11,
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
  expandedContent: {
    gap: 12,
    paddingTop: 4,
  },
  deviceList: {
    gap: 10,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: 'rgba(12, 14, 24, 0.78)',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: FluxColors.glassBorder,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  deviceMeta: {
    flex: 1,
    gap: 4,
  },
  deviceName: {
    color: FluxColors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  deviceId: {
    color: FluxColors.textSecondary,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  connectBtn: {
    minWidth: 118,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
});

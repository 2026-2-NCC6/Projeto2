import { Platform, StyleSheet } from 'react-native';

import { FluxColors, Radius } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    gap: 6,
    position: 'relative',
    width: '100%',
    overflow: 'visible',
  },
  containerOpen: {
    zIndex: 99999,
    elevation: 50,
  },
  label: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(16, 18, 30, 0.75)',
    borderWidth: 1,
    borderColor: FluxColors.glassBorder,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    width: '100%',
  },
  triggerActive: {
    borderColor: FluxColors.primary,
    backgroundColor: 'rgba(24, 28, 48, 0.9)',
  },
  triggerDisabled: {
    opacity: 0.5,
  },
  triggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  triggerIcon: {
    fontSize: 16,
  },
  triggerText: {
    color: FluxColors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  placeholderText: {
    color: FluxColors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  chevron: {
    color: FluxColors.primaryLight,
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 8,
  },
  backdrop: {
    ...(Platform.OS === 'web'
      ? { position: 'fixed' as any, top: 0, left: 0, right: 0, bottom: 0 }
      : { position: 'absolute', top: -4000, left: -4000, right: -4000, bottom: -4000 }),
    zIndex: 9998,
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 6,
    zIndex: 100000,
    elevation: 60,
    backgroundColor: '#11131F',
    borderWidth: 1,
    borderColor: FluxColors.glassBorderActive,
    borderRadius: Radius.md,
    padding: 6,
    maxHeight: 260,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
  optionsScroll: {
    maxHeight: 180,
  },
  optionsScrollContent: {
    gap: 4,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: Radius.sm,
  },
  optionItemActive: {
    backgroundColor: FluxColors.primarySoft,
  },
  optionText: {
    color: FluxColors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  optionTextActive: {
    color: FluxColors.primaryLight,
    fontWeight: '800',
  },
  checkMark: {
    color: FluxColors.primaryLight,
    fontSize: 13,
    fontWeight: '900',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 4,
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(123, 104, 238, 0.12)',
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(123, 104, 238, 0.3)',
  },
  addNewIcon: {
    fontSize: 12,
  },
  addNewText: {
    color: FluxColors.primaryLight,
    fontSize: 13,
    fontWeight: '800',
  },
});

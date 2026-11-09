import { StyleSheet } from 'react-native';

import { FluxColors, Radius } from '@/constants/theme';

export const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    zIndex: 999,
  },
  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    minWidth: 82,
    backgroundColor: '#0D101D',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: FluxColors.glassBorderActive,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  selectTriggerOpen: {
    borderColor: FluxColors.primary,
    backgroundColor: '#191833',
  },
  selectedText: {
    color: FluxColors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  chevron: {
    color: FluxColors.primaryLight,
    fontSize: 10,
    fontWeight: '900',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '110%',
    left: 0,
    right: 0,
    zIndex: 9999,
    backgroundColor: '#141728',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: FluxColors.primary,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.65,
    shadowRadius: 14,
    elevation: 20,
  },
  optionItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  optionItemActive: {
    backgroundColor: FluxColors.primarySoft,
  },
  optionText: {
    color: FluxColors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  optionTextActive: {
    color: FluxColors.text,
    fontWeight: '900',
  },
});


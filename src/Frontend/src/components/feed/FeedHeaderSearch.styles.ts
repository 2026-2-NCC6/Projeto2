import { StyleSheet } from 'react-native';

import { FluxColors, Radius } from '@/constants/theme';

export const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagText: {
    color: FluxColors.primaryLight,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  screenTitle: {
    color: FluxColors.text,
    fontSize: 26,
    fontWeight: '900',
    marginTop: 2,
  },
  searchToggleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(18, 22, 36, 0.9)',
    borderWidth: 1,
    borderColor: FluxColors.glassBorderActive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchToggleBtnActive: {
    backgroundColor: FluxColors.primarySoft,
    borderColor: FluxColors.primary,
  },
  searchToggleIcon: {
    fontSize: 18,
    color: FluxColors.text,
    fontWeight: '800',
  },
  expandedSearchDrawer: {
    gap: 10,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(12, 14, 24, 0.88)',
    borderWidth: 1,
    borderColor: FluxColors.glassBorderActive,
    borderRadius: Radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInputIcon: {
    fontSize: 15,
  },
  searchInput: {
    flex: 1,
    color: FluxColors.text,
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 2,
  },
  clearQueryBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  clearQueryText: {
    color: FluxColors.textSecondary,
    fontSize: 13,
    fontWeight: '800',
  },
  resultsList: {
    gap: 8,
  },
  emptySearchBox: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  emptySearchText: {
    color: FluxColors.textSecondary,
    fontSize: 12,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(12, 14, 24, 0.78)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: FluxColors.glassBorder,
    gap: 10,
  },
  userLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: FluxColors.primarySoft,
    borderWidth: 1,
    borderColor: FluxColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    color: FluxColors.primaryLight,
    fontSize: 14,
    fontWeight: '900',
  },
  userInfoCol: {
    flex: 1,
  },
  userRowName: {
    color: FluxColors.text,
    fontWeight: '800',
    fontSize: 14,
  },
  userRowSub: {
    color: FluxColors.textSecondary,
    fontSize: 12,
  },
  followBtn: {
    backgroundColor: FluxColors.primarySoft,
    borderWidth: 1,
    borderColor: FluxColors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.pill,
  },
  followBtnText: {
    color: FluxColors.primaryLight,
    fontWeight: '800',
    fontSize: 12,
  },
});


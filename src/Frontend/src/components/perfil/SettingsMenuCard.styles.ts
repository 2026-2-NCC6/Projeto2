import { StyleSheet } from 'react-native';

import { FluxColors, Radius } from '@/constants/theme';

export const styles = StyleSheet.create({
  wrapper: {
    gap: 14,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(18, 22, 36, 0.88)',
    borderWidth: 1,
    borderColor: FluxColors.glassBorderActive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    color: FluxColors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  headerTitleCol: {
    flex: 1,
  },
  headerTag: {
    color: FluxColors.primaryLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  headerTitle: {
    color: FluxColors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  userSummaryCard: {
    gap: 12,
  },
  userSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: FluxColors.primary,
    borderWidth: 2,
    borderColor: FluxColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: FluxColors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  userIdentityCol: {
    flex: 1,
    gap: 2,
  },
  userNameText: {
    color: FluxColors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  userSubText: {
    color: FluxColors.primaryLight,
    fontSize: 13,
    fontWeight: '700',
  },
  userEmailText: {
    color: FluxColors.textSecondary,
    fontSize: 12,
  },
  menuSectionCard: {
    gap: 10,
  },
  sectionLabel: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.9,
  },
  menuOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(10, 12, 20, 0.72)',
    borderWidth: 1,
    borderColor: FluxColors.glassBorderActive,
    borderRadius: Radius.md,
    padding: 14,
    gap: 12,
  },
  menuOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  menuOptionIconBox: {
    width: 38,
    height: 38,
    borderRadius: Radius.sm,
    backgroundColor: FluxColors.primarySoft,
    borderWidth: 1,
    borderColor: FluxColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuOptionEmoji: {
    fontSize: 18,
  },
  menuOptionTextCol: {
    flex: 1,
    gap: 2,
  },
  menuOptionTitle: {
    color: FluxColors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  menuOptionDesc: {
    color: FluxColors.textSecondary,
    fontSize: 12,
  },
  menuOptionArrow: {
    color: FluxColors.primaryLight,
    fontSize: 18,
    fontWeight: '900',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: FluxColors.glassBorder,
  },
  infoLabel: {
    color: FluxColors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  infoValue: {
    color: FluxColors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  logoutCard: {
    gap: 12,
  },
  logoutActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FluxColors.dangerSoft,
    borderWidth: 1,
    borderColor: FluxColors.danger,
    borderRadius: Radius.lg,
    paddingVertical: 14,
    paddingHorizontal: 18,
    gap: 8,
  },
  logoutActionBtnText: {
    color: '#FCA5A5',
    fontSize: 15,
    fontWeight: '800',
  },
  confirmLogoutBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.14)',
    borderWidth: 1,
    borderColor: FluxColors.danger,
    borderRadius: Radius.md,
    padding: 14,
    gap: 10,
  },
  confirmLogoutText: {
    color: '#FECACA',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },
  confirmLogoutRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelLogoutBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: FluxColors.glassBorder,
    borderRadius: Radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  cancelLogoutBtnText: {
    color: FluxColors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  confirmLogoutSubmitBtn: {
    backgroundColor: FluxColors.danger,
    borderRadius: Radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  confirmLogoutSubmitText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});


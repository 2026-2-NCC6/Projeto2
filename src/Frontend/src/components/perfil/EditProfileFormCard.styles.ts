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
  formCard: {
    gap: 14,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  textInput: {
    backgroundColor: 'rgba(10, 12, 20, 0.78)',
    borderWidth: 1,
    borderColor: FluxColors.glassBorderActive,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: FluxColors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  bioInput: {
    minHeight: 84,
    textAlignVertical: 'top',
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 12, 20, 0.72)',
    borderWidth: 1,
    borderColor: FluxColors.glassBorder,
    borderRadius: Radius.md,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  optionPillActive: {
    backgroundColor: FluxColors.primarySoft,
    borderColor: FluxColors.primary,
  },
  optionPillText: {
    color: FluxColors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  optionPillTextActive: {
    color: FluxColors.primaryLight,
    fontWeight: '800',
  },
  privacyToggleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(10, 12, 20, 0.72)',
    borderWidth: 1,
    borderColor: FluxColors.glassBorder,
    borderRadius: Radius.md,
    padding: 12,
    gap: 12,
  },
  privacyTextCol: {
    flex: 1,
    gap: 2,
  },
  privacyTitle: {
    color: FluxColors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  privacyDesc: {
    color: FluxColors.textSecondary,
    fontSize: 11,
  },
  privacySwitchBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: FluxColors.glassBorderActive,
    borderRadius: Radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  privacySwitchBtnActive: {
    backgroundColor: FluxColors.primary,
    borderColor: FluxColors.primaryLight,
  },
  privacySwitchText: {
    color: FluxColors.text,
    fontSize: 12,
    fontWeight: '800',
  },
  actionsRow: {
    gap: 10,
    marginTop: 4,
  },
});


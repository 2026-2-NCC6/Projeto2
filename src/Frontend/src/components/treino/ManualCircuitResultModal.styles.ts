import { StyleSheet } from 'react-native';

import { FluxColors, Radius } from '@/constants/theme';

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(6, 7, 13, 0.84)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 460,
  },
  modalCard: {
    gap: 14,
    paddingVertical: 20,
    paddingHorizontal: 18,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tag: {
    color: FluxColors.warning,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  modalTitle: {
    color: FluxColors.text,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
  },
  metaSubtitle: {
    color: FluxColors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: FluxColors.glass,
    borderWidth: 1,
    borderColor: FluxColors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: FluxColors.textSecondary,
    fontSize: 14,
    fontWeight: '800',
  },
  fieldGroup: {
    gap: 6,
  },
  timeFieldGroup: {
    gap: 6,
    zIndex: 200,
  },
  fieldLabel: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  input: {
    backgroundColor: 'rgba(12, 14, 24, 0.85)',
    borderWidth: 1,
    borderColor: FluxColors.glassBorderActive,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: FluxColors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  inputDisabled: {
    backgroundColor: 'rgba(12, 14, 24, 0.35)',
    borderColor: FluxColors.glassBorder,
    color: FluxColors.textMuted,
    opacity: 0.55,
  },
  inputInvalid: {
    borderColor: FluxColors.danger,
  },
  timeValueAndUnitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 200,
  },
  flexInput: {
    flex: 1,
  },
  strokeTypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  strokeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(12, 14, 24, 0.75)',
    borderWidth: 1,
    borderColor: FluxColors.glassBorder,
  },
  strokeChipActive: {
    backgroundColor: FluxColors.primarySoft,
    borderColor: FluxColors.primary,
  },
  strokeChipText: {
    color: FluxColors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  strokeChipTextActive: {
    color: FluxColors.primaryLight,
    fontWeight: '800',
  },
  optionalCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 2,
  },
  checkboxLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: FluxColors.glassBorderActive,
    backgroundColor: 'rgba(12, 14, 24, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: FluxColors.primary,
    borderColor: FluxColors.primaryLight,
  },
  checkboxCheckmark: {
    color: FluxColors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  hitsRatioBadge: {
    backgroundColor: FluxColors.primarySoft,
    borderWidth: 1,
    borderColor: FluxColors.glassBorderActive,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  hitsRatioText: {
    color: FluxColors.primaryLight,
    fontSize: 11,
    fontWeight: '800',
  },
  limitNoticeText: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  limitNoticeDanger: {
    color: FluxColors.danger,
    fontWeight: '700',
  },
  errorText: {
    color: FluxColors.danger,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  halfButton: {
    flex: 1,
  },
});

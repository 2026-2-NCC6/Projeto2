import { StyleSheet } from 'react-native';

import { FluxColors, Radius } from '@/constants/theme';

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(6, 7, 13, 0.82)',
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
    paddingVertical: 22,
    paddingHorizontal: 18,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tag: {
    color: FluxColors.primaryLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  modalTitle: {
    color: FluxColors.text,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: FluxColors.textSecondary,
    fontSize: 14,
    fontWeight: '800',
  },
  fieldLabel: {
    color: FluxColors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  modeSelectorRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modeOption: {
    flex: 1,
    backgroundColor: 'rgba(12, 14, 24, 0.78)',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: FluxColors.glassBorder,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 6,
  },
  modeOptionActive: {
    backgroundColor: FluxColors.primarySoft,
    borderColor: FluxColors.primary,
  },
  modeEmoji: {
    fontSize: 20,
  },
  modeOptionTitle: {
    color: FluxColors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  modeOptionTitleActive: {
    color: FluxColors.text,
  },
  inputsGroup: {
    gap: 6,
    zIndex: 1,
  },
  tempoFreqGroup: {
    gap: 12,
    zIndex: 100,
  },
  timeFieldGroup: {
    gap: 6,
    zIndex: 200,
  },
  freqFieldGroup: {
    gap: 6,
    zIndex: 1,
  },
  timeValueAndUnitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 300,
  },
  flexInput: {
    flex: 1,
  },
  input: {
    backgroundColor: 'rgba(10, 12, 20, 0.88)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: FluxColors.glassBorderActive,
    color: FluxColors.text,
    fontSize: 15,
    fontWeight: '700',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  presetSequenceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    backgroundColor: 'rgba(12, 14, 24, 0.75)',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: FluxColors.glassBorderActive,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  presetLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  presetIcon: {
    fontSize: 20,
  },
  presetTexts: {
    flex: 1,
    gap: 2,
  },
  presetTitle: {
    color: FluxColors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  presetSub: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
  },
  soonBadge: {
    backgroundColor: FluxColors.primarySoft,
    borderWidth: 1,
    borderColor: FluxColors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  soonBadgeText: {
    color: FluxColors.primaryLight,
    fontSize: 9,
    fontWeight: '800',
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


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
    maxWidth: 420,
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
  description: {
    color: FluxColors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  fieldGroup: {
    gap: 6,
    zIndex: 50,
  },
  fieldLabel: {
    color: FluxColors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timeInput: {
    flex: 1,
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
  halfBtn: {
    flex: 1,
  },
});


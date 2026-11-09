import { StyleSheet } from 'react-native';

import { FluxColors, Radius } from '@/constants/theme';

export const styles = StyleSheet.create({
  toastWrapper: {
    position: 'absolute',
    top: 24,
    left: 16,
    right: 16,
    zIndex: 999,
    alignItems: 'center',
  },
  toastPopup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(18, 22, 38, 0.96)',
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 12,
  },
  toastPopupSuccess: {
    borderColor: FluxColors.primary,
    shadowColor: FluxColors.primary,
  },
  toastPopupError: {
    borderColor: FluxColors.danger,
    shadowColor: FluxColors.danger,
  },
  toastIcon: {
    fontSize: 15,
  },
  toastText: {
    color: FluxColors.text,
    fontWeight: '800',
    fontSize: 13,
  },
});


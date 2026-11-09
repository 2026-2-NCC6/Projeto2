import { StyleSheet } from 'react-native';

import { FluxColors, Radius } from '@/constants/theme';

export const styles = StyleSheet.create({
  connectorWrapper: {
    alignItems: 'center',
    marginVertical: 2,
  },
  connectorLine: {
    width: 2,
    height: 10,
    backgroundColor: FluxColors.glassBorderActive,
  },
  addIntervalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(18, 22, 36, 0.9)',
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: FluxColors.glassBorderActive,
    paddingVertical: 7,
    paddingHorizontal: 16,
  },
  addIntervalIcon: {
    fontSize: 13,
  },
  addIntervalText: {
    color: FluxColors.primaryLight,
    fontSize: 12,
    fontWeight: '800',
  },
  intervalBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
    backgroundColor: 'rgba(16, 19, 32, 0.92)',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: FluxColors.glassBorderActive,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  intervalBoxActive: {
    backgroundColor: FluxColors.primarySoft,
    borderColor: FluxColors.primary,
  },
  intervalBoxDone: {
    backgroundColor: FluxColors.successSoft,
    borderColor: FluxColors.success,
  },
  intervalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  intervalEmoji: {
    fontSize: 18,
  },
  intervalTitle: {
    color: FluxColors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  intervalCountdownText: {
    fontSize: 22,
    fontWeight: '900',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  intervalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 12, 20, 0.78)',
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: FluxColors.glassBorderActive,
    overflow: 'hidden',
  },
  stepBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  stepDivider: {
    width: 1,
    height: 16,
    backgroundColor: FluxColors.glassBorderActive,
  },
  stepBtnText: {
    color: FluxColors.primaryLight,
    fontSize: 11,
    fontWeight: '800',
  },
  skipBtn: {
    backgroundColor: FluxColors.primary,
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  skipBtnText: {
    color: FluxColors.text,
    fontSize: 11,
    fontWeight: '800',
  },
  iconActionBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  iconActionText: {
    color: FluxColors.primaryLight,
    fontSize: 11,
    fontWeight: '700',
  },
  removeBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 92, 122, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    color: FluxColors.danger,
    fontSize: 11,
    fontWeight: '800',
  },
});

import { StyleSheet } from 'react-native';

import { FluxColors, Radius, Spacing } from '@/constants/theme';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: FluxColors.glassSurface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: FluxColors.glassBorder,
    padding: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 6,
  },
  cardHighlighted: {
    borderColor: FluxColors.glassBorderActive,
    backgroundColor: FluxColors.glassSurfaceElevated,
    shadowColor: FluxColors.primary,
    shadowOpacity: 0.25,
  },
  buttonBase: {
    borderRadius: Radius.pill,
    paddingVertical: 14,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonPrimary: {
    backgroundColor: FluxColors.primary,
    borderWidth: 1,
    borderColor: FluxColors.primaryLight,
    shadowColor: FluxColors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonGhost: {
    backgroundColor: FluxColors.primarySoft,
    borderWidth: 1,
    borderColor: FluxColors.glassBorderActive,
  },
  buttonDanger: {
    backgroundColor: FluxColors.dangerSoft,
    borderWidth: 1,
    borderColor: FluxColors.danger,
  },
  buttonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: FluxColors.text,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  inputWrapper: {
    gap: 6,
  },
  inputLabel: {
    color: FluxColors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: 'rgba(12, 14, 24, 0.78)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: FluxColors.glassBorder,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: FluxColors.text,
    fontSize: 15,
  },
  metricPill: {
    flex: 1,
    backgroundColor: 'rgba(12, 14, 24, 0.65)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: FluxColors.glassBorder,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 2,
  },
  metricPillAccent: {
    backgroundColor: FluxColors.primarySoft,
    borderColor: FluxColors.glassBorderActive,
  },
  metricLabel: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValue: {
    color: FluxColors.text,
    fontSize: 18,
    fontWeight: '800',
  },
});


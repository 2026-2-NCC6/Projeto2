import { StyleSheet } from 'react-native';

import { FluxColors, Radius } from '@/constants/theme';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 6, 12, 0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'rgba(20, 24, 40, 0.96)',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: FluxColors.glassBorderActive,
    padding: 20,
    gap: 16,
    shadowColor: FluxColors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    gap: 4,
  },
  tag: {
    color: FluxColors.primaryLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  title: {
    color: FluxColors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    color: FluxColors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: Radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: FluxColors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  actionCol: {
    flex: 1,
  },
});


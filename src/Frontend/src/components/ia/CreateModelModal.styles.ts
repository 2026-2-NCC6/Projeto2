import { StyleSheet } from 'react-native';

import { FluxColors, Radius, Spacing } from '@/constants/theme';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 13, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.three,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: 'rgba(18, 20, 36, 0.98)',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(123, 104, 238, 0.35)',
    padding: Spacing.four,
    gap: Spacing.three,
  },
  header: {
    gap: Spacing.one,
  },
  tag: {
    color: FluxColors.primaryLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: FluxColors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  subtitle: {
    color: FluxColors.textSecondary,
    fontSize: 12,
  },
  formGroup: {
    gap: 6,
  },
  fieldLabel: {
    color: FluxColors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    color: FluxColors.text,
    fontSize: 13,
  },
  idPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.one,
  },
  idPreviewText: {
    color: FluxColors.textSecondary,
    fontSize: 11,
  },
  idHighlight: {
    color: FluxColors.primaryLight,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  actionCol: {
    flex: 1,
  },
});

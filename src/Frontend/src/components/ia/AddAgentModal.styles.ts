import { StyleSheet } from 'react-native';

import { FluxColors, Radius, Spacing } from '@/constants/theme';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.three,
  },
  modalCard: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '92%',
    backgroundColor: 'rgba(16, 18, 30, 0.98)',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: FluxColors.glassBorderActive,
    padding: Spacing.four,
    gap: 14,
    shadowColor: FluxColors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 20,
  },
  header: {
    gap: 4,
  },
  tag: {
    color: FluxColors.primaryLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    color: FluxColors.text,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  subtitle: {
    color: FluxColors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  scrollBody: {
    maxHeight: 440,
  },
  scrollContent: {
    gap: 14,
    paddingBottom: 8,
  },
  sectionTitle: {
    color: FluxColors.primaryLight,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 6,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: FluxColors.glassBorder,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: FluxColors.text,
    fontSize: 13,
  },
  rowFields: {
    flexDirection: 'row',
    gap: 10,
  },
  halfCol: {
    flex: 1,
  },
  thirdCol: {
    flex: 1,
  },
  genderToggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: FluxColors.glassBorder,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderBtnActive: {
    borderColor: FluxColors.primary,
    backgroundColor: FluxColors.primarySoft,
  },
  genderBtnText: {
    color: FluxColors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  genderBtnTextActive: {
    color: FluxColors.primaryLight,
    fontWeight: '800',
  },
  footerActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  actionCol: {
    flex: 1,
  },
});


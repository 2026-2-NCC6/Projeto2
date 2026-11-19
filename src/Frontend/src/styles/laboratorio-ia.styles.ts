import { StyleSheet } from 'react-native';

import { BottomTabInset, FluxColors, MaxContentWidth, Spacing } from '@/constants/theme';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: FluxColors.background,
  },
  glowOrb: {
    position: 'absolute',
    top: -100,
    right: -70,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: FluxColors.primaryGlow,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: BottomTabInset + 100,
    gap: Spacing.three,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  topModelSection: {
    position: 'relative',
    zIndex: 100,
    elevation: 20,
  },
  setupSection: {
    position: 'relative',
    zIndex: 5,
    elevation: 2,
  },
  lowerSection: {
    position: 'relative',
    zIndex: 1,
    elevation: 1,
  },
  // Botão de Gravar Flutuante Fixo Acima do Navigation Bar
  floatingRecordDock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: BottomTabInset + 12,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    zIndex: 999,
    elevation: 20,
  },
  floatingRecordInner: {
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  recordButton: {
    paddingVertical: 15,
    shadowColor: FluxColors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 12,
  },
});

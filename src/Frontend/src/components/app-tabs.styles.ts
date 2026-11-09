import { StyleSheet } from 'react-native';

import { FluxColors, MaxContentWidth, Radius } from '@/constants/theme';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: FluxColors.background,
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: FluxColors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassTabBar: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: 'rgba(18, 20, 32, 0.92)',
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: FluxColors.glassBorderActive,
    paddingVertical: 8,
    paddingHorizontal: 8,
    maxWidth: MaxContentWidth,
    justifyContent: 'space-between',
    shadowColor: FluxColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 10,
  },
  tabTrigger: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: Radius.lg,
    gap: 2,
  },
  tabTriggerActive: {
    backgroundColor: FluxColors.primarySoft,
    borderWidth: 1,
    borderColor: FluxColors.primary,
  },
  tabIcon: {
    fontSize: 16,
  },
  tabLabel: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  tabLabelActive: {
    color: FluxColors.text,
  },
});


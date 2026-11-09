import { StyleSheet } from 'react-native';

import { BottomTabInset, FluxColors, MaxContentWidth, Spacing } from '@/constants/theme';

export const styles = StyleSheet.create({
  dockWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: BottomTabInset + 10,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    zIndex: 50,
  },
  dockContainer: {
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  startButton: {
    paddingVertical: 16,
    shadowColor: FluxColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 12,
  },
});


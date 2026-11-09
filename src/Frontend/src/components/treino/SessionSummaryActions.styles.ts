import { StyleSheet } from 'react-native';

import { FluxColors } from '@/constants/theme';

export const styles = StyleSheet.create({
  footerCard: {
    gap: 12,
    marginTop: 8,
  },
  footerHint: {
    color: FluxColors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  buttonsCol: {
    gap: 10,
  },
});


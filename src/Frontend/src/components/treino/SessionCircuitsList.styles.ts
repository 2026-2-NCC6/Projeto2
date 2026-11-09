import { StyleSheet } from 'react-native';

import { FluxColors } from '@/constants/theme';

export const styles = StyleSheet.create({
  sectionContainer: {
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  headerButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.9,
  },
  sectionCount: {
    color: FluxColors.primaryLight,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  createCircuitBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 28,
  },
  emptyTitle: {
    color: FluxColors.text,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptySub: {
    color: FluxColors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  circuitsStack: {
    gap: 14,
  },
});

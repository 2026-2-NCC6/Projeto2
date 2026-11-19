import { StyleSheet } from 'react-native';

import { FluxColors, Radius } from '@/constants/theme';

export const styles = StyleSheet.create({
  card: {
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleCol: {
    gap: 2,
  },
  tag: {
    color: FluxColors.primaryLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  title: {
    color: FluxColors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  devBadge: {
    backgroundColor: 'rgba(123, 104, 238, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(123, 104, 238, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  devBadgeText: {
    color: FluxColors.primaryLight,
    fontSize: 11,
    fontWeight: '800',
  },
  description: {
    color: FluxColors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(12, 14, 24, 0.65)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: FluxColors.glassBorder,
    padding: 10,
    gap: 3,
  },
  statLabel: {
    color: FluxColors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statValue: {
    color: FluxColors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  actionsCol: {
    gap: 8,
    marginTop: 4,
  },
});


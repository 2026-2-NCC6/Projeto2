import { StyleSheet } from 'react-native';

import { FluxColors } from '@/constants/theme';

export const styles = StyleSheet.create({
  sessionCard: {
    gap: 14,
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: FluxColors.success,
  },
  liveBadgeText: {
    color: FluxColors.success,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.9,
  },
  sessionTitle: {
    color: FluxColors.text,
    fontSize: 24,
    fontWeight: '900',
  },
  sessionSub: {
    color: FluxColors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  sessionIdText: {
    color: FluxColors.textMuted,
    fontSize: 11,
    fontFamily: 'monospace',
  },
  actionsStack: {
    marginTop: 8,
    gap: 10,
  },
});


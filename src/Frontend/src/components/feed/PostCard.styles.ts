import { StyleSheet } from 'react-native';

import { FluxColors, Radius } from '@/constants/theme';

export const styles = StyleSheet.create({
  postCard: {
    gap: 12,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: FluxColors.primarySoft,
    borderWidth: 1,
    borderColor: FluxColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: FluxColors.primaryLight,
    fontSize: 16,
    fontWeight: '900',
  },
  postAuthor: {
    color: FluxColors.text,
    fontWeight: '800',
    fontSize: 15,
  },
  postTime: {
    color: FluxColors.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  workoutTag: {
    backgroundColor: FluxColors.successSoft,
    borderWidth: 1,
    borderColor: FluxColors.success,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  workoutTagText: {
    color: FluxColors.success,
    fontSize: 10,
    fontWeight: '800',
  },
  postBody: {
    color: FluxColors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  actionPill: {
    backgroundColor: FluxColors.primarySoft,
    borderWidth: 1,
    borderColor: FluxColors.glassBorderActive,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
  },
  actionPillText: {
    color: FluxColors.primaryLight,
    fontWeight: '700',
    fontSize: 13,
  },
  commentCount: {
    color: FluxColors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  commentsList: {
    gap: 6,
    backgroundColor: 'rgba(10, 12, 20, 0.55)',
    padding: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: FluxColors.glassBorder,
  },
  commentItem: {
    paddingVertical: 2,
  },
  commentText: {
    color: FluxColors.textSecondary,
    fontSize: 13,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sendCommentBtn: {
    backgroundColor: FluxColors.primary,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: Radius.md,
  },
  sendCommentText: {
    color: FluxColors.text,
    fontWeight: '700',
    fontSize: 13,
  },
});


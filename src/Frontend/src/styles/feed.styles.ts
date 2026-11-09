import { StyleSheet } from 'react-native';

import { BottomTabInset, FluxColors, MaxContentWidth, Radius, Spacing } from '@/constants/theme';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: FluxColors.background,
  },
  ambientGlow: {
    position: 'absolute',
    top: -120,
    left: -60,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: FluxColors.primaryGlow,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: BottomTabInset + 32,
    gap: Spacing.three,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  heroCard: {
    gap: 16,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingText: {
    color: FluxColors.primaryLight,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  athleteName: {
    color: FluxColors.text,
    fontSize: 24,
    fontWeight: '900',
    marginTop: 2,
  },
  usernameText: {
    color: FluxColors.textSecondary,
    fontSize: 13,
  },
  levelBadge: {
    backgroundColor: FluxColors.primary,
    borderRadius: Radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: FluxColors.primaryLight,
  },
  levelBadgeLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    fontWeight: '800',
  },
  levelBadgeNumber: {
    color: FluxColors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  xpBarBlock: {
    gap: 6,
  },
  xpLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xpLabel: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  xpValue: {
    color: FluxColors.primaryLight,
    fontSize: 12,
    fontWeight: '800',
  },
  xpTrack: {
    height: 10,
    backgroundColor: 'rgba(10, 12, 20, 0.85)',
    borderRadius: Radius.pill,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: FluxColors.glassBorder,
  },
  xpFill: {
    height: '100%',
    backgroundColor: FluxColors.primary,
    borderRadius: Radius.pill,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  sectionCard: {
    gap: 12,
  },
  sectionTitle: {
    color: FluxColors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  searchResults: {
    gap: 8,
    marginTop: 4,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(12, 14, 24, 0.7)',
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: FluxColors.glassBorder,
  },
  userRowName: {
    color: FluxColors.text,
    fontWeight: '700',
    fontSize: 14,
  },
  userRowSub: {
    color: FluxColors.textSecondary,
    fontSize: 12,
  },
  followBtn: {
    backgroundColor: FluxColors.primarySoft,
    borderWidth: 1,
    borderColor: FluxColors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.pill,
  },
  followBtnText: {
    color: FluxColors.primaryLight,
    fontWeight: '700',
    fontSize: 12,
  },
  feedHeading: {
    color: FluxColors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginLeft: 4,
    marginTop: 4,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 6,
  },
  emptyTitle: {
    color: FluxColors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: FluxColors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
  postCard: {
    gap: 12,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: FluxColors.primarySoft,
    borderWidth: 1,
    borderColor: FluxColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 18,
  },
  postAuthor: {
    color: FluxColors.text,
    fontWeight: '800',
    fontSize: 15,
  },
  postTime: {
    color: FluxColors.textMuted,
    fontSize: 11,
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


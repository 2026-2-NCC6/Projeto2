import { StyleSheet } from 'react-native';

import { FluxColors, Radius } from '@/constants/theme';

export const styles = StyleSheet.create({
  card: {
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  titleBlock: {
    gap: 2,
  },
  sectionTitle: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.9,
  },
  sectionSubtitle: {
    color: FluxColors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(8, 10, 18, 0.9)',
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: FluxColors.glassBorder,
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 8,
  },
  monthNavBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  monthNavBtnText: {
    color: FluxColors.primaryLight,
    fontSize: 11,
    fontWeight: '900',
  },
  monthTitleText: {
    color: FluxColors.text,
    fontSize: 12,
    fontWeight: '800',
    minWidth: 105,
    textAlign: 'center',
  },
  calendarFrame: {
    backgroundColor: 'rgba(10, 12, 20, 0.68)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: FluxColors.glassBorder,
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 8,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekDayCell: {
    width: '14.28%',
    alignItems: 'center',
  },
  weekDayLabel: {
    color: FluxColors.textMuted,
    fontSize: 10,
    fontWeight: '800',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8,
  },
  dayCellWrapper: {
    width: '14.28%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBubbleEmpty: {
    width: 34,
    height: 34,
  },
  dayBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  dayBubbleTrained: {
    backgroundColor: FluxColors.primary,
    borderColor: FluxColors.primaryLight,
    borderWidth: 1.5,
  },
  dayBubbleIntense: {
    backgroundColor: FluxColors.success,
    borderColor: '#A7F3D0',
    borderWidth: 1.5,
  },
  dayBubbleToday: {
    borderColor: FluxColors.primaryLight,
    borderWidth: 1.5,
  },
  dayBubbleSelected: {
    transform: [{ scale: 1.08 }],
  },
  dayNumberText: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  dayNumberTextTrained: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  trainedDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  selectedDayBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: FluxColors.primarySoft,
    borderWidth: 1,
    borderColor: FluxColors.primary,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectedDayText: {
    color: FluxColors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  selectedDayScore: {
    color: FluxColors.primaryLight,
    fontSize: 12,
    fontWeight: '900',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
  },
  legendGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendBubbleEmpty: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  legendBubbleTrained: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: FluxColors.primary,
  },
  legendBubbleIntense: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: FluxColors.success,
  },
  legendLabel: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  constancyBadge: {
    backgroundColor: FluxColors.primarySoft,
    borderWidth: 1,
    borderColor: FluxColors.primary,
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  constancyBadgeText: {
    color: FluxColors.primaryLight,
    fontSize: 11,
    fontWeight: '800',
  },
});


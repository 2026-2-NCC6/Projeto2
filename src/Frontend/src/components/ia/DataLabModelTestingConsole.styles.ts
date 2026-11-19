import { StyleSheet } from 'react-native';

import { FluxColors, Radius, Spacing } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
    width: '100%',
  },
  // 1. Cabeçalho do Modelo em Teste
  headerCard: {
    gap: Spacing.two,
    padding: Spacing.three,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  headerLeft: {
    gap: Spacing.half,
    flex: 1,
    minWidth: 180,
  },
  tagModel: {
    color: FluxColors.primaryLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  modelTitle: {
    color: FluxColors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  sportBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  sportBadgeText: {
    color: FluxColors.text,
    fontSize: 11,
    fontWeight: '700',
  },
  versionBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: '#38BDF8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  versionBadgeText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
  },
  // 2. Indicador do Estado Atual do Dispositivo em Tempo Real
  stateCard: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  stateRepouso: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  stateMovimento: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.45)',
  },
  stateImpacto: {
    backgroundColor: 'rgba(123, 104, 238, 0.22)',
    borderColor: FluxColors.primaryLight,
  },
  stateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stateLabel: {
    color: FluxColors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  stateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotRepouso: {
    backgroundColor: FluxColors.success,
  },
  dotMovimento: {
    backgroundColor: FluxColors.warning,
  },
  dotImpacto: {
    backgroundColor: FluxColors.primaryLight,
  },
  stateMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  textRepouso: {
    color: FluxColors.success,
  },
  textMovimento: {
    color: FluxColors.warning,
  },
  textImpacto: {
    color: FluxColors.primaryLight,
  },
  accelValue: {
    color: FluxColors.text,
    fontSize: 18,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  accelUnit: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  // 3. Card Hero do Golpe Classificado
  heroPredictionCard: {
    gap: Spacing.two,
    padding: Spacing.three,
    backgroundColor: 'rgba(14, 16, 28, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(123, 104, 238, 0.45)',
    borderRadius: Radius.lg,
  },
  heroPredictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroPredictionTag: {
    color: FluxColors.primaryLight,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  confidenceBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    borderWidth: 1,
    borderColor: FluxColors.success,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  confidenceText: {
    color: FluxColors.success,
    fontSize: 12,
    fontWeight: '900',
  },
  heroStrokeTitle: {
    color: FluxColors.text,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginVertical: 4,
  },
  heroStrokeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 8,
  },
  heroLatencyText: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  heroPeakText: {
    color: FluxColors.primaryLight,
    fontSize: 11,
    fontWeight: '800',
  },
  heroEmptyText: {
    color: FluxColors.textSecondary,
    fontSize: 13,
    fontStyle: 'italic',
    paddingVertical: 12,
    textAlign: 'center',
  },
  // 4. Placar da Sessão de Testes
  scoreCard: {
    gap: Spacing.two,
    padding: Spacing.three,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreTitle: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  scoreTotalBadge: {
    color: FluxColors.primaryLight,
    fontSize: 12,
    fontWeight: '800',
  },
  scoreList: {
    flexDirection: 'column',
    gap: Spacing.one,
  },
  scoreRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
    borderRadius: Radius.md,
  },
  scoreRowItemActive: {
    borderColor: 'rgba(123, 104, 238, 0.35)',
    backgroundColor: 'rgba(123, 104, 238, 0.1)',
  },
  scoreStrokeName: {
    color: FluxColors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  scoreCountBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  scoreCountBadgeActive: {
    backgroundColor: FluxColors.primaryDark,
  },
  scoreCountText: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  scoreCountTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  // 5. Feed de Detecções Recentes
  feedSection: {
    gap: Spacing.one,
    padding: Spacing.three,
  },
  feedTitle: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  feedList: {
    flexDirection: 'column',
    gap: 6,
    maxHeight: 200,
  },
  feedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  // Explicabilidade Biomecânica (XAI)
  xaiSection: {
    marginTop: Spacing.two,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    gap: 8,
  },
  xaiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  xaiTitle: {
    color: FluxColors.primaryLight,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  xaiToggleText: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  xaiList: {
    gap: 6,
  },
  xaiItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: Radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  xaiItemLeft: {
    flex: 1,
    gap: 2,
  },
  xaiItemTitle: {
    color: FluxColors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  xaiItemDesc: {
    color: FluxColors.textSecondary,
    fontSize: 10,
    fontWeight: '500',
  },
  xaiItemValueBadge: {
    backgroundColor: 'rgba(123, 104, 238, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(123, 104, 238, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  xaiItemValueText: {
    color: FluxColors.primaryLight,
    fontSize: 11,
    fontWeight: '800',
  },
  probabilitiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  probabilityPill: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  probPillActive: {
    borderColor: 'rgba(123, 104, 238, 0.4)',
    backgroundColor: 'rgba(123, 104, 238, 0.12)',
  },
  probPillName: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  probPillNameActive: {
    color: FluxColors.text,
    fontWeight: '700',
  },
  probPillPercent: {
    color: FluxColors.primaryLight,
    fontSize: 11,
    fontWeight: '800',
  },
  feedStroke: {
    color: FluxColors.text,
    fontSize: 12,
    fontWeight: '800',
  },
  feedMeta: {
    color: FluxColors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  // 6. Botões de Ação
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    width: '100%',
  },
  actionCol: {
    flex: 1,
  },
});


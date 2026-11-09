import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import {
  EvolutionLineChart,
  type PontoGraficoLinha,
} from '@/components/perfil/EvolutionLineChart';
import { MonthlyFrequencyCalendarCard } from '@/components/perfil/MonthlyFrequencyCalendarCard';
import { styles } from '@/components/perfil/ProfileMetricsDashboard.styles';
import { GlassCard, MetricPill, PrimaryButton } from '@/components/ui/GlassCard';
import {
  useExcluirSessao,
  useMapaMovimentosCircuitos,
  useModeloIAMaisRecente,
  useMovimentosCircuito,
  useSincronizarModeloOTA,
} from '@/hooks';
import {
  metricasPerfilService,
  type PeriodoFiltroMetricas,
} from '@/services/sessao/metricasPerfilService';
import type { Postagem, Sessao } from '@/types/api';

interface ProfileMetricsDashboardProps {
  sessoes: Sessao[];
  postagensUsuario?: Postagem[];
}

export function ProfileMetricsDashboard({
  sessoes,
  postagensUsuario = [],
}: ProfileMetricsDashboardProps) {
  const [periodoFiltro, setPeriodoFiltro] =
    useState<PeriodoFiltroMetricas>('semana');
  const [circuitoInspecionadoId, setCircuitoInspecionadoId] = useState<
    string | undefined
  >(undefined);
  const [sessaoConfirmandoExclusaoId, setSessaoConfirmandoExclusaoId] =
    useState<string | null>(null);
  const [statusOTA, setStatusOTA] = useState<string | null>(null);

  const { data: mapaMovimentosNoSQL = {} } = useMapaMovimentosCircuitos(sessoes);
  const { data: movimentosNoSQL } = useMovimentosCircuito(circuitoInspecionadoId);
  const { data: modeloRemoto } = useModeloIAMaisRecente('tenis');
  const sincronizarOTAMutation = useSincronizarModeloOTA('tenis');
  const excluirSessaoMutation = useExcluirSessao();

  const dashboard = useMemo(
    () =>
      metricasPerfilService.calcularDashboardMetricas(
        sessoes,
        postagensUsuario,
        periodoFiltro,
        mapaMovimentosNoSQL
      ),
    [sessoes, postagensUsuario, periodoFiltro, mapaMovimentosNoSQL]
  );

  const pontosEvolucaoPontuacao = useMemo<PontoGraficoLinha[]>(
    () =>
      dashboard.sessoesEvolucao.map((s) => ({
        id: s.id,
        rotulo: s.rotuloEixo,
        subRotulo: s.dataCurta,
        valorPrincipal: s.pontuacaoTotal,
        textoValorPrincipal: `${s.pontuacaoTotal}`,
      })),
    [dashboard.sessoesEvolucao]
  );

  const pontosEvolucaoGolpes = useMemo<PontoGraficoLinha[]>(
    () =>
      dashboard.sessoesEvolucao.map((s) => ({
        id: s.id,
        rotulo: s.rotuloEixo,
        subRotulo: s.dataCurta,
        valorPrincipal: s.mediaGolpesPorCircuito,
        textoValorPrincipal: `${s.mediaGolpesPorCircuito}`,
        valorSecundario: s.totalGolpesSessao,
        textoValorSecundario: `(${s.totalGolpesSessao} tot)`,
      })),
    [dashboard.sessoesEvolucao]
  );

  const pontosEvolucaoAcerto = useMemo<PontoGraficoLinha[]>(
    () =>
      dashboard.sessoesEvolucao.map((s) => ({
        id: s.id,
        rotulo: s.rotuloEixo,
        subRotulo: s.dataCurta,
        valorPrincipal: s.percentualMedioAcerto,
        textoValorPrincipal: `${s.percentualMedioAcerto}%`,
      })),
    [dashboard.sessoesEvolucao]
  );

  async function handleSincronizarModelo() {
    setStatusOTA(null);
    try {
      const res = await sincronizarOTAMutation.mutateAsync();
      setStatusOTA(
        res.atualizado
          ? `Novo modelo v${res.info.versao} baixado e pronto para uso Offline!`
          : `Modelo local já atualizado (v${res.info.versao}).`
      );
    } catch (err) {
      setStatusOTA(
        err instanceof Error
          ? err.message
          : 'Nenhum modelo publicado no servidor ainda.'
      );
    }
  }

  async function handleConfirmarExclusaoSessao(sessao: Sessao) {
    const idsCircuitosSessao = (sessao.circuitos ?? []).map((c) => c.id);
    if (
      circuitoInspecionadoId &&
      idsCircuitosSessao.includes(circuitoInspecionadoId)
    ) {
      setCircuitoInspecionadoId(undefined);
    }
    await excluirSessaoMutation.mutateAsync(sessao.id);
    setSessaoConfirmandoExclusaoId(null);
  }

  return (
    <View style={styles.stack}>
      {/* Cards de Tempo de Treino + KPIs Gerais */}
      <GlassCard highlighted style={styles.cardGap}>
        <Text style={styles.sectionTitle}>TEMPO DE TREINO & DESEMPENHO GERAL</Text>

        <View style={styles.timeCardsRow}>
          <View style={styles.timeHeroCard}>
            <View style={styles.timeHeroIconRow}>
              <Text style={styles.timeHeroLabel}>Tempo Total Treinando</Text>
              <Text style={styles.timeHeroBadge}>⏱ Acumulado</Text>
            </View>
            <Text style={styles.timeHeroValueAccent}>
              {dashboard.tempoTotalFormatado}
            </Text>
            <Text style={styles.timeHeroHint}>
              Em {dashboard.totalSessoes} sessões • {dashboard.totalCircuitos} circuitos
            </Text>
          </View>

          <View style={styles.timeHeroCardSecondary}>
            <View style={styles.timeHeroIconRow}>
              <Text style={styles.timeHeroLabel}>Tempo Médio / Sessão</Text>
              <Text style={styles.timeHeroBadge}>⚡ Ritmo</Text>
            </View>
            <Text style={styles.timeHeroValue}>
              {dashboard.tempoMedioSessaoFormatado}
            </Text>
            <Text style={styles.timeHeroHint}>
              Média de {dashboard.mediaGolpesPorSessao} golpes / treino
            </Text>
          </View>
        </View>

        <View style={styles.kpiGrid}>
          <MetricPill label="Sessões" value={dashboard.totalSessoes} />
          <MetricPill label="Circuitos" value={dashboard.totalCircuitos} />
          <MetricPill
            label="Golpes / Circuito"
            value={dashboard.mediaGolpesPorCircuitoGeral}
          />
        </View>

        <View style={styles.kpiGrid}>
          <MetricPill
            label="Pontos Totais"
            value={dashboard.pontuacaoAcumulada}
            accent
          />
          <MetricPill
            label="Média / Sessão"
            value={`${dashboard.mediaPontosPorSessao} pts`}
            accent
          />
          <MetricPill
            label="% Médio Acerto"
            value={`${dashboard.percentualAcertoMedioGeral}%`}
            accent
          />
        </View>
      </GlassCard>

      {/* Mini Calendário Mensal com Bolinhas de Frequência */}
      <MonthlyFrequencyCalendarCard
        sessoesEnriquecidas={dashboard.todasSessoesEnriquecidas}
      />

      {/* Barra de Filtro de Período para os Gráficos de Evolução: Semana | Mês */}
      <View style={styles.periodFilterBar}>
        <View style={styles.periodFilterTitleBlock}>
          <Text style={styles.periodFilterTitle}>Período de Evolução</Text>
          <Text style={styles.periodFilterSub}>
            {periodoFiltro === 'semana'
              ? 'Últimos 7 dias • Gráficos de linha por sessão'
              : 'Últimos 30 dias • Gráficos de linha por sessão'}
          </Text>
        </View>

        <View style={styles.periodToggleGroup}>
          <Pressable
            onPress={() => setPeriodoFiltro('semana')}
            style={[
              styles.periodToggleBtn,
              periodoFiltro === 'semana' && styles.periodToggleBtnActive,
            ]}>
            <Text
              style={[
                styles.periodToggleText,
                periodoFiltro === 'semana' && styles.periodToggleTextActive,
              ]}>
              Semana
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setPeriodoFiltro('mes')}
            style={[
              styles.periodToggleBtn,
              periodoFiltro === 'mes' && styles.periodToggleBtnActive,
            ]}>
            <Text
              style={[
                styles.periodToggleText,
                periodoFiltro === 'mes' && styles.periodToggleTextActive,
              ]}>
              Mês
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Gráfico de Linha 1: Evolução de Pontos por Sessão */}
      <GlassCard style={styles.cardGap}>
        <View style={styles.headerRowBetween}>
          <View>
            <Text style={styles.sectionTitle}>EVOLUÇÃO DE PONTOS POR SESSÃO</Text>
            <Text style={styles.sectionSubtitle}>
              Curva de progressão da pontuação total conquistada nos treinos
            </Text>
          </View>
          <View style={styles.chartHighlightBadge}>
            <Text style={styles.chartHighlightText}>
              Média: {dashboard.mediaPontosPorSessao} pts
            </Text>
          </View>
        </View>

        {pontosEvolucaoPontuacao.length === 0 ? (
          <Text style={styles.emptySub}>
            Inicie um treino na aba "Treino" para gerar seu gráfico de evolução!
          </Text>
        ) : (
          <EvolutionLineChart
            pontos={pontosEvolucaoPontuacao}
            varianteCor="primary"
          />
        )}
      </GlassCard>

      {/* Gráfico de Linha 2: Evolução do Número Médio de Golpes por Circuito / Sessão */}
      <GlassCard style={styles.cardGap}>
        <View style={styles.headerRowBetween}>
          <View>
            <Text style={styles.sectionTitle}>
              EVOLUÇÃO DE GOLPES POR CIRCUITO & SESSÃO
            </Text>
            <Text style={styles.sectionSubtitle}>
              Linhas comparativas entre média de golpes por circuito e volume na sessão
            </Text>
          </View>
          <View style={styles.chartHighlightBadge}>
            <Text style={styles.chartHighlightText}>
              {dashboard.mediaGolpesPorCircuitoGeral} golpes / circ
            </Text>
          </View>
        </View>

        {pontosEvolucaoGolpes.length === 0 ? (
          <Text style={styles.emptySub}>
            Conclua circuitos para visualizar a evolução do volume de golpes!
          </Text>
        ) : (
          <>
            <EvolutionLineChart
              pontos={pontosEvolucaoGolpes}
              varianteCor="primary"
            />

            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={styles.legendDotPrimary} />
                <Text style={styles.legendText}>
                  Média de Golpes / Circuito ({dashboard.mediaGolpesPorCircuitoGeral})
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={styles.legendDotSecondary} />
                <Text style={styles.legendText}>
                  Total de Golpes / Sessão (média {dashboard.mediaGolpesPorSessao})
                </Text>
              </View>
            </View>
          </>
        )}
      </GlassCard>

      {/* Gráfico de Linha 3: Evolução da Média do Percentual de Acerto dos Golpes */}
      <GlassCard style={styles.cardGap}>
        <View style={styles.headerRowBetween}>
          <View>
            <Text style={styles.sectionTitle}>
              EVOLUÇÃO DO % MÉDIO DE ACERTO DOS GOLPES
            </Text>
            <Text style={styles.sectionSubtitle}>
              Curva de precisão técnica média registrada nos golpes de cada sessão
            </Text>
          </View>
          <View style={styles.chartHighlightBadgeSuccess}>
            <Text style={styles.chartHighlightTextSuccess}>
              Média: {dashboard.percentualAcertoMedioGeral}%
            </Text>
          </View>
        </View>

        {pontosEvolucaoAcerto.length === 0 ? (
          <Text style={styles.emptySub}>
            Registre sessões com o bracelete ou manualmente para acompanhar sua precisão!
          </Text>
        ) : (
          <EvolutionLineChart
            pontos={pontosEvolucaoAcerto}
            varianteCor="success"
            valorMaximoFixo={100}
          />
        )}
      </GlassCard>

      {/* Inspetor de Telemetria Biomecânica (TinyDB NoSQL) */}
      {movimentosNoSQL ? (
        <GlassCard highlighted style={styles.cardGap}>
          <View style={styles.nosqlHeader}>
            <Text style={styles.sectionTitle}>
              TELEMETRIA BIOMECÂNICA IA ({movimentosNoSQL.id_nosql})
            </Text>
            <Pressable onPress={() => setCircuitoInspecionadoId(undefined)}>
              <Text style={styles.closeBtn}>Fechar ✕</Text>
            </Pressable>
          </View>

          <View style={styles.metricsRow}>
            <MetricPill
              label="Precisão IA"
              value={`${Math.round(movimentosNoSQL.precisao_media * 100)}%`}
              accent
            />
            <MetricPill label="Golpes" value={movimentosNoSQL.total_movimentos} />
            <MetricPill label="Modelo" value={`v${movimentosNoSQL.versao_modelo_ia}`} />
          </View>

          {movimentosNoSQL.movimentos.map((m, idx) => {
            const pct = Math.round(m.precisao * 100);
            return (
              <View key={idx} style={styles.movItemBlock}>
                <View style={styles.movRow}>
                  <Text style={styles.movType}>{m.tipo_movimento.toUpperCase()}</Text>
                  <Text style={styles.movSpeed}>{m.velocidade_pico ?? '-'} km/h</Text>
                  <Text style={styles.movPrecision}>{pct}% precisão</Text>
                </View>
                <View style={styles.precisionTrack}>
                  <View style={[styles.precisionFill, { width: `${pct}%` }]} />
                </View>
              </View>
            );
          })}
        </GlassCard>
      ) : null}

      {/* Histórico Detalhado de Sessões e Circuitos */}
      <Text style={styles.sectionTitle}>HISTÓRICO DE SESSÕES & CIRCUITOS</Text>
      {sessoes.length === 0 ? (
        <GlassCard style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Nenhum treino registrado</Text>
          <Text style={styles.emptySub}>
            Seus circuitos e métricas biomecânicas do bracelete FLUX aparecerão aqui.
          </Text>
        </GlassCard>
      ) : (
        sessoes.map((sessao) => {
          const confirmandoExclusao = sessaoConfirmandoExclusaoId === sessao.id;

          return (
            <GlassCard key={sessao.id} style={styles.cardGap}>
              <View style={styles.sessaoHeader}>
                <View>
                  <Text style={styles.sessaoTitle}>🎾 Smart Tennis</Text>
                  <Text style={styles.sessaoDate}>
                    {new Date(sessao.data_inicio).toLocaleString('pt-BR')}
                  </Text>
                </View>

                <View style={styles.sessaoHeaderRight}>
                  <View style={styles.scoreBadge}>
                    <Text style={styles.scoreText}>
                      {sessao.pontuacao_total} pts
                    </Text>
                  </View>

                  <Pressable
                    onPress={() =>
                      setSessaoConfirmandoExclusaoId(
                        confirmandoExclusao ? null : sessao.id
                      )
                    }
                    style={styles.deleteSessionBtn}>
                    <Text style={styles.deleteSessionBtnText}>🗑️ Apagar</Text>
                  </Pressable>
                </View>
              </View>

              {confirmandoExclusao ? (
                <View style={styles.confirmDeleteBox}>
                  <Text style={styles.confirmDeleteText}>
                    Tem certeza que deseja apagar esta sessão e todos os seus{' '}
                    {sessao.circuitos?.length ?? 0} circuitos?
                  </Text>
                  <View style={styles.confirmDeleteActions}>
                    <Pressable
                      onPress={() => setSessaoConfirmandoExclusaoId(null)}
                      style={styles.cancelDeleteBtn}>
                      <Text style={styles.cancelDeleteBtnText}>Cancelar</Text>
                    </Pressable>

                    <Pressable
                      disabled={excluirSessaoMutation.isPending}
                      onPress={() => handleConfirmarExclusaoSessao(sessao)}
                      style={styles.confirmDeleteBtn}>
                      <Text style={styles.confirmDeleteBtnText}>
                        {excluirSessaoMutation.isPending
                          ? 'Apagando...'
                          : 'Confirmar Exclusão'}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}

              {sessao.circuitos && sessao.circuitos.length > 0 ? (
                <View style={styles.circuitsStack}>
                  {sessao.circuitos.map((circ) => {
                    const selecionado = circuitoInspecionadoId === circ.id;
                    return (
                      <Pressable
                        key={circ.id}
                        onPress={() =>
                          setCircuitoInspecionadoId(
                            selecionado ? undefined : circ.id
                          )
                        }
                        style={[
                          styles.circuitRow,
                          selecionado && styles.circuitRowActive,
                        ]}>
                        <View>
                          <Text style={styles.circuitTitle}>
                            Circuito #{circ.numero_rodada} • {circ.pontuacao} pts
                          </Text>
                          <Text style={styles.circuitSub}>
                            Documento NoSQL: {circ.id_movimentos_nosql ?? 'N/A'}
                          </Text>
                        </View>
                        <Text style={styles.inspectText}>
                          {selecionado ? 'Ocultar' : 'Ver Métricas IA →'}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
            </GlassCard>
          );
        })
      )}

      {/* Atualização OTA do Modelo de IA */}
      <GlassCard style={styles.cardGap}>
        <Text style={styles.sectionTitle}>MOTOR DE IA EDGE (ATUALIZAÇÃO OTA)</Text>
        <Text style={styles.otaDesc}>
          Sincronize a versão mais recente do modelo de classificação biomecânica para uso
          offline.
        </Text>
        <View style={styles.metricsRow}>
          <MetricPill
            label="Versão Ativa"
            value={modeloRemoto ? `v${modeloRemoto.versao}` : 'v1.0.0'}
            accent
          />
          <MetricPill
            label="Acurácia"
            value={
              modeloRemoto?.acuracia
                ? `${Math.round(modeloRemoto.acuracia * 100)}%`
                : '94%'
            }
          />
        </View>
        {statusOTA ? <Text style={styles.otaStatusText}>{statusOTA}</Text> : null}
        <PrimaryButton
          label="Checar Atualização do Modelo IA"
          variant="ghost"
          onPress={handleSincronizarModelo}
          loading={sincronizarOTAMutation.isPending}
        />
      </GlassCard>
    </View>
  );
}

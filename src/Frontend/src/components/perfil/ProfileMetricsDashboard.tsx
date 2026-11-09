import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { styles } from '@/components/perfil/ProfileMetricsDashboard.styles';
import { GlassCard, MetricPill, PrimaryButton } from '@/components/ui/GlassCard';
import {
  useModeloIAMaisRecente,
  useMovimentosCircuito,
  useSincronizarModeloOTA,
} from '@/hooks';
import type { Sessao } from '@/types/api';

interface ProfileMetricsDashboardProps {
  sessoes: Sessao[];
}

export function ProfileMetricsDashboard({ sessoes }: ProfileMetricsDashboardProps) {
  const [circuitoInspecionadoId, setCircuitoInspecionadoId] = useState<string | undefined>(
    undefined
  );
  const [statusOTA, setStatusOTA] = useState<string | null>(null);

  const { data: movimentosNoSQL } = useMovimentosCircuito(circuitoInspecionadoId);
  const { data: modeloRemoto } = useModeloIAMaisRecente('tenis');
  const sincronizarOTAMutation = useSincronizarModeloOTA('tenis');

  const totalSessoes = sessoes.length;
  const totalCircuitos = sessoes.reduce((acc, s) => acc + (s.circuitos?.length ?? 0), 0);
  const pontuacaoAcumulada = sessoes.reduce((acc, s) => acc + s.pontuacao_total, 0);
  const mediaPorSessao =
    totalSessoes > 0 ? Math.round(pontuacaoAcumulada / totalSessoes) : 0;

  const ultimasSessoes = [...sessoes].slice(0, 6).reverse();
  const maiorPontuacao = Math.max(
    ...ultimasSessoes.map((s) => s.pontuacao_total),
    100
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
        err instanceof Error ? err.message : 'Nenhum modelo publicado no servidor ainda.'
      );
    }
  }

  return (
    <View style={styles.stack}>
      {/* KPIs Gerais de Performance */}
      <GlassCard highlighted style={styles.cardGap}>
        <Text style={styles.sectionTitle}>VISÃO GERAL DE DESEMPENHO</Text>
        <View style={styles.kpiGrid}>
          <MetricPill label="Sessões" value={totalSessoes} />
          <MetricPill label="Circuitos" value={totalCircuitos} />
        </View>
        <View style={styles.kpiGrid}>
          <MetricPill label="Pontos Totais" value={pontuacaoAcumulada} accent />
          <MetricPill label="Média / Treino" value={`${mediaPorSessao} pts`} accent />
        </View>
      </GlassCard>

      {/* Gráfico de Evolução de Pontuação por Sessão */}
      <GlassCard style={styles.cardGap}>
        <Text style={styles.sectionTitle}>EVOLUÇÃO NAS ÚLTIMAS SESSÕES</Text>
        {ultimasSessoes.length === 0 ? (
          <Text style={styles.emptySub}>
            Inicie um treino na aba "Treino" para gerar seu gráfico de evolução!
          </Text>
        ) : (
          <View style={styles.chartContainer}>
            {ultimasSessoes.map((s, idx) => {
              const alturaPct = Math.max(
                12,
                Math.round((s.pontuacao_total / maiorPontuacao) * 100)
              );
              return (
                <View key={s.id} style={styles.barColumn}>
                  <Text style={styles.barValueText}>{s.pontuacao_total}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { height: `${alturaPct}%` }]} />
                  </View>
                  <Text style={styles.barLabel}>T{idx + 1}</Text>
                </View>
              );
            })}
          </View>
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
        sessoes.map((sessao) => (
          <GlassCard key={sessao.id} style={styles.cardGap}>
            <View style={styles.sessaoHeader}>
              <View>
                <Text style={styles.sessaoTitle}>🎾 Smart Tennis</Text>
                <Text style={styles.sessaoDate}>
                  {new Date(sessao.data_inicio).toLocaleString('pt-BR')}
                </Text>
              </View>
              <View style={styles.scoreBadge}>
                <Text style={styles.scoreText}>{sessao.pontuacao_total} pts</Text>
              </View>
            </View>

            {sessao.circuitos && sessao.circuitos.length > 0 ? (
              <View style={styles.circuitsStack}>
                {sessao.circuitos.map((circ) => {
                  const selecionado = circuitoInspecionadoId === circ.id;
                  return (
                    <Pressable
                      key={circ.id}
                      onPress={() =>
                        setCircuitoInspecionadoId(selecionado ? undefined : circ.id)
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
        ))
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


import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  GlassCard,
  GlassInput,
  MetricPill,
} from '@/components/ui/GlassCard';
import { BottomTabInset, FluxColors, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import {
  useAdicionarCliente,
  useBuscarUsuarios,
  useMeusClientes,
  useMovimentosCircuito,
  useSessoesDoCliente,
  useSessoesUsuario,
  useUsuarioLogado,
} from '@/hooks';

export default function PersonalScreen() {
  const { data: usuario } = useUsuarioLogado();
  const { data: meusClientes = [] } = useMeusClientes();
  const { data: minhasSessoes = [] } = useSessoesUsuario(usuario?.id);
  const adicionarClienteMutation = useAdicionarCliente();

  const [buscaAluno, setBuscaAluno] = useState('');
  const [clienteSelecionadoId, setClienteSelecionadoId] = useState<string | undefined>(
    undefined
  );
  const [circuitoInspecionadoId, setCircuitoInspecionadoId] = useState<string | undefined>(
    undefined
  );

  const { data: alunosEncontrados = [] } = useBuscarUsuarios(buscaAluno);
  const { data: sessoesCliente = [] } = useSessoesDoCliente(clienteSelecionadoId);
  const { data: movimentosNoSQL } = useMovimentosCircuito(circuitoInspecionadoId);

  const sessoesParaMostrar = clienteSelecionadoId ? sessoesCliente : minhasSessoes;

  return (
    <View style={styles.root}>
      <View style={styles.glowOrb} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View>
            <Text style={styles.tag}>DASHBOARD TÉCNICO • PERSONAL & ATLETA</Text>
            <Text style={styles.screenTitle}>Análise & Alunos</Text>
          </View>

          {/* Vincular novo Aluno na carteira de Personal */}
          <GlassCard style={styles.cardGap}>
            <Text style={styles.sectionTitle}>CARTEIRA DE CLIENTES (PERSONAL)</Text>
            <GlassInput
              label="Vincular Novo Aluno"
              placeholder="Buscar aluno por nome ou @username..."
              value={buscaAluno}
              onChangeText={setBuscaAluno}
            />
            {buscaAluno.trim().length > 0 && (
              <View style={styles.resultsStack}>
                {alunosEncontrados
                  .filter((u) => u.id !== usuario?.id)
                  .map((aluno) => (
                    <View key={aluno.id} style={styles.alunoRow}>
                      <View>
                        <Text style={styles.alunoName}>{aluno.nome}</Text>
                        <Text style={styles.alunoSub}>
                          @{aluno.username} • Nível {aluno.nivel}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => {
                          adicionarClienteMutation.mutate({
                            id_aluno: aluno.id,
                            observacoes: 'Acompanhamento Smart Tennis Arena',
                          });
                          setBuscaAluno('');
                        }}
                        style={styles.addBtn}>
                        <Text style={styles.addBtnText}>+ Vincular</Text>
                      </Pressable>
                    </View>
                  ))}
              </View>
            )}

            {meusClientes.length > 0 ? (
              <View style={styles.clientChips}>
                <Pressable
                  onPress={() => setClienteSelecionadoId(undefined)}
                  style={[
                    styles.clientChip,
                    !clienteSelecionadoId && styles.clientChipActive,
                  ]}>
                  <Text style={styles.clientChipText}>Meus Treinos</Text>
                </Pressable>
                {meusClientes.map((c, idx) => {
                  const ativo = clienteSelecionadoId === c.id;
                  return (
                    <Pressable
                      key={c.id}
                      onPress={() => setClienteSelecionadoId(ativo ? undefined : c.id)}
                      style={[styles.clientChip, ativo && styles.clientChipActive]}>
                      <Text style={styles.clientChipText}>
                        Aluno #{idx + 1} ({c.status})
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </GlassCard>

          {/* Inspecionar Telemetria NoSQL quando um circuito é clicado */}
          {movimentosNoSQL ? (
            <GlassCard highlighted style={styles.cardGap}>
              <View style={styles.nosqlHeader}>
                <Text style={styles.sectionTitle}>
                  TELEMETRIA NOSQL ({movimentosNoSQL.id_nosql})
                </Text>
                <Pressable onPress={() => setCircuitoInspecionadoId(undefined)}>
                  <Text style={styles.closeBtn}>Fechar ✕</Text>
                </Pressable>
              </View>
              <View style={styles.metricsRow}>
                <MetricPill
                  label="Precisão Média IA"
                  value={`${Math.round(movimentosNoSQL.precisao_media * 100)}%`}
                  accent
                />
                <MetricPill
                  label="Total Golpes"
                  value={movimentosNoSQL.total_movimentos}
                />
                <MetricPill
                  label="Modelo IA"
                  value={`v${movimentosNoSQL.versao_modelo_ia}`}
                />
              </View>
              {movimentosNoSQL.movimentos.map((m, idx) => (
                <View key={idx} style={styles.movRow}>
                  <Text style={styles.movType}>{m.tipo_movimento.toUpperCase()}</Text>
                  <Text style={styles.movSpeed}>{m.velocidade_pico ?? '-'} km/h</Text>
                  <Text style={styles.movPrecision}>
                    {Math.round(m.precisao * 100)}% precisão
                  </Text>
                </View>
              ))}
            </GlassCard>
          ) : null}

          {/* Lista de Sessões e Circuitos */}
          <Text style={styles.sectionTitle}>
            {clienteSelecionadoId
              ? 'HISTÓRICO DE SESSÕES DO ALUNO'
              : 'MEU HISTÓRICO DE SESSÕES E CIRCUITOS'}
          </Text>

          {sessoesParaMostrar.length === 0 ? (
            <GlassCard style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Nenhuma sessão registrada ainda</Text>
              <Text style={styles.emptySub}>
                Vá até a aba "Treinar" para registrar rodadas e movimentos com o FLUX!
              </Text>
            </GlassCard>
          ) : (
            sessoesParaMostrar.map((sessao) => (
              <GlassCard key={sessao.id} style={styles.cardGap}>
                <View style={styles.sessaoHeader}>
                  <View>
                    <Text style={styles.sessaoTitle}>
                      {sessao.modalidade === 'tenis' ? '🎾 Smart Tennis' : '🏋️ Musculação'}
                    </Text>
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
                    {sessao.circuitos.map((circ) => (
                      <Pressable
                        key={circ.id}
                        onPress={() => setCircuitoInspecionadoId(circ.id)}
                        style={styles.circuitRow}>
                        <View>
                          <Text style={styles.circuitTitle}>
                            Circuito #{circ.numero_rodada} • {circ.pontuacao} pts
                          </Text>
                          <Text style={styles.circuitSub}>
                            NoSQL Doc: {circ.id_movimentos_nosql ?? 'N/A'}
                          </Text>
                        </View>
                        <Text style={styles.inspectText}>Ver Golpes IA →</Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </GlassCard>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: FluxColors.background,
  },
  glowOrb: {
    position: 'absolute',
    top: -100,
    right: -60,
    width: 270,
    height: 270,
    borderRadius: 135,
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
  tag: {
    color: FluxColors.primaryLight,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  screenTitle: {
    color: FluxColors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  cardGap: {
    gap: 12,
  },
  sectionTitle: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.9,
  },
  resultsStack: {
    gap: 8,
  },
  alunoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(12, 14, 24, 0.72)',
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: FluxColors.glassBorder,
  },
  alunoName: {
    color: FluxColors.text,
    fontWeight: '700',
    fontSize: 14,
  },
  alunoSub: {
    color: FluxColors.textSecondary,
    fontSize: 12,
  },
  addBtn: {
    backgroundColor: FluxColors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
  },
  addBtnText: {
    color: FluxColors.text,
    fontWeight: '700',
    fontSize: 12,
  },
  clientChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  clientChip: {
    backgroundColor: 'rgba(12, 14, 24, 0.72)',
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: FluxColors.glassBorder,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  clientChipActive: {
    backgroundColor: FluxColors.primary,
    borderColor: FluxColors.primaryLight,
  },
  clientChipText: {
    color: FluxColors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  nosqlHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeBtn: {
    color: FluxColors.primaryLight,
    fontWeight: '700',
    fontSize: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  movRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: FluxColors.glassBorder,
  },
  movType: {
    color: FluxColors.text,
    fontWeight: '800',
    fontSize: 13,
  },
  movSpeed: {
    color: FluxColors.textSecondary,
    fontSize: 13,
  },
  movPrecision: {
    color: FluxColors.success,
    fontWeight: '800',
    fontSize: 13,
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
  emptySub: {
    color: FluxColors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
  sessaoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessaoTitle: {
    color: FluxColors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  sessaoDate: {
    color: FluxColors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  scoreBadge: {
    backgroundColor: FluxColors.primarySoft,
    borderWidth: 1,
    borderColor: FluxColors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  scoreText: {
    color: FluxColors.primaryLight,
    fontWeight: '800',
    fontSize: 13,
  },
  circuitsStack: {
    gap: 8,
    marginTop: 4,
  },
  circuitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 12, 20, 0.65)',
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: FluxColors.glassBorder,
  },
  circuitTitle: {
    color: FluxColors.text,
    fontWeight: '700',
    fontSize: 13,
  },
  circuitSub: {
    color: FluxColors.textMuted,
    fontSize: 11,
  },
  inspectText: {
    color: FluxColors.primaryLight,
    fontWeight: '700',
    fontSize: 12,
  },
});


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
  MetricPill,
  PrimaryButton,
} from '@/components/ui/GlassCard';
import { BottomTabInset, FluxColors, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import {
  useEstabelecimentos,
  useFinalizarSessao,
  useIniciarSessao,
  usePublicarPostagem,
  useRegistrarCircuito,
  useSalvarOuSincronizarSessaoOffline,
} from '@/hooks';
import type { ModalidadeTreino, MovimentoItem, Sessao } from '@/types/api';

const GOLPES_TENIS = [
  { tipo: 'forehand', label: 'Forehand', velBase: 86 },
  { tipo: 'backhand', label: 'Backhand', velBase: 78 },
  { tipo: 'saque', label: 'Saque', velBase: 118 },
  { tipo: 'smash', label: 'Smash', velBase: 104 },
];

const EXERCICIOS_MUSCULACAO = [
  { tipo: 'rosca_direta', label: 'Rosca Direta', velBase: 32 },
  { tipo: 'supino_reto', label: 'Supino Reto', velBase: 40 },
  { tipo: 'elevacao_lateral', label: 'Elevação Lateral', velBase: 28 },
  { tipo: 'agachamento', label: 'Agachamento', velBase: 36 },
];

export default function TreinarScreen() {
  const { data: arenas = [] } = useEstabelecimentos();
  const iniciarSessaoMutation = useIniciarSessao();
  const registrarCircuitoMutation = useRegistrarCircuito();
  const finalizarSessaoMutation = useFinalizarSessao();
  const offlineSyncMutation = useSalvarOuSincronizarSessaoOffline();
  const publicarMutation = usePublicarPostagem();

  const [modalidade, setModalidade] = useState<ModalidadeTreino>('tenis');
  const [arenaSelecionada, setArenaSelecionada] = useState<string | null>(null);
  const [sessaoAtiva, setSessaoAtiva] = useState<Sessao | null>(null);
  const [rodadaAtual, setRodadaAtual] = useState(1);
  const [inicioRodada, setInicioRodada] = useState<string>(new Date().toISOString());
  const [movimentosRodada, setMovimentosRodada] = useState<MovimentoItem[]>([]);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  const catalogoMovimentos =
    modalidade === 'tenis' ? GOLPES_TENIS : EXERCICIOS_MUSCULACAO;

  const precisaoMediaRodada =
    movimentosRodada.length > 0
      ? Math.round(
          (movimentosRodada.reduce((acc, m) => acc + m.precisao, 0) /
            movimentosRodada.length) *
            100
        )
      : 0;

  const pontuacaoRodada = movimentosRodada.reduce(
    (acc, m) => acc + Math.round(m.precisao * 120),
    0
  );

  async function handleIniciarSessao() {
    setFeedbackBanner(null);
    const nova = await iniciarSessaoMutation.mutateAsync({
      modalidade,
      id_estabelecimento: arenaSelecionada,
    });
    setSessaoAtiva(nova);
    setRodadaAtual(1);
    setMovimentosRodada([]);
    setInicioRodada(new Date().toISOString());
  }

  function handleCapturarMovimentoIA(tipo: string, velBase: number) {
    const variacaoPrecisao = Math.min(0.99, Math.max(0.74, 0.85 + (Math.random() - 0.4) * 0.22));
    const velocidade = Number((velBase + (Math.random() - 0.5) * 14).toFixed(1));
    const novoMovimento: MovimentoItem = {
      tipo_movimento: tipo,
      precisao: Number(variacaoPrecisao.toFixed(2)),
      velocidade_pico: velocidade,
      aceleracao_max: Number((velocidade * 0.34).toFixed(1)),
      timestamp_execucao: new Date().toISOString(),
    };
    setMovimentosRodada((prev) => [novoMovimento, ...prev]);
  }

  async function handleSalvarCircuito() {
    if (!sessaoAtiva || movimentosRodada.length === 0) return;

    await registrarCircuitoMutation.mutateAsync({
      idSessao: sessaoAtiva.id,
      dados: {
        numero_rodada: rodadaAtual,
        hora_inicio: inicioRodada,
        hora_fim: new Date().toISOString(),
        pontuacao: pontuacaoRodada,
        versao_modelo_ia: '1.0.0',
        movimentos: movimentosRodada,
      },
    });

    setFeedbackBanner(
      `Circuito #${rodadaAtual} salvo no SQLite + NoSQL! (+${pontuacaoRodada} XP)`
    );
    setRodadaAtual((r) => r + 1);
    setMovimentosRodada([]);
    setInicioRodada(new Date().toISOString());
  }

  async function handleFinalizarSessao(compartilharNoFeed: boolean) {
    if (!sessaoAtiva) return;
    const encerrada = await finalizarSessaoMutation.mutateAsync(sessaoAtiva.id);
    if (compartilharNoFeed) {
      await publicarMutation.mutateAsync({
        id_sessao: encerrada.id,
        legenda: `Treino de ${modalidade.toUpperCase()} finalizado no bracelete FLUX! 🏆 Pontuação total: ${encerrada.pontuacao_total} pts.`,
        visibilidade: 'publico',
      });
    }
    setSessaoAtiva(null);
    setMovimentosRodada([]);
    setFeedbackBanner('Sessão finalizada com sucesso!');
  }

  async function handleSalvarSessaoOfflineDireta() {
    if (movimentosRodada.length === 0) return;
    const agora = new Date().toISOString();
    const res = await offlineSyncMutation.mutateAsync({
      modalidade,
      id_estabelecimento: arenaSelecionada,
      data_inicio: inicioRodada,
      data_fim: agora,
      circuitos: [
        {
          numero_rodada: 1,
          hora_inicio: inicioRodada,
          hora_fim: agora,
          pontuacao: pontuacaoRodada,
          versao_modelo_ia: '1.0.0-offline',
          movimentos: movimentosRodada,
        },
      ],
    });
    setMovimentosRodada([]);
    setFeedbackBanner(
      res
        ? `Sessão sincronizada direto com o servidor! (+${pontuacaoRodada} XP)`
        : 'Sem conexão: treino salvo na fila offline do celular e será sincronizado ao reconectar!'
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.glowOrb} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.topBar}>
            <View>
              <Text style={styles.tag}>BRACELETE FLUX • TELEMETRIA IMU</Text>
              <Text style={styles.screenTitle}>Sessão de Treino</Text>
            </View>
            <View style={styles.bleBadge}>
              <View style={styles.bleDot} />
              <Text style={styles.bleText}>IA EDGE PRONTA</Text>
            </View>
          </View>

          {feedbackBanner ? (
            <GlassCard highlighted style={styles.bannerCard}>
              <Text style={styles.bannerText}>{feedbackBanner}</Text>
            </GlassCard>
          ) : null}

          {!sessaoAtiva ? (
            <GlassCard highlighted style={styles.setupCard}>
              <Text style={styles.sectionTitle}>1. ESCOLHA A MODALIDADE</Text>
              <View style={styles.modalityRow}>
                <Pressable
                  onPress={() => setModalidade('tenis')}
                  style={[
                    styles.modalityBtn,
                    modalidade === 'tenis' && styles.modalityBtnActive,
                  ]}>
                  <Text style={styles.modalityEmoji}>🎾</Text>
                  <Text style={styles.modalityLabel}>Smart Tennis</Text>
                </Pressable>
                <Pressable
                  onPress={() => setModalidade('musculacao')}
                  style={[
                    styles.modalityBtn,
                    modalidade === 'musculacao' && styles.modalityBtnActive,
                  ]}>
                  <Text style={styles.modalityEmoji}>🏋️</Text>
                  <Text style={styles.modalityLabel}>Musculação</Text>
                </Pressable>
              </View>

              {arenas.length > 0 ? (
                <>
                  <Text style={styles.sectionTitle}>2. ARENA PARCEIRA (OPCIONAL)</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.arenaChipsRow}>
                      {arenas.map((arena) => {
                        const selecionada = arenaSelecionada === arena.id;
                        return (
                          <Pressable
                            key={arena.id}
                            onPress={() =>
                              setArenaSelecionada(selecionada ? null : arena.id)
                            }
                            style={[
                              styles.arenaChip,
                              selecionada && styles.arenaChipActive,
                            ]}>
                            <Text style={styles.arenaChipText}>{arena.nome}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </ScrollView>
                </>
              ) : null}

              <PrimaryButton
                label="Iniciar Sessão Ao Vivo"
                onPress={handleIniciarSessao}
                loading={iniciarSessaoMutation.isPending}
              />
            </GlassCard>
          ) : null}

          {/* Painel de Captura de Circuitos e Movimentos da IA */}
          <GlassCard highlighted={Boolean(sessaoAtiva)} style={styles.circuitCard}>
            <View style={styles.circuitHeader}>
              <Text style={styles.sectionTitle}>
                {sessaoAtiva
                  ? `CIRCUITO ATIVO #${rodadaAtual}`
                  : 'SIMULADOR / GRAVADOR OFFLINE DE MOVIMENTOS'}
              </Text>
              <Text style={styles.modelVersion}>Modelo IA v1.0.0</Text>
            </View>

            <View style={styles.metricsRow}>
              <MetricPill label="Movimentos" value={movimentosRodada.length} />
              <MetricPill label="Precisão IA" value={`${precisaoMediaRodada}%`} accent />
              <MetricPill label="Pontos" value={pontuacaoRodada} accent />
            </View>

            <Text style={styles.subHint}>
              Toque nos movimentos abaixo para registrar a leitura do sensor IMU + classificação da IA:
            </Text>

            <View style={styles.strokeGrid}>
              {catalogoMovimentos.map((item) => (
                <Pressable
                  key={item.tipo}
                  onPress={() => handleCapturarMovimentoIA(item.tipo, item.velBase)}
                  style={({ pressed }) => [
                    styles.strokeButton,
                    pressed && { opacity: 0.75, transform: [{ scale: 0.97 }] },
                  ]}>
                  <Text style={styles.strokeTitle}>{item.label}</Text>
                  <Text style={styles.strokeSub}>+ Capturar Golpe IA</Text>
                </Pressable>
              ))}
            </View>

            {movimentosRodada.length > 0 ? (
              <View style={styles.movementsLog}>
                <Text style={styles.sectionTitle}>
                  LEITURAS DO CIRCUITO (DESTINO: TINYDB NOSQL)
                </Text>
                {movimentosRodada.slice(0, 6).map((mov, idx) => (
                  <View key={`${mov.timestamp_execucao}-${idx}`} style={styles.movRow}>
                    <Text style={styles.movType}>{mov.tipo_movimento.toUpperCase()}</Text>
                    <Text style={styles.movSpeed}>{mov.velocidade_pico} km/h</Text>
                    <View style={styles.precisionBadge}>
                      <Text style={styles.precisionText}>
                        {Math.round(mov.precisao * 100)}% precisão
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : null}

            {sessaoAtiva ? (
              <View style={styles.actionsStack}>
                <PrimaryButton
                  label={`Salvar Circuito #${rodadaAtual} (+${pontuacaoRodada} XP)`}
                  onPress={handleSalvarCircuito}
                  disabled={movimentosRodada.length === 0}
                  loading={registrarCircuitoMutation.isPending}
                />
                <View style={styles.finishRow}>
                  <PrimaryButton
                    label="Encerrar e Postar no Feed"
                    variant="ghost"
                    onPress={() => handleFinalizarSessao(true)}
                    loading={finalizarSessaoMutation.isPending}
                    style={{ flex: 1 }}
                  />
                  <PrimaryButton
                    label="Só Encerrar"
                    variant="danger"
                    onPress={() => handleFinalizarSessao(false)}
                    loading={finalizarSessaoMutation.isPending}
                  />
                </View>
              </View>
            ) : (
              <PrimaryButton
                label="Sincronizar / Salvar Treino Rápido (Online ou Offline)"
                variant="ghost"
                onPress={handleSalvarSessaoOfflineDireta}
                disabled={movimentosRodada.length === 0}
                loading={offlineSyncMutation.isPending}
              />
            )}
          </GlassCard>
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
    right: -70,
    width: 280,
    height: 280,
    borderRadius: 140,
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  bleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: FluxColors.successSoft,
    borderWidth: 1,
    borderColor: FluxColors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  bleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: FluxColors.success,
  },
  bleText: {
    color: FluxColors.success,
    fontSize: 10,
    fontWeight: '800',
  },
  bannerCard: {
    paddingVertical: 12,
  },
  bannerText: {
    color: FluxColors.primaryLight,
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center',
  },
  setupCard: {
    gap: 14,
  },
  sectionTitle: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.9,
  },
  modalityRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalityBtn: {
    flex: 1,
    backgroundColor: 'rgba(12, 14, 24, 0.72)',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: FluxColors.glassBorder,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 6,
  },
  modalityBtnActive: {
    backgroundColor: FluxColors.primarySoft,
    borderColor: FluxColors.primary,
  },
  modalityEmoji: {
    fontSize: 24,
  },
  modalityLabel: {
    color: FluxColors.text,
    fontWeight: '800',
    fontSize: 14,
  },
  arenaChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  arenaChip: {
    backgroundColor: 'rgba(12, 14, 24, 0.72)',
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: FluxColors.glassBorder,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  arenaChipActive: {
    backgroundColor: FluxColors.primary,
    borderColor: FluxColors.primaryLight,
  },
  arenaChipText: {
    color: FluxColors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  circuitCard: {
    gap: 14,
  },
  circuitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modelVersion: {
    color: FluxColors.primaryLight,
    fontSize: 11,
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  subHint: {
    color: FluxColors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  strokeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  strokeButton: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: FluxColors.primarySoft,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: FluxColors.glassBorderActive,
    paddingVertical: 16,
    paddingHorizontal: 14,
    gap: 4,
  },
  strokeTitle: {
    color: FluxColors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  strokeSub: {
    color: FluxColors.primaryLight,
    fontSize: 11,
    fontWeight: '700',
  },
  movementsLog: {
    gap: 8,
    backgroundColor: 'rgba(10, 12, 20, 0.65)',
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: FluxColors.glassBorder,
  },
  movRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  movType: {
    color: FluxColors.text,
    fontWeight: '800',
    fontSize: 13,
    flex: 1,
  },
  movSpeed: {
    color: FluxColors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginRight: 12,
  },
  precisionBadge: {
    backgroundColor: FluxColors.successSoft,
    borderWidth: 1,
    borderColor: FluxColors.success,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  precisionText: {
    color: FluxColors.success,
    fontSize: 11,
    fontWeight: '800',
  },
  actionsStack: {
    gap: 10,
  },
  finishRow: {
    flexDirection: 'row',
    gap: 10,
  },
});


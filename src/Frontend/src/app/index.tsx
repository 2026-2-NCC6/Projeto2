import React, { useState } from 'react';
import {
  Pressable,
  RefreshControl,
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
  PrimaryButton,
} from '@/components/ui/GlassCard';
import { BottomTabInset, FluxColors, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import {
  useAlternarSeguir,
  useBuscarUsuarios,
  useComentarPostagem,
  useCurtirPostagem,
  useFeed,
  usePublicarPostagem,
  useUsuarioLogado,
} from '@/hooks';

export default function FeedScreen() {
  const { data: usuario } = useUsuarioLogado();
  const { data: postagens = [], isLoading, refetch } = useFeed();
  const publicarMutation = usePublicarPostagem();
  const curtirMutation = useCurtirPostagem();
  const comentarMutation = useComentarPostagem();
  const seguirMutation = useAlternarSeguir();

  const [legenda, setLegenda] = useState('');
  const [buscaTermo, setBuscaTermo] = useState('');
  const [comentarioTexto, setComentarioTexto] = useState<Record<string, string>>({});

  const { data: usuariosEncontrados = [] } = useBuscarUsuarios(buscaTermo);

  const xpAtualNoNivel = (usuario?.xp_total ?? 0) % 1000;
  const progressoNivel = Math.min(100, Math.round((xpAtualNoNivel / 1000) * 100));

  async function handlePublicar() {
    if (!legenda.trim()) return;
    await publicarMutation.mutateAsync({
      legenda: legenda.trim(),
      visibilidade: 'publico',
    });
    setLegenda('');
  }

  async function handleComentar(idPostagem: string) {
    const texto = comentarioTexto[idPostagem]?.trim();
    if (!texto) return;
    await comentarMutation.mutateAsync({
      idPostagem,
      dados: { texto },
    });
    setComentarioTexto((prev) => ({ ...prev, [idPostagem]: '' }));
  }

  return (
    <View style={styles.root}>
      <View style={styles.ambientGlow} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor={FluxColors.primary}
            />
          }>
          {/* Header Estilo Strava/Hevy com Nível e Barra de XP */}
          <GlassCard highlighted style={styles.heroCard}>
            <View style={styles.heroHeader}>
              <View>
                <Text style={styles.greetingText}>ARENA FEED • FLUX</Text>
                <Text style={styles.athleteName}>{usuario?.nome ?? 'Atleta'}</Text>
                <Text style={styles.usernameText}>@{usuario?.username}</Text>
              </View>
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeLabel}>NÍVEL</Text>
                <Text style={styles.levelBadgeNumber}>{usuario?.nivel ?? 1}</Text>
              </View>
            </View>

            <View style={styles.xpBarBlock}>
              <View style={styles.xpLabelRow}>
                <Text style={styles.xpLabel}>PROGRESSO DE TEMPORADA</Text>
                <Text style={styles.xpValue}>{xpAtualNoNivel} / 1000 XP</Text>
              </View>
              <View style={styles.xpTrack}>
                <View style={[styles.xpFill, { width: `${progressoNivel}%` }]} />
              </View>
            </View>

            <View style={styles.metricsRow}>
              <MetricPill label="XP Total" value={usuario?.xp_total ?? 0} accent />
              <MetricPill label="Categoria" value={(usuario?.tipo_perfil ?? 'atleta').toUpperCase()} />
            </View>
          </GlassCard>

          {/* Busca rápida de atletas para seguir */}
          <GlassCard style={styles.sectionCard}>
            <GlassInput
              label="Explorar Atletas & Treinadores"
              placeholder="Buscar por nome ou @username..."
              value={buscaTermo}
              onChangeText={setBuscaTermo}
            />
            {buscaTermo.trim().length > 0 && (
              <View style={styles.searchResults}>
                {usuariosEncontrados
                  .filter((u) => u.id !== usuario?.id)
                  .map((u) => (
                    <View key={u.id} style={styles.userRow}>
                      <View>
                        <Text style={styles.userRowName}>{u.nome}</Text>
                        <Text style={styles.userRowSub}>
                          @{u.username} • Nível {u.nivel} ({u.tipo_perfil})
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => seguirMutation.mutate(u.id)}
                        style={styles.followBtn}>
                        <Text style={styles.followBtnText}>Seguir</Text>
                      </Pressable>
                    </View>
                  ))}
              </View>
            )}
          </GlassCard>

          {/* Criar Postagem no Feed */}
          <GlassCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>COMPARTILHAR NA COMUNIDADE</Text>
            <GlassInput
              placeholder="Como foi o treino na Smart Tennis Arena hoje?"
              multiline
              value={legenda}
              onChangeText={setLegenda}
              style={{ minHeight: 72, textAlignVertical: 'top' }}
            />
            <PrimaryButton
              label="Publicar no Feed"
              onPress={handlePublicar}
              loading={publicarMutation.isPending}
            />
          </GlassCard>

          {/* Lista do Feed */}
          <Text style={styles.feedHeading}>ATIVIDADES RECENTES</Text>
          {postagens.length === 0 ? (
            <GlassCard style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Nenhuma atividade no feed ainda</Text>
              <Text style={styles.emptySubtitle}>
                Publique seu primeiro resumo de treino ou siga outros atletas da arena!
              </Text>
            </GlassCard>
          ) : (
            postagens.map((post) => (
              <GlassCard key={post.id} style={styles.postCard}>
                <View style={styles.postHeader}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarLetter}>⚡</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.postAuthor}>Atleta FLUX</Text>
                    <Text style={styles.postTime}>
                      {new Date(post.criado_em).toLocaleString('pt-BR')}
                    </Text>
                  </View>
                  {post.id_sessao ? (
                    <View style={styles.workoutTag}>
                      <Text style={styles.workoutTagText}>TREINO VINCULADO</Text>
                    </View>
                  ) : null}
                </View>

                {post.legenda ? <Text style={styles.postBody}>{post.legenda}</Text> : null}

                <View style={styles.postActions}>
                  <Pressable
                    onPress={() => curtirMutation.mutate(post.id)}
                    style={styles.actionPill}>
                    <Text style={styles.actionPillText}>🔥 Kudos / Curtir</Text>
                  </Pressable>
                  <Text style={styles.commentCount}>
                    💬 {post.comentarios?.length ?? 0} comentários
                  </Text>
                </View>

                {post.comentarios && post.comentarios.length > 0 ? (
                  <View style={styles.commentsList}>
                    {post.comentarios.map((c) => (
                      <View key={c.id} style={styles.commentItem}>
                        <Text style={styles.commentText}>{c.texto}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}

                <View style={styles.commentInputRow}>
                  <View style={{ flex: 1 }}>
                    <GlassInput
                      placeholder="Adicionar comentário..."
                      value={comentarioTexto[post.id] ?? ''}
                      onChangeText={(txt) =>
                        setComentarioTexto((prev) => ({ ...prev, [post.id]: txt }))
                      }
                    />
                  </View>
                  <Pressable
                    onPress={() => handleComentar(post.id)}
                    style={styles.sendCommentBtn}>
                    <Text style={styles.sendCommentText}>Enviar</Text>
                  </Pressable>
                </View>
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

import React, { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PostCard } from '@/components/feed/PostCard';
import {
  GlassCard,
  GlassInput,
  PrimaryButton,
} from '@/components/ui/GlassCard';
import { FluxColors } from '@/constants/theme';
import {
  useAlternarSeguir,
  useBuscarUsuarios,
  useComentarPostagem,
  useCurtirPostagem,
  useFeed,
  usePublicarPostagem,
  useUsuarioLogado,
} from '@/hooks';
import { styles } from '@/styles/feed.styles';

export default function HomeScreen() {
  const { data: usuario } = useUsuarioLogado();
  const { data: postagens = [], isLoading, refetch } = useFeed();
  const publicarMutation = usePublicarPostagem();
  const curtirMutation = useCurtirPostagem();
  const comentarMutation = useComentarPostagem();
  const seguirMutation = useAlternarSeguir();

  const [legenda, setLegenda] = useState('');
  const [buscaTermo, setBuscaTermo] = useState('');

  const { data: usuariosEncontrados = [] } = useBuscarUsuarios(buscaTermo);

  async function handlePublicar() {
    if (!legenda.trim()) return;
    await publicarMutation.mutateAsync({
      legenda: legenda.trim(),
      visibilidade: 'publico',
    });
    setLegenda('');
  }

  async function handleComentar(idPostagem: string, texto: string) {
    await comentarMutation.mutateAsync({
      idPostagem,
      dados: { texto },
    });
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
              onRefresh={() => {
                void refetch();
              }}
              tintColor={FluxColors.primary}
            />
          }>
          {/* Topo da Home */}
          <View style={styles.heroHeader}>
            <View>
              <Text style={styles.greetingText}>COMUNIDADE • SMART TENNIS ARENA</Text>
              <Text style={styles.athleteName}>Feed de Atividades</Text>
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeLabel}>NÍVEL</Text>
              <Text style={styles.levelBadgeNumber}>{usuario?.nivel ?? 1}</Text>
            </View>
          </View>

          {/* Busca rápida de atletas para seguir */}
          <GlassCard style={styles.sectionCard}>
            <GlassInput
              label="Buscar Atletas & Amigos"
              placeholder="Pesquisar por nome ou @username..."
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

          {/* Nova Publicação */}
          <GlassCard highlighted style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>NOVA PUBLICAÇÃO</Text>
            <GlassInput
              placeholder="Compartilhe seu treino ou conquista na arena..."
              multiline
              value={legenda}
              onChangeText={setLegenda}
              style={{ minHeight: 68, textAlignVertical: 'top' }}
            />
            <PrimaryButton
              label="Publicar no Feed"
              onPress={handlePublicar}
              loading={publicarMutation.isPending}
            />
          </GlassCard>

          {/* Feed de Rolagem */}
          <Text style={styles.feedHeading}>ATIVIDADES DA REDE</Text>
          {postagens.length === 0 ? (
            <GlassCard style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Nenhuma publicação no feed ainda</Text>
              <Text style={styles.emptySubtitle}>
                Inicie um treino na aba "Treino" ou faça a primeira publicação acima!
              </Text>
            </GlassCard>
          ) : (
            postagens.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                authorLabel={
                  post.id_usuario === usuario?.id
                    ? `${usuario.nome} (@${usuario.username})`
                    : 'Atleta FLUX'
                }
                onCurtir={(idPost) => curtirMutation.mutate(idPost)}
                onComentar={handleComentar}
              />
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

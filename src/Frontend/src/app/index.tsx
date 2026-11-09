import React, { useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FeedHeaderSearch } from '@/components/feed/FeedHeaderSearch';
import { PostCard } from '@/components/feed/PostCard';
import { GlassCard } from '@/components/ui/GlassCard';
import { FluxColors } from '@/constants/theme';
import {
  useAlternarSeguir,
  useBuscarUsuarios,
  useCurtirPostagem,
  useFeed,
  useUsuarioLogado,
} from '@/hooks';
import { styles } from '@/styles/feed.styles';

export default function HomeScreen() {
  const { data: usuario } = useUsuarioLogado();
  const { data: postagensRaw = [], isLoading, refetch } = useFeed();
  const postagens = postagensRaw.filter((p) => p.visibilidade !== 'privado');
  const curtirMutation = useCurtirPostagem();
  const seguirMutation = useAlternarSeguir();

  const [buscaTermo, setBuscaTermo] = useState('');

  const { data: usuariosEncontrados = [] } = useBuscarUsuarios(buscaTermo);

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
          {/* Cabeçalho Comunidade Flux + Busca Expansível estilo Instagram */}
          <FeedHeaderSearch
            buscaTermo={buscaTermo}
            onChangeBuscaTermo={setBuscaTermo}
            usuariosEncontrados={usuariosEncontrados}
            idUsuarioLogado={usuario?.id}
            onSeguirUsuario={(idUsuario) => seguirMutation.mutate(idUsuario)}
          />

          {/* Feed de Rolagem */}
          <Text style={styles.feedHeading}>ATIVIDADES DA REDE</Text>
          {postagens.length === 0 ? (
            <GlassCard style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>
                Nenhuma publicação no feed ainda
              </Text>
              <Text style={styles.emptySubtitle}>
                Conclua uma sessão na aba "Treino" e publique o template do seu
                treino!
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
              />
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

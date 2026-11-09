import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PostCard } from '@/components/feed/PostCard';
import { ProfileMetricsDashboard } from '@/components/perfil/ProfileMetricsDashboard';
import {
  GlassCard,
  MetricPill,
} from '@/components/ui/GlassCard';
import {
  useComentarPostagem,
  useCurtirPostagem,
  useFeed,
  useLogout,
  useSeguidores,
  useSessoesUsuario,
  useUsuarioLogado,
} from '@/hooks';
import { styles } from '@/styles/perfil.styles';

export default function PerfilScreen() {
  const { data: usuario } = useUsuarioLogado();
  const { data: seguidores } = useSeguidores(usuario?.id);
  const { data: todasPostagens = [] } = useFeed();
  const { data: minhasSessoes = [] } = useSessoesUsuario(usuario?.id);

  const curtirMutation = useCurtirPostagem();
  const comentarMutation = useComentarPostagem();
  const logoutMutation = useLogout();

  const [abaInterna, setAbaInterna] = useState<'feed' | 'metricas'>('feed');

  const minhasPostagens = todasPostagens.filter((p) => p.id_usuario === usuario?.id);
  const xpAtualNoNivel = (usuario?.xp_total ?? 0) % 1000;
  const progressoNivel = Math.min(100, Math.round((xpAtualNoNivel / 1000) * 100));

  async function handleComentar(idPostagem: string, texto: string) {
    await comentarMutation.mutateAsync({
      idPostagem,
      dados: { texto },
    });
  }

  return (
    <View style={styles.root}>
      <View style={styles.glowOrb} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Cabeçalho do Perfil: Foto, Nome, Seguidores, Seguindo e XP */}
          <GlassCard highlighted style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarInitial}>
                  {(usuario?.nome?.[0] ?? 'F').toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.profileName}>{usuario?.nome}</Text>
                <Text style={styles.profileUsername}>
                  @{usuario?.username} • {(usuario?.tipo_perfil ?? 'atleta').toUpperCase()}
                </Text>
                {usuario?.bio ? (
                  <Text style={styles.profileBio}>{usuario.bio}</Text>
                ) : null}
              </View>
              <Pressable
                onPress={() => logoutMutation.mutate()}
                style={styles.logoutIconBtn}>
                <Text style={styles.logoutIconText}>Sair</Text>
              </Pressable>
            </View>

            {/* Contadores de Seguidores, Seguindo, Nível e XP */}
            <View style={styles.socialStatsRow}>
              <MetricPill
                label="Seguidores"
                value={seguidores?.total_seguidores ?? 0}
              />
              <MetricPill
                label="Seguindo"
                value={seguidores?.total_seguindo ?? 0}
              />
              <MetricPill label="Nível" value={usuario?.nivel ?? 1} accent />
              <MetricPill label="XP Total" value={usuario?.xp_total ?? 0} accent />
            </View>

            <View style={styles.xpBarBlock}>
              <View style={styles.xpLabelRow}>
                <Text style={styles.xpLabel}>PROGRESSO DE NÍVEL</Text>
                <Text style={styles.xpValue}>{xpAtualNoNivel} / 1000 XP</Text>
              </View>
              <View style={styles.xpTrack}>
                <View style={[styles.xpFill, { width: `${progressoNivel}%` }]} />
              </View>
            </View>
          </GlassCard>

          {/* Seletor das 2 Abas Internas: Meu Feed | Métricas */}
          <View style={styles.internalTabsRow}>
            <Pressable
              onPress={() => setAbaInterna('feed')}
              style={[
                styles.internalTabBtn,
                abaInterna === 'feed' && styles.internalTabBtnActive,
              ]}>
              <Text
                style={[
                  styles.internalTabText,
                  abaInterna === 'feed' && styles.internalTabTextActive,
                ]}>
                📱 Meu Feed ({minhasPostagens.length})
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setAbaInterna('metricas')}
              style={[
                styles.internalTabBtn,
                abaInterna === 'metricas' && styles.internalTabBtnActive,
              ]}>
              <Text
                style={[
                  styles.internalTabText,
                  abaInterna === 'metricas' && styles.internalTabTextActive,
                ]}>
                📊 Métricas & Desempenho
              </Text>
            </Pressable>
          </View>

          {/* Conteúdo da Aba Interna selecionada */}
          {abaInterna === 'feed' ? (
            <View style={styles.feedStack}>
              {minhasPostagens.length === 0 ? (
                <GlassCard style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>Você ainda não tem publicações</Text>
                  <Text style={styles.emptySub}>
                    Compartilhe um treino na aba "Treino" ou publique uma atividade na "Home"!
                  </Text>
                </GlassCard>
              ) : (
                minhasPostagens.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    authorLabel={`${usuario?.nome ?? 'Atleta'} (@${usuario?.username ?? 'flux'})`}
                    onCurtir={(idPost) => curtirMutation.mutate(idPost)}
                    onComentar={handleComentar}
                  />
                ))
              )}
            </View>
          ) : (
            <ProfileMetricsDashboard sessoes={minhasSessoes} />
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

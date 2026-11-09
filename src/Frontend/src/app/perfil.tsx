import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PostCard } from '@/components/feed/PostCard';
import { ProfileIdentityHeaderCard } from '@/components/perfil/ProfileIdentityHeaderCard';
import { ProfileMetricsDashboard } from '@/components/perfil/ProfileMetricsDashboard';
import { GlassCard } from '@/components/ui/GlassCard';
import {
  useCurtirPostagem,
  usePostagensUsuario,
  useSeguidores,
  useSessoesUsuario,
  useUsuarioLogado,
} from '@/hooks';
import { styles } from '@/styles/perfil.styles';

export default function PerfilScreen() {
  const router = useRouter();
  const { data: usuario } = useUsuarioLogado();
  const { data: seguidores } = useSeguidores(usuario?.id);
  const { data: minhasPostagens = [] } = usePostagensUsuario(usuario?.id);
  const { data: minhasSessoes = [] } = useSessoesUsuario(usuario?.id);

  const curtirMutation = useCurtirPostagem();

  const [abaInterna, setAbaInterna] = useState<'feed' | 'metricas'>('feed');

  return (
    <View style={styles.root}>
      <View style={styles.glowOrb} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Cabeçalho do Perfil com Engrenagem de Configurações */}
          <ProfileIdentityHeaderCard
            usuario={usuario}
            seguidores={seguidores}
            onAbrirConfiguracoes={() => router.push('/configuracoes' as never)}
          />

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
                  />
                ))
              )}
            </View>
          ) : (
            <ProfileMetricsDashboard
              sessoes={minhasSessoes}
              postagensUsuario={minhasPostagens}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

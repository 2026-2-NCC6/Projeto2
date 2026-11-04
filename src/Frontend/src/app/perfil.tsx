import React, { useState } from 'react';
import {
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
  useAtualizarPerfil,
  useLogout,
  useModeloIAMaisRecente,
  useSeguidores,
  useSincronizarModeloOTA,
  useUsuarioLogado,
} from '@/hooks';
import { API_BASE_URL } from '@/services/api';

export default function PerfilScreen() {
  const { data: usuario } = useUsuarioLogado();
  const { data: seguidores } = useSeguidores(usuario?.id);
  const { data: modeloRemoto } = useModeloIAMaisRecente('tenis');
  const sincronizarOTAMutation = useSincronizarModeloOTA('tenis');
  const atualizarPerfilMutation = useAtualizarPerfil();
  const logoutMutation = useLogout();

  const [bio, setBio] = useState(usuario?.bio ?? '');
  const [statusOTA, setStatusOTA] = useState<string | null>(null);

  async function handleSalvarBio() {
    await atualizarPerfilMutation.mutateAsync({ bio: bio.trim() });
  }

  async function handleSincronizarModelo() {
    setStatusOTA(null);
    try {
      const res = await sincronizarOTAMutation.mutateAsync();
      setStatusOTA(
        res.atualizado
          ? `Novo modelo v${res.info.versao} baixado e salvo para uso Offline!`
          : `Seu celular já está na versão mais recente (v${res.info.versao}).`
      );
    } catch (err) {
      setStatusOTA(
        err instanceof Error ? err.message : 'Nenhum modelo publicado no servidor ainda.'
      );
    }
  }

  return (
    <View style={styles.root}>
      <View style={styles.glowOrb} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <GlassCard highlighted style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarInitial}>
                  {(usuario?.nome?.[0] ?? 'F').toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.profileName}>{usuario?.nome}</Text>
                <Text style={styles.profileUsername}>@{usuario?.username}</Text>
                <Text style={styles.profileEmail}>{usuario?.email}</Text>
              </View>
            </View>

            <View style={styles.metricsRow}>
              <MetricPill label="Nível" value={usuario?.nivel ?? 1} accent />
              <MetricPill label="XP Total" value={usuario?.xp_total ?? 0} accent />
              <MetricPill
                label="Seguidores"
                value={seguidores?.total_seguidores ?? 0}
              />
              <MetricPill label="Seguindo" value={seguidores?.total_seguindo ?? 0} />
            </View>
          </GlassCard>

          {/* Atualização OTA do Modelo de IA */}
          <GlassCard style={styles.cardGap}>
            <Text style={styles.sectionTitle}>MOTOR DE IA EDGE (ATUALIZAÇÃO OTA)</Text>
            <Text style={styles.otaDesc}>
              O modelo de classificação de golpes roda localmente no seu aparelho para funcionar
              offline na quadra.
            </Text>
            <View style={styles.metricsRow}>
              <MetricPill
                label="Versão no Servidor"
                value={modeloRemoto ? `v${modeloRemoto.versao}` : 'v1.0.0 (Padrão)'}
                accent
              />
              <MetricPill
                label="Acurácia IA"
                value={
                  modeloRemoto?.acuracia
                    ? `${Math.round(modeloRemoto.acuracia * 100)}%`
                    : '94%'
                }
              />
            </View>
            {statusOTA ? <Text style={styles.otaStatusText}>{statusOTA}</Text> : null}
            <PrimaryButton
              label="Verificar e Baixar Atualização do Modelo IA"
              variant="ghost"
              onPress={handleSincronizarModelo}
              loading={sincronizarOTAMutation.isPending}
            />
          </GlassCard>

          {/* Editar Bio */}
          <GlassCard style={styles.cardGap}>
            <Text style={styles.sectionTitle}>EDITAR BIO DO ATLETA</Text>
            <GlassInput
              placeholder="Ex: Jogador de Tênis • Smart Tennis Arena"
              value={bio}
              onChangeText={setBio}
            />
            <PrimaryButton
              label="Salvar Alterações"
              onPress={handleSalvarBio}
              loading={atualizarPerfilMutation.isPending}
            />
          </GlassCard>

          {/* Informações de Conexão */}
          <GlassCard style={styles.cardGap}>
            <Text style={styles.sectionTitle}>CONEXÃO COM O BACKEND</Text>
            <Text style={styles.serverText}>Servidor API: {API_BASE_URL}</Text>
            <PrimaryButton
              label="Sair da Conta (Logout)"
              variant="danger"
              onPress={() => logoutMutation.mutate()}
              loading={logoutMutation.isPending}
            />
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
    top: -110,
    left: -50,
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
  profileCard: {
    gap: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: FluxColors.primary,
    borderWidth: 2,
    borderColor: FluxColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: FluxColors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  profileName: {
    color: FluxColors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  profileUsername: {
    color: FluxColors.primaryLight,
    fontSize: 14,
    fontWeight: '700',
  },
  profileEmail: {
    color: FluxColors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
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
  otaDesc: {
    color: FluxColors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  otaStatusText: {
    color: FluxColors.primaryLight,
    fontSize: 13,
    fontWeight: '700',
  },
  serverText: {
    color: FluxColors.textMuted,
    fontSize: 12,
  },
});


import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { styles } from '@/components/perfil/ProfileIdentityHeaderCard.styles';
import { GlassCard, MetricPill } from '@/components/ui/GlassCard';
import type { SeguidoresResumo, Usuario } from '@/types/api';

interface ProfileIdentityHeaderCardProps {
  usuario?: Usuario | null;
  seguidores?: SeguidoresResumo | null;
  onAbrirConfiguracoes: () => void;
}

export function ProfileIdentityHeaderCard({
  usuario,
  seguidores,
  onAbrirConfiguracoes,
}: ProfileIdentityHeaderCardProps) {
  const xpAtualNoNivel = (usuario?.xp_total ?? 0) % 1000;
  const progressoNivel = Math.min(
    100,
    Math.round((xpAtualNoNivel / 1000) * 100)
  );

  return (
    <GlassCard highlighted style={styles.profileCard}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarInitial}>
            {(usuario?.nome?.[0] ?? 'F').toUpperCase()}
          </Text>
        </View>

        <View style={styles.profileIdentityCol}>
          <Text style={styles.profileName}>{usuario?.nome}</Text>
          <Text style={styles.profileUsername}>
            @{usuario?.username} •{' '}
            {(usuario?.tipo_perfil ?? 'atleta').toUpperCase()}
          </Text>
          {usuario?.bio ? (
            <Text style={styles.profileBio}>{usuario.bio}</Text>
          ) : null}
        </View>

        <Pressable
          onPress={onAbrirConfiguracoes}
          accessibilityLabel="Configurações do Perfil"
          style={styles.gearIconBtn}>
          <Text style={styles.gearIconText}>⚙️</Text>
        </Pressable>
      </View>

      <View style={styles.socialStatsRow}>
        <MetricPill
          label="Seguidores"
          value={seguidores?.total_seguidores ?? 0}
        />
        <MetricPill label="Seguindo" value={seguidores?.total_seguindo ?? 0} />
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
  );
}


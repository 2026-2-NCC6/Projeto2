import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { styles } from '@/components/perfil/SettingsMenuCard.styles';
import { GlassCard } from '@/components/ui/GlassCard';
import type { Usuario } from '@/types/api';

interface SettingsMenuCardProps {
  usuario?: Usuario | null;
  saindo: boolean;
  onVoltarPerfil: () => void;
  onIrEditarPerfil: () => void;
  onConfirmarLogout: () => void;
}

export function SettingsMenuCard({
  usuario,
  saindo,
  onVoltarPerfil,
  onIrEditarPerfil,
  onConfirmarLogout,
}: SettingsMenuCardProps) {
  const [confirmandoLogout, setConfirmandoLogout] = useState(false);

  return (
    <View style={styles.wrapper}>
      {/* Cabeçalho da Página de Configurações */}
      <View style={styles.topHeaderRow}>
        <Pressable
          onPress={onVoltarPerfil}
          accessibilityLabel="Voltar ao Perfil"
          style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </Pressable>

        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTag}>CONTA & PREFERÊNCIAS</Text>
          <Text style={styles.headerTitle}>Configurações</Text>
        </View>
      </View>

      {/* Resumo da Conta */}
      <GlassCard highlighted style={styles.userSummaryCard}>
        <View style={styles.userSummaryRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>
              {(usuario?.nome?.[0] ?? 'F').toUpperCase()}
            </Text>
          </View>

          <View style={styles.userIdentityCol}>
            <Text style={styles.userNameText}>{usuario?.nome}</Text>
            <Text style={styles.userSubText}>
              @{usuario?.username} •{' '}
              {(usuario?.tipo_perfil ?? 'atleta').toUpperCase()}
            </Text>
            <Text style={styles.userEmailText}>{usuario?.email}</Text>
          </View>
        </View>
      </GlassCard>

      {/* Acesso à Edição de Perfil */}
      <GlassCard style={styles.menuSectionCard}>
        <Text style={styles.sectionLabel}>PERFIL DO ATLETA</Text>

        <Pressable onPress={onIrEditarPerfil} style={styles.menuOptionItem}>
          <View style={styles.menuOptionLeft}>
            <View style={styles.menuOptionIconBox}>
              <Text style={styles.menuOptionEmoji}>✏️</Text>
            </View>
            <View style={styles.menuOptionTextCol}>
              <Text style={styles.menuOptionTitle}>
                Editar Informações do Perfil
              </Text>
              <Text style={styles.menuOptionDesc}>
                Alterar nome, @username, biografia, categoria e privacidade
              </Text>
            </View>
          </View>
          <Text style={styles.menuOptionArrow}>›</Text>
        </Pressable>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Categoria Atual</Text>
          <Text style={styles.infoValue}>
            {(usuario?.tipo_perfil ?? 'atleta').toUpperCase()}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Visibilidade do Perfil</Text>
          <Text style={styles.infoValue}>
            {usuario?.privado ? '🔒 Conta Privada' : '🌐 Conta Pública'}
          </Text>
        </View>
      </GlassCard>

      {/* Sessão / Logout */}
      <GlassCard style={styles.logoutCard}>
        <Text style={styles.sectionLabel}>SESSÃO E SEGURANÇA</Text>

        {!confirmandoLogout ? (
          <Pressable
            onPress={() => setConfirmandoLogout(true)}
            style={styles.logoutActionBtn}>
            <Text style={styles.logoutActionBtnText}>🚪 Sair da Conta</Text>
          </Pressable>
        ) : (
          <View style={styles.confirmLogoutBox}>
            <Text style={styles.confirmLogoutText}>
              Deseja realmente encerrar sua sessão atual no aplicativo FLUX?
            </Text>
            <View style={styles.confirmLogoutRow}>
              <Pressable
                onPress={() => setConfirmandoLogout(false)}
                style={styles.cancelLogoutBtn}>
                <Text style={styles.cancelLogoutBtnText}>Cancelar</Text>
              </Pressable>

              <Pressable
                disabled={saindo}
                onPress={onConfirmarLogout}
                style={styles.confirmLogoutSubmitBtn}>
                <Text style={styles.confirmLogoutSubmitText}>
                  {saindo ? 'Saindo...' : 'Confirmar Saída'}
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </GlassCard>
    </View>
  );
}


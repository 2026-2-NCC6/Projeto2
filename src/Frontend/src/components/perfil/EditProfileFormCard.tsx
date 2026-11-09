import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { styles } from '@/components/perfil/EditProfileFormCard.styles';
import { GlassCard, PrimaryButton } from '@/components/ui/GlassCard';
import { FluxColors } from '@/constants/theme';
import type { TipoPerfil } from '@/types/api';

interface EditProfileFormCardProps {
  nome: string;
  username: string;
  bio: string;
  tipoPerfil: TipoPerfil;
  privado: boolean;
  salvando: boolean;
  onChangeNome: (valor: string) => void;
  onChangeUsername: (valor: string) => void;
  onChangeBio: (valor: string) => void;
  onChangeTipoPerfil: (valor: TipoPerfil) => void;
  onTogglePrivado: () => void;
  onSalvar: () => void;
  onVoltar: () => void;
}

const OPCOES_TIPO_PERFIL: Array<{ valor: TipoPerfil; rotulo: string }> = [
  { valor: 'atleta', rotulo: '🏆 Atleta' },
  { valor: 'personal', rotulo: '📋 Personal' },
];

export function EditProfileFormCard({
  nome,
  username,
  bio,
  tipoPerfil,
  privado,
  salvando,
  onChangeNome,
  onChangeUsername,
  onChangeBio,
  onChangeTipoPerfil,
  onTogglePrivado,
  onSalvar,
  onVoltar,
}: EditProfileFormCardProps) {
  return (
    <View style={styles.wrapper}>
      {/* Cabeçalho */}
      <View style={styles.topHeaderRow}>
        <Pressable
          onPress={onVoltar}
          accessibilityLabel="Voltar às Configurações"
          style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </Pressable>

        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTag}>DADOS PESSOAIS</Text>
          <Text style={styles.headerTitle}>Editar Perfil</Text>
        </View>
      </View>

      {/* Formulário */}
      <GlassCard highlighted style={styles.formCard}>
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>NOME COMPLETO</Text>
          <TextInput
            value={nome}
            onChangeText={onChangeNome}
            placeholder="Seu nome"
            placeholderTextColor={FluxColors.textMuted}
            style={styles.textInput}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>NOME DE USUÁRIO (@USERNAME)</Text>
          <TextInput
            value={username}
            onChangeText={onChangeUsername}
            autoCapitalize="none"
            placeholder="seu_username"
            placeholderTextColor={FluxColors.textMuted}
            style={styles.textInput}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>BIOGRAFIA</Text>
          <TextInput
            value={bio}
            onChangeText={onChangeBio}
            multiline
            placeholder="Conte um pouco sobre seu estilo de jogo e objetivos..."
            placeholderTextColor={FluxColors.textMuted}
            style={[styles.textInput, styles.bioInput]}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>CATEGORIA DO PERFIL</Text>
          <View style={styles.pillsRow}>
            {OPCOES_TIPO_PERFIL.map((item) => {
              const ativo = tipoPerfil === item.valor;
              return (
                <Pressable
                  key={item.valor}
                  onPress={() => onChangeTipoPerfil(item.valor)}
                  style={[
                    styles.optionPill,
                    ativo && styles.optionPillActive,
                  ]}>
                  <Text
                    style={[
                      styles.optionPillText,
                      ativo && styles.optionPillTextActive,
                    ]}>
                    {item.rotulo}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.privacyToggleBox}>
          <View style={styles.privacyTextCol}>
            <Text style={styles.privacyTitle}>
              {privado ? '🔒 Conta Privada' : '🌐 Conta Pública'}
            </Text>
            <Text style={styles.privacyDesc}>
              {privado
                ? 'Novos seguidores precisam da sua aprovação.'
                : 'Qualquer atleta da comunidade pode seguir seu perfil.'}
            </Text>
          </View>

          <Pressable
            onPress={onTogglePrivado}
            style={[
              styles.privacySwitchBtn,
              privado && styles.privacySwitchBtnActive,
            ]}>
            <Text style={styles.privacySwitchText}>
              {privado ? 'Privado' : 'Público'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.actionsRow}>
          <PrimaryButton
            label="Salvar Alterações"
            variant="primary"
            loading={salvando}
            onPress={onSalvar}
          />
          <PrimaryButton
            label="Cancelar"
            variant="ghost"
            disabled={salvando}
            onPress={onVoltar}
          />
        </View>
      </GlassCard>
    </View>
  );
}


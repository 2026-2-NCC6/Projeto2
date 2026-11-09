import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from '@/components/auth-screen.styles';
import { GlassCard, GlassInput, PrimaryButton } from '@/components/ui/GlassCard';
import { FluxColors } from '@/constants/theme';
import { useCadastro, useLogin } from '@/hooks';
import type { TipoPerfil } from '@/types/api';

const PERFIS: { id: TipoPerfil; label: string; desc: string }[] = [
  { id: 'atleta', label: 'Atleta', desc: 'Performance & Ranking' },
  { id: 'personal', label: 'Personal', desc: 'Gestão de Alunos' },
  { id: 'iniciante', label: 'Iniciante', desc: 'Jornada Gamificada' },
];

export function AuthScreen() {
  const [modo, setModo] = useState<'login' | 'cadastro'>('login');
  const [identificador, setIdentificador] = useState(
    process.env.EXPO_PUBLIC_DEV_USER ?? ''
  );
  const [nome, setNome] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState(process.env.EXPO_PUBLIC_DEV_PASS ?? '');
  const [tipoPerfil, setTipoPerfil] = useState<TipoPerfil>('atleta');
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  const loginMutation = useLogin();
  const cadastroMutation = useCadastro();

  async function handleSubmit() {
    setMensagemErro(null);
    try {
      if (modo === 'login') {
        if (!identificador.trim() || !senha) {
          setMensagemErro('Informe seu e-mail/username e sua senha para entrar.');
          return;
        }
        await loginMutation.mutateAsync({
          identificador: identificador.trim(),
          senha,
        });
      } else {
        if (!nome.trim() || !username.trim() || !email.trim() || !senha) {
          setMensagemErro('Preencha todos os campos para criar sua conta.');
          return;
        }
        if (senha.length < 6) {
          setMensagemErro('A senha deve ter pelo menos 6 caracteres.');
          return;
        }
        await cadastroMutation.mutateAsync({
          nome: nome.trim(),
          username: username.trim().replace(/^@/, ''),
          email: email.trim(),
          senha,
          tipo_perfil: tipoPerfil,
        });
        await loginMutation.mutateAsync({
          identificador: email.trim(),
          senha,
        });
      }
    } catch (err) {
      setMensagemErro(err instanceof Error ? err.message : 'Falha ao autenticar.');
    }
  }

  const carregando = loginMutation.isPending || cadastroMutation.isPending;

  return (
    <View style={styles.root}>
      <View style={styles.glowOrbTop} />
      <View style={styles.glowOrbBottom} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            <View style={styles.headerBlock}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>SMART TENNIS ARENA • WEARABLE IA</Text>
              </View>
              <Text style={styles.brandTitle}>FLUX</Text>
              <Text style={styles.brandSubtitle}>
                Telemetria biomecânica, evolução de performance e comunidade esportiva.
              </Text>
            </View>

            <GlassCard highlighted style={styles.authCard}>
              <View style={styles.SegmentRow}>
                <Pressable
                  onPress={() => {
                    setModo('login');
                    setMensagemErro(null);
                  }}
                  style={[styles.segmentBtn, modo === 'login' && styles.segmentBtnActive]}>
                  <Text
                    style={[
                      styles.segmentText,
                      modo === 'login' && styles.segmentTextActive,
                    ]}>
                    Entrar
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setModo('cadastro');
                    setMensagemErro(null);
                  }}
                  style={[styles.segmentBtn, modo === 'cadastro' && styles.segmentBtnActive]}>
                  <Text
                    style={[
                      styles.segmentText,
                      modo === 'cadastro' && styles.segmentTextActive,
                    ]}>
                    Criar Conta
                  </Text>
                </Pressable>
              </View>

              {modo === 'login' ? (
                <View style={styles.formStack}>
                  <GlassInput
                    label="E-mail ou @username"
                    placeholder="ex: atleta@flux.com ou @lucastennis"
                    autoCapitalize="none"
                    value={identificador}
                    onChangeText={setIdentificador}
                  />
                  <GlassInput
                    label="Senha"
                    placeholder="••••••••"
                    secureTextEntry
                    value={senha}
                    onChangeText={setSenha}
                  />
                </View>
              ) : (
                <View style={styles.formStack}>
                  <GlassInput
                    label="Nome Completo"
                    placeholder="João Silva"
                    value={nome}
                    onChangeText={setNome}
                  />
                  <GlassInput
                    label="Username"
                    placeholder="@joaotennis"
                    autoCapitalize="none"
                    value={username}
                    onChangeText={setUsername}
                  />
                  <GlassInput
                    label="E-mail"
                    placeholder="joao@flux.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                  <GlassInput
                    label="Senha (mín. 6 caracteres)"
                    placeholder="••••••••"
                    secureTextEntry
                    value={senha}
                    onChangeText={setSenha}
                  />

                  <Text style={styles.sectionLabel}>PERFIL DE TREINO</Text>
                  <View style={styles.roleRow}>
                    {PERFIS.map((item) => {
                      const ativo = tipoPerfil === item.id;
                      return (
                        <Pressable
                          key={item.id}
                          onPress={() => setTipoPerfil(item.id)}
                          style={[styles.roleChip, ativo && styles.roleChipActive]}>
                          <Text style={[styles.roleTitle, ativo && { color: FluxColors.text }]}>
                            {item.label}
                          </Text>
                          <Text style={styles.roleDesc}>{item.desc}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}

              {mensagemErro ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{mensagemErro}</Text>
                </View>
              ) : null}

              <PrimaryButton
                label={modo === 'login' ? 'Acessar Arena FLUX' : 'Finalizar Cadastro'}
                onPress={handleSubmit}
                loading={carregando}
                style={{ marginTop: 8 }}
              />
            </GlassCard>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

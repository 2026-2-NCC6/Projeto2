import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EditProfileFormCard } from '@/components/perfil/EditProfileFormCard';
import { ToastPopup, type ToastData } from '@/components/ui/ToastPopup';
import { useAtualizarPerfil, useUsuarioLogado } from '@/hooks';
import { styles } from '@/styles/editar-perfil.styles';
import type { TipoPerfil } from '@/types/api';

export default function EditarPerfilScreen() {
  const router = useRouter();
  const { data: usuario } = useUsuarioLogado();
  const atualizarPerfilMutation = useAtualizarPerfil();

  const [nome, setNome] = useState(usuario?.nome ?? '');
  const [username, setUsername] = useState(usuario?.username ?? '');
  const [bio, setBio] = useState(usuario?.bio ?? '');
  const [tipoPerfil, setTipoPerfil] = useState<TipoPerfil>(
    usuario?.tipo_perfil === 'personal' ? 'personal' : 'atleta'
  );
  const [privado, setPrivado] = useState(usuario?.privado ?? false);
  const [toast, setToast] = useState<ToastData | null>(null);

  useEffect(() => {
    if (usuario) {
      setNome(usuario.nome ?? '');
      setUsername(usuario.username ?? '');
      setBio(usuario.bio ?? '');
      setTipoPerfil(
        usuario.tipo_perfil === 'personal' ? 'personal' : 'atleta'
      );
      setPrivado(usuario.privado ?? false);
    }
  }, [usuario]);

  async function handleSalvar() {
    const nomeLimpo = nome.trim();
    const usernameLimpo = username.trim().toLowerCase().replace(/^@+/, '');

    if (nomeLimpo.length < 2) {
      setToast({
        mensagem: 'O nome deve ter pelo menos 2 caracteres.',
        tipo: 'erro',
      });
      return;
    }

    if (usernameLimpo.length < 3) {
      setToast({
        mensagem: 'O nome de usuário deve ter pelo menos 3 caracteres.',
        tipo: 'erro',
      });
      return;
    }

    try {
      await atualizarPerfilMutation.mutateAsync({
        nome: nomeLimpo,
        username: usernameLimpo,
        bio: bio.trim(),
        tipo_perfil: tipoPerfil,
        privado,
      });

      setToast({
        mensagem: 'Perfil atualizado com sucesso!',
        tipo: 'sucesso',
      });

      setTimeout(() => {
        router.back();
      }, 700);
    } catch (err) {
      setToast({
        mensagem:
          err instanceof Error
            ? err.message
            : 'Não foi possível atualizar o perfil. Verifique os dados.',
        tipo: 'erro',
      });
    }
  }

  return (
    <View style={styles.root}>
      <View style={styles.glowOrb} />
      <ToastPopup toast={toast} onHide={() => setToast(null)} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <EditProfileFormCard
            nome={nome}
            username={username}
            bio={bio}
            tipoPerfil={tipoPerfil}
            privado={privado}
            salvando={atualizarPerfilMutation.isPending}
            onChangeNome={setNome}
            onChangeUsername={setUsername}
            onChangeBio={setBio}
            onChangeTipoPerfil={setTipoPerfil}
            onTogglePrivado={() => setPrivado((prev) => !prev)}
            onSalvar={handleSalvar}
            onVoltar={() => router.back()}
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}


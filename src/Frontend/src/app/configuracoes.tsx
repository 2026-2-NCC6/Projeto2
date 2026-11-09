import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SettingsMenuCard } from '@/components/perfil/SettingsMenuCard';
import { useLogout, useUsuarioLogado } from '@/hooks';
import { styles } from '@/styles/configuracoes.styles';

export default function ConfiguracoesScreen() {
  const router = useRouter();
  const { data: usuario } = useUsuarioLogado();
  const logoutMutation = useLogout();

  return (
    <View style={styles.root}>
      <View style={styles.glowOrb} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <SettingsMenuCard
            usuario={usuario}
            saindo={logoutMutation.isPending}
            onVoltarPerfil={() => router.back()}
            onIrEditarPerfil={() => router.push('/editar-perfil' as never)}
            onConfirmarLogout={() => logoutMutation.mutate()}
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}


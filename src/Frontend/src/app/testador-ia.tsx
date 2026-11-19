import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DataLabModelTestingConsole } from '@/components/ia/DataLabModelTestingConsole';
import { ToastPopup, type ToastData } from '@/components/ui/ToastPopup';
import { FluxColors } from '@/constants/theme';
import { useWearable } from '@/hooks';
import { styles } from '@/styles/testador-ia.styles';

export default function TestadorIAScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    modeloId?: string;
    versao?: string;
    esporteId?: string;
    modeloNome?: string;
  }>();

  const {
    estaConectado,
    dispositivo,
    conectarDispositivo,
  } = useWearable();

  const [toast, setToast] = useState<ToastData | null>(null);

  const modeloId = params.modeloId || 'flux_tenis';
  const versao = params.versao || 'v1';
  const esporteId = params.esporteId || 'tenis';
  const modeloNome = params.modeloNome || 'flux_tenis';

  async function handleConectarDispositivo() {
    const ok = await conectarDispositivo();
    setToast(
      ok
        ? { mensagem: 'Sensor conectado com sucesso!', tipo: 'sucesso' }
        : { mensagem: 'Dispositivo BLE não encontrado', tipo: 'erro' }
    );
  }

  function handleVoltar() {
    router.push('/laboratorio-ia' as any);
  }

  return (
    <View style={styles.root}>
      <View style={styles.glowOrb} />

      <ToastPopup toast={toast} onHide={() => setToast(null)} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* BARRA SUPERIOR: VOLTAR + STATUS BLE */}
          <View style={styles.headerBar}>
            <Pressable
              onPress={handleVoltar}
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="Voltar ao Laboratório de IA">
              <MaterialIcons name="arrow-back" size={16} color={FluxColors.primaryLight} />
              <Text style={styles.backButtonText}>{'Voltar ao Lab IA'}</Text>
            </Pressable>

            <Pressable
              onPress={handleConectarDispositivo}
              style={[
                styles.deviceBadge,
                estaConectado && styles.deviceBadgeConnected,
              ]}>
              <View
                style={[
                  styles.deviceDot,
                  estaConectado && styles.deviceDotConnected,
                ]}
              />
              <Text style={styles.deviceBadgeText}>
                {estaConectado
                  ? dispositivo?.nome || 'Sensor Conectado'
                  : 'Toque para Conectar BLE'}
              </Text>
            </Pressable>
          </View>

          {/* CONSOLE PRINCIPAL DE TESTE DE INFERÊNCIA DO MODELO */}
          <DataLabModelTestingConsole
            modeloId={modeloId}
            versao={versao}
            esporteId={esporteId}
            modeloNome={modeloNome}
            estaConectado={estaConectado}
            onConectarDispositivo={handleConectarDispositivo}
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}


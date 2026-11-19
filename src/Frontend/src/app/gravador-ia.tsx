import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DataLabRecordingSessionConsole } from '@/components/ia/DataLabRecordingSessionConsole';
import { ToastPopup, type ToastData } from '@/components/ui/ToastPopup';
import { FluxColors } from '@/constants/theme';
import { useSalvarAmostraDataset, useWearable } from '@/hooks';
import { styles } from '@/styles/gravador-ia.styles';
import type { AmostraDatalabCreate } from '@/types/api';

export default function GravadorIAScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    agenteId?: string;
    esporteId?: string;
    articulacaoId?: string;
    posicaoLateralidade?: 'direita' | 'esquerda' | 'central';
    movimentoId?: string;
    modo?: 'pontual' | 'continuo';
    duracaoMs?: string;
  }>();

  const {
    estaConectado,
    estaConectando,
    dispositivo,
    conectarDispositivo,
  } = useWearable();

  const salvarMutation = useSalvarAmostraDataset();
  const [toast, setToast] = useState<ToastData | null>(null);

  const agenteId = params.agenteId || 'dev-agente-01';
  const esporteId = params.esporteId || 'tenis';
  const articulacaoId = params.articulacaoId || 'pulso';
  const posicaoLateralidade = params.posicaoLateralidade || 'direita';
  const movimentoId = params.movimentoId || 'tenis_forehand';
  const modo = (params.modo as 'pontual' | 'continuo') || 'continuo';
  const duracaoMs = Number(params.duracaoMs || 1500);

  async function handleConectarDispositivo() {
    const ok = await conectarDispositivo();
    setToast(
      ok
        ? { mensagem: 'Arduino R4 conectado com sucesso!', tipo: 'sucesso' }
        : { mensagem: 'Dispositivo BLE não encontrado', tipo: 'erro' }
    );
  }

  async function handleSalvarAmostra(dados: AmostraDatalabCreate | AmostraDatalabCreate[]) {
    try {
      const lista = Array.isArray(dados) ? dados : [dados];
      for (const item of lista) {
        await salvarMutation.mutateAsync(item);
      }
      setToast({
        mensagem:
          lista.length > 1
            ? `${lista.length} amostras salvas com sucesso! Retornando...`
            : 'Amostra salva com sucesso! Retornando...',
        tipo: 'sucesso',
      });
      setTimeout(() => {
        router.push('/laboratorio-ia' as any);
      }, 700);
    } catch {
      setToast({
        mensagem: 'Falha ao salvar amostra(s) no servidor.',
        tipo: 'erro',
      });
    }
  }

  function handleVoltar() {
    router.push('/laboratorio-ia' as any);
  }

  return (
    <View style={styles.root}>
      <View style={styles.glowOrb} />

      <ToastPopup toast={toast} onHide={() => setToast(null)} />

      <SafeAreaView style={styles.safeArea}>
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

          <View style={styles.deviceBadge}>
            <View
              style={[
                styles.deviceDot,
                estaConectado ? styles.deviceDotOnline : styles.deviceDotOffline,
              ]}
            />
            <Text style={styles.deviceText}>
              {estaConectado
                ? dispositivo?.nome || 'Arduino UNO R4'
                : 'Desconectado'}
            </Text>
          </View>
        </View>

        {/* CONSOLE DE OBSERVAÇÃO AO VIVO E GRAVAÇÃO COM PAINEL FLUTUANTE */}
        <DataLabRecordingSessionConsole
          agenteId={agenteId}
          esporteId={esporteId}
          articulacaoId={articulacaoId}
          posicaoLateralidade={posicaoLateralidade}
          movimentoId={movimentoId}
          modo={modo}
          duracaoMs={duracaoMs}
          estaConectado={estaConectado}
          estaConectando={estaConectando}
          onConectarDispositivo={handleConectarDispositivo}
          onSalvarAmostra={handleSalvarAmostra}
          salvando={salvarMutation.isPending}
        />
      </SafeAreaView>
    </View>
  );
}


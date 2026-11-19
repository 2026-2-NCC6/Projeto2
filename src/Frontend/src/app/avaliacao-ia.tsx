import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DataLabModelEvaluationDashboard } from '@/components/ia/DataLabModelEvaluationDashboard';
import { FluxColors } from '@/constants/theme';
import { useAvaliacaoModeloIA } from '@/hooks';
import { styles } from '@/styles/avaliacao-ia.styles';

export default function AvaliacaoIAScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    modeloId?: string;
    esporteId?: string;
    versao?: string;
  }>();

  const modeloId = params.modeloId || 'flux_tenis';
  const [versaoSelecionada, setVersaoSelecionada] = useState<string>(params.versao || '');

  const { data: avaliacao, isLoading: carregando } = useAvaliacaoModeloIA(
    modeloId,
    versaoSelecionada || undefined
  );

  const versaoExibida = versaoSelecionada || avaliacao?.versao_selecionada || 'v4';

  function handleVoltar() {
    router.push('/laboratorio-ia' as any);
  }

  function handleSelecionarVersao(v: string) {
    setVersaoSelecionada(v);
  }

  return (
    <View style={styles.root}>
      <View style={styles.glowOrb} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* BARRA SUPERIOR: VOLTAR + STATUS DO MODELO */}
          <View style={styles.headerBar}>
            <Pressable
              onPress={handleVoltar}
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="Voltar ao Laboratório de IA">
              <MaterialIcons name="arrow-back" size={16} color={FluxColors.primaryLight} />
              <Text style={styles.backButtonText}>{'Voltar ao Lab IA'}</Text>
            </Pressable>

            <View style={styles.headerBadge}>
              <View style={styles.headerBadgeDot} />
              <Text style={styles.headerBadgeText}>
                {`MLOps • ${avaliacao?.esporte_id?.toUpperCase() || 'TÊNIS'} (${versaoExibida})`}
              </Text>
            </View>
          </View>

          {/* PAINEL COMPLETO DE AVALIAÇÃO E AUDITORIA */}
          <DataLabModelEvaluationDashboard
            dados={avaliacao}
            carregando={carregando}
            versaoSelecionada={versaoExibida}
            onSelecionarVersao={handleSelecionarVersao}
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}


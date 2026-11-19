import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DataLabHeader } from '@/components/ia/DataLabHeader';
import { DataLabModelProjectsCard } from '@/components/ia/DataLabModelProjectsCard';
import { DataLabSamplesListCard } from '@/components/ia/DataLabSamplesListCard';
import { DataLabSetupCard } from '@/components/ia/DataLabSetupCard';
import { PrimaryButton } from '@/components/ui/GlassCard';
import { ToastPopup, type ToastData } from '@/components/ui/ToastPopup';
import {
  useAmostrasDataset,
  useEsportesDataLab,
  useExcluirAmostraDataset,
  useMovimentosDataLab,
  useReiniciarDatasetDataLab,
  useWearable,
} from '@/hooks';
import { styles } from '@/styles/laboratorio-ia.styles';

export default function LaboratorioIAScreen() {
  const router = useRouter();
  const {
    estaConectado,
    estaConectando,
    dispositivo,
    conectarDispositivo,
    desconectarDispositivo,
  } = useWearable();

  const { data: amostras, isLoading: carregandoAmostras } = useAmostrasDataset();
  const excluirMutation = useExcluirAmostraDataset();
  const reiniciarMutation = useReiniciarDatasetDataLab();

  // Estados dos parâmetros de gravação compartilhados
  const [esporteId, setEsporteId] = useState('tenis');
  const [agenteId, setAgenteId] = useState('dev-agente-01');
  const [articulacaoId, setArticulacaoId] = useState('pulso');
  const [posicaoLateralidade, setPosicaoLateralidade] = useState<'direita' | 'esquerda' | 'central'>('direita');
  const [movimentoId, setMovimentoId] = useState('tenis_forehand');
  const [modo, setModo] = useState<'pontual' | 'continuo'>('continuo');
  const [duracaoMs, setDuracaoMs] = useState(1500);

  const { data: listaMovimentos } = useMovimentosDataLab(esporteId);
  const { data: listaEsportes } = useEsportesDataLab();

  const [toast, setToast] = useState<ToastData | null>(null);

  const esporteNome = listaEsportes?.find((e) => e.id === esporteId)?.nome || 'Tênis';
  const movimentoNome = listaMovimentos?.find((m) => m.id === movimentoId)?.nome || 'Forehand';

  function handleIrParaGravador() {
    try {
      router.push({
        pathname: '/gravador-ia' as any,
        params: {
          agenteId,
          esporteId,
          articulacaoId,
          posicaoLateralidade,
          movimentoId,
          modo,
          duracaoMs: String(duracaoMs),
        },
      });
    } catch (err) {
      console.error('Erro ao navegar:', err);
      setToast({
        mensagem: 'Erro ao abrir cabine de gravação.',
        tipo: 'erro',
      });
    }
  }

  async function handleConectarDispositivo() {
    const ok = await conectarDispositivo();
    setToast(
      ok
        ? { mensagem: 'Arduino R4 conectado com sucesso!', tipo: 'sucesso' }
        : { mensagem: 'Dispositivo BLE não encontrado', tipo: 'erro' }
    );
  }

  async function handleDesconectarDispositivo() {
    await desconectarDispositivo();
    setToast({ mensagem: 'Arduino desconectado', tipo: 'sucesso' });
  }

  async function handleExcluirAmostra(idAmostra: string) {
    try {
      await excluirMutation.mutateAsync(idAmostra);
      setToast({
        mensagem: 'Amostra removida do dataset.',
        tipo: 'sucesso',
      });
    } catch {
      setToast({
        mensagem: 'Falha ao excluir amostra.',
        tipo: 'erro',
      });
    }
  }

  async function handleReiniciarOuExcluirLote(filtros: {
    ids?: string[];
    esporteId?: string;
    movimentoId?: string;
    articulacaoId?: string;
    agenteId?: string;
    reiniciarModelo?: boolean;
    totalExcluir: number;
  }) {
    try {
      const resp = await reiniciarMutation.mutateAsync({
        ids: filtros.ids,
        esporte_id: filtros.esporteId,
        movimento_id: filtros.movimentoId,
        articulacao_id: filtros.articulacaoId,
        agente_id: filtros.agenteId,
        reiniciar_modelo: filtros.reiniciarModelo,
      });

      if (filtros.reiniciarModelo || resp.modelo_reiniciado) {
        setToast({
          tipo: 'sucesso',
          mensagem: `Modelo reiniciado com sucesso! ${resp.total_excluidas} amostras apagadas.`,
        });
      } else {
        setToast({
          tipo: 'sucesso',
          mensagem: `${resp.total_excluidas} amostra(s) excluída(s) com sucesso.`,
        });
      }
    } catch (err: any) {
      setToast({
        tipo: 'erro',
        mensagem: err?.message || 'Falha ao excluir amostras ou reiniciar modelo.',
      });
      throw err;
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
          <DataLabHeader
            estaConectado={estaConectado}
            estaConectando={estaConectando}
            nomeDispositivo={dispositivo?.nome}
            onConectar={handleConectarDispositivo}
            onDesconectar={handleDesconectarDispositivo}
          />

          {/* 1. MODELO DE IA EM DESENVOLVIMENTO & DATASET CONSOLIDADO NO TOPO */}
          <View style={styles.topModelSection}>
            <DataLabModelProjectsCard
              onModeloSelecionado={(modelo) => {
                if (modelo.esporte_id && modelo.esporte_id !== esporteId) {
                  setEsporteId(modelo.esporte_id);
                }
              }}
            />
          </View>

          {/* 2. CONFIGURADOR DE PARÂMETROS FIXOS (ATLETA, MODALIDADE, ARTICULAÇÃO, GOLPE) */}
          <View style={styles.setupSection}>
            <DataLabSetupCard
              estaConectado={estaConectado}
              estaConectando={estaConectando}
              onConectarDispositivo={handleConectarDispositivo}
              esporteId={esporteId}
              setEsporteId={setEsporteId}
              agenteId={agenteId}
              setAgenteId={setAgenteId}
              articulacaoId={articulacaoId}
              setArticulacaoId={setArticulacaoId}
              posicaoLateralidade={posicaoLateralidade}
              setPosicaoLateralidade={setPosicaoLateralidade}
              movimentoId={movimentoId}
              setMovimentoId={setMovimentoId}
              modo={modo}
              setModo={setModo}
              duracaoMs={duracaoMs}
              setDuracaoMs={setDuracaoMs}
              onIniciarGravacao={handleIrParaGravador}
            />
          </View>

          {/* 3. LISTA DE AMOSTRAS GRAVADAS */}
          <View style={styles.lowerSection}>
            <DataLabSamplesListCard
              amostras={amostras}
              onExcluirAmostra={handleExcluirAmostra}
              onReiniciarOuExcluirLote={handleReiniciarOuExcluirLote}
              carregando={carregandoAmostras}
            />
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* BOTÃO FLUTUANTE DE GRAVAR FIXO ACIMA DO BOTTOM BAR */}
      <View style={styles.floatingRecordDock} pointerEvents="box-none">
        <View style={styles.floatingRecordInner}>
          <PrimaryButton
            label="⏺ Gravar Movimento"
            variant="primary"
            onPress={handleIrParaGravador}
            style={styles.recordButton}
          />
        </View>
      </View>
    </View>
  );
}


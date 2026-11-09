import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CreateCircuitModal } from '@/components/treino/CreateCircuitModal';
import { ManualCircuitResultModal } from '@/components/treino/ManualCircuitResultModal';
import { RestIntervalModal } from '@/components/treino/RestIntervalModal';
import { SessionActionModal } from '@/components/treino/SessionActionModal';
import { SessionBottomActions } from '@/components/treino/SessionBottomActions';
import { SessionCircuitsList } from '@/components/treino/SessionCircuitsList';
import {
  SessionClockCard,
  SessionHeader,
} from '@/components/treino/SessionHeader';
import { ToastPopup } from '@/components/ui/ToastPopup';
import { useSessaoTreino } from '@/hooks/useSessaoTreino';
import { styles } from '@/styles/sessao.styles';

export default function SessaoScreen() {
  const {
    circuitos,
    estaConectado,
    tempoSessaoFormatado,
    relogioCompactoVisivel,
    modalCriarVisivel,
    circuitoEditando,
    circuitoAlvoIntervalo,
    circuitoRegistroManual,
    modalAtivo,
    toast,
    estaProcessando,
    setToast,
    setModalAtivo,
    setCircuitoAlvoIntervalo,
    handleScrollSessao,
    abrirModalNovoCircuito,
    abrirModalEditarCircuito,
    fecharModalCriarEditar,
    abrirModalRegistroManualCiclo,
    fecharModalRegistroManualCiclo,
    handleConfirmarRegistroManualCiclo,
    concluirCircuito,
    handleAdicionarAoPlano,
    handleSalvarEdicaoCircuito,
    handleExcluirCircuito,
    handleMoverOrdemCircuito,
    handleSalvarIntervalo,
    handleAjustarIntervalo,
    handleRemoverIntervalo,
    handlePularIntervalo,
    handleIniciarCircuito,
    handleAvisoSequenciaPreDefinida,
    handleConfirmarEncerramento,
    handleConfirmarDescarte,
  } = useSessaoTreino();

  return (
    <View style={styles.root}>
      <View style={styles.glowOrb} />

      <ToastPopup toast={toast} onHide={() => setToast(null)} />

      <CreateCircuitModal
        visivel={modalCriarVisivel}
        proximoNumeroRodada={circuitos.length + 1}
        circuitoEditando={circuitoEditando}
        onFechar={fecharModalCriarEditar}
        onAdicionarAoPlano={handleAdicionarAoPlano}
        onSalvarEdicao={handleSalvarEdicaoCircuito}
        onClicarSequenciaPreDefinida={handleAvisoSequenciaPreDefinida}
      />

      <ManualCircuitResultModal
        visivel={Boolean(circuitoRegistroManual)}
        circuito={circuitoRegistroManual}
        onFechar={fecharModalRegistroManualCiclo}
        onConfirmarRegistroManual={handleConfirmarRegistroManualCiclo}
      />

      <RestIntervalModal
        visivel={Boolean(circuitoAlvoIntervalo)}
        numeroCircuitoAnterior={circuitoAlvoIntervalo?.numero_rodada ?? 1}
        onFechar={() => setCircuitoAlvoIntervalo(null)}
        onSalvarIntervalo={handleSalvarIntervalo}
      />

      <SessionActionModal
        tipo={modalAtivo}
        carregando={estaProcessando}
        onFechar={() => setModalAtivo(null)}
        onConfirmarEncerramento={handleConfirmarEncerramento}
        onConfirmarDescarte={handleConfirmarDescarte}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Cabeçalho fixo no topo da tela */}
        <SessionHeader
          tempoFormatado={tempoSessaoFormatado}
          relogioCompactoVisivel={relogioCompactoVisivel}
          dispositivoConectado={estaConectado}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={handleScrollSessao}
          scrollEventThrottle={16}>
          <SessionClockCard tempoFormatado={tempoSessaoFormatado} />

          <SessionCircuitsList
            circuitos={circuitos}
            dispositivoConectado={estaConectado}
            onAbrirModalCriarCircuito={abrirModalNovoCircuito}
            onIniciarCircuito={handleIniciarCircuito}
            onConcluirCircuitoManualmente={concluirCircuito}
            onAbrirRegistroManualCiclo={abrirModalRegistroManualCiclo}
            onEditarCircuito={abrirModalEditarCircuito}
            onExcluirCircuito={handleExcluirCircuito}
            onMoverOrdemCircuito={handleMoverOrdemCircuito}
            onAbrirModalIntervalo={setCircuitoAlvoIntervalo}
            onAjustarIntervalo={handleAjustarIntervalo}
            onPularIntervalo={handlePularIntervalo}
            onRemoverIntervalo={handleRemoverIntervalo}
          />

          <SessionBottomActions
            processando={estaProcessando}
            onSolicitarEncerrar={() => setModalAtivo('encerrar')}
            onSolicitarDescartar={() => setModalAtivo('descartar')}
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

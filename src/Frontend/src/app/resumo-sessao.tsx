import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CameraCaptureModal } from '@/components/treino/CameraCaptureModal';
import { ManualCircuitResultModal } from '@/components/treino/ManualCircuitResultModal';
import { SessionSummaryActions } from '@/components/treino/SessionSummaryActions';
import { SessionSummaryTemplateCard } from '@/components/treino/SessionSummaryTemplateCard';
import { ToastPopup } from '@/components/ui/ToastPopup';
import { useResumoSessao } from '@/hooks/useResumoSessao';
import { styles } from '@/styles/resumo-sessao.styles';

export default function ResumoSessaoScreen() {
  const {
    resumo,
    legenda,
    setLegenda,
    fotoBackgroundUri,
    modalCameraVisivel,
    setModalCameraVisivel,
    handleTirarFoto,
    handleEscolherFotoGaleria,
    handleRemoverFoto,
    handleFotoCapturadaCamera,
    circuitoRegistroManual,
    setCircuitoRegistroManual,
    handleConfirmarRegistroManualNoResumo,
    toast,
    setToast,
    estaProcessando,
    concluirSessaoFinal,
  } = useResumoSessao();

  return (
    <View style={styles.root}>
      <View style={styles.glowOrb} />

      <ToastPopup toast={toast} onHide={() => setToast(null)} />

      <CameraCaptureModal
        visivel={modalCameraVisivel}
        onFechar={() => setModalCameraVisivel(false)}
        onFotoCapturada={handleFotoCapturadaCamera}
      />

      <ManualCircuitResultModal
        visivel={Boolean(circuitoRegistroManual)}
        circuito={circuitoRegistroManual}
        onFechar={() => setCircuitoRegistroManual(null)}
        onConfirmarRegistroManual={handleConfirmarRegistroManualNoResumo}
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <SessionSummaryTemplateCard
            resumo={resumo}
            legenda={legenda}
            fotoBackgroundUri={fotoBackgroundUri}
            onChangeLegenda={setLegenda}
            onTirarFoto={handleTirarFoto}
            onEscolherFotoGaleria={handleEscolherFotoGaleria}
            onRemoverFoto={handleRemoverFoto}
            onAbrirFormularioManualCiclo={setCircuitoRegistroManual}
          />

          <SessionSummaryActions
            processando={estaProcessando}
            onPublicarSessao={() => concluirSessaoFinal(true)}
            onApenasConcluirSessao={() => concluirSessaoFinal(false)}
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

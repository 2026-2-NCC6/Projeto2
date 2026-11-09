import { usePathname, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import type { DadosRegistroManualCiclo } from '@/components/treino/ManualCircuitResultModal';
import type { CircuitoSessaoAtiva } from '@/components/treino/SessionCircuitsList';
import type { ToastData } from '@/components/ui/ToastPopup';
import {
  useFinalizarSessao,
  useIniciarSessao,
  useRegistrarCircuito,
} from '@/hooks/useSessoes';
import { usePublicarPostagem } from '@/hooks/useSocial';
import { midiaSessaoService } from '@/services/sessao/midiaSessaoService';
import {
  sessaoService,
  type ResumoSessaoSnapshot,
} from '@/services/sessao/sessaoService';

export const LIMITE_CARACTERES_LEGENDA = 140;

const RESUMO_FALLBACK: ResumoSessaoSnapshot = {
  dataSessaoFormatada: new Date().toLocaleDateString('pt-BR'),
  tempoTotalSegundos: 0,
  tempoTotalFormatado: '00:00:00',
  pontuacaoTotal: 0,
  percentualMedioAcerto: 0,
  totalGolpes: 0,
  versaoModeloIa: '1.0.0',
  legendaTemplate: '',
  circuitos: [],
};

export function useResumoSessao() {
  const router = useRouter();
  const pathname = usePathname();
  const naTelaResumo = pathname === '/resumo-sessao';

  const iniciarSessaoMutation = useIniciarSessao();
  const registrarCircuitoMutation = useRegistrarCircuito();
  const finalizarSessaoMutation = useFinalizarSessao();
  const publicarMutation = usePublicarPostagem();

  const [resumo, setResumo] = useState<ResumoSessaoSnapshot>(
    () => sessaoService.obterResumoPendente() ?? RESUMO_FALLBACK
  );
  const [legenda, setLegendaState] = useState<string>('');
  const [fotoBackgroundUri, setFotoBackgroundUri] = useState<string | null>(
    null
  );
  const [modalCameraVisivel, setModalCameraVisivel] = useState(false);
  const [circuitoRegistroManual, setCircuitoRegistroManual] =
    useState<CircuitoSessaoAtiva | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);

  const setLegenda = useCallback((texto: string) => {
    setLegendaState(texto.slice(0, LIMITE_CARACTERES_LEGENDA));
  }, []);

  useEffect(() => {
    if (!naTelaResumo) return;
    const pendente = sessaoService.obterResumoPendente();
    if (pendente) {
      setResumo(pendente);
      setLegendaState('');
      setFotoBackgroundUri(null);
    } else {
      setResumo({
        ...RESUMO_FALLBACK,
        dataSessaoFormatada: new Date().toLocaleDateString('pt-BR'),
      });
      setLegendaState('');
      setFotoBackgroundUri(null);
    }
  }, [naTelaResumo]);

  const handleTirarFoto = useCallback(async () => {
    if (midiaSessaoService.suportaCameraWebAoVivo()) {
      setModalCameraVisivel(true);
      return;
    }
    const uri = await midiaSessaoService.selecionarImagemGaleria(true);
    if (uri) {
      setFotoBackgroundUri(uri);
    }
  }, []);

  const handleEscolherFotoGaleria = useCallback(async () => {
    const uri = await midiaSessaoService.selecionarImagemGaleria(false);
    if (uri) {
      setFotoBackgroundUri(uri);
    }
  }, []);

  const handleRemoverFoto = useCallback(() => {
    setFotoBackgroundUri(null);
  }, []);

  const handleFotoCapturadaCamera = useCallback((dataUrl: string) => {
    setFotoBackgroundUri(dataUrl);
    setModalCameraVisivel(false);
  }, []);

  const handleConfirmarRegistroManualNoResumo = useCallback(
    (idCircuito: string, dados: DadosRegistroManualCiclo) => {
      const { circuitosAtualizados } =
        sessaoService.registrarResultadoManualNoCircuito(
          resumo.circuitos,
          idCircuito,
          dados
        );

      const novoResumo = sessaoService.gerarERegistrarResumoSessao(
        circuitosAtualizados,
        resumo.tempoTotalSegundos,
        resumo.versaoModeloIa
      );

      setResumo(novoResumo);
      setCircuitoRegistroManual(null);
      setToast({
        mensagem: 'Dados do ciclo atualizados no resumo!',
        tipo: 'sucesso',
      });
    },
    [resumo]
  );

  const estaProcessando =
    iniciarSessaoMutation.isPending ||
    registrarCircuitoMutation.isPending ||
    finalizarSessaoMutation.isPending ||
    publicarMutation.isPending;

  const concluirSessaoFinal = useCallback(
    async (publicarNoFeed: boolean) => {
      try {
        const novaSessao = await iniciarSessaoMutation.mutateAsync({
          modalidade: 'tenis',
          id_estabelecimento: null,
        });

        const payloads = sessaoService.montarPayloadsCircuitosConcluidos(
          resumo.circuitos,
          resumo.versaoModeloIa
        );

        for (const dadosCircuito of payloads) {
          await registrarCircuitoMutation.mutateAsync({
            idSessao: novaSessao.id,
            dados: dadosCircuito,
          });
        }

        const encerrada = await finalizarSessaoMutation.mutateAsync(
          novaSessao.id
        );

        const legendaLimpa = legenda.trim();
        const midiaSerializada = sessaoService.serializarTemplateParaPostagem(
          resumo,
          fotoBackgroundUri
        );

        await publicarMutation.mutateAsync({
          id_sessao: encerrada.id,
          legenda: legendaLimpa.length > 0 ? legendaLimpa : null,
          midia_url: midiaSerializada,
          visibilidade: publicarNoFeed ? 'publico' : 'privado',
        });

        sessaoService.limparResumoPendente();

        setToast({
          mensagem: publicarNoFeed
            ? 'Sessão publicada no Feed Público e salva no histórico!'
            : 'Sessão salva como Privada (visível apenas no seu Perfil)!',
          tipo: 'sucesso',
        });

        setTimeout(() => {
          router.replace(publicarNoFeed ? '/' : '/perfil');
        }, 900);
      } catch {
        setToast({
          mensagem: 'Erro ao salvar a sessão',
          tipo: 'erro',
        });
      }
    },
    [
      finalizarSessaoMutation,
      fotoBackgroundUri,
      iniciarSessaoMutation,
      legenda,
      publicarMutation,
      registrarCircuitoMutation,
      resumo,
      router,
    ]
  );

  return {
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
  };
}

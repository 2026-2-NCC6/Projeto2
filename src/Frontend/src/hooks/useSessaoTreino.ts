import { usePathname, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

import type { DadosRegistroManualCiclo } from '@/components/treino/ManualCircuitResultModal';
import type { SessionModalType } from '@/components/treino/SessionActionModal';
import type { CircuitoSessaoAtiva } from '@/components/treino/SessionCircuitsList';
import type { ToastData } from '@/components/ui/ToastPopup';
import { useWearable } from '@/hooks/useWearable';
import { sessaoService } from '@/services/sessao/sessaoService';
import { soundService } from '@/services/soundService';
import { wearableService } from '@/services/wearableService';
import type { MovimentoItem } from '@/types/api';

export function useSessaoTreino() {
  const router = useRouter();
  const pathname = usePathname();
  const naTelaSessao = pathname === '/sessao';
  const { dispositivo, estaConectado } = useWearable();

  const [circuitos, setCircuitos] = useState<CircuitoSessaoAtiva[]>([]);
  const [segundosSessao, setSegundosSessao] = useState(0);
  const [relogioCompactoVisivel, setRelogioCompactoVisivel] = useState(false);
  const [idCircuitoExecutando, setIdCircuitoExecutando] = useState<string | null>(
    null
  );
  const [modalCriarVisivel, setModalCriarVisivel] = useState(false);
  const [circuitoEditando, setCircuitoEditando] =
    useState<CircuitoSessaoAtiva | null>(null);
  const [circuitoAlvoIntervalo, setCircuitoAlvoIntervalo] =
    useState<CircuitoSessaoAtiva | null>(null);
  const [circuitoRegistroManual, setCircuitoRegistroManual] =
    useState<CircuitoSessaoAtiva | null>(null);
  const [modalAtivo, setModalAtivo] = useState<SessionModalType>(null);
  const [toast, setToast] = useState<ToastData | null>(null);

  const pararEscutaBLERef = useRef<(() => void) | null>(null);
  const estavaNaSessaoRef = useRef(false);

  const encerrarEscutaBLE = useCallback(() => {
    if (pararEscutaBLERef.current) {
      pararEscutaBLERef.current();
      pararEscutaBLERef.current = null;
    }
  }, []);

  const resetarSessaoCompleta = useCallback(() => {
    encerrarEscutaBLE();
    setCircuitos([]);
    setSegundosSessao(0);
    setRelogioCompactoVisivel(false);
    setIdCircuitoExecutando(null);
    setModalCriarVisivel(false);
    setCircuitoEditando(null);
    setCircuitoAlvoIntervalo(null);
    setCircuitoRegistroManual(null);
    setModalAtivo(null);
  }, [encerrarEscutaBLE]);

  // Sempre que entrar em /sessao vindo de outra rota, inicia uma sessão limpa do zero (00:00:00 e sem circuitos antigos)
  useEffect(() => {
    if (naTelaSessao && !estavaNaSessaoRef.current) {
      resetarSessaoCompleta();
      setToast(null);
    }
    estavaNaSessaoRef.current = naTelaSessao;
  }, [naTelaSessao, resetarSessaoCompleta]);

  // Cronômetro da sessão só conta enquanto a tela /sessao estiver ativa
  useEffect(() => {
    if (!naTelaSessao) return;

    const timerSessao = setInterval(() => {
      setSegundosSessao((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timerSessao);
  }, [naTelaSessao]);

  const handleScrollSessao = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const deveMostrarNoTopo = offsetY > 75;
      setRelogioCompactoVisivel((atual) =>
        atual !== deveMostrarNoTopo ? deveMostrarNoTopo : atual
      );
    },
    []
  );

  const tempoSessaoFormatado =
    sessaoService.formatarDuracaoSessao(segundosSessao);

  const concluirCircuito = useCallback(
    (idCircuito: string) => {
      encerrarEscutaBLE();
      setIdCircuitoExecutando(null);

      // Se o dispositivo NÃO está conectado, abre o formulário manual para cadastrar as rodadas executadas
      if (!estaConectado) {
        setCircuitos((prev) => {
          const alvo = prev.find((c) => c.id === idCircuito) ?? null;
          if (alvo) {
            setCircuitoRegistroManual(alvo);
          }
          return prev;
        });
        return;
      }

      setCircuitos((prev) => {
        const {
          circuitosAtualizados,
          circuitoConcluido,
          iniciouDescanso,
        } = sessaoService.concluirCircuitoNaLista(prev, idCircuito);

        if (circuitoConcluido) {
          if (iniciouDescanso) {
            soundService.tocarInicioDescanso();
          }
          setToast({
            mensagem: iniciouDescanso
              ? 'Circuito concluído! Iniciando descanso...'
              : `Circuito finalizado! (+${circuitoConcluido.pontuacao} pts)`,
            tipo: 'sucesso',
          });
        }

        return circuitosAtualizados;
      });
    },
    [encerrarEscutaBLE, estaConectado]
  );

  const temCircuitoOuIntervaloAtivo = circuitos.some(
    (c) =>
      (c.status === 'executando' && c.id === idCircuitoExecutando) ||
      c.intervalo_apos?.status === 'contando'
  );

  useEffect(() => {
    if (!temCircuitoOuIntervaloAtivo) return;

    const timer = setInterval(() => {
      setCircuitos((prev) => {
        const {
          circuitosAtualizados,
          idsCircuitosMetaTempoAtingida,
          descansoFinalizadoNesteTick,
        } = sessaoService.processarTickSegundo(prev, idCircuitoExecutando);

        if (descansoFinalizadoNesteTick) {
          soundService.tocarFimDescanso();
        }

        for (const idConcluir of idsCircuitosMetaTempoAtingida) {
          setTimeout(() => concluirCircuito(idConcluir), 0);
        }

        return circuitosAtualizados;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [temCircuitoOuIntervaloAtivo, idCircuitoExecutando, concluirCircuito]);

  useEffect(() => {
    return () => encerrarEscutaBLE();
  }, [encerrarEscutaBLE]);

  const handleAdicionarAoPlano = useCallback(
    (circuitoPlanejado: CircuitoSessaoAtiva) => {
      setCircuitos((prev) =>
        sessaoService.adicionarCircuito(prev, circuitoPlanejado)
      );
      setModalCriarVisivel(false);
      setCircuitoEditando(null);
      setToast({
        mensagem: 'Circuito adicionado ao plano!',
        tipo: 'sucesso',
      });
    },
    []
  );

  const handleSalvarEdicaoCircuito = useCallback(
    (circuitoAtualizado: CircuitoSessaoAtiva) => {
      setCircuitos((prev) =>
        sessaoService.atualizarCircuito(prev, circuitoAtualizado)
      );
      setModalCriarVisivel(false);
      setCircuitoEditando(null);
      setToast({
        mensagem: 'Circuito atualizado!',
        tipo: 'sucesso',
      });
    },
    []
  );

  const handleExcluirCircuito = useCallback(
    (idCircuito: string) => {
      if (idCircuitoExecutando === idCircuito) {
        encerrarEscutaBLE();
        setIdCircuitoExecutando(null);
      }
      setCircuitos((prev) => sessaoService.excluirCircuito(prev, idCircuito));
      setToast({
        mensagem: 'Circuito removido do plano',
        tipo: 'sucesso',
      });
    },
    [encerrarEscutaBLE, idCircuitoExecutando]
  );

  const handleMoverOrdemCircuito = useCallback(
    (idCircuito: string, direcao: 'subir' | 'descer') => {
      setCircuitos((prev) =>
        sessaoService.moverOrdemCircuito(prev, idCircuito, direcao)
      );
    },
    []
  );

  const handleSalvarIntervalo = useCallback(
    (duracaoSegundos: number, textoFormatado: string) => {
      if (!circuitoAlvoIntervalo) return;
      const alvoId = circuitoAlvoIntervalo.id;

      setCircuitos((prev) => {
        const { circuitosAtualizados, iniciouAgora } =
          sessaoService.configurarIntervalo(
            prev,
            alvoId,
            duracaoSegundos,
            textoFormatado
          );
        if (iniciouAgora) {
          soundService.tocarInicioDescanso();
        }
        return circuitosAtualizados;
      });

      setCircuitoAlvoIntervalo(null);
      setToast({
        mensagem: `Intervalo de ${textoFormatado} configurado!`,
        tipo: 'sucesso',
      });
    },
    [circuitoAlvoIntervalo]
  );

  const handleAjustarIntervalo = useCallback(
    (idCircuito: string, deltaSegundos: number) => {
      setCircuitos((prev) => {
        const { circuitosAtualizados, zerouDescanso } =
          sessaoService.ajustarIntervaloAtivo(prev, idCircuito, deltaSegundos);
        if (zerouDescanso) {
          soundService.tocarFimDescanso();
        }
        return circuitosAtualizados;
      });
    },
    []
  );

  const handleRemoverIntervalo = useCallback((idCircuito: string) => {
    setCircuitos((prev) => sessaoService.removerIntervalo(prev, idCircuito));
  }, []);

  const handlePularIntervalo = useCallback((idCircuito: string) => {
    soundService.tocarFimDescanso();
    setCircuitos((prev) => sessaoService.pularIntervalo(prev, idCircuito));
  }, []);

  const handleIniciarCircuito = useCallback(
    async (idCircuito: string) => {
      encerrarEscutaBLE();
      setIdCircuitoExecutando(idCircuito);

      setCircuitos((prev) =>
        sessaoService.iniciarExecucaoCircuito(prev, idCircuito)
      );

      if (!estaConectado) {
        return;
      }

      const stopFn = await wearableService.iniciarEscutaGolpesDispositivo(
        (novoGolpe: MovimentoItem) => {
          setCircuitos((prev) => {
            const { circuitosAtualizados, atingiuMetaGolpes } =
              sessaoService.registrarGolpeNoCircuito(
                prev,
                idCircuito,
                novoGolpe
              );

            if (atingiuMetaGolpes) {
              setTimeout(() => concluirCircuito(idCircuito), 0);
            }

            return circuitosAtualizados;
          });
        }
      );

      pararEscutaBLERef.current = stopFn;
    },
    [concluirCircuito, encerrarEscutaBLE, estaConectado]
  );

  const abrirModalRegistroManualCiclo = useCallback(
    (circuito: CircuitoSessaoAtiva) => {
      if (idCircuitoExecutando === circuito.id) {
        encerrarEscutaBLE();
        setIdCircuitoExecutando(null);
      }
      setCircuitoRegistroManual(circuito);
    },
    [encerrarEscutaBLE, idCircuitoExecutando]
  );

  const fecharModalRegistroManualCiclo = useCallback(() => {
    setCircuitoRegistroManual(null);
  }, []);

  const handleConfirmarRegistroManualCiclo = useCallback(
    (idCircuito: string, dados: DadosRegistroManualCiclo) => {
      setCircuitos((prev) => {
        const {
          circuitosAtualizados,
          circuitoConcluido,
          iniciouDescanso,
        } = sessaoService.registrarResultadoManualNoCircuito(
          prev,
          idCircuito,
          dados
        );

        if (circuitoConcluido) {
          if (iniciouDescanso) {
            soundService.tocarInicioDescanso();
          }
          setToast({
            mensagem: iniciouDescanso
              ? 'Ciclo registrado! Iniciando descanso...'
              : `Ciclo registrado manualmente! (+${circuitoConcluido.pontuacao} pts)`,
            tipo: 'sucesso',
          });
        }

        return circuitosAtualizados;
      });

      setCircuitoRegistroManual(null);
    },
    []
  );

  const handleAvisoSequenciaPreDefinida = useCallback(() => {
    setToast({
      mensagem: 'Banco de sequências pré-definidas estará disponível em breve!',
      tipo: 'sucesso',
    });
  }, []);

  const estaProcessando = false;

  const handleConfirmarEncerramento = useCallback(() => {
    encerrarEscutaBLE();
    sessaoService.gerarERegistrarResumoSessao(
      circuitos,
      segundosSessao,
      dispositivo?.versaoSoftware ?? 'manual-v1'
    );
    resetarSessaoCompleta();
    router.push('/resumo-sessao' as never);
  }, [
    circuitos,
    dispositivo?.versaoSoftware,
    encerrarEscutaBLE,
    resetarSessaoCompleta,
    router,
    segundosSessao,
  ]);

  const handleConfirmarDescarte = useCallback(() => {
    resetarSessaoCompleta();
    sessaoService.limparResumoPendente();
    setToast({
      mensagem: 'Sessão descartada (não salva no histórico)',
      tipo: 'erro',
    });

    setTimeout(() => {
      router.replace('/treinar');
    }, 600);
  }, [resetarSessaoCompleta, router]);

  const abrirModalNovoCircuito = useCallback(() => {
    setCircuitoEditando(null);
    setModalCriarVisivel(true);
  }, []);

  const abrirModalEditarCircuito = useCallback(
    (circuito: CircuitoSessaoAtiva) => {
      setCircuitoEditando(circuito);
      setModalCriarVisivel(true);
    },
    []
  );

  const fecharModalCriarEditar = useCallback(() => {
    setModalCriarVisivel(false);
    setCircuitoEditando(null);
  }, []);

  return {
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
  };
}

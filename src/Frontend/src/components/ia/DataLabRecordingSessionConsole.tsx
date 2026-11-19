import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { styles } from '@/components/ia/DataLabRecordingSessionConsole.styles';
import {
  calcularSegmentosNativos,
  PlotLinhas,
} from '@/components/ia/LiveHardwareTelemetryCard';
import { GlassCard, PrimaryButton } from '@/components/ui/GlassCard';
import { FluxColors } from '@/constants/theme';
import {
  useAgentesDataLab,
  useArticulacoesDataLab,
  useEsportesDataLab,
  useMovimentosDataLab,
} from '@/hooks';
import { wearableService, type TelemetriaIMUItem } from '@/services/wearableService';
import type { AmostraDatalabCreate, TelemetriaFrameItem } from '@/types/api';

interface DataLabRecordingSessionConsoleProps {
  agenteId: string;
  esporteId: string;
  articulacaoId: string;
  posicaoLateralidade: 'direita' | 'esquerda' | 'central';
  movimentoId: string;
  modo: 'pontual' | 'continuo';
  duracaoMs: number;
  estaConectado: boolean;
  estaConectando?: boolean;
  onConectarDispositivo?: () => void;
  onSalvarAmostra: (amostra: AmostraDatalabCreate | AmostraDatalabCreate[]) => Promise<void>;
  salvando?: boolean;
}

const BUFFER_MAX_FRAMES = 50; // ~2.5 segundos contínuos a 20Hz

export function DataLabRecordingSessionConsole({
  agenteId,
  esporteId,
  articulacaoId,
  posicaoLateralidade,
  movimentoId,
  modo,
  duracaoMs,
  estaConectado,
  estaConectando = false,
  onConectarDispositivo,
  onSalvarAmostra,
  salvando = false,
}: DataLabRecordingSessionConsoleProps) {
  // Queries dos metadados
  const { data: listaEsportes } = useEsportesDataLab();
  const { data: listaArticulacoes } = useArticulacoesDataLab();
  const { data: listaAgentes } = useAgentesDataLab();
  const { data: listaMovimentos } = useMovimentosDataLab(esporteId);

  // Estados dos gráficos em tempo real
  const [bufferFrames, setBufferFrames] = useState<TelemetriaIMUItem[]>([]);
  const [ultimoFrame, setUltimoFrame] = useState<TelemetriaIMUItem | null>(null);
  const [pausado, setPausado] = useState(false);
  const [picoSessao, setPicoSessao] = useState(0);

  // Estados da gravação
  const [status, setStatus] = useState<'ocioso' | 'contagem' | 'gravando' | 'revisao'>('ocioso');
  const [contagem, setContagem] = useState(3);
  const [tempoDecorridoMs, setTempoDecorridoMs] = useState(0);
  const [framesCapturados, setFramesCapturados] = useState<TelemetriaFrameItem[]>([]);
  const [nota, setNota] = useState('');

  // Estados de recorte (modo contínuo)
  const [picos, setPicos] = useState<number[]>([]);
  const [picoSelecionado, setPicoSelecionado] = useState<number | null>(null);
  const [janelasPicos, setJanelasPicos] = useState<{ ini: number; fim: number }[]>([]);
  const [frameInicio, setFrameInicio] = useState(0);
  const [frameFim, setFrameFim] = useState(0);
  const [totalSalvasSessao, setTotalSalvasSessao] = useState(0);
  const [modoTimelineVisual, setModoTimelineVisual] = useState<'3eixos_res' | '3eixos' | 'apenas_res'>('3eixos_res');

  const picoSelecionadoRef = useRef<number | null>(null);
  picoSelecionadoRef.current = picoSelecionado;

  const frameInicioRef = useRef(0);
  frameInicioRef.current = frameInicio;

  const frameFimRef = useRef(0);
  frameFimRef.current = frameFim;

  const janelasPicosRef = useRef<{ ini: number; fim: number }[]>([]);
  janelasPicosRef.current = janelasPicos;

  const pausadoRef = useRef(false);
  pausadoRef.current = pausado;

  const statusRef = useRef(status);
  statusRef.current = status;

  const modoRef = useRef(modo);
  modoRef.current = modo;

  const gravandoBufferRef = useRef<TelemetriaFrameItem[]>([]);
  const streamTimerRef = useRef<any>(null);

  // Assina telemetria global do wearable
  useEffect(() => {
    if (!estaConectado) {
      setBufferFrames([]);
      setUltimoFrame(null);
      return;
    }

    let inicioGravacao = Date.now();

    const cancelar = wearableService.inscreverTelemetria((leitura) => {
      if (pausadoRef.current) return;

      const res = leitura.accel.resultante;
      setPicoSessao((prev) => Math.max(prev, res));
      setUltimoFrame(leitura);

      // Buffer deslizante para os 3 gráficos ao vivo
      setBufferFrames((prev) => {
        const novo = [...prev, leitura];
        if (novo.length > BUFFER_MAX_FRAMES) {
          return novo.slice(novo.length - BUFFER_MAX_FRAMES);
        }
        return novo;
      });

      // Se estiver no estado de gravação ativa
      if (statusRef.current === 'gravando') {
        const frameContador = gravandoBufferRef.current.length + 1;
        const novoFrame: TelemetriaFrameItem = {
          frame_id: frameContador,
          timestamp_ms: Date.now() - inicioGravacao,
          ax: leitura.accel.x,
          ay: leitura.accel.y,
          az: leitura.accel.z,
          gx: leitura.gyro.x,
          gy: leitura.gyro.y,
          gz: leitura.gyro.z,
          resultante_accel: Number(res.toFixed(3)),
          temperatura: leitura.temperatura,
        };

        gravandoBufferRef.current.push(novoFrame);
        setFramesCapturados([...gravandoBufferRef.current]);
      }
    });

    return () => {
      cancelar();
    };
  }, [estaConectado]);

  // Controles de gravação
  function iniciarCaptura() {
    if (!estaConectado) return;
    gravandoBufferRef.current = [];
    setFramesCapturados([]);
    setTempoDecorridoMs(0);

    if (modo === 'pontual') {
      setStatus('contagem');
      setContagem(3);
      const timer = setInterval(() => {
        setContagem((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            dispararGravacaoPontual();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // Modo contínuo imediato
      setStatus('gravando');
      const inicio = Date.now();
      streamTimerRef.current = setInterval(() => {
        setTempoDecorridoMs(Date.now() - inicio);
      }, 100);
    }
  }

  function dispararGravacaoPontual() {
    setStatus('gravando');
    setTimeout(() => {
      setStatus('revisao');
    }, duracaoMs);
  }

  function finalizarGravacaoContinua() {
    if (streamTimerRef.current) {
      clearInterval(streamTimerRef.current);
      streamTimerRef.current = null;
    }

    const capturados = [...gravandoBufferRef.current];
    setFramesCapturados(capturados);
    setStatus('revisao');

    if (capturados.length === 0) return;

    // 1. Calcula o pico máximo da sessão e o limiar dinâmico adaptativo
    const maxVal = capturados.reduce(
      (m, f) => Math.max(m, f.resultante_accel ?? 0),
      0
    );
    // Limiar dinâmico: pelo menos 13.0 m/s², ou 65% do pico máximo registrado (teto em 18 m/s²)
    const limiarDinamico = Math.max(13.0, Math.min(18.0, maxVal * 0.65));

    // 2. Busca picos locais com janela de refratário (~12 frames / 600ms entre golpes)
    const picosCandidatos: number[] = [];
    const minDistanciaFrames = 12;

    for (let i = 2; i < capturados.length - 2; i += 1) {
      const val = capturados[i].resultante_accel ?? 0;
      const ant1 = capturados[i - 1].resultante_accel ?? 0;
      const ant2 = capturados[i - 2].resultante_accel ?? 0;
      const prox1 = capturados[i + 1].resultante_accel ?? 0;
      const prox2 = capturados[i + 2].resultante_accel ?? 0;

      // Pico local: maior que vizinhos e acima do limiar dinâmico
      if (val >= limiarDinamico && val > ant1 && val > ant2 && val >= prox1 && val >= prox2) {
        if (picosCandidatos.length === 0) {
          picosCandidatos.push(i);
        } else {
          const ultimoPico = picosCandidatos[picosCandidatos.length - 1];
          if (i - ultimoPico < minDistanciaFrames) {
            // Se estiver muito próximo do anterior, mantém o maior
            if (val > (capturados[ultimoPico].resultante_accel ?? 0)) {
              picosCandidatos[picosCandidatos.length - 1] = i;
            }
          } else {
            picosCandidatos.push(i);
          }
        }
      }
    }

    // 3. Fallback inteligente: se não encontrou picos acima do limiar, mas houve movimento (> 11.5 m/s²)
    if (picosCandidatos.length === 0 && maxVal >= 11.5) {
      let maiorIdx = 0;
      let maiorVal = 0;
      for (let i = 0; i < capturados.length; i += 1) {
        const v = capturados[i].resultante_accel ?? 0;
        if (v > maiorVal) {
          maiorVal = v;
          maiorIdx = i;
        }
      }
      picosCandidatos.push(maiorIdx);
    }

    setPicos(picosCandidatos);

    if (picosCandidatos.length > 0) {
      const janelasIniciais = picosCandidatos.map((pos) =>
        calcularJanelaPico(pos, capturados)
      );
      setJanelasPicos(janelasIniciais);
      janelasPicosRef.current = janelasIniciais;
      setPicoSelecionado(0);
      picoSelecionadoRef.current = 0;
      setFrameInicio(janelasIniciais[0].ini);
      frameInicioRef.current = janelasIniciais[0].ini;
      setFrameFim(janelasIniciais[0].fim);
      frameFimRef.current = janelasIniciais[0].fim;
    } else {
      setJanelasPicos([]);
      janelasPicosRef.current = [];
      setPicoSelecionado(null);
      picoSelecionadoRef.current = null;
      setFrameInicio(0);
      frameInicioRef.current = 0;
      setFrameFim(capturados.length - 1);
      frameFimRef.current = capturados.length - 1;
    }
  }

  function calcularJanelaPico(
    pos: number,
    frames: TelemetriaFrameItem[]
  ): { ini: number; fim: number } {
    const totalFrames = frames.length || 0;
    const maxIdx = Math.max(0, totalFrames - 1);
    const posSegura = Number.isFinite(pos) ? Math.max(0, Math.min(maxIdx, pos)) : 0;

    let ini = Math.max(0, posSegura - 12);
    let minAnt = 999;
    for (let i = Math.max(0, posSegura - 18); i <= Math.max(0, posSegura - 3); i += 1) {
      const v = frames[i]?.resultante_accel ?? 999;
      if (Number.isFinite(v) && v <= minAnt) {
        minAnt = v;
        ini = i;
      }
    }

    let fim = Math.min(maxIdx, posSegura + 12);
    let minPost = 999;
    for (
      let i = Math.min(maxIdx, posSegura + 3);
      i <= Math.min(maxIdx, posSegura + 18);
      i += 1
    ) {
      const v = frames[i]?.resultante_accel ?? 999;
      if (Number.isFinite(v) && v <= minPost) {
        minPost = v;
        fim = i;
      }
    }

    // Garante janela mínima de ~12 frames (0.6s) para conter a cinemática completa
    if (fim - ini < 12) {
      ini = Math.max(0, posSegura - 8);
      fim = Math.min(maxIdx, posSegura + 8);
    }

    return {
      ini: Number.isFinite(ini) ? ini : 0,
      fim: Number.isFinite(fim) ? fim : maxIdx,
    };
  }

  function atualizarJanelaAtiva(novoIni: number, novoFim: number) {
    const maxIdx = Math.max(0, (framesCapturados.length || 1) - 1);
    const validIni = Number.isFinite(novoIni) ? Math.max(0, Math.min(maxIdx, novoIni)) : 0;
    const validFim = Number.isFinite(novoFim)
      ? Math.max(validIni, Math.min(maxIdx, novoFim))
      : maxIdx;

    setFrameInicio(validIni);
    setFrameFim(validFim);
    frameInicioRef.current = validIni;
    frameFimRef.current = validFim;

    const idxAtual = picoSelecionadoRef.current;
    if (idxAtual !== null) {
      setJanelasPicos((prev) => {
        const copy = [...prev];
        copy[idxAtual] = { ini: validIni, fim: validFim };
        janelasPicosRef.current = copy;
        return copy;
      });
    }
  }

  function selecionarPicoIndex(
    idx: number,
    frames = framesCapturados,
    listaPicos = picos
  ) {
    if (listaPicos[idx] === undefined) return;

    const maxIdx = Math.max(0, (frames.length || 1) - 1);

    // 1. Salva a janela do pico que estava ativo antes da transição (somente valores finitos válidos)
    const idxAnterior = picoSelecionadoRef.current;
    const janelasAtualizadas = [...janelasPicosRef.current];
    if (idxAnterior !== null && idxAnterior !== idx) {
      const curIni = Number.isFinite(frameInicioRef.current) ? frameInicioRef.current : 0;
      const curFim = Number.isFinite(frameFimRef.current) ? frameFimRef.current : maxIdx;
      janelasAtualizadas[idxAnterior] = { ini: curIni, fim: curFim };
    }

    // 2. Define o novo pico
    setPicoSelecionado(idx);
    picoSelecionadoRef.current = idx;

    // 3. Obtém a janela já personalizada ou calcula a padrão
    let janelaAlvo = janelasAtualizadas[idx];
    if (
      !janelaAlvo ||
      !Number.isFinite(janelaAlvo.ini) ||
      !Number.isFinite(janelaAlvo.fim)
    ) {
      const pos = listaPicos[idx];
      janelaAlvo = calcularJanelaPico(pos, frames);
      janelasAtualizadas[idx] = janelaAlvo;
    }

    const safeIni = Number.isFinite(janelaAlvo.ini)
      ? Math.max(0, Math.min(maxIdx, janelaAlvo.ini))
      : 0;
    const safeFim = Number.isFinite(janelaAlvo.fim)
      ? Math.max(safeIni, Math.min(maxIdx, janelaAlvo.fim))
      : maxIdx;

    setFrameInicio(safeIni);
    setFrameFim(safeFim);
    frameInicioRef.current = safeIni;
    frameFimRef.current = safeFim;

    setJanelasPicos(janelasAtualizadas);
    janelasPicosRef.current = janelasAtualizadas;
  }

  function descartarAmostra() {
    gravandoBufferRef.current = [];
    setFramesCapturados([]);
    setNota('');
    setPicos([]);
    setPicoSelecionado(null);
    picoSelecionadoRef.current = null;
    setJanelasPicos([]);
    janelasPicosRef.current = [];
    setStatus('ocioso');
  }

  async function handleSalvar() {
    if (framesCapturados.length === 0) return;

    let framesParaSalvar = framesCapturados;
    let duracaoRealMs = duracaoMs;

    if (modo === 'continuo' && framesCapturados.length > 0) {
      framesParaSalvar = framesCapturados.slice(frameInicio, frameFim + 1);
      const tIni = framesParaSalvar[0]?.timestamp_ms ?? 0;
      const tFim = framesParaSalvar[framesParaSalvar.length - 1]?.timestamp_ms ?? 0;
      duracaoRealMs = Math.max(100, tFim - tIni);
    }

    await onSalvarAmostra({
      agente_id: agenteId,
      esporte_id: esporteId,
      movimento_id: movimentoId,
      articulacao_id: articulacaoId,
      posicao_lateralidade: posicaoLateralidade,
      taxa_amostragem_hz: 20.0,
      duracao_ms: duracaoRealMs,
      frames: framesParaSalvar,
      notas: nota.trim()
        ? `${nota}${picos.length > 1 && picoSelecionado !== null ? ` (Golpe ${picoSelecionado + 1}/${picos.length})` : ''}`
        : undefined,
    });

    setTotalSalvasSessao((prev) => prev + 1);
    descartarAmostra();
  }

  async function handleSalvarTodos() {
    if (framesCapturados.length === 0 || picos.length === 0) return;

    // Sincroniza a janela atual do pico selecionado
    const janelasFinais = [...janelasPicosRef.current];
    if (picoSelecionadoRef.current !== null) {
      janelasFinais[picoSelecionadoRef.current] = {
        ini: frameInicioRef.current,
        fim: frameFimRef.current,
      };
    }

    const amostrasParaSalvar: AmostraDatalabCreate[] = [];

    for (let k = 0; k < picos.length; k += 1) {
      const pos = picos[k];
      const janela = janelasFinais[k] || calcularJanelaPico(pos, framesCapturados);

      const ini = Math.max(0, janela.ini);
      const fim = Math.min(framesCapturados.length - 1, janela.fim);
      const slice = framesCapturados.slice(ini, fim + 1);
      const tIni = slice[0]?.timestamp_ms ?? 0;
      const tFim = slice[slice.length - 1]?.timestamp_ms ?? 0;
      const dur = Math.max(100, tFim - tIni);

      amostrasParaSalvar.push({
        agente_id: agenteId,
        esporte_id: esporteId,
        movimento_id: movimentoId,
        articulacao_id: articulacaoId,
        posicao_lateralidade: posicaoLateralidade,
        taxa_amostragem_hz: 20.0,
        duracao_ms: dur,
        frames: slice,
        notas: nota.trim() ? `${nota} (Golpe ${k + 1}/${picos.length})` : undefined,
      });
    }

    await onSalvarAmostra(amostrasParaSalvar);
    setTotalSalvasSessao((prev) => prev + picos.length);
    descartarAmostra();
  }

  function irPicoAnterior() {
    if (picos.length === 0) return;
    const atual = picoSelecionado ?? 0;
    const prox = atual <= 0 ? picos.length - 1 : atual - 1;
    selecionarPicoIndex(prox);
  }

  function irProximoPico() {
    if (picos.length === 0) return;
    const atual = picoSelecionado ?? 0;
    const prox = atual >= picos.length - 1 ? 0 : atual + 1;
    selecionarPicoIndex(prox);
  }

  function ajustarInicio(delta: number) {
    const novo = Math.max(0, Math.min(frameFim - 2, frameInicio + delta));
    atualizarJanelaAtiva(novo, frameFim);
  }

  function ajustarFim(delta: number) {
    const novo = Math.min(
      framesCapturados.length - 1,
      Math.max(frameInicio + 2, frameFim + delta)
    );
    atualizarJanelaAtiva(frameInicio, novo);
  }

  function deslocarJanela(delta: number) {
    if (framesCapturados.length === 0) return;
    const duracao = frameFim - frameInicio;
    let novoIni = frameInicio + delta;
    let novoFim = frameFim + delta;
    if (novoIni < 0) {
      novoIni = 0;
      novoFim = Math.min(framesCapturados.length - 1, duracao);
    }
    if (novoFim >= framesCapturados.length) {
      novoFim = framesCapturados.length - 1;
      novoIni = Math.max(0, novoFim - duracao);
    }
    atualizarJanelaAtiva(novoIni, novoFim);
  }

  function aplicarLarguraJanela(novaLargura: number) {
    if (framesCapturados.length === 0) return;
    const centro = Math.round((frameInicio + frameFim) / 2);
    const metade = Math.floor(novaLargura / 2);
    let novoIni = Math.max(0, centro - metade);
    let novoFim = novoIni + novaLargura;
    if (novoFim >= framesCapturados.length) {
      novoFim = framesCapturados.length - 1;
      novoIni = Math.max(0, novoFim - novaLargura);
    }
    atualizarJanelaAtiva(novoIni, novoFim);
  }

  // Resoluções de nomes
  const esporte = listaEsportes?.find((e) => e.id === esporteId);
  const movimento = listaMovimentos?.find((m) => m.id === movimentoId);
  const agente = listaAgentes?.find((a) => a.id === agenteId);
  const articulacao = listaArticulacoes?.find((a) => a.id === articulacaoId);

  // Séries temporais ao vivo
  const serieAx = bufferFrames.map((f) => f.accel.x);
  const serieAy = bufferFrames.map((f) => f.accel.y);
  const serieAz = bufferFrames.map((f) => f.accel.z);

  const serieGx = bufferFrames.map((f) => f.gyro.x);
  const serieGy = bufferFrames.map((f) => f.gyro.y);
  const serieGz = bufferFrames.map((f) => f.gyro.z);

  const serieRes = bufferFrames.map((f) => f.accel.resultante);

  // Valores instantâneos
  const ax = ultimoFrame?.accel.x ?? 0;
  const ay = ultimoFrame?.accel.y ?? 0;
  const az = ultimoFrame?.accel.z ?? 0;
  const gx = ultimoFrame?.gyro.x ?? 0;
  const gy = ultimoFrame?.gyro.y ?? 0;
  const gz = ultimoFrame?.gyro.z ?? 0;
  const res = ultimoFrame?.accel.resultante ?? 0;
  const freq = ultimoFrame?.frequenciaHz ?? 20;
  const temp = ultimoFrame?.temperatura ?? 24;

  // Cálculos do trecho recortado
  const totalFrames = framesCapturados.length || 0;
  const maxFrameIdx = Math.max(0, totalFrames - 1);
  const iniSeguro = Number.isFinite(frameInicio)
    ? Math.max(0, Math.min(maxFrameIdx, frameInicio))
    : 0;
  const fimSeguro = Number.isFinite(frameFim)
    ? Math.max(iniSeguro, Math.min(maxFrameIdx, frameFim))
    : maxFrameIdx;

  const totalFramesTrecho = totalFrames > 0 ? Math.max(1, fimSeguro - iniSeguro + 1) : 0;
  const tempoInicioMs = framesCapturados[iniSeguro]?.timestamp_ms ?? 0;
  const tempoFimMs = framesCapturados[fimSeguro]?.timestamp_ms ?? 0;
  const duracaoTrechoMs = Math.max(0, tempoFimMs - tempoInicioMs);

  const maxAccel = framesCapturados.reduce(
    (max, f) => Math.max(max, f.resultante_accel ?? 0),
    0
  );
  const maxGyro = framesCapturados.reduce(
    (max, f) => Math.max(max, Math.abs(f.gx), Math.abs(f.gy), Math.abs(f.gz)),
    0
  );

  // Dimensionamento da Timeline em Gráfico de Linhas (Modo Contínuo)
  const trackLargura = Math.max(340, framesCapturados.length * 9 + 40);

  function calcularXFrame(i: number) {
    if (framesCapturados.length <= 1) return 20;
    return 20 + (i / (framesCapturados.length - 1)) * (trackLargura - 40);
  }

  // Amplitude dinâmica para os 3 eixos de aceleração (Ax, Ay, Az)
  const maxAbsAccelAxis = useMemo(() => {
    let m = 25;
    for (const f of framesCapturados) {
      m = Math.max(m, Math.abs(f.ax ?? 0), Math.abs(f.ay ?? 0), Math.abs(f.az ?? 0));
    }
    return Math.ceil(Math.min(65, m * 1.15));
  }, [framesCapturados]);

  // Amplitude máxima para a aceleração resultante |A|
  const maxValRes = useMemo(() => {
    let m = 35;
    for (const f of framesCapturados) {
      m = Math.max(m, f.resultante_accel ?? 0);
    }
    return Math.ceil(Math.max(45, m * 1.15));
  }, [framesCapturados]);

  function calcularYLaneAxis(val: number, laneH: number = 105) {
    const clamped = Math.max(-maxAbsAccelAxis, Math.min(maxAbsAccelAxis, val));
    const ratio = (clamped - (-maxAbsAccelAxis)) / (2 * maxAbsAccelAxis);
    return (laneH - 8) - ratio * (laneH - 16);
  }

  function calcularYLaneRes(val: number, laneH: number = 105) {
    const clamped = Math.max(0, Math.min(maxValRes, val));
    const ratio = clamped / maxValRes;
    return (laneH - 8) - ratio * (laneH - 16);
  }

  const posThresholdResY = calcularYLaneRes(25, 105);
  const posXInicio = calcularXFrame(iniSeguro);
  const posXFim = calcularXFrame(fimSeguro);

  const caminhosSvgLanes = useMemo(() => {
    if (framesCapturados.length < 2) return null;

    const ptsAx = framesCapturados.map((f, i) => ({
      x: calcularXFrame(i),
      y: calcularYLaneAxis(f.ax ?? 0, 105),
    }));

    const ptsAy = framesCapturados.map((f, i) => ({
      x: calcularXFrame(i),
      y: calcularYLaneAxis(f.ay ?? 0, 105),
    }));

    const ptsAz = framesCapturados.map((f, i) => ({
      x: calcularXFrame(i),
      y: calcularYLaneAxis(f.az ?? 0, 105),
    }));

    const ptsRes = framesCapturados.map((f, i) => ({
      x: calcularXFrame(i),
      y: calcularYLaneRes(f.resultante_accel ?? 0, 105),
    }));

    function gerarPath(pts: { x: number; y: number }[], yBase: number) {
      const dLinha = pts
        .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
        .join(' ');
      const primeiroX = pts[0].x.toFixed(1);
      const ultimoX = pts[pts.length - 1].x.toFixed(1);
      const dArea = `${dLinha} L ${ultimoX} ${yBase.toFixed(1)} L ${primeiroX} ${yBase.toFixed(1)} Z`;
      return { dLinha, dArea, pts };
    }

    return {
      ax: gerarPath(ptsAx, 52.5),
      ay: gerarPath(ptsAy, 52.5),
      az: gerarPath(ptsAz, 52.5),
      res: gerarPath(ptsRes, 97),
    };
  }, [framesCapturados, trackLargura, maxAbsAccelAxis, maxValRes]);

  const segmentosNativosLanes = useMemo(() => {
    if (Platform.OS === 'web' || !caminhosSvgLanes) return null;
    return {
      ax: calcularSegmentosNativos(caminhosSvgLanes.ax.pts, '#EF4444', 2),
      ay: calcularSegmentosNativos(caminhosSvgLanes.ay.pts, '#10B981', 2),
      az: calcularSegmentosNativos(caminhosSvgLanes.az.pts, '#38BDF8', 2),
      res: calcularSegmentosNativos(caminhosSvgLanes.res.pts, '#F59E0B', 2),
    };
  }, [caminhosSvgLanes]);

  const frameAtualPico = picoSelecionado !== null ? framesCapturados[picos[picoSelecionado]] : null;
  const frameAtualIn = framesCapturados[iniSeguro];
  const frameAtualOut = framesCapturados[fimSeguro];

  function handleCanvasTouch(evt: any) {
    if (framesCapturados.length < 2) return;
    const nativeEvt = evt?.nativeEvent || {};
    let touchX = nativeEvt.locationX;
    if (typeof touchX !== 'number' || isNaN(touchX)) {
      touchX = nativeEvt.offsetX;
    }
    if (typeof touchX !== 'number' || isNaN(touchX)) {
      if (evt?.currentTarget && typeof evt.currentTarget.getBoundingClientRect === 'function') {
        const rect = evt.currentTarget.getBoundingClientRect();
        touchX = (nativeEvt.clientX ?? 0) - rect.left;
      }
    }
    if (typeof touchX !== 'number' || isNaN(touchX)) return;

    const larguraUtil = Math.max(1, trackLargura - 40);
    const ratio = Math.max(0, Math.min(1, (touchX - 20) / larguraUtil));
    const frameIndex = Math.round(ratio * (framesCapturados.length - 1));

    if (!Number.isFinite(frameIndex)) return;

    if (Math.abs(frameIndex - frameInicio) < Math.abs(frameIndex - frameFim)) {
      const novoIni = Math.min(frameFim - 2, frameIndex);
      atualizarJanelaAtiva(novoIni, frameFim);
    } else {
      const novoFim = Math.max(frameInicio + 2, frameIndex);
      atualizarJanelaAtiva(frameInicio, novoFim);
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* 1. CARD DE CONTEXTO E PARÂMETROS FIXOS */}
      <GlassCard highlighted style={styles.setupCard}>
        <View style={styles.setupHeader}>
          <Text style={styles.setupTitle}>
            {`ALVO: ${movimento?.nome?.toUpperCase() || 'GOLPE'} (${esporte?.nome || 'TÊNIS'})`}
          </Text>
          <View style={styles.modeBadge}>
            <Text style={styles.modeBadgeText}>
              {modo === 'continuo' ? 'Stream Livre' : `${duracaoMs} ms`}
            </Text>
          </View>
        </View>

        <View style={styles.setupGrid}>
          <View style={styles.setupPill}>
            <Text style={styles.setupPillLabel}>👤 ATLETA:</Text>
            <Text style={styles.setupPillValue}>
              {agente?.nome || 'Atleta Teste'} ({agente?.altura_cm}cm, {agente?.peso_kg}kg)
            </Text>
          </View>

          <View style={styles.setupPill}>
            <Text style={styles.setupPillLabel}>🎾 ESPORTE:</Text>
            <Text style={styles.setupPillValue}>{esporte?.nome || 'Tênis'}</Text>
          </View>

          <View style={styles.setupPill}>
            <Text style={styles.setupPillLabel}>📍 MEMBRO:</Text>
            <Text style={styles.setupPillValue}>
              {articulacao?.nome || 'Pulso'} ({posicaoLateralidade})
            </Text>
          </View>

          <View style={styles.setupPill}>
            <Text style={styles.setupPillLabel}>⚡ GOLPE:</Text>
            <Text style={styles.setupPillValue}>{movimento?.nome || 'Forehand'}</Text>
          </View>
        </View>
      </GlassCard>

      {/* 2. CARD DE TELEMETRIA AO VIVO (OCULTO NA REVISÃO CONFORME SOLICITADO) */}
      {status !== 'revisao' ? (
        <GlassCard highlighted style={styles.telemetryCard}>
        <View style={styles.telemetryHeader}>
          <Text style={styles.telemetryTitle}>📈 Observação dos Sensores ao Vivo</Text>
          <View style={[styles.livePill, pausado && styles.livePillPaused]}>
            <View style={[styles.liveDot, pausado && styles.liveDotPaused]} />
            <Text style={[styles.livePillText, pausado && styles.livePillTextPaused]}>
              {pausado ? 'CONGELADO' : 'AO VIVO'} • {freq.toFixed(1)} Hz
            </Text>
          </View>
        </View>

        {/* Métricas Instantâneas */}
        <View style={styles.instantMetricsRow}>
          <View style={styles.instantMetricItem}>
            <Text style={styles.instantMetricLabel}>ACELERAÇÃO |A|</Text>
            <Text style={styles.instantMetricValue}>
              {res.toFixed(1)} <Text style={styles.instantMetricUnit}>m/s²</Text>
            </Text>
          </View>

          <View style={styles.instantMetricItem}>
            <Text style={styles.instantMetricLabel}>PICO DA SESSÃO</Text>
            <Text style={styles.instantMetricValue}>
              {picoSessao.toFixed(1)} <Text style={styles.instantMetricUnit}>m/s²</Text>
            </Text>
          </View>

          <View style={styles.instantMetricItem}>
            <Text style={styles.instantMetricLabel}>GIRO MÁX</Text>
            <Text style={styles.instantMetricValue}>
              {Math.max(Math.abs(gx), Math.abs(gy), Math.abs(gz)).toFixed(1)}{' '}
              <Text style={styles.instantMetricUnit}>rad/s</Text>
            </Text>
          </View>

          <View style={styles.instantMetricItem}>
            <Text style={styles.instantMetricLabel}>TEMP</Text>
            <Text style={styles.instantMetricValue}>
              {temp.toFixed(1)} <Text style={styles.instantMetricUnit}>°C</Text>
            </Text>
          </View>
        </View>

        {!estaConectado ? (
          <View style={styles.emptyNotice}>
            <Text style={styles.emptyNoticeTitle}>Arduino Desconectado</Text>
            <Text style={styles.emptyNoticeText}>
              Conecte o bracelete BLE para visualizar os gráficos e iniciar a gravação.
            </Text>
            <PrimaryButton
              label={estaConectando ? 'Conectando...' : '⚡ Conectar Arduino'}
              variant="primary"
              onPress={() => onConectarDispositivo?.()}
              loading={estaConectando}
            />
          </View>
        ) : (
          /* Pilha dos 3 Gráficos de Linha Empilhados */
          <View style={styles.chartsStack}>
            {/* Gráfico 1: Aceleração Triaxial */}
            <View style={styles.chartBox}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>⚡ 1. Aceleração Triaxial (m/s²)</Text>
                <View style={styles.legendRow}>
                  <View style={styles.legendItem}>
                    <View style={styles.legendLineX} />
                    <Text style={[styles.legendText, styles.legendTextX]}>
                      Ax: {ax.toFixed(1)}
                    </Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={styles.legendLineY} />
                    <Text style={[styles.legendText, styles.legendTextY]}>
                      Ay: {ay.toFixed(1)}
                    </Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={styles.legendLineZ} />
                    <Text style={[styles.legendText, styles.legendTextZ]}>
                      Az: {az.toFixed(1)}
                    </Text>
                  </View>
                </View>
              </View>

              <PlotLinhas
                series={[
                  { id: 'ax', nome: 'Ax', cor: '#EF4444', valores: serieAx },
                  { id: 'ay', nome: 'Ay', cor: '#10B981', valores: serieAy },
                  { id: 'az', nome: 'Az', cor: '#38BDF8', valores: serieAz },
                ]}
                minY={-30}
                maxY={30}
                temLinhaZero={true}
              />

              <View style={styles.chartScaleFooter}>
                <Text style={styles.chartScaleFooterText}>{'◀ -2.5s'}</Text>
                <Text style={styles.chartScaleFooterText}>{'Faixa: -30 a +30 m/s²'}</Text>
                <Text style={styles.chartScaleFooterText}>{'Agora ▶'}</Text>
              </View>
            </View>

            {/* Gráfico 2: Giroscópio Triaxial */}
            <View style={styles.chartBox}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>🌀 2. Giroscópio Triaxial (rad/s)</Text>
                <View style={styles.legendRow}>
                  <View style={styles.legendItem}>
                    <View style={styles.legendLineX} />
                    <Text style={[styles.legendText, styles.legendTextX]}>
                      Gx: {gx.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={styles.legendLineY} />
                    <Text style={[styles.legendText, styles.legendTextY]}>
                      Gy: {gy.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={styles.legendLineZ} />
                    <Text style={[styles.legendText, styles.legendTextZ]}>
                      Gz: {gz.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>

              <PlotLinhas
                series={[
                  { id: 'gx', nome: 'Gx', cor: '#EF4444', valores: serieGx },
                  { id: 'gy', nome: 'Gy', cor: '#10B981', valores: serieGy },
                  { id: 'gz', nome: 'Gz', cor: '#38BDF8', valores: serieGz },
                ]}
                minY={-12}
                maxY={12}
                temLinhaZero={true}
              />

              <View style={styles.chartScaleFooter}>
                <Text style={styles.chartScaleFooterText}>{'◀ -2.5s'}</Text>
                <Text style={styles.chartScaleFooterText}>{'Faixa: -12 a +12 rad/s'}</Text>
                <Text style={styles.chartScaleFooterText}>{'Agora ▶'}</Text>
              </View>
            </View>

            {/* Gráfico 3: Aceleração Resultante |A| */}
            <View style={styles.chartBox}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>💥 3. Aceleração Resultante |A|</Text>
                <View style={styles.legendRow}>
                  <View style={styles.legendItem}>
                    <View style={styles.legendLineRes} />
                    <Text style={[styles.legendText, styles.legendTextRes]}>
                      |A|: {res.toFixed(1)} m/s²
                    </Text>
                  </View>
                  <Text style={styles.legendText}>
                    {res > 25 ? '🔥 IMPACTO' : '⚡ 1G Gravidade'}
                  </Text>
                </View>
              </View>

              <PlotLinhas
                series={[
                  { id: 'res', nome: '|A|', cor: '#F59E0B', valores: serieRes },
                ]}
                minY={0}
                maxY={55}
                temLinhaZero={false}
                linhaReferenciaY={25}
              />

              <View style={styles.chartScaleFooter}>
                <Text style={styles.chartScaleFooterText}>{'◀ -2.5s'}</Text>
                <Text style={styles.chartScaleFooterText}>{'0 a 55 m/s² (Tracejado: 25 m/s² corte de impacto)'}</Text>
                <Text style={styles.chartScaleFooterText}>{'Agora ▶'}</Text>
              </View>
            </View>
          </View>
        )}
      </GlassCard>
      ) : null}

      {/* 3. ESTADOS DE CAPTURA (CONTAGEM, GRAVAÇÃO OU REVISÃO) */}
      {status !== 'ocioso' ? (
        <GlassCard highlighted style={styles.controlsCard}>

        {status === 'contagem' ? (
          <View style={styles.countdownBox}>
            <Text style={styles.countdownNumber}>{contagem}</Text>
            <Text style={styles.countdownHint}>Prepare o golpe {movimento?.nome}...</Text>
          </View>
        ) : status === 'gravando' ? (
          <View style={styles.recordingBox}>
            <View style={styles.recordingHeader}>
              <View style={styles.recordingPulseDot} />
              <Text style={styles.recordingTitle}>
                {modo === 'continuo' ? 'GRAVANDO FLUXO CONTÍNUO...' : 'GRAVANDO MOVIMENTO...'}
              </Text>
            </View>

            <Text style={styles.recordingCounter}>
              {modo === 'continuo'
                ? `${(tempoDecorridoMs / 1000).toFixed(1)}s (${framesCapturados.length} frames)`
                : `${framesCapturados.length} frames`}
            </Text>

            <Text style={styles.recordingHint}>
              Execute o {movimento?.nome} ({esporte?.nome}) com o wearable no{' '}
              {articulacao?.nome || 'Pulso'} ({posicaoLateralidade})
            </Text>

            {modo === 'continuo' ? (
              <PrimaryButton
                label="Encerrar Captura e Analisar Picos"
                variant="danger"
                onPress={finalizarGravacaoContinua}
              />
            ) : null}
          </View>
        ) : status === 'revisao' ? (
          <View style={styles.reviewBox}>
            <View style={styles.reviewTitleRow}>
              <Text style={styles.reviewTitle}>
                {`Amostra Capturada (${esporte?.nome} • ${movimento?.nome})`}
              </Text>
            </View>

            {modo === 'continuo' && picos.length > 1 ? (
              <View style={styles.multiStrokeBanner}>
                <Text style={styles.multiStrokeBannerText}>
                  {`⚡ ${picos.length} golpes identificados no ciclo gravado!`}
                </Text>
                <View style={styles.multiStrokeBadge}>
                  <Text style={styles.multiStrokeBadgeText}>
                    {`Golpe ${picoSelecionado !== null ? picoSelecionado + 1 : 1}/${picos.length}`}
                  </Text>
                </View>
              </View>
            ) : null}

            <View style={styles.reviewMetricsGrid}>
              <View style={styles.reviewMetricItem}>
                <Text style={styles.reviewMetricLabel}>FRAMES</Text>
                <Text style={styles.reviewMetricValue}>
                  {String(
                    modo === 'continuo'
                      ? (Number.isFinite(totalFramesTrecho) ? totalFramesTrecho : 0)
                      : (framesCapturados.length || 0)
                  )}
                </Text>
              </View>

              <View style={styles.reviewMetricItem}>
                <Text style={styles.reviewMetricLabel}>DURAÇÃO</Text>
                <Text style={styles.reviewMetricValue}>
                  {modo === 'continuo'
                    ? `${Number.isFinite(duracaoTrechoMs) ? duracaoTrechoMs : 0} ms`
                    : `${Number.isFinite(duracaoMs) ? duracaoMs : 0} ms`}
                </Text>
              </View>

              <View style={styles.reviewMetricItem}>
                <Text style={styles.reviewMetricLabel}>|A| MÁX</Text>
                <Text style={styles.reviewMetricValue}>{maxAccel.toFixed(1)} m/s²</Text>
              </View>

              <View style={styles.reviewMetricItem}>
                <Text style={styles.reviewMetricLabel}>GIRO MÁX</Text>
                <Text style={styles.reviewMetricValue}>{maxGyro.toFixed(2)} rad/s</Text>
              </View>
            </View>

            {/* No Modo Contínuo: Gráfico de Linhas com Linhas Verticais de Edição */}
            {modo === 'continuo' && framesCapturados.length > 0 ? (
              <View style={styles.timelineTrackContainer}>
                {/* 1. NAVEGAÇÃO ENTRE PICOS COM SETAS */}
                {picos.length > 0 ? (
                  <View style={styles.peakNavRow}>
                    <Pressable
                      onPress={irPicoAnterior}
                      style={styles.peakNavBtn}
                      accessibilityRole="button"
                      accessibilityLabel="Ir para o pico anterior">
                      <Text style={styles.peakNavBtnText}>{'◀ Pico Anterior'}</Text>
                    </Pressable>

                    <View style={styles.peakNavCenter}>
                      <Text style={styles.peakNavCenterTitle}>
                        {picoSelecionado !== null
                          ? `⚡ Pico ${picoSelecionado + 1} de ${picos.length}`
                          : 'Selecione um Pico'}
                      </Text>
                      {picoSelecionado !== null && framesCapturados[picos[picoSelecionado]] ? (
                        <Text style={styles.peakNavCenterSub}>
                          {`Impacto: ${framesCapturados[picos[picoSelecionado]].resultante_accel?.toFixed(0)} m/s² aos ${((framesCapturados[picos[picoSelecionado]].timestamp_ms ?? 0) / 1000).toFixed(2)}s`}
                        </Text>
                      ) : null}
                    </View>

                    <Pressable
                      onPress={irProximoPico}
                      style={styles.peakNavBtn}
                      accessibilityRole="button"
                      accessibilityLabel="Ir para o próximo pico">
                      <Text style={styles.peakNavBtnText}>{'Próximo Pico ▶'}</Text>
                    </Pressable>
                  </View>
                ) : null}

                {/* 2. CHIPS DE TODOS OS PICOS PARA SALTO DIRETO */}
                {picos.length > 0 ? (
                  <View style={styles.peaksRow}>
                    <Text style={styles.peaksLabel}>
                      {`Marcadores de Impacto na Linha do Tempo (${picos.length}):`}
                    </Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.peaksScroll}
                      contentContainerStyle={styles.peaksContainer}>
                      {picos.map((idxPico, index) => {
                        const frame = framesCapturados[idxPico];
                        const ativo = picoSelecionado === index;
                        return (
                          <Pressable
                            key={idxPico}
                            onPress={() =>
                              selecionarPicoIndex(index, framesCapturados, picos)
                            }
                            style={[styles.peakChip, ativo && styles.peakChipActive]}>
                            <Text
                              style={[
                                styles.peakChipText,
                                ativo && styles.peakChipTextActive,
                              ]}>
                              {`P#${index + 1} (${((frame?.timestamp_ms ?? 0) / 1000).toFixed(1)}s)`}
                            </Text>
                            <Text style={styles.peakAccelBadge}>
                              {`${frame?.resultante_accel?.toFixed(0)} m/s²`}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  </View>
                ) : null}

                {/* 3. CABEÇALHO DO OSCILOSCÓPIO DA TIMELINE */}
                <View style={styles.timelineTrackHeader}>
                  <Text style={styles.timelineTrackTitle}>
                    {'🎞️ OSCILOSCÓPIO MULTI-EIXOS DE RECORTE'}
                  </Text>
                  <Text style={styles.timelineTrackScale}>
                    {`[ ${frameInicio} ➔ ${frameFim} ] (${totalFramesTrecho} frames • ${duracaoTrechoMs} ms)`}
                  </Text>
                </View>

                {/* SELETOR DE MODO DE VISUALIZAÇÃO DOS GRÁFICOS */}
                <View style={styles.timelineVisualModeSelector}>
                  <Pressable
                    onPress={() => setModoTimelineVisual('3eixos_res')}
                    style={[
                      styles.timelineVisualModeBtn,
                      modoTimelineVisual === '3eixos_res' && styles.timelineVisualModeBtnActive,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="Exibir 3 eixos de aceleração mais resultante">
                    <Text
                      style={[
                        styles.timelineVisualModeText,
                        modoTimelineVisual === '3eixos_res' && styles.timelineVisualModeTextActive,
                      ]}>
                      {'📊 3 Eixos + Resultante (4 Gráficos Alinhados)'}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setModoTimelineVisual('3eixos')}
                    style={[
                      styles.timelineVisualModeBtn,
                      modoTimelineVisual === '3eixos' && styles.timelineVisualModeBtnActive,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="Exibir apenas os 3 eixos de aceleração">
                    <Text
                      style={[
                        styles.timelineVisualModeText,
                        modoTimelineVisual === '3eixos' && styles.timelineVisualModeTextActive,
                      ]}>
                      {'⚡ Apenas 3 Eixos (Ax, Ay, Az)'}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setModoTimelineVisual('apenas_res')}
                    style={[
                      styles.timelineVisualModeBtn,
                      modoTimelineVisual === 'apenas_res' && styles.timelineVisualModeBtnActive,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="Exibir apenas a resultante">
                    <Text
                      style={[
                        styles.timelineVisualModeText,
                        modoTimelineVisual === 'apenas_res' && styles.timelineVisualModeTextActive,
                      ]}>
                      {'💥 Apenas Resultante |A|'}
                    </Text>
                  </Pressable>
                </View>

                {/* PAINEL DE LEITURA BIOMECÂNICA NOS PONTOS DE CORTE */}
                <View style={styles.frameBiomechBar}>
                  <View style={styles.frameBiomechItem}>
                    <Text style={styles.frameBiomechLabel}>[ IN #F{iniSeguro} ]:</Text>
                    <Text style={styles.frameBiomechValue}>
                      {`Ax: ${frameAtualIn?.ax?.toFixed(1) ?? 0} | Ay: ${frameAtualIn?.ay?.toFixed(1) ?? 0} | Az: ${frameAtualIn?.az?.toFixed(1) ?? 0} m/s²`}
                    </Text>
                  </View>

                  {frameAtualPico ? (
                    <View style={styles.frameBiomechItem}>
                      <Text style={styles.frameBiomechLabel}>⚡ Pico #F{picos[picoSelecionado ?? 0]}:</Text>
                      <Text style={[styles.frameBiomechValue, { color: '#F59E0B' }]}>
                        {`|A| ${frameAtualPico.resultante_accel?.toFixed(1)} m/s²`}
                      </Text>
                    </View>
                  ) : null}

                  <View style={styles.frameBiomechItem}>
                    <Text style={styles.frameBiomechLabel}>[ OUT #F{fimSeguro} ]:</Text>
                    <Text style={styles.frameBiomechValue}>
                      {`Ax: ${frameAtualOut?.ax?.toFixed(1) ?? 0} | Ay: ${frameAtualOut?.ay?.toFixed(1) ?? 0} | Az: ${frameAtualOut?.az?.toFixed(1) ?? 0} m/s²`}
                    </Text>
                  </View>
                </View>

                {/* 4. CANVAS MULTI-PISTAS COM LINHAS VERTICAIS IN/OUT 100% ALINHADAS DE CIMA A BAIXO */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={true}
                  style={styles.timelineMultiTrackScroll}>
                  <Pressable
                    onPress={handleCanvasTouch}
                    style={[styles.timelineMultiTrackCanvas, { width: trackLargura }]}>
                    {/* PISTA 1: EIXO X (Ax) */}
                    {(modoTimelineVisual === '3eixos_res' || modoTimelineVisual === '3eixos') ? (
                      <View style={styles.laneTrack}>
                        <View style={styles.laneZeroLine} />
                        <View style={styles.laneHeader}>
                          <View
                            style={[
                              styles.laneBadge,
                              { backgroundColor: 'rgba(239, 68, 68, 0.18)', borderColor: '#EF4444' },
                            ]}>
                            <Text style={[styles.laneBadgeText, { color: '#EF4444' }]}>
                              🔴 EIXO X (Ax)
                            </Text>
                          </View>
                          {frameAtualPico ? (
                            <Text style={styles.laneValueText}>
                              {`Pico: ${(frameAtualPico.ax ?? 0) >= 0 ? '+' : ''}${(frameAtualPico.ax ?? 0).toFixed(1)} m/s²`}
                            </Text>
                          ) : null}
                        </View>
                        <Text style={styles.laneScaleLabelTop}>{`+${maxAbsAccelAxis} m/s²`}</Text>
                        <Text style={styles.laneScaleLabelZero}>{'0'}</Text>
                        <Text style={styles.laneScaleLabelBottom}>{`-${maxAbsAccelAxis} m/s²`}</Text>

                        {Platform.OS === 'web' && caminhosSvgLanes?.ax ? (
                          <svg
                            width={trackLargura}
                            height={105}
                            style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' } as any}>
                            <path d={caminhosSvgLanes.ax.dArea} fill="rgba(239, 68, 68, 0.08)" />
                            <path
                              d={caminhosSvgLanes.ax.dLinha}
                              fill="none"
                              stroke="#EF4444"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : null}

                        {Platform.OS !== 'web' &&
                          segmentosNativosLanes?.ax.map((seg) => (
                            <View
                              key={seg.chave}
                              style={[
                                styles.segmentReta,
                                {
                                  left: seg.left,
                                  top: seg.top,
                                  width: seg.width,
                                  height: 2,
                                  backgroundColor: seg.cor,
                                  transform: [{ rotate: `${seg.anguloRad}rad` }],
                                },
                              ]}
                            />
                          ))}
                      </View>
                    ) : null}

                    {/* PISTA 2: EIXO Y (Ay) */}
                    {(modoTimelineVisual === '3eixos_res' || modoTimelineVisual === '3eixos') ? (
                      <View style={styles.laneTrack}>
                        <View style={styles.laneZeroLine} />
                        <View style={styles.laneHeader}>
                          <View
                            style={[
                              styles.laneBadge,
                              { backgroundColor: 'rgba(16, 185, 129, 0.18)', borderColor: '#10B981' },
                            ]}>
                            <Text style={[styles.laneBadgeText, { color: '#10B981' }]}>
                              🟢 EIXO Y (Ay)
                            </Text>
                          </View>
                          {frameAtualPico ? (
                            <Text style={styles.laneValueText}>
                              {`Pico: ${(frameAtualPico.ay ?? 0) >= 0 ? '+' : ''}${(frameAtualPico.ay ?? 0).toFixed(1)} m/s²`}
                            </Text>
                          ) : null}
                        </View>
                        <Text style={styles.laneScaleLabelTop}>{`+${maxAbsAccelAxis} m/s²`}</Text>
                        <Text style={styles.laneScaleLabelZero}>{'0'}</Text>
                        <Text style={styles.laneScaleLabelBottom}>{`-${maxAbsAccelAxis} m/s²`}</Text>

                        {Platform.OS === 'web' && caminhosSvgLanes?.ay ? (
                          <svg
                            width={trackLargura}
                            height={105}
                            style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' } as any}>
                            <path d={caminhosSvgLanes.ay.dArea} fill="rgba(16, 185, 129, 0.08)" />
                            <path
                              d={caminhosSvgLanes.ay.dLinha}
                              fill="none"
                              stroke="#10B981"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : null}

                        {Platform.OS !== 'web' &&
                          segmentosNativosLanes?.ay.map((seg) => (
                            <View
                              key={seg.chave}
                              style={[
                                styles.segmentReta,
                                {
                                  left: seg.left,
                                  top: seg.top,
                                  width: seg.width,
                                  height: 2,
                                  backgroundColor: seg.cor,
                                  transform: [{ rotate: `${seg.anguloRad}rad` }],
                                },
                              ]}
                            />
                          ))}
                      </View>
                    ) : null}

                    {/* PISTA 3: EIXO Z (Az) */}
                    {(modoTimelineVisual === '3eixos_res' || modoTimelineVisual === '3eixos') ? (
                      <View
                        style={[
                          styles.laneTrack,
                          modoTimelineVisual === '3eixos' && styles.laneTrackLast,
                        ]}>
                        <View style={styles.laneZeroLine} />
                        <View style={styles.laneHeader}>
                          <View
                            style={[
                              styles.laneBadge,
                              { backgroundColor: 'rgba(56, 189, 248, 0.18)', borderColor: '#38BDF8' },
                            ]}>
                            <Text style={[styles.laneBadgeText, { color: '#38BDF8' }]}>
                              🔵 EIXO Z (Az)
                            </Text>
                          </View>
                          {frameAtualPico ? (
                            <Text style={styles.laneValueText}>
                              {`Pico: ${(frameAtualPico.az ?? 0) >= 0 ? '+' : ''}${(frameAtualPico.az ?? 0).toFixed(1)} m/s²`}
                            </Text>
                          ) : null}
                        </View>
                        <Text style={styles.laneScaleLabelTop}>{`+${maxAbsAccelAxis} m/s²`}</Text>
                        <Text style={styles.laneScaleLabelZero}>{'0'}</Text>
                        <Text style={styles.laneScaleLabelBottom}>{`-${maxAbsAccelAxis} m/s²`}</Text>

                        {Platform.OS === 'web' && caminhosSvgLanes?.az ? (
                          <svg
                            width={trackLargura}
                            height={105}
                            style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' } as any}>
                            <path d={caminhosSvgLanes.az.dArea} fill="rgba(56, 189, 248, 0.08)" />
                            <path
                              d={caminhosSvgLanes.az.dLinha}
                              fill="none"
                              stroke="#38BDF8"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : null}

                        {Platform.OS !== 'web' &&
                          segmentosNativosLanes?.az.map((seg) => (
                            <View
                              key={seg.chave}
                              style={[
                                styles.segmentReta,
                                {
                                  left: seg.left,
                                  top: seg.top,
                                  width: seg.width,
                                  height: 2,
                                  backgroundColor: seg.cor,
                                  transform: [{ rotate: `${seg.anguloRad}rad` }],
                                },
                              ]}
                            />
                          ))}
                      </View>
                    ) : null}

                    {/* PISTA 4: RESULTANTE |A| */}
                    {(modoTimelineVisual === '3eixos_res' || modoTimelineVisual === 'apenas_res') ? (
                      <View style={[styles.laneTrack, styles.laneTrackLast]}>
                        <View style={[styles.timelineThresholdLine, { top: posThresholdResY }]} />
                        <Text style={[styles.timelineThresholdLabel, { top: posThresholdResY - 14 }]}>
                          {'25 m/s² (impacto)'}
                        </Text>
                        <View style={styles.laneHeader}>
                          <View
                            style={[
                              styles.laneBadge,
                              { backgroundColor: 'rgba(245, 158, 11, 0.18)', borderColor: '#F59E0B' },
                            ]}>
                            <Text style={[styles.laneBadgeText, { color: '#F59E0B' }]}>
                              🟡 RESULTANTE |A|
                            </Text>
                          </View>
                          {frameAtualPico ? (
                            <Text style={styles.laneValueText}>
                              {`Pico: ${(frameAtualPico.resultante_accel ?? 0).toFixed(1)} m/s²`}
                            </Text>
                          ) : null}
                        </View>
                        <Text style={styles.laneScaleLabelTop}>{`${maxValRes} m/s²`}</Text>
                        <Text style={styles.laneScaleLabelBottom}>{'0 m/s²'}</Text>

                        {Platform.OS === 'web' && caminhosSvgLanes?.res ? (
                          <svg
                            width={trackLargura}
                            height={105}
                            style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' } as any}>
                            <path d={caminhosSvgLanes.res.dArea} fill="rgba(245, 158, 11, 0.12)" />
                            <path
                              d={caminhosSvgLanes.res.dLinha}
                              fill="none"
                              stroke="#F59E0B"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : null}

                        {Platform.OS !== 'web' &&
                          segmentosNativosLanes?.res.map((seg) => (
                            <View
                              key={seg.chave}
                              style={[
                                styles.segmentReta,
                                {
                                  left: seg.left,
                                  top: seg.top,
                                  width: seg.width,
                                  height: 2,
                                  backgroundColor: seg.cor,
                                  transform: [{ rotate: `${seg.anguloRad}rad` }],
                                },
                              ]}
                            />
                          ))}
                      </View>
                    ) : null}

                    {/* Linhas Verticais Pontilhadas nos Picos Detectados (atravessam todas as pistas) */}
                    {picos.map((p, k) => {
                      const posX = calcularXFrame(p);
                      const ativo = picoSelecionado === k;
                      return (
                        <React.Fragment key={`peak-line-${p}`}>
                          <View style={[styles.verticalPeakLine, { left: posX }]} />
                          <Pressable
                            onPress={() =>
                              selecionarPicoIndex(k, framesCapturados, picos)
                            }
                            style={[
                              styles.peakHeadBadge,
                              { left: posX - 14 },
                              ativo && styles.peakHeadBadgeActive,
                            ]}>
                            <Text style={styles.peakHeadBadgeText}>{`P${k + 1}`}</Text>
                          </Pressable>
                        </React.Fragment>
                      );
                    })}

                    {/* Faixas Sombreadas das Janelas Salvas dos Outros Picos */}
                    {janelasPicos.map((janela, k) => {
                      if (k === picoSelecionado || !janela) return null;
                      const xIni = calcularXFrame(janela.ini);
                      const xFim = calcularXFrame(janela.fim);
                      return (
                        <View
                          key={`inactive-band-${k}`}
                          style={[
                            styles.timelineInactiveBand,
                            {
                              left: xIni,
                              width: Math.max(4, xFim - xIni),
                            },
                          ]}
                          pointerEvents="none"
                        />
                      );
                    })}

                    {/* Faixa Sombreada da Janela Selecionada (atravessa todas as pistas) */}
                    <View
                      style={[
                        styles.timelineSelectionBand,
                        {
                          left: posXInicio,
                          width: Math.max(4, posXFim - posXInicio),
                        },
                      ]}
                    />

                    {/* Linha Vertical [ Início ] (alinhada em todas as pistas de cima a baixo) */}
                    <View style={[styles.verticalLineIn, { left: posXInicio }]}>
                      <View style={styles.markerHeadIn}>
                        <Text style={styles.markerHeadText}>{'[ IN'}</Text>
                      </View>
                      <View style={styles.markerFootIn}>
                        <Text style={styles.markerHeadText}>{'[ IN'}</Text>
                      </View>
                    </View>

                    {/* Linha Vertical [ Fim ] (alinhada em todas as pistas de cima a baixo) */}
                    <View style={[styles.verticalLineOut, { left: posXFim }]}>
                      <View style={styles.markerHeadOut}>
                        <Text style={styles.markerHeadText}>{'OUT ]'}</Text>
                      </View>
                      <View style={styles.markerFootOut}>
                        <Text style={styles.markerHeadText}>{'OUT ]'}</Text>
                      </View>
                    </View>
                  </Pressable>
                </ScrollView>

                {/* 5. PAINEL DE CONTROLE DAS LINHAS VERTICAIS (SEM DESLIZANTES) */}
                <View style={styles.timelineControlBar}>
                  {/* Presets de Janela */}
                  <View style={styles.timelinePresetsRow}>
                    <Text style={styles.timelinePresetLabel}>{'Largura da Janela:'}</Text>
                    {[
                      { rotulo: '1.0s (20f)', frames: 20 },
                      { rotulo: '1.5s (30f)', frames: 30 },
                      { rotulo: '2.0s (40f)', frames: 40 },
                      { rotulo: '2.5s (50f)', frames: 50 },
                    ].map((preset) => {
                      const ativo = Math.abs(totalFramesTrecho - preset.frames) <= 2;
                      return (
                        <Pressable
                          key={preset.frames}
                          onPress={() => aplicarLarguraJanela(preset.frames)}
                          style={[
                            styles.timelinePresetBtn,
                            ativo && styles.timelinePresetBtnActive,
                          ]}>
                          <Text
                            style={[
                              styles.timelinePresetText,
                              ativo && styles.timelinePresetTextActive,
                            ]}>
                            {preset.rotulo}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  {/* Botões de Deslocamento das Linhas Verticais */}
                  <View style={styles.timelineNudgeRow}>
                    <View style={styles.timelineNudgeGroup}>
                      <Text style={styles.timelineNudgeLabel}>{'[ Início ]:'}</Text>
                      <Pressable
                        onPress={() => ajustarInicio(-2)}
                        style={styles.timelineNudgeBtn}>
                        <Text style={styles.timelineNudgeBtnText}>{'◀ -2f'}</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => ajustarInicio(2)}
                        style={styles.timelineNudgeBtn}>
                        <Text style={styles.timelineNudgeBtnText}>{'+2f ▶'}</Text>
                      </Pressable>
                    </View>

                    <View style={styles.timelineNudgeGroup}>
                      <Text style={styles.timelineNudgeLabel}>{'Deslocar Janela:'}</Text>
                      <Pressable
                        onPress={() => deslocarJanela(-5)}
                        style={styles.timelineNudgeBtn}>
                        <Text style={styles.timelineNudgeBtnText}>{'◀ 5f'}</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => deslocarJanela(5)}
                        style={styles.timelineNudgeBtn}>
                        <Text style={styles.timelineNudgeBtnText}>{'5f ▶'}</Text>
                      </Pressable>
                    </View>

                    <View style={styles.timelineNudgeGroup}>
                      <Text style={styles.timelineNudgeLabel}>{'[ Fim ]:'}</Text>
                      <Pressable
                        onPress={() => ajustarFim(-2)}
                        style={styles.timelineNudgeBtn}>
                        <Text style={styles.timelineNudgeBtnText}>{'◀ -2f'}</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => ajustarFim(2)}
                        style={styles.timelineNudgeBtn}>
                        <Text style={styles.timelineNudgeBtnText}>{'+2f ▶'}</Text>
                      </Pressable>
                    </View>
                  </View>

                  {/* Banner Informativo */}
                  <View style={styles.timelineInfoBanner}>
                    <Text style={styles.timelineInfoBannerText}>
                      {'Toque no gráfico para posicionar as linhas de corte In/Out'}
                    </Text>
                    <Text style={styles.timelineInfoBannerHighlight}>
                      {`Pico: ${maxAccel.toFixed(1)} m/s²`}
                    </Text>
                  </View>
                </View>
              </View>
            ) : null}

            <TextInput
              placeholder="Anotações opcionais (ex: top spin com término alto, bola rápida)"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              value={nota}
              onChangeText={setNota}
              style={styles.noteInput}
            />

            <View style={styles.actionBtnsRow}>
              <View style={styles.actionBtnCol}>
                <PrimaryButton
                  label="Descartar"
                  variant="ghost"
                  onPress={descartarAmostra}
                />
              </View>

              {modo === 'continuo' && picos.length > 1 ? (
                <>
                  <View style={styles.actionBtnCol}>
                    <PrimaryButton
                      label={`Salvar Este (P#${picoSelecionado !== null ? picoSelecionado + 1 : 1})`}
                      variant="ghost"
                      onPress={handleSalvar}
                      loading={salvando}
                    />
                  </View>
                  <View style={styles.actionBtnCol}>
                    <PrimaryButton
                      label={salvando ? 'Salvando...' : `Salvar Todos (${picos.length} Golpes)`}
                      variant="primary"
                      onPress={handleSalvarTodos}
                      loading={salvando}
                    />
                  </View>
                </>
              ) : (
                <View style={styles.actionBtnCol}>
                  <PrimaryButton
                    label={salvando ? 'Salvando...' : 'Salvar no Dataset'}
                    variant="primary"
                    onPress={handleSalvar}
                    loading={salvando}
                  />
                </View>
              )}
            </View>
          </View>
        ) : null}
      </GlassCard>
    ) : null}
  </ScrollView>

  {/* PAINEL DE CONTROLE FLUTUANTE COM Z-INDEX SUPERIOR E FIXO (GOOGLE MATERIAL ICONS) */}
  <View style={styles.floatingControlsDock} pointerEvents="box-none">
    <View style={styles.floatingControlsInner}>
      {/* 1. CONGELAR / DESCONGELAR */}
      <Pressable
        onPress={() => setPausado((prev) => !prev)}
        disabled={!estaConectado}
        style={[
          styles.controlIconBtn,
          pausado && styles.controlIconBtnActive,
          !estaConectado && styles.controlIconBtnDisabled,
        ]}
        accessibilityRole="button"
        accessibilityLabel={pausado ? 'Descongelar' : 'Congelar'}>
        <MaterialIcons
          name={pausado ? 'play-arrow' : 'pause'}
          size={24}
          color={pausado ? '#F59E0B' : FluxColors.text}
        />
      </Pressable>

      {/* 2. GRAVAR (HERO CENTRAL) */}
      <Pressable
        onPress={() => {
          if (status === 'gravando' && modo === 'continuo') {
            finalizarGravacaoContinua();
          } else if (status === 'revisao') {
            if (modo === 'continuo' && picos.length > 1) {
              handleSalvarTodos();
            } else {
              handleSalvar();
            }
          } else if (status === 'ocioso') {
            iniciarCaptura();
          }
        }}
        disabled={!estaConectado || status === 'contagem'}
        style={[
          styles.recordMainBtn,
          status === 'gravando' && styles.recordMainBtnRecording,
          (!estaConectado || status === 'contagem') && styles.recordMainBtnDisabled,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Gravar">
        <MaterialIcons
          name={
            status === 'gravando'
              ? 'stop'
              : status === 'contagem'
                ? 'timer'
                : status === 'revisao'
                  ? 'save'
                  : 'fiber-manual-record'
          }
          size={status === 'gravando' ? 28 : status === 'contagem' ? 26 : status === 'revisao' ? 26 : 30}
          color="#FFFFFF"
        />
      </Pressable>

      {/* 3. ZERAR PICO */}
      <Pressable
        onPress={() => setPicoSessao(ultimoFrame?.accel.resultante ?? 0)}
        disabled={!estaConectado}
        style={[
          styles.controlIconBtn,
          !estaConectado && styles.controlIconBtnDisabled,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Zerar Pico">
        <MaterialIcons name="refresh" size={24} color={FluxColors.text} />
      </Pressable>
    </View>
  </View>
</View>
);
}

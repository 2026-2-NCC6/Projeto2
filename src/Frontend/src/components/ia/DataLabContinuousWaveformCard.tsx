import React, { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AddAgentModal } from '@/components/ia/AddAgentModal';
import { AddOptionModal } from '@/components/ia/AddOptionModal';
import { styles } from '@/components/ia/DataLabContinuousWaveformCard.styles';
import { GlassCard, PrimaryButton } from '@/components/ui/GlassCard';
import { GlassSelectBox } from '@/components/ui/GlassSelectBox';
import {
  useAgentesDataLab,
  useArticulacoesDataLab,
  useCriarAgenteDataLab,
  useCriarEsporteDataLab,
  useCriarMovimentoDataLab,
  useEsportesDataLab,
  useMovimentosDataLab,
} from '@/hooks';
import { wearableService, type TelemetriaIMUItem } from '@/services/wearableService';
import type {
  AgenteTesteCreate,
  AmostraDatalabCreate,
  TelemetriaFrameItem,
} from '@/types/api';

interface DataLabContinuousWaveformCardProps {
  estaConectado: boolean;
  estaConectando?: boolean;
  onConectarDispositivo?: () => void;
  onSalvarAmostra: (amostra: AmostraDatalabCreate) => Promise<void>;
  salvando?: boolean;
}

export function DataLabContinuousWaveformCard({
  estaConectado,
  estaConectando = false,
  onConectarDispositivo,
  onSalvarAmostra,
  salvando = false,
}: DataLabContinuousWaveformCardProps) {
  // Catálogo do Banco Paralelo
  const { data: listaEsportes } = useEsportesDataLab();
  const { data: listaArticulacoes } = useArticulacoesDataLab();
  const { data: listaAgentes } = useAgentesDataLab();

  const [esporteId, setEsporteId] = useState('tenis');
  const { data: listaMovimentos } = useMovimentosDataLab(esporteId);

  const criarEsporteMutation = useCriarEsporteDataLab();
  const criarMovimentoMutation = useCriarMovimentoDataLab();
  const criarAgenteMutation = useCriarAgenteDataLab();

  const [agenteId, setAgenteId] = useState('dev-agente-01');
  const [articulacaoId, setArticulacaoId] = useState('pulso');
  const [posicaoLateralidade, setPosicaoLateralidade] = useState<'direita' | 'esquerda' | 'central'>('direita');
  const [movimentoId, setMovimentoId] = useState('tenis_forehand');

  // Estados da gravação contínua
  const [gravando, setGravando] = useState(false);
  const [tempoDecorridoMs, setTempoDecorridoMs] = useState(0);
  const [framesGravados, setFramesGravados] = useState<TelemetriaFrameItem[]>([]);

  // Estados da análise e recorte
  const [picos, setPicos] = useState<number[]>([]);
  const [picoSelecionado, setPicoSelecionado] = useState<number | null>(null);
  const [frameInicio, setFrameInicio] = useState(0);
  const [frameFim, setFrameFim] = useState(0);
  const [amostrasSalvas, setAmostrasSalvas] = useState(0);
  const [nota, setNota] = useState('');

  // Modais de cadastro rápido
  const [modalTipo, setModalTipo] = useState<'esporte' | 'movimento' | 'agente' | null>(null);
  const [selectAbertoId, setSelectAbertoId] = useState<string | null>(null);

  const bufferRef = useRef<TelemetriaFrameItem[]>([]);
  const cancelarInscricaoRef = useRef<(() => void) | null>(null);
  const timerRef = useRef<any>(null);

  // Sincroniza seletores
  useEffect(() => {
    if (listaAgentes && listaAgentes.length > 0 && !agenteId) {
      setAgenteId(listaAgentes[0].id);
    }
  }, [listaAgentes, agenteId]);

  useEffect(() => {
    if (listaMovimentos && listaMovimentos.length > 0) {
      setMovimentoId(listaMovimentos[0].id);
    }
  }, [listaMovimentos]);

  useEffect(() => {
    const art = listaArticulacoes?.find((a) => a.id === articulacaoId);
    if (art && !art.possui_lateralidade) {
      setPosicaoLateralidade('central');
    } else if (posicaoLateralidade === 'central') {
      setPosicaoLateralidade('direita');
    }
  }, [articulacaoId, listaArticulacoes, posicaoLateralidade]);

  useEffect(() => {
    return () => {
      if (cancelarInscricaoRef.current) cancelarInscricaoRef.current();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function iniciarGravacaoContinua() {
    if (!estaConectado) return;
    bufferRef.current = [];
    setFramesGravados([]);
    setPicos([]);
    setPicoSelecionado(null);
    setAmostrasSalvas(0);
    setGravando(true);
    setTempoDecorridoMs(0);

    const inicio = Date.now();
    let frameId = 0;

    timerRef.current = setInterval(() => {
      setTempoDecorridoMs(Date.now() - inicio);
    }, 100);

    cancelarInscricaoRef.current = wearableService.inscreverTelemetria(
      (leitura: TelemetriaIMUItem) => {
        frameId += 1;
        const ax = leitura.accel.x;
        const ay = leitura.accel.y;
        const az = leitura.accel.z;
        const gx = leitura.gyro.x;
        const gy = leitura.gyro.y;
        const gz = leitura.gyro.z;
        const res = leitura.accel.resultante;

        const novoFrame: TelemetriaFrameItem = {
          frame_id: frameId,
          timestamp_ms: Date.now() - inicio,
          ax,
          ay,
          az,
          gx,
          gy,
          gz,
          resultante_accel: Number(res.toFixed(3)),
          temperatura: leitura.temperatura,
        };

        bufferRef.current.push(novoFrame);
      }
    );
  }

  function finalizarGravacaoContinua() {
    if (cancelarInscricaoRef.current) {
      cancelarInscricaoRef.current();
      cancelarInscricaoRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setGravando(false);

    const frames = [...bufferRef.current];
    setFramesGravados(frames);

    if (frames.length > 0) {
      // Auto-detecta picos de impacto (> 22 m/s²)
      const picosDetectados = detectarPicos(frames);
      setPicos(picosDetectados);

      if (picosDetectados.length > 0) {
        selecionarPico(0, picosDetectados, frames.length);
      } else {
        setFrameInicio(0);
        setFrameFim(Math.min(frames.length - 1, 30));
      }
    }
  }

  function detectarPicos(frames: TelemetriaFrameItem[]): number[] {
    const indices: number[] = [];
    const LIMIAR = 22.0; // m/s²
    const DISTANCIA_MIN = 14; // ~700ms

    for (let i = 1; i < frames.length - 1; i++) {
      const atual = frames[i].resultante_accel ?? 0;
      const ant = frames[i - 1].resultante_accel ?? 0;
      const prox = frames[i + 1].resultante_accel ?? 0;

      if (atual > LIMIAR && atual >= ant && atual >= prox) {
        if (indices.length === 0 || i - indices[indices.length - 1] >= DISTANCIA_MIN) {
          indices.push(i);
        } else if (atual > (frames[indices[indices.length - 1]].resultante_accel ?? 0)) {
          indices[indices.length - 1] = i;
        }
      }
    }
    return indices;
  }

  function selecionarPico(indicePico: number, listaPicos = picos, total = framesGravados.length) {
    if (indicePico < 0 || indicePico >= listaPicos.length) return;
    const framePico = listaPicos[indicePico];
    setPicoSelecionado(indicePico);

    // Janela padrão: 16 frames (~800ms) antes do impacto e 14 frames (~700ms) depois
    const inicio = Math.max(0, framePico - 16);
    const fim = Math.min(total - 1, framePico + 14);
    setFrameInicio(inicio);
    setFrameFim(fim);
  }

  function descartarTudo() {
    bufferRef.current = [];
    setFramesGravados([]);
    setPicos([]);
    setPicoSelecionado(null);
    setTempoDecorridoMs(0);
    setAmostrasSalvas(0);
  }

  async function handleSalvarTrecho() {
    if (framesGravados.length === 0 || frameInicio >= frameFim) return;

    const trechoFrames = framesGravados.slice(frameInicio, frameFim + 1);
    const duracaoMs =
      trechoFrames[trechoFrames.length - 1].timestamp_ms - trechoFrames[0].timestamp_ms;

    await onSalvarAmostra({
      agente_id: agenteId,
      esporte_id: esporteId,
      movimento_id: movimentoId,
      articulacao_id: articulacaoId,
      posicao_lateralidade: posicaoLateralidade,
      taxa_amostragem_hz: 20.0,
      duracao_ms: Math.max(duracaoMs, 100),
      frames: trechoFrames,
      notas: nota.trim() || undefined,
    });

    setAmostrasSalvas((prev) => prev + 1);
    setNota('');
  }

  // Handlers de ajuste fino de início e fim
  function ajustarInicio(delta: number) {
    setFrameInicio((prev) => Math.max(0, Math.min(frameFim - 3, prev + delta)));
  }

  function ajustarFim(delta: number) {
    setFrameFim((prev) => Math.min(framesGravados.length - 1, Math.max(frameInicio + 3, prev + delta)));
  }

  // Dados para os selects
  const opcoesAgentes = (listaAgentes || []).map((ag) => ({
    label: `${ag.nome} (${ag.altura_cm}cm, ${ag.peso_kg}kg)`,
    value: ag.id,
  }));

  const opcoesEsportes = (listaEsportes || []).map((e) => ({
    label: `${e.icone} ${e.nome}`,
    value: e.id,
  }));

  const opcoesArticulacoes = (listaArticulacoes || []).map((a) => ({
    label: `${a.icone} ${a.nome}`,
    value: a.id,
  }));

  const articulacaoAtual = listaArticulacoes?.find((a) => a.id === articulacaoId);
  const temLateralidade = articulacaoAtual ? articulacaoAtual.possui_lateralidade : true;

  const opcoesLateralidade = temLateralidade
    ? [
        { label: 'Direita (Membro Direito)', value: 'direita' },
        { label: 'Esquerda (Membro Esquerdo)', value: 'esquerda' },
      ]
    : [{ label: 'Central (Eixo Corporal / Tronco)', value: 'central' }];

  const opcoesMovimentos = (listaMovimentos || []).map((m) => ({
    label: m.nome,
    value: m.id,
  }));

  const esporteNome = listaEsportes?.find((e) => e.id === esporteId)?.nome || 'Tênis';
  const movimentoNome = listaMovimentos?.find((m) => m.id === movimentoId)?.nome || 'Golpe';

  // Cálculos do trecho selecionado
  const totalFramesTrecho = Math.max(0, frameFim - frameInicio + 1);
  const tempoInicioMs = framesGravados[frameInicio]?.timestamp_ms ?? 0;
  const tempoFimMs = framesGravados[frameFim]?.timestamp_ms ?? 0;
  const duracaoTrechoMs = Math.max(0, tempoFimMs - tempoInicioMs);

  const maxAccelTrecho = framesGravados
    .slice(frameInicio, frameFim + 1)
    .reduce((max, f) => Math.max(max, f.resultante_accel ?? 0), 0);

  return (
    <GlassCard highlighted style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>🌊 GRAVAÇÃO CONTÍNUA & OSCILOSCÓPIO</Text>
        <View style={styles.modeBadge}>
          <Text style={styles.modeBadgeText}>Stream Livre</Text>
        </View>
      </View>

      <Text style={styles.descriptionText}>
        Grave uma sequência livre de golpes por 15 a 60 segundos. O gráfico exibirá
        todas as ondas para você definir o início e fim de cada movimento individual.
      </Text>

      {/* SelectBoxes Configuráveis */}
      <View style={styles.selectStack}>
        <View
          style={[
            styles.selectItemWrapper,
            selectAbertoId === 'agente' ? styles.selectItemElevated : styles.selectItem1,
          ]}>
          <GlassSelectBox
            label="AGENTE DE TESTE / PERFIL CORPORAL"
            valor={agenteId}
            opcoes={opcoesAgentes}
            icone="👤"
            onSelect={setAgenteId}
            aberto={selectAbertoId === 'agente'}
            onToggleAberto={(open) => setSelectAbertoId(open ? 'agente' : null)}
            onAdicionarNovo={() => setModalTipo('agente')}
            labelAdicionarNovo="➕ Novo Agente (Ficha Corporal)"
            disabled={gravando || salvando}
          />
        </View>

        <View
          style={[
            styles.selectItemWrapper,
            selectAbertoId === 'esporte' ? styles.selectItemElevated : styles.selectItem2,
          ]}>
          <GlassSelectBox
            label="ESPORTE / MODALIDADE"
            valor={esporteId}
            opcoes={opcoesEsportes}
            icone="🎾"
            onSelect={setEsporteId}
            aberto={selectAbertoId === 'esporte'}
            onToggleAberto={(open) => setSelectAbertoId(open ? 'esporte' : null)}
            onAdicionarNovo={() => setModalTipo('esporte')}
            labelAdicionarNovo="➕ Adicionar Esporte"
            disabled={gravando || salvando}
          />
        </View>

        <View
          style={[
            styles.selectItemWrapper,
            selectAbertoId === 'articulacao' ? styles.selectItemElevated : styles.selectItem3,
          ]}>
          <GlassSelectBox
            label="LOCAL DO WEARABLE (ARTICULAÇÃO)"
            valor={articulacaoId}
            opcoes={opcoesArticulacoes}
            icone="📍"
            onSelect={setArticulacaoId}
            aberto={selectAbertoId === 'articulacao'}
            onToggleAberto={(open) => setSelectAbertoId(open ? 'articulacao' : null)}
            disabled={gravando || salvando}
          />
        </View>

        <View
          style={[
            styles.selectItemWrapper,
            selectAbertoId === 'lateralidade' ? styles.selectItemElevated : styles.selectItem4,
          ]}>
          <GlassSelectBox
            label={temLateralidade ? 'POSIÇÃO / LATERALIDADE' : 'POSIÇÃO CORPORAL (FIXO)'}
            valor={posicaoLateralidade}
            opcoes={opcoesLateralidade}
            icone="✋"
            onSelect={(val) => setPosicaoLateralidade(val as any)}
            aberto={selectAbertoId === 'lateralidade'}
            onToggleAberto={(open) => setSelectAbertoId(open ? 'lateralidade' : null)}
            disabled={gravando || salvando || !temLateralidade}
          />
        </View>

        <View
          style={[
            styles.selectItemWrapper,
            selectAbertoId === 'movimento' ? styles.selectItemElevated : styles.selectItem5,
          ]}>
          <GlassSelectBox
            label={`GOLPE / CLASSE A RECORTAR (${esporteNome.toUpperCase()})`}
            valor={movimentoId}
            opcoes={opcoesMovimentos}
            icone="⚡"
            onSelect={setMovimentoId}
            aberto={selectAbertoId === 'movimento'}
            onToggleAberto={(open) => setSelectAbertoId(open ? 'movimento' : null)}
            onAdicionarNovo={() => setModalTipo('movimento')}
            labelAdicionarNovo={`➕ Novo Golpe em ${esporteNome}`}
            disabled={gravando || salvando}
          />
        </View>
      </View>

      {/* ESTADO: GRAVANDO CONTINUAMENTE */}
      {gravando ? (
        <View style={styles.recordingStreamBox}>
          <View style={styles.recordingStreamHeader}>
            <View style={styles.recordingPulseDot} />
            <Text style={styles.recordingStreamTitle}>GRAVANDO FLUXO CONTÍNUO...</Text>
          </View>
          <Text style={styles.recordingStreamTimer}>
            {(tempoDecorridoMs / 1000).toFixed(1)}s
          </Text>
          <Text style={styles.recordingStreamHint}>
            Execute os golpes normalmente em quadra com o wearable no {articulacaoAtual?.nome || 'Pulso'}.
          </Text>
          <PrimaryButton
            label="⏹️ Encerrar e Analisar Ondas"
            variant="danger"
            onPress={finalizarGravacaoContinua}
          />
        </View>
      ) : framesGravados.length > 0 ? (
        /* ESTADO: ANÁLISE DE ONDAS E RECORTE */
        <View style={styles.timelineCard}>
          <View style={styles.timelineHeader}>
            <Text style={styles.timelineTitle}>📈 Linha do Tempo dos 6 Eixos</Text>
            <Text style={styles.timelineMeta}>
              {framesGravados.length} frames • {(framesGravados[framesGravados.length - 1].timestamp_ms / 1000).toFixed(1)}s totais
            </Text>
          </View>

          {/* Banner de Amostras Já Salvas desta sessão */}
          {amostrasSalvas > 0 ? (
            <View style={styles.savedCountBanner}>
              <Text style={styles.savedCountText}>
                ✅ {amostrasSalvas} amostra{amostrasSalvas > 1 ? 's' : ''} recortada{amostrasSalvas > 1 ? 's' : ''} e salva{amostrasSalvas > 1 ? 's' : ''} no dataset!
              </Text>
            </View>
          ) : null}

          {/* Atalhos para Picos Detectados Automaticamente */}
          {picos.length > 0 ? (
            <View style={styles.peaksRow}>
              <Text style={styles.peaksLabel}>⚡ Picos de Impacto Auto-Detectados ({picos.length}):</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.peaksScroll}
                contentContainerStyle={styles.peaksContainer}>
                {picos.map((idxPico, index) => {
                  const frame = framesGravados[idxPico];
                  const ativo = picoSelecionado === index;
                  return (
                    <Pressable
                      key={idxPico}
                      onPress={() => selecionarPico(index)}
                      style={[styles.peakChip, ativo && styles.peakChipActive]}>
                      <Text style={[styles.peakChipText, ativo && styles.peakChipTextActive]}>
                        Pico #{index + 1} ({(frame.timestamp_ms / 1000).toFixed(1)}s)
                      </Text>
                      <Text style={styles.peakAccelBadge}>
                        {frame.resultante_accel?.toFixed(0)} m/s²
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}

          {/* PISTA DE ONDA / OSCILOSCÓPIO */}
          <View style={styles.waveformTrackContainer}>
            <View style={styles.trackHeader}>
              <Text style={styles.trackAxisTitle}>ACELERAÇÃO RESULTANTE |A| (m/s²)</Text>
              <Text style={styles.trackAxisScale}>0 a 60 m/s²</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={true}
              style={styles.waveformScroll}
              contentContainerStyle={styles.waveformContent}>
              {framesGravados.map((f, i) => {
                const res = f.resultante_accel ?? 0;
                // Altura proporcional (0 a 100px baseada em até 55 m/s²)
                const alturaBarra = Math.min(100, Math.max(6, (res / 55) * 100));
                const noTrecho = i >= frameInicio && i <= frameFim;
                const eImpacto = res > 25;
                const eMedio = res > 15;

                return (
                  <Pressable
                    key={f.frame_id}
                    onPress={() => {
                      if (Math.abs(i - frameInicio) < Math.abs(i - frameFim)) {
                        setFrameInicio(i);
                      } else {
                        setFrameFim(i);
                      }
                    }}
                    style={styles.barCol}>
                    {noTrecho && (i === frameInicio || i === frameFim) ? (
                      <View style={styles.selectionCursorTop} />
                    ) : null}
                    <View
                      style={[
                        styles.barStick,
                        { height: alturaBarra },
                        eImpacto ? styles.barPeak : eMedio ? styles.barMid : styles.barRest,
                        noTrecho && styles.barInSelection,
                      ]}
                    />
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* PAINEL DE INFORMAÇÕES DO RECORTE SELECIONADO */}
          <View style={styles.selectionInfoBox}>
            <Text style={styles.selectionInfoTitle}>
              ✂️ TRECHO SELECIONADO PARA RECORTE:
            </Text>
            <Text style={styles.selectionInfoMetrics}>
              {totalFramesTrecho} frames • {duracaoTrechoMs} ms ({(tempoInicioMs / 1000).toFixed(2)}s até {(tempoFimMs / 1000).toFixed(2)}s)
            </Text>
            <Text style={styles.descriptionText}>
              Aceleração de Impacto no Trecho: {maxAccelTrecho.toFixed(1)} m/s²
            </Text>
          </View>

          {/* AJUSTE FINO DOS PONTOS DE INÍCIO E FIM */}
          <View style={styles.nudgeControlsRow}>
            <View style={styles.nudgeGroup}>
              <Text style={styles.nudgeLabel}>Início:</Text>
              <Pressable onPress={() => ajustarInicio(-5)} style={styles.nudgeBtn}>
                <Text style={styles.nudgeBtnText}>-5</Text>
              </Pressable>
              <Pressable onPress={() => ajustarInicio(-1)} style={styles.nudgeBtn}>
                <Text style={styles.nudgeBtnText}>-1</Text>
              </Pressable>
              <Pressable onPress={() => ajustarInicio(1)} style={styles.nudgeBtn}>
                <Text style={styles.nudgeBtnText}>+1</Text>
              </Pressable>
              <Pressable onPress={() => ajustarInicio(5)} style={styles.nudgeBtn}>
                <Text style={styles.nudgeBtnText}>+5</Text>
              </Pressable>
            </View>

            <View style={styles.nudgeGroup}>
              <Text style={styles.nudgeLabel}>Fim:</Text>
              <Pressable onPress={() => ajustarFim(-5)} style={styles.nudgeBtn}>
                <Text style={styles.nudgeBtnText}>-5</Text>
              </Pressable>
              <Pressable onPress={() => ajustarFim(-1)} style={styles.nudgeBtn}>
                <Text style={styles.nudgeBtnText}>-1</Text>
              </Pressable>
              <Pressable onPress={() => ajustarFim(1)} style={styles.nudgeBtn}>
                <Text style={styles.nudgeBtnText}>+1</Text>
              </Pressable>
              <Pressable onPress={() => ajustarFim(5)} style={styles.nudgeBtn}>
                <Text style={styles.nudgeBtnText}>+5</Text>
              </Pressable>
            </View>
          </View>

          <TextInput
            placeholder="Anotações opcionais deste trecho (ex: golpe limpo de fundo)"
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            value={nota}
            onChangeText={setNota}
            style={styles.noteInput}
          />

          {/* AÇÕES DE RECORTE */}
          <View style={styles.cropActionsRow}>
            <View style={styles.cropActionCol}>
              <PrimaryButton
                label="Nova Gravação"
                variant="ghost"
                onPress={descartarTudo}
              />
            </View>
            <View style={styles.cropActionCol}>
              <PrimaryButton
                label={salvando ? 'Salvando...' : `✂️ Salvar ${movimentoNome}`}
                variant="primary"
                onPress={handleSalvarTrecho}
                loading={salvando}
              />
            </View>
          </View>
        </View>
      ) : (
        /* BOTÃO PRINCIPAL INICIAL */
        <View style={styles.buttonContainer}>
          <PrimaryButton
            label={
              estaConectado
                ? '🔴 Iniciar Gravação Contínua Livre'
                : estaConectando
                  ? 'Conectando ao Arduino...'
                  : '⚡ Conectar Arduino UNO R4 para Gravar'
            }
            variant="primary"
            onPress={
              estaConectado ? iniciarGravacaoContinua : () => onConectarDispositivo?.()
            }
            loading={estaConectando}
          />
        </View>
      )}

      {/* Modais */}
      <AddAgentModal
        visivel={modalTipo === 'agente'}
        onConfirmar={async (dados) => {
          const novo = await criarAgenteMutation.mutateAsync(dados);
          setAgenteId(novo.id);
          setModalTipo(null);
        }}
        onFechar={() => setModalTipo(null)}
        salvando={criarAgenteMutation.isPending}
      />

      <AddOptionModal
        visivel={modalTipo === 'esporte'}
        tag="NOVA MODALIDADE ESPORTIVA"
        titulo="Adicionar Novo Esporte"
        subtitulo="Cadastre uma modalidade esportiva para o modelo de IA."
        placeholder="Nome do esporte (ex: Beach Tennis)"
        onConfirmar={async (nome) => {
          const novo = await criarEsporteMutation.mutateAsync({ nome, icone: '🏅' });
          setEsporteId(novo.id);
          setModalTipo(null);
        }}
        onFechar={() => setModalTipo(null)}
      />

      <AddOptionModal
        visivel={modalTipo === 'movimento'}
        tag={`NOVO GOLPE / MOVIMENTO (${esporteNome.toUpperCase()})`}
        titulo={`Adicionar Movimento em ${esporteNome}`}
        subtitulo={`Cadastre uma classe de golpe para ser recortada no esporte ${esporteNome}.`}
        placeholder="Nome do movimento (ex: Smash)"
        onConfirmar={async (nome) => {
          const novo = await criarMovimentoMutation.mutateAsync({
            nome,
            esporte_id: esporteId,
            articulacao_padrao_id: articulacaoId,
          });
          setMovimentoId(novo.id);
          setModalTipo(null);
        }}
        onFechar={() => setModalTipo(null)}
      />
    </GlassCard>
  );
}


import React, { useEffect, useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { AddAgentModal } from '@/components/ia/AddAgentModal';
import { AddOptionModal } from '@/components/ia/AddOptionModal';
import { styles } from '@/components/ia/DataLabRecorderCard.styles';
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

interface DataLabRecorderCardProps {
  estaConectado: boolean;
  estaConectando?: boolean;
  onConectarDispositivo?: () => void;
  onSalvarAmostra: (amostra: AmostraDatalabCreate) => Promise<void>;
  salvando?: boolean;
}

const OPCOES_DURACAO = [
  { label: '1.0 segundo (20 frames @ 20Hz)', value: '1000' },
  { label: '1.5 segundos (30 frames @ 20Hz)', value: '1500' },
  { label: '2.0 segundos (40 frames @ 20Hz)', value: '2000' },
];

export function DataLabRecorderCard({
  estaConectado,
  estaConectando = false,
  onConectarDispositivo,
  onSalvarAmostra,
  salvando,
}: DataLabRecorderCardProps) {
  // Queries do Catálogo do Banco Paralelo de IA
  const { data: listaEsportes } = useEsportesDataLab();
  const { data: listaArticulacoes } = useArticulacoesDataLab();
  const { data: listaAgentes } = useAgentesDataLab();

  const criarEsporteMutation = useCriarEsporteDataLab();
  const criarMovimentoMutation = useCriarMovimentoDataLab();
  const criarAgenteMutation = useCriarAgenteDataLab();

  // Estados dos seletores
  const [esporteId, setEsporteId] = useState('tenis');
  const { data: listaMovimentos } = useMovimentosDataLab(esporteId);

  const [agenteId, setAgenteId] = useState('dev-agente-01');
  const [articulacaoId, setArticulacaoId] = useState('pulso');
  const [posicaoLateralidade, setPosicaoLateralidade] = useState<'direita' | 'esquerda' | 'central'>('direita');
  const [movimentoId, setMovimentoId] = useState('tenis_forehand');
  const [duracaoMs, setDuracaoMs] = useState(1500);

  // Estados da captura
  const [status, setStatus] = useState<'ocioso' | 'contagem' | 'gravando' | 'revisao'>('ocioso');
  const [contagem, setContagem] = useState(3);
  const [framesCapturados, setFramesCapturados] = useState<TelemetriaFrameItem[]>([]);
  const [nota, setNota] = useState('');

  // Controle dos modais de cadastro
  const [modalTipo, setModalTipo] = useState<'esporte' | 'movimento' | 'agente' | null>(null);
  const [selectAbertoId, setSelectAbertoId] = useState<string | null>(null);

  const framesBufferRef = useRef<TelemetriaFrameItem[]>([]);
  const cancelarInscricaoRef = useRef<(() => void) | null>(null);

  // Sincroniza o primeiro agente se não selecionado
  useEffect(() => {
    if (listaAgentes && listaAgentes.length > 0 && !agenteId) {
      setAgenteId(listaAgentes[0].id);
    }
  }, [listaAgentes, agenteId]);

  // Sincroniza o primeiro movimento do esporte ao trocar de esporte
  useEffect(() => {
    if (listaMovimentos && listaMovimentos.length > 0) {
      const primeiro = listaMovimentos[0];
      setMovimentoId(primeiro.id);
    }
  }, [listaMovimentos]);

  // Regra de lateralidade quando a articulação muda
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
      if (cancelarInscricaoRef.current) {
        cancelarInscricaoRef.current();
      }
    };
  }, []);

  // Handlers de cadastro dinâmico
  async function handleCriarEsporte(nome: string) {
    try {
      const novo = await criarEsporteMutation.mutateAsync({ nome, icone: '🏅' });
      setEsporteId(novo.id);
      setModalTipo(null);
    } catch {
      setModalTipo(null);
    }
  }

  async function handleCriarMovimento(nome: string) {
    try {
      const novo = await criarMovimentoMutation.mutateAsync({
        nome,
        esporte_id: esporteId,
        articulacao_padrao_id: articulacaoId,
      });
      setMovimentoId(novo.id);
      setModalTipo(null);
    } catch {
      setModalTipo(null);
    }
  }

  async function handleCriarAgente(dados: AgenteTesteCreate) {
    try {
      const novo = await criarAgenteMutation.mutateAsync(dados);
      setAgenteId(novo.id);
      setModalTipo(null);
    } catch {
      setModalTipo(null);
    }
  }

  function iniciarGravacao() {
    if (!estaConectado) return;
    framesBufferRef.current = [];
    setFramesCapturados([]);
    setStatus('contagem');
    setContagem(3);

    const intervalo = setInterval(() => {
      setContagem((prev) => {
        if (prev <= 1) {
          clearInterval(intervalo);
          comecarColetaFrames();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function comecarColetaFrames() {
    setStatus('gravando');
    const inicio = Date.now();
    let frameContador = 0;

    cancelarInscricaoRef.current = wearableService.inscreverTelemetria(
      (leitura: TelemetriaIMUItem) => {
        frameContador += 1;
        const ax = leitura.accel.x;
        const ay = leitura.accel.y;
        const az = leitura.accel.z;
        const gx = leitura.gyro.x;
        const gy = leitura.gyro.y;
        const gz = leitura.gyro.z;
        const res = leitura.accel.resultante;

        const novoFrame: TelemetriaFrameItem = {
          frame_id: frameContador,
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

        framesBufferRef.current.push(novoFrame);
        setFramesCapturados([...framesBufferRef.current]);
      }
    );

    setTimeout(() => {
      finalizarGravacao();
    }, duracaoMs);
  }

  function finalizarGravacao() {
    if (cancelarInscricaoRef.current) {
      cancelarInscricaoRef.current();
      cancelarInscricaoRef.current = null;
    }
    setStatus('revisao');
  }

  function descartarAmostra() {
    framesBufferRef.current = [];
    setFramesCapturados([]);
    setNota('');
    setStatus('ocioso');
  }

  async function salvarAmostra() {
    if (framesCapturados.length === 0) return;

    await onSalvarAmostra({
      agente_id: agenteId,
      esporte_id: esporteId,
      movimento_id: movimentoId,
      articulacao_id: articulacaoId,
      posicao_lateralidade: posicaoLateralidade,
      taxa_amostragem_hz: 20.0,
      duracao_ms: duracaoMs,
      frames: framesCapturados,
      notas: nota.trim() || undefined,
    });

    descartarAmostra();
  }

  // Prepara opções normalizadas para os GlassSelectBox
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

  const desabilitarInputs = status === 'contagem' || status === 'gravando' || salvando;

  // Métricas de visualização rápida
  const maxAccel = framesCapturados.reduce(
    (max, f) => Math.max(max, f.resultante_accel ?? 0),
    0
  );
  const maxGyro = framesCapturados.reduce(
    (max, f) => Math.max(max, Math.abs(f.gx), Math.abs(f.gy), Math.abs(f.gz)),
    0
  );

  const esporteNome = listaEsportes?.find((e) => e.id === esporteId)?.nome || 'Tênis';
  const movimentoNome = listaMovimentos?.find((m) => m.id === movimentoId)?.nome || 'Golpe';

  return (
    <GlassCard highlighted style={styles.card}>
      <Text style={styles.sectionTitle}>🎯 GRAVADOR DE AMOSTRAS BIOMECÂNICAS</Text>

      {/* SelectBoxes em Coluna Vertical (um abaixo do outro com stacking hierárquico) */}
      <View style={styles.selectStack}>
        {/* 1. Agente de Teste / Perfil Antropométrico */}
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
            disabled={desabilitarInputs}
          />
        </View>

        {/* 2. Esporte / Modalidade */}
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
            disabled={desabilitarInputs}
          />
        </View>

        {/* 3. Articulação do Dispositivo */}
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
            disabled={desabilitarInputs}
          />
        </View>

        {/* 4. Posição / Lateralidade no Corpo */}
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
            disabled={desabilitarInputs || !temLateralidade}
          />
        </View>

        {/* 5. Movimento / Golpe Técnico */}
        <View
          style={[
            styles.selectItemWrapper,
            selectAbertoId === 'movimento' ? styles.selectItemElevated : styles.selectItem5,
          ]}>
          <GlassSelectBox
            label={`GOLPE / MOVIMENTO (${esporteNome.toUpperCase()})`}
            valor={movimentoId}
            opcoes={opcoesMovimentos}
            icone="⚡"
            onSelect={setMovimentoId}
            aberto={selectAbertoId === 'movimento'}
            onToggleAberto={(open) => setSelectAbertoId(open ? 'movimento' : null)}
            onAdicionarNovo={() => setModalTipo('movimento')}
            labelAdicionarNovo={`➕ Novo Golpe em ${esporteNome}`}
            disabled={desabilitarInputs}
          />
        </View>

        {/* 6. Janela Temporal */}
        <View
          style={[
            styles.selectItemWrapper,
            selectAbertoId === 'duracao' ? styles.selectItemElevated : styles.selectItem6,
          ]}>
          <GlassSelectBox
            label="JANELA TEMPORAL"
            valor={String(duracaoMs)}
            opcoes={OPCOES_DURACAO}
            icone="⏱️"
            onSelect={(val) => setDuracaoMs(Number(val))}
            aberto={selectAbertoId === 'duracao'}
            onToggleAberto={(open) => setSelectAbertoId(open ? 'duracao' : null)}
            disabled={desabilitarInputs}
          />
        </View>
      </View>

      {/* ÁREA DE STATUS DA GRAVAÇÃO */}
      {status === 'contagem' ? (
        <View style={styles.countdownBox}>
          <Text style={styles.countdownNumber}>{contagem}</Text>
          <Text style={styles.countdownHint}>Prepare-se para o movimento...</Text>
        </View>
      ) : status === 'gravando' ? (
        <View style={styles.recordingBox}>
          <View style={styles.recordingHeader}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>GRAVANDO MOVIMENTO...</Text>
          </View>
          <Text style={styles.recordingCount}>{framesCapturados.length} frames</Text>
          <Text style={styles.recordingSubtext}>
            Execute o {movimentoNome} ({esporteNome}) agora com o wearable no {articulacaoAtual?.nome || 'Pulso'}
          </Text>
        </View>
      ) : status === 'revisao' ? (
        <View style={styles.reviewBox}>
          <View style={styles.reviewTitleRow}>
            <Text style={styles.reviewTitle}>
              ✅ Amostra Capturada ({esporteNome} • {movimentoNome})
            </Text>
          </View>

          <View style={styles.reviewMetricsGrid}>
            <View style={styles.reviewMetricItem}>
              <Text style={styles.reviewMetricLabel}>FRAMES</Text>
              <Text style={styles.reviewMetricValue}>{framesCapturados.length}</Text>
            </View>
            <View style={styles.reviewMetricItem}>
              <Text style={styles.reviewMetricLabel}>DURAÇÃO</Text>
              <Text style={styles.reviewMetricValue}>{duracaoMs} ms</Text>
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

          <TextInput
            placeholder="Anotações opcionais (ex: top spin alto, erro de timing)"
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            value={nota}
            onChangeText={setNota}
            style={styles.noteInput}
          />

          <View style={styles.actionsRow}>
            <View style={styles.actionBtn}>
              <PrimaryButton
                label="Descartar"
                variant="ghost"
                onPress={descartarAmostra}
              />
            </View>
            <View style={styles.actionBtn}>
              <PrimaryButton
                label={salvando ? 'Salvando...' : 'Salvar Amostra'}
                variant="primary"
                onPress={salvarAmostra}
                loading={salvando}
              />
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.buttonContainer}>
          <PrimaryButton
            label={
              estaConectado
                ? `Gravar ${movimentoNome} (${esporteNome} - 3s)`
                : estaConectando
                  ? 'Conectando ao Arduino...'
                  : '⚡ Conectar Arduino UNO R4 para Gravar'
            }
            variant="primary"
            onPress={
              estaConectado ? iniciarGravacao : () => onConectarDispositivo?.()
            }
            loading={estaConectando}
          />
        </View>
      )}

      {/* Modal para Adicionar Novo Agente */}
      <AddAgentModal
        visivel={modalTipo === 'agente'}
        onConfirmar={handleCriarAgente}
        onFechar={() => setModalTipo(null)}
        salvando={criarAgenteMutation.isPending}
      />

      {/* Modal para Adicionar Novo Esporte */}
      <AddOptionModal
        visivel={modalTipo === 'esporte'}
        tag="NOVA MODALIDADE ESPORTIVA"
        titulo="Adicionar Novo Esporte"
        subtitulo="Cadastre uma modalidade (ex: Beach Tennis, Padel, Basquete) para forjar modelos futuros."
        placeholder="Nome do esporte (ex: Beach Tennis)"
        onConfirmar={handleCriarEsporte}
        onFechar={() => setModalTipo(null)}
      />

      {/* Modal para Adicionar Novo Movimento */}
      <AddOptionModal
        visivel={modalTipo === 'movimento'}
        tag={`NOVO GOLPE / MOVIMENTO (${esporteNome.toUpperCase()})`}
        titulo={`Adicionar Movimento em ${esporteNome}`}
        subtitulo={`Cadastre uma classe de golpe para ser identificada pelo modelo no esporte ${esporteNome}.`}
        placeholder="Nome do movimento (ex: Voleio Baixo)"
        onConfirmar={handleCriarMovimento}
        onFechar={() => setModalTipo(null)}
      />
    </GlassCard>
  );
}

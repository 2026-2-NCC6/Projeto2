import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { styles } from '@/components/ia/DataLabModelTestingConsole.styles';
import { GlassCard, PrimaryButton } from '@/components/ui/GlassCard';
import { useMovimentosDataLab, useTestarInferenciaIA } from '@/hooks';
import { wearableService, type TelemetriaIMUItem } from '@/services/wearableService';
import type { TelemetriaFrameItem, TestarInferenciaResultado } from '@/types/api';

interface DetecaoItem {
  id: string;
  golpe: string;
  confianca: number;
  latenciaMs: number;
  picoAccel: number;
  horario: string;
}

interface DataLabModelTestingConsoleProps {
  modeloId: string;
  versao: string;
  esporteId: string;
  modeloNome: string;
  estaConectado: boolean;
  onConectarDispositivo?: () => void;
}

export function DataLabModelTestingConsole({
  modeloId,
  versao,
  esporteId,
  modeloNome,
  estaConectado,
  onConectarDispositivo,
}: DataLabModelTestingConsoleProps) {
  const { data: listaMovimentos } = useMovimentosDataLab(esporteId);
  const testarMutation = useTestarInferenciaIA();

  // Estados em tempo real
  const [aceleracaoAtual, setAceleracaoAtual] = useState<number>(9.8);
  const [picoSessao, setPicoSessao] = useState<number>(9.8);
  const [estadoAtual, setEstadoAtual] = useState<'repouso' | 'movimento' | 'impacto'>('repouso');

  // Último golpe classificado
  const [ultimoResultado, setUltimoResultado] = useState<TestarInferenciaResultado | null>(null);
  const [ultimoPico, setUltimoPico] = useState<number>(0);

  // Placar da sessão de testes (contagem por golpe)
  const [placar, setPlacar] = useState<Record<string, number>>({});
  const [historicoRecente, setHistoricoRecente] = useState<DetecaoItem[]>([]);
  const [mostrarXai, setMostrarXai] = useState<boolean>(true);

  // Buffer deslizante e controle de trigger
  const slidingBufferRef = useRef<TelemetriaFrameItem[]>([]);
  const ultimoTriggerRef = useRef<number>(0);
  const emProcessamentoRef = useRef<boolean>(false);
  const capturaPicoRef = useRef<{
    idxPicoNoBuffer: number;
    picoMax: number;
    framesRestantesPosPico: number;
  } | null>(null);
  const tipoSimulacaoRef = useRef<'backhand' | 'saque'>('backhand');

  // Lista base de golpes cadastrados para o esporte
  const golpesCadastrados = useMemo(() => {
    if (listaMovimentos && listaMovimentos.length > 0) {
      return listaMovimentos.map((m) => m.nome);
    }
    if (esporteId === 'padel') return ['Bandeja', 'Vibora', 'Smash', 'Forehand', 'Backhand'];
    if (esporteId === 'beach_tennis') return ['Smash', 'Drop Shot', 'Forehand', 'Backhand'];
    return ['Forehand', 'Backhand', 'Saque', 'Smash', 'Slice'];
  }, [listaMovimentos, esporteId]);

  // Total de golpes classificados na sessão
  const totalGolpesSessao = useMemo(() => {
    return Object.values(placar).reduce((acc, curr) => acc + curr, 0);
  }, [placar]);

  // Função interna de classificação contra o modelo real
  async function executarInferencia(frames: TelemetriaFrameItem[], picoAccel: number) {
    if (emProcessamentoRef.current) return;
    emProcessamentoRef.current = true;

    try {
      const res = await testarMutation.mutateAsync({
        modeloId,
        versao: versao !== 'v0 (Não gerado)' ? versao : undefined,
        frames: frames.length > 0 ? frames : undefined,
      });

      setUltimoResultado(res);
      setUltimoPico(picoAccel);

      // Incrementa placar
      const golpeNorm = res.golpe_detectado;
      setPlacar((prev) => ({
        ...prev,
        [golpeNorm]: (prev[golpeNorm] ?? 0) + 1,
      }));

      // Adiciona ao feed recente
      const novoItem: DetecaoItem = {
        id: `${Date.now()}-${Math.random()}`,
        golpe: res.golpe_detectado,
        confianca: res.confianca,
        latenciaMs: res.latencia_ms,
        picoAccel,
        horario: new Date().toLocaleTimeString(),
      };
      setHistoricoRecente((prev) => [novoItem, ...prev.slice(0, 14)]);
    } catch {
      // Erro tratado pela mutation
    } finally {
      emProcessamentoRef.current = false;
    }
  }

  // Listener da telemetria BLE ao vivo do wearable
  useEffect(() => {
    const cancelar = wearableService.inscreverTelemetria((leitura: TelemetriaIMUItem) => {
      const resAccel = leitura.accel.resultante;
      setAceleracaoAtual(resAccel);
      setPicoSessao((prev) => Math.max(prev, resAccel));

      // Determina o estado instantâneo do dispositivo
      if (resAccel >= 24.0) {
        setEstadoAtual('impacto');
      } else if (resAccel >= 13.5) {
        setEstadoAtual('movimento');
      } else {
        setEstadoAtual('repouso');
      }

      // Alimenta buffer deslizante de frames (janela circular de 40 frames)
      const frameFormatado: TelemetriaFrameItem = {
        frame_id: slidingBufferRef.current.length + 1,
        timestamp_ms: leitura.timestampMs,
        ax: leitura.accel.x,
        ay: leitura.accel.y,
        az: leitura.accel.z,
        gx: leitura.gyro.x,
        gy: leitura.gyro.y,
        gz: leitura.gyro.z,
        resultante_accel: resAccel,
      };

      slidingBufferRef.current.push(frameFormatado);
      if (slidingBufferRef.current.length > 40) {
        slidingBufferRef.current.shift();
      }

      const agora = Date.now();

      // 1. Se já detectou início de impacto, acumula frames pós-impacto (follow-through)
      if (capturaPicoRef.current) {
        if (resAccel > capturaPicoRef.current.picoMax) {
          capturaPicoRef.current.picoMax = resAccel;
          capturaPicoRef.current.idxPicoNoBuffer = slidingBufferRef.current.length - 1;
        }
        capturaPicoRef.current.framesRestantesPosPico -= 1;

        // Quando completar os frames pós-impacto, extrai a janela centrada no pico e classifica
        if (capturaPicoRef.current.framesRestantesPosPico <= 0) {
          const idxPico = capturaPicoRef.current.idxPicoNoBuffer;
          const picoFinal = capturaPicoRef.current.picoMax;
          capturaPicoRef.current = null;
          ultimoTriggerRef.current = agora;

          const buffer = slidingBufferRef.current;
          // Janela centrada no pico: 8 frames antes até 12 frames depois (~20 frames)
          const inIdx = Math.max(0, idxPico - 8);
          const outIdx = Math.min(buffer.length, idxPico + 12);
          const janelaCentrada = buffer.slice(inIdx, outIdx);

          if (janelaCentrada.length >= 8) {
            executarInferencia(janelaCentrada, picoFinal);
          }
        }
      } else {
        // 2. Detecção de início de impacto (Threshold >= 25 m/s² com cooldown de 800ms)
        if (resAccel >= 25.0 && agora - ultimoTriggerRef.current > 800) {
          capturaPicoRef.current = {
            idxPicoNoBuffer: slidingBufferRef.current.length - 1,
            picoMax: resAccel,
            framesRestantesPosPico: 12, // Aguarda 12 frames pós-impacto (~400ms) para follow-through
          };
        }
      }
    });

    return () => cancelar();
  }, [modeloId, versao]);

  // Simulação rápida para teste sem dispositivo físico (alternando entre Backhand e Saque)
  function handleSimularGolpe() {
    const isBackhand = tipoSimulacaoRef.current === 'backhand';
    tipoSimulacaoRef.current = isBackhand ? 'saque' : 'backhand';

    const picoSimulado = isBackhand
      ? Number((38 + Math.random() * 10).toFixed(1))
      : Number((28 + Math.random() * 8).toFixed(1));

    setAceleracaoAtual(picoSimulado);
    setEstadoAtual('impacto');
    setPicoSessao((prev) => Math.max(prev, picoSimulado));

    const framesSimulados: TelemetriaFrameItem[] = [];
    const baseTime = Date.now();
    const totalFramesSim = isBackhand ? 18 : 26;
    const centroPico = Math.floor(totalFramesSim * 0.45);

    for (let i = 0; i < totalFramesSim; i += 1) {
      const fatorPico = Math.exp(-0.5 * ((i - centroPico) / 3.5) ** 2);

      if (isBackhand) {
        // Assinatura biomecânica do Backhand: Ax negativo forte (-15 a -35), Az neutro, Gx/Gz negativos
        framesSimulados.push({
          frame_id: i + 1,
          timestamp_ms: baseTime + i * 50,
          ax: Number((-fatorPico * picoSimulado * 0.85 + (Math.random() - 0.5) * 2).toFixed(2)),
          ay: Number((fatorPico * 12 + Math.random() * 2).toFixed(2)),
          az: Number(((Math.random() - 0.5) * 3).toFixed(2)),
          gx: Number((-fatorPico * 3.5 - Math.random() * 0.5).toFixed(2)),
          gy: Number((fatorPico * 1.5 + Math.random() * 0.3).toFixed(2)),
          gz: Number((-fatorPico * 4.2 - Math.random() * 0.6).toFixed(2)),
          resultante_accel: Number((fatorPico * picoSimulado + 5.0).toFixed(2)),
        });
      } else {
        // Assinatura biomecânica do Saque: Az positivo vertical (+15 a +28), Ax próximo de zero, Gx positivo
        framesSimulados.push({
          frame_id: i + 1,
          timestamp_ms: baseTime + i * 50,
          ax: Number(((Math.random() - 0.5) * 3).toFixed(2)),
          ay: Number((fatorPico * 8 + Math.random() * 2).toFixed(2)),
          az: Number((fatorPico * picoSimulado * 0.75 + 9.8).toFixed(2)),
          gx: Number((fatorPico * 2.8 + Math.random() * 0.5).toFixed(2)),
          gy: Number((fatorPico * 0.5 + Math.random() * 0.2).toFixed(2)),
          gz: Number(((Math.random() - 0.5) * 1.5).toFixed(2)),
          resultante_accel: Number((fatorPico * picoSimulado + 8.0).toFixed(2)),
        });
      }
    }

    executarInferencia(framesSimulados, picoSimulado);

    setTimeout(() => {
      setEstadoAtual('repouso');
      setAceleracaoAtual(9.8);
    }, 600);
  }

  function handleZerarPlacar() {
    setPlacar({});
    setHistoricoRecente([]);
    setUltimoResultado(null);
    setPicoSessao(9.8);
  }

  const nomeEsporteRotulo =
    esporteId === 'tenis'
      ? '🎾 Tênis'
      : esporteId === 'padel'
        ? '🏸 Padel'
        : esporteId === 'beach_tennis'
          ? '🏓 Beach Tennis'
          : `⚽ ${esporteId.toUpperCase()}`;

  return (
    <View style={styles.container}>
      {/* 1. CABEÇALHO DO MODELO SENDO TESTADO */}
      <GlassCard highlighted style={styles.headerCard}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.tagModel}>{'MODELO ALVO EM TESTE DE INFERÊNCIA'}</Text>
            <Text style={styles.modelTitle}>{modeloNome || modeloId}</Text>
          </View>

          <View style={styles.badgesRow}>
            <View style={styles.sportBadge}>
              <Text style={styles.sportBadgeText}>{nomeEsporteRotulo}</Text>
            </View>
            <View style={styles.versionBadge}>
              <Text style={styles.versionBadgeText}>{`Versão: ${versao}`}</Text>
            </View>
          </View>
        </View>
      </GlassCard>

      {/* 2. INDICADOR DE ESTADO DO DISPOSITIVO EM TEMPO REAL */}
      <View
        style={[
          styles.stateCard,
          estadoAtual === 'repouso' && styles.stateRepouso,
          estadoAtual === 'movimento' && styles.stateMovimento,
          estadoAtual === 'impacto' && styles.stateImpacto,
        ]}>
        <View style={styles.stateHeader}>
          <Text style={styles.stateLabel}>{'ESTADO EM TEMPO REAL DO DISPOSITIVO'}</Text>
          <View
            style={[
              styles.stateDot,
              estadoAtual === 'repouso' && styles.dotRepouso,
              estadoAtual === 'movimento' && styles.dotMovimento,
              estadoAtual === 'impacto' && styles.dotImpacto,
            ]}
          />
        </View>

        <View style={styles.stateMainRow}>
          <Text
            style={[
              styles.stateTitle,
              estadoAtual === 'repouso' && styles.textRepouso,
              estadoAtual === 'movimento' && styles.textMovimento,
              estadoAtual === 'impacto' && styles.textImpacto,
            ]}>
            {estadoAtual === 'repouso'
              ? '🟢 Em Repouso / Posição Inicial'
              : estadoAtual === 'movimento'
                ? '🟡 Em Movimento / Swing'
                : '⚡ Impacto / Golpe Executado!'}
          </Text>

          <Text style={styles.accelValue}>
            {`${aceleracaoAtual.toFixed(1)} `}
            <Text style={styles.accelUnit}>m/s²</Text>
          </Text>
        </View>
      </View>

      {/* 3. CARD HERO DO ÚLTIMO GOLPE CLASSIFICADO */}
      <GlassCard highlighted style={styles.heroPredictionCard}>
        <View style={styles.heroPredictionHeader}>
          <Text style={styles.heroPredictionTag}>{'ÚLTIMO GOLPE DETECTADO PELO MODELO'}</Text>
          {ultimoResultado ? (
            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>{`${ultimoResultado.confianca}% CONFIANÇA`}</Text>
            </View>
          ) : null}
        </View>

        {ultimoResultado ? (
          <View>
            <Text style={styles.heroStrokeTitle}>
              {`🎯 ${ultimoResultado.golpe_detectado.toUpperCase()}`}
            </Text>

            <View style={styles.heroStrokeMetaRow}>
              <Text style={styles.heroLatencyText}>
                {`⚡ Latência de IA: ${ultimoResultado.latencia_ms.toFixed(1)} ms`}
              </Text>
              <Text style={styles.heroPeakText}>
                {`Pico de aceleração: ${ultimoPico.toFixed(1)} m/s²`}
              </Text>
            </View>

            {/* BARRAS DE PROBABILIDADE RELATIVA */}
            {ultimoResultado.probabilidades_por_golpe ? (
              <View style={styles.probabilitiesRow}>
                {Object.entries(ultimoResultado.probabilidades_por_golpe).map(([g, p]) => {
                  const ehVencedor = g === ultimoResultado.golpe_detectado;
                  const nomeLimpo = g.replace('tenis_', '').replace('padel_', '').toUpperCase();
                  return (
                    <View
                      key={g}
                      style={[styles.probabilityPill, ehVencedor && styles.probPillActive]}>
                      <Text
                        style={[styles.probPillName, ehVencedor && styles.probPillNameActive]}>
                        {nomeLimpo}
                      </Text>
                      <Text style={styles.probPillPercent}>{`${p}%`}</Text>
                    </View>
                  );
                })}
              </View>
            ) : null}

            {/* EXPLICABILIDADE BIOMECÂNICA (POR QUE ESTE GOLPE?) */}
            {ultimoResultado.fatores_determinantes && ultimoResultado.fatores_determinantes.length > 0 ? (
              <View style={styles.xaiSection}>
                <Pressable
                  onPress={() => setMostrarXai(!mostrarXai)}
                  style={styles.xaiHeader}
                  accessibilityRole="button"
                  accessibilityLabel="Alternar visualização dos fatores biomecânicos">
                  <Text style={styles.xaiTitle}>
                    {'🔍 RAIO-X BIOMECÂNICO (POR QUE DETECTOU ESTE GOLPE?)'}
                  </Text>
                  <Text style={styles.xaiToggleText}>{mostrarXai ? '▲' : '▼'}</Text>
                </Pressable>

                {mostrarXai ? (
                  <View style={styles.xaiList}>
                    {ultimoResultado.fatores_determinantes.map((fator) => (
                      <View key={fator.feature} style={styles.xaiItem}>
                        <View style={styles.xaiItemLeft}>
                          <Text style={styles.xaiItemTitle}>{fator.titulo}</Text>
                          <Text style={styles.xaiItemDesc}>{fator.descricao}</Text>
                        </View>
                        <View style={styles.xaiItemValueBadge}>
                          <Text style={styles.xaiItemValueText}>{fator.valor}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
        ) : (
          <Text style={styles.heroEmptyText}>
            {estaConectado
              ? 'Faça um movimento com o sensor para testar a detecção em tempo real...'
              : 'Conecte o sensor ou use o botão "Simular Golpe" abaixo para testar.'}
          </Text>
        )}
      </GlassCard>

      {/* 4. PLACAR DA SESSÃO DE TESTES */}
      <GlassCard style={styles.scoreCard}>
        <View style={styles.scoreHeader}>
          <Text style={styles.scoreTitle}>{'PLACAR DE GOLPES NA SESSÃO DE TESTE'}</Text>
          <Text style={styles.scoreTotalBadge}>{`${totalGolpesSessao} golpes no total`}</Text>
        </View>

        <View style={styles.scoreList}>
          {golpesCadastrados.map((golpe) => {
            const qtd = placar[golpe] ?? 0;
            const ativo = qtd > 0;
            return (
              <View
                key={golpe}
                style={[styles.scoreRowItem, ativo && styles.scoreRowItemActive]}>
                <Text style={styles.scoreStrokeName}>{golpe}</Text>
                <View
                  style={[styles.scoreCountBadge, ativo && styles.scoreCountBadgeActive]}>
                  <Text
                    style={[
                      styles.scoreCountText,
                      ativo && styles.scoreCountTextActive,
                    ]}>
                    {qtd === 1 ? '1 detectado' : `${qtd} detectados`}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </GlassCard>

      {/* 5. FEED HISTÓRICO DE DETECÇÕES RECENTES */}
      {historicoRecente.length > 0 ? (
        <GlassCard style={styles.feedSection}>
          <Text style={styles.feedTitle}>{'FEED DE GOLPES RECENTES'}</Text>
          <ScrollView
            nestedScrollEnabled
            style={styles.feedList}
            showsVerticalScrollIndicator={false}>
            {historicoRecente.map((item) => (
              <View key={item.id} style={styles.feedItem}>
                <Text style={styles.feedStroke}>{`🎯 ${item.golpe}`}</Text>
                <Text style={styles.feedMeta}>
                  {`${item.confianca}% • ${item.latenciaMs.toFixed(1)}ms • ${item.horario}`}
                </Text>
              </View>
            ))}
          </ScrollView>
        </GlassCard>
      ) : null}

      {/* 6. BOTÕES DE AÇÃO: SIMULAR GOLPE & ZERAR PLACAR */}
      <View style={styles.actionsRow}>
        <View style={styles.actionCol}>
          <PrimaryButton
            label="⚡ Simular Golpe"
            variant="ghost"
            onPress={handleSimularGolpe}
            loading={testarMutation.isPending}
          />
        </View>

        <View style={styles.actionCol}>
          <PrimaryButton
            label="🔄 Zerar Placar"
            variant="ghost"
            onPress={handleZerarPlacar}
            disabled={totalGolpesSessao === 0}
          />
        </View>
      </View>
    </View>
  );
}

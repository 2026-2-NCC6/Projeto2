import React, { useMemo, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';

import { styles } from '@/components/treino/CircuitCardItem.styles';
import type { CircuitoSessaoAtiva } from '@/components/treino/SessionCircuitsList';
import { GlassCard, MetricPill, PrimaryButton } from '@/components/ui/GlassCard';
import type { MovimentoItem } from '@/types/api';

const SWIPE_OPEN_WIDTH = -186;
const DRAG_SWAP_STEP_PX = 68;

interface StrokeSequenceBoxProps {
  golpe: MovimentoItem;
  ordem: number;
}

function StrokeSequenceBox({ golpe, ordem }: StrokeSequenceBoxProps) {
  const precisaoPct = Math.round(golpe.precisao * 100);

  return (
    <View style={styles.strokeBox}>
      <View style={styles.strokeLeft}>
        <View style={styles.strokeOrderBadge}>
          <Text style={styles.strokeOrderText}>#{ordem}</Text>
        </View>
        <View>
          <Text style={styles.strokeName}>{golpe.tipo_movimento.toUpperCase()}</Text>
          {golpe.velocidade_pico !== undefined ? (
            <Text style={styles.strokeMeta}>{golpe.velocidade_pico} km/h</Text>
          ) : null}
        </View>
      </View>

      <View style={styles.precisionBadge}>
        <Text style={styles.precisionText}>{precisaoPct}% acerto</Text>
      </View>
    </View>
  );
}

interface CircuitCardItemProps {
  circuito: CircuitoSessaoAtiva;
  dispositivoConectado: boolean;
  existeCircuitoExecutando: boolean;
  modoOrdemAtivo: boolean;
  onAlternarModoOrdem: () => void;
  onIniciarCircuito: (idCircuito: string) => void;
  onConcluirCircuitoManualmente: (idCircuito: string) => void;
  onAbrirRegistroManualCiclo: (circuito: CircuitoSessaoAtiva) => void;
  onEditarCircuito: (circuito: CircuitoSessaoAtiva) => void;
  onExcluirCircuito: (idCircuito: string) => void;
  onMoverOrdem: (idCircuito: string, direcao: 'subir' | 'descer') => void;
}

export function CircuitCardItem({
  circuito,
  dispositivoConectado,
  existeCircuitoExecutando,
  modoOrdemAtivo,
  onAlternarModoOrdem,
  onIniciarCircuito,
  onConcluirCircuitoManualmente,
  onAbrirRegistroManualCiclo,
  onEditarCircuito,
  onExcluirCircuito,
  onMoverOrdem,
}: CircuitCardItemProps) {
  const isWeb = Platform.OS === 'web';
  const isPlanejado = circuito.status === 'planejado';
  const isExecutando = circuito.status === 'executando';
  const isConcluido = circuito.status === 'concluido';

  // Animação de arraste lateral no celular (Swipe to reveal)
  const translateX = useRef(new Animated.Value(0)).current;
  const swipeAbertoRef = useRef(false);

  // Animação de arraste vertical na caixa inteira (quando Editar Ordem está ativo)
  const dragY = useRef(new Animated.Value(0)).current;
  const [arrastandoVertical, setArrastandoVertical] = useState(false);
  const ultimoStepSwapRef = useRef(0);

  const fecharSwipeMobile = () => {
    swipeAbertoRef.current = false;
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  // PanResponder horizontal (exclusivo para Smartphone quando NÃO está em modo de reordenar)
  const swipePanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          !isWeb &&
          !modoOrdemAtivo &&
          Math.abs(gesture.dx) > 12 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.4,
        onPanResponderMove: (_, gesture) => {
          const base = swipeAbertoRef.current ? SWIPE_OPEN_WIDTH : 0;
          const novoX = Math.min(
            0,
            Math.max(SWIPE_OPEN_WIDTH - 20, base + gesture.dx)
          );
          translateX.setValue(novoX);
        },
        onPanResponderRelease: (_, gesture) => {
          const deveAbrir =
            gesture.dx < -45 || (swipeAbertoRef.current && gesture.dx < 35);
          swipeAbertoRef.current = deveAbrir;
          Animated.spring(translateX, {
            toValue: deveAbrir ? SWIPE_OPEN_WIDTH : 0,
            useNativeDriver: true,
            friction: 8,
          }).start();
        },
      }),
    [isWeb, modoOrdemAtivo, translateX]
  );

  // PanResponder vertical aplicado na caixa inteira quando modoOrdemAtivo === true
  const reorderPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => modoOrdemAtivo,
        onMoveShouldSetPanResponder: (_, gesture) =>
          modoOrdemAtivo && Math.abs(gesture.dy) > 3,
        onPanResponderGrant: () => {
          ultimoStepSwapRef.current = 0;
          setArrastandoVertical(true);
        },
        onPanResponderMove: (_, gesture) => {
          dragY.setValue(gesture.dy);
          const steps = Math.trunc(gesture.dy / DRAG_SWAP_STEP_PX);

          if (steps < ultimoStepSwapRef.current) {
            ultimoStepSwapRef.current = steps;
            onMoverOrdem(circuito.id, 'subir');
          } else if (steps > ultimoStepSwapRef.current) {
            ultimoStepSwapRef.current = steps;
            onMoverOrdem(circuito.id, 'descer');
          }
        },
        onPanResponderRelease: () => {
          setArrastandoVertical(false);
          ultimoStepSwapRef.current = 0;
          Animated.spring(dragY, {
            toValue: 0,
            useNativeDriver: true,
            friction: 7,
          }).start();
        },
        onPanResponderTerminate: () => {
          setArrastandoVertical(false);
          ultimoStepSwapRef.current = 0;
          Animated.spring(dragY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        },
      }),
    [circuito.id, dragY, modoOrdemAtivo, onMoverOrdem]
  );

  const tituloMeta =
    circuito.modo_definicao === 'numero_golpes'
      ? `Meta: ${circuito.meta_golpes ?? 0} golpes`
      : `Meta: ${
          circuito.meta_tempo_rotulo ?? `${circuito.meta_tempo_segundos ?? 0} seg`
        } • ${circuito.meta_frequencia_min ?? 0} golpes/min`;

  const cardElement = (
    <View
      {...(modoOrdemAtivo ? reorderPanResponder.panHandlers : {})}
      style={modoOrdemAtivo ? styles.draggableBoxWrapper : undefined}>
      <GlassCard
        highlighted={isExecutando || isConcluido || modoOrdemAtivo}
        style={[
          styles.circuitCard,
          arrastandoVertical && styles.circuitCardDragging,
        ]}>
        {/* Cabeçalho do Circuito com os 6 pontinhos ao lado quando em modo de arraste */}
        <View style={styles.circuitHeader}>
          <View style={styles.headerLeftRow}>
            {modoOrdemAtivo ? (
              <Text style={styles.sixDotsGrip}>⠿</Text>
            ) : null}

            <Text style={styles.circuitTitle}>{tituloMeta}</Text>
          </View>

          {isExecutando ? (
            <View style={styles.runningBadge}>
              <View style={styles.runningDot} />
              <Text style={styles.runningBadgeText}>EXECUTANDO</Text>
            </View>
          ) : isConcluido ? (
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreText}>{circuito.pontuacao} pts</Text>
            </View>
          ) : null}
        </View>

        {/* Estado 1: PLANEJADO (Botão Iniciar oculto enquanto Editar Ordem estiver ativo) */}
        {isPlanejado && !modoOrdemAtivo ? (
          dispositivoConectado ? (
            <PrimaryButton
              label="▶ Iniciar Circuito"
              variant="primary"
              disabled={existeCircuitoExecutando}
              onPress={() => onIniciarCircuito(circuito.id)}
            />
          ) : (
            <View style={styles.strokesList}>
              <PrimaryButton
                label="▶ Iniciar Cronômetro do Ciclo"
                variant="primary"
                disabled={existeCircuitoExecutando}
                onPress={() => onIniciarCircuito(circuito.id)}
              />
              <PrimaryButton
                label="📝 Cadastrar Rodadas via Formulário"
                variant="ghost"
                onPress={() => onAbrirRegistroManualCiclo(circuito)}
              />
            </View>
          )
        ) : null}

        {/* Estado 2: EXECUTANDO */}
        {isExecutando && !modoOrdemAtivo ? (
          dispositivoConectado ? (
            <>
              <View style={styles.metricsGrid}>
                <MetricPill
                  label="Tempo Rodada"
                  value={`${circuito.tempo_total_segundos}s${
                    circuito.meta_tempo_segundos
                      ? ` / ${circuito.meta_tempo_segundos}s`
                      : ''
                  }`}
                  accent
                />
                <MetricPill
                  label="Golpes do Dispositivo"
                  value={
                    circuito.modo_definicao === 'numero_golpes' &&
                    circuito.meta_golpes
                      ? `${circuito.golpes.length} / ${circuito.meta_golpes}`
                      : `${circuito.golpes.length}`
                  }
                  accent
                />
              </View>

              <Text style={styles.sequenceHeaderLabel}>
                GOLPES RECEBIDOS DO DISPOSITIVO EM TEMPO REAL
              </Text>
              {circuito.golpes.length === 0 ? (
                <View style={styles.waitingStrokeBox}>
                  <Text style={styles.waitingStrokeText}>
                    📡 Aguardando leitura de golpes do bracelete Bluetooth...
                  </Text>
                </View>
              ) : (
                <View style={styles.strokesList}>
                  {circuito.golpes.map((golpe, idx) => (
                    <StrokeSequenceBox
                      key={`${circuito.id}-live-${idx}`}
                      golpe={golpe}
                      ordem={idx + 1}
                    />
                  ))}
                </View>
              )}

              <PrimaryButton
                label="⏹ Finalizar Rodada Agora"
                variant="ghost"
                onPress={() => onConcluirCircuitoManualmente(circuito.id)}
              />
            </>
          ) : (
            <>
              <View style={styles.metricsGrid}>
                <MetricPill
                  label="Tempo do Ciclo"
                  value={`${circuito.tempo_total_segundos}s${
                    circuito.meta_tempo_segundos
                      ? ` / ${circuito.meta_tempo_segundos}s`
                      : ''
                  }`}
                  accent
                />
                <MetricPill
                  label="Modo de Registro"
                  value="Formulário Manual"
                />
              </View>

              <View style={styles.waitingStrokeBox}>
                <Text style={styles.waitingStrokeText}>
                  📝 Sem dispositivo conectado: as rodadas não são computadas
                  automaticamente. Ao finalizar o ciclo, cadastre os dados no
                  formulário.
                </Text>
              </View>

              <PrimaryButton
                label="⏹ Finalizar e Cadastrar Rodadas"
                variant="primary"
                onPress={() => onAbrirRegistroManualCiclo(circuito)}
              />
            </>
          )
        ) : null}

        {/* Estado 3: CONCLUÍDO */}
        {isConcluido && !modoOrdemAtivo ? (
          <>
            <View style={styles.metricsGrid}>
              <MetricPill
                label="Tempo Total"
                value={`${circuito.tempo_total_segundos}s`}
              />
              <MetricPill label="Total Golpes" value={circuito.total_golpes} />
            </View>

            <View style={styles.metricsGrid}>
              <MetricPill
                label="Frequência"
                value={`${circuito.frequencia_golpes_min} g/min`}
              />
              <MetricPill
                label="% de Acerto"
                value={`${circuito.percentual_acerto}%`}
                accent
              />
            </View>

            {dispositivoConectado ? (
              <>
                <Text style={styles.sequenceHeaderLabel}>
                  SEQUÊNCIA DE GOLPES OBTIDA DO DISPOSITIVO
                </Text>
                <View style={styles.strokesList}>
                  {circuito.golpes.map((golpe, idx) => (
                    <StrokeSequenceBox
                      key={`${circuito.id}-golpe-${idx}`}
                      golpe={golpe}
                      ordem={idx + 1}
                    />
                  ))}
                </View>
              </>
            ) : (
              <PrimaryButton
                label="📝 Editar Rodadas Cadastradas"
                variant="ghost"
                onPress={() => onAbrirRegistroManualCiclo(circuito)}
              />
            )}
          </>
        ) : null}
      </GlassCard>
    </View>
  );

  // ============================================================================
  // RENDERIZAÇÃO NO COMPUTADOR (WEB): Card + Botões Redondos Laterais
  // ============================================================================
  if (isWeb) {
    return (
      <Animated.View
        style={[
          styles.desktopRowWrapper,
          { transform: [{ translateY: dragY }] },
          arrastandoVertical && { zIndex: 100 },
        ]}>
        <View style={styles.desktopCardColumn}>{cardElement}</View>

        <View style={styles.desktopSideButtonsCol}>
          {!modoOrdemAtivo ? (
            <Pressable
              onPress={() => onEditarCircuito(circuito)}
              style={({ pressed }) => [
                styles.roundSideBtn,
                pressed && styles.roundSideBtnPressed,
              ]}>
              <Text style={styles.roundSideBtnIcon}>✏️</Text>
            </Pressable>
          ) : null}

          <Pressable
            onPress={onAlternarModoOrdem}
            style={[
              styles.roundSideBtn,
              modoOrdemAtivo && styles.roundSideBtnActive,
            ]}>
            <Text style={styles.roundSideBtnIcon}>⇅</Text>
          </Pressable>

          {!modoOrdemAtivo ? (
            <Pressable
              onPress={() => onExcluirCircuito(circuito.id)}
              style={({ pressed }) => [
                styles.roundSideBtn,
                styles.roundSideBtnDanger,
                pressed && styles.roundSideBtnPressed,
              ]}>
              <Text style={styles.roundSideBtnIcon}>🗑️</Text>
            </Pressable>
          ) : null}
        </View>
      </Animated.View>
    );
  }

  // ============================================================================
  // RENDERIZAÇÃO NO CELULAR (MOBILE): Arrasta para o lado ou caixa arrastável
  // ============================================================================
  return (
    <Animated.View
      style={[
        styles.mobileSwipeContainer,
        { transform: [{ translateY: dragY }] },
        arrastandoVertical && { zIndex: 100 },
      ]}>
      {!modoOrdemAtivo ? (
        <View style={styles.mobileActionsTray}>
          <Pressable
            onPress={() => {
              fecharSwipeMobile();
              onEditarCircuito(circuito);
            }}
            style={[styles.mobileSwipeActionBtn, styles.mobileEditBtn]}>
            <Text style={styles.mobileActionEmoji}>✏️</Text>
            <Text style={styles.mobileActionLabel}>Editar</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              fecharSwipeMobile();
              onAlternarModoOrdem();
            }}
            style={[styles.mobileSwipeActionBtn, styles.mobileOrderBtn]}>
            <Text style={styles.mobileActionEmoji}>⇅</Text>
            <Text style={styles.mobileActionLabel}>Ordem</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              fecharSwipeMobile();
              onExcluirCircuito(circuito.id);
            }}
            style={[styles.mobileSwipeActionBtn, styles.mobileDeleteBtn]}>
            <Text style={styles.mobileActionEmoji}>🗑️</Text>
            <Text style={styles.mobileActionLabel}>Excluir</Text>
          </Pressable>
        </View>
      ) : null}

      <Animated.View
        {...(!modoOrdemAtivo ? swipePanResponder.panHandlers : {})}
        style={{ transform: [{ translateX: modoOrdemAtivo ? 0 : translateX }] }}>
        {cardElement}
      </Animated.View>
    </Animated.View>
  );
}

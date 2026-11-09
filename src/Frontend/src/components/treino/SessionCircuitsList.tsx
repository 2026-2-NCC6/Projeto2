import React, { useState } from 'react';
import { Text, View } from 'react-native';

import { CircuitCardItem } from '@/components/treino/CircuitCardItem';
import type { ModoCircuito } from '@/components/treino/CreateCircuitModal';
import {
  RestIntervalBetweenCard,
  type IntervaloDescanso,
} from '@/components/treino/RestIntervalBetweenCard';
import { styles } from '@/components/treino/SessionCircuitsList.styles';
import { GlassCard, PrimaryButton } from '@/components/ui/GlassCard';
import type { MovimentoItem } from '@/types/api';

export type StatusCircuito = 'planejado' | 'executando' | 'concluido';

export interface CircuitoSessaoAtiva {
  id: string;
  numero_rodada: number;
  status: StatusCircuito;
  modo_definicao: ModoCircuito;
  meta_golpes?: number;
  meta_tempo_segundos?: number;
  meta_tempo_rotulo?: string;
  meta_frequencia_min?: number;
  intervalo_apos?: IntervaloDescanso;
  hora_inicio: string;
  hora_fim: string;
  tempo_total_segundos: number;
  total_golpes: number;
  frequencia_golpes_min: number;
  percentual_acerto: number;
  pontuacao: number;
  golpes: MovimentoItem[];
}

interface SessionCircuitsListProps {
  circuitos: CircuitoSessaoAtiva[];
  dispositivoConectado: boolean;
  onAbrirModalCriarCircuito: () => void;
  onIniciarCircuito: (idCircuito: string) => void;
  onConcluirCircuitoManualmente: (idCircuito: string) => void;
  onAbrirRegistroManualCiclo: (circuito: CircuitoSessaoAtiva) => void;
  onEditarCircuito: (circuito: CircuitoSessaoAtiva) => void;
  onExcluirCircuito: (idCircuito: string) => void;
  onMoverOrdemCircuito: (idCircuito: string, direcao: 'subir' | 'descer') => void;
  onAbrirModalIntervalo: (circuito: CircuitoSessaoAtiva) => void;
  onAjustarIntervalo: (idCircuito: string, deltaSegundos: number) => void;
  onPularIntervalo: (idCircuito: string) => void;
  onRemoverIntervalo: (idCircuito: string) => void;
}

export function SessionCircuitsList({
  circuitos,
  dispositivoConectado,
  onAbrirModalCriarCircuito,
  onIniciarCircuito,
  onConcluirCircuitoManualmente,
  onAbrirRegistroManualCiclo,
  onEditarCircuito,
  onExcluirCircuito,
  onMoverOrdemCircuito,
  onAbrirModalIntervalo,
  onAjustarIntervalo,
  onPularIntervalo,
  onRemoverIntervalo,
}: SessionCircuitsListProps) {
  const [modoOrdemAtivo, setModoOrdemAtivo] = useState(false);

  const existeCircuitoExecutando = circuitos.some(
    (c) => c.status === 'executando'
  );

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionTitle}>PLANO DE CIRCUITOS DA SESSÃO</Text>
          <Text style={styles.sectionCount}>
            {circuitos.length}{' '}
            {circuitos.length === 1 ? 'circuito no plano' : 'circuitos no plano'}
          </Text>
        </View>

        <View style={styles.headerButtonsRow}>
          {modoOrdemAtivo ? (
            <PrimaryButton
              label="Concluir Ordem"
              variant="ghost"
              onPress={() => setModoOrdemAtivo(false)}
              style={styles.createCircuitBtn}
            />
          ) : null}

          <PrimaryButton
            label="+ Criar Circuito"
            variant="primary"
            onPress={onAbrirModalCriarCircuito}
            style={styles.createCircuitBtn}
          />
        </View>
      </View>

      {circuitos.length === 0 ? (
        <GlassCard style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>📋</Text>
          <Text style={styles.emptyTitle}>Monte o plano de circuitos do treino</Text>
          <Text style={styles.emptySub}>
            {dispositivoConectado
              ? 'Adicione os circuitos que você pretende realizar nesta sessão e depois inicie cada rodada para capturar os golpes do dispositivo.'
              : 'Adicione os ciclos pré-programados da sessão. Sem o dispositivo conectado, você poderá cadastrar as rodadas via formulário para cada ciclo.'}
          </Text>
        </GlassCard>
      ) : (
        <View style={styles.circuitsStack}>
          {circuitos.map((circuito, index) => {
            const mostrarConectorIntervalo =
              index < circuitos.length - 1 || Boolean(circuito.intervalo_apos);

            return (
              <React.Fragment key={circuito.id}>
                <CircuitCardItem
                  circuito={circuito}
                  dispositivoConectado={dispositivoConectado}
                  existeCircuitoExecutando={existeCircuitoExecutando}
                  modoOrdemAtivo={modoOrdemAtivo}
                  onAlternarModoOrdem={() => setModoOrdemAtivo((prev) => !prev)}
                  onIniciarCircuito={onIniciarCircuito}
                  onConcluirCircuitoManualmente={onConcluirCircuitoManualmente}
                  onAbrirRegistroManualCiclo={onAbrirRegistroManualCiclo}
                  onEditarCircuito={onEditarCircuito}
                  onExcluirCircuito={onExcluirCircuito}
                  onMoverOrdem={onMoverOrdemCircuito}
                />

                {mostrarConectorIntervalo ? (
                  <RestIntervalBetweenCard
                    intervalo={circuito.intervalo_apos}
                    onAdicionarOuEditar={() => onAbrirModalIntervalo(circuito)}
                    onAjustarIntervalo={(delta) =>
                      onAjustarIntervalo(circuito.id, delta)
                    }
                    onPularIntervalo={() => onPularIntervalo(circuito.id)}
                    onRemoverIntervalo={() => onRemoverIntervalo(circuito.id)}
                  />
                ) : null}
              </React.Fragment>
            );
          })}
        </View>
      )}
    </View>
  );
}

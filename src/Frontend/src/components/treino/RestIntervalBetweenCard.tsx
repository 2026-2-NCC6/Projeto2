import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { styles } from '@/components/treino/RestIntervalBetweenCard.styles';

export type StatusIntervalo = 'aguardando' | 'contando' | 'concluido';

export interface IntervaloDescanso {
  duracao_total_segundos: number;
  segundos_restantes: number;
  rotulo: string;
  status: StatusIntervalo;
}

function formatarMMSS(segundos: number): string {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

interface RestIntervalBetweenCardProps {
  intervalo?: IntervaloDescanso;
  onAdicionarOuEditar: () => void;
  onAjustarIntervalo: (deltaSegundos: number) => void;
  onPularIntervalo: () => void;
  onRemoverIntervalo: () => void;
}

export function RestIntervalBetweenCard({
  intervalo,
  onAdicionarOuEditar,
  onAjustarIntervalo,
  onPularIntervalo,
  onRemoverIntervalo,
}: RestIntervalBetweenCardProps) {
  if (!intervalo) {
    return (
      <View style={styles.connectorWrapper}>
        <View style={styles.connectorLine} />
        <Pressable
          onPress={onAdicionarOuEditar}
          style={({ pressed }) => [
            styles.addIntervalButton,
            pressed && { opacity: 0.8 },
          ]}>
          <Text style={styles.addIntervalIcon}>⏱️</Text>
          <Text style={styles.addIntervalText}>+ Adicionar Intervalo</Text>
        </Pressable>
        <View style={styles.connectorLine} />
      </View>
    );
  }

  const isContando = intervalo.status === 'contando';
  const isConcluido = intervalo.status === 'concluido';

  return (
    <View style={styles.connectorWrapper}>
      <View style={styles.connectorLine} />
      <View
        style={[
          styles.intervalBox,
          isContando && styles.intervalBoxActive,
          isConcluido && styles.intervalBoxDone,
        ]}>
        <View style={styles.intervalLeft}>
          <Text style={styles.intervalEmoji}>
            {isContando ? '⏳' : isConcluido ? '✅' : '⏱️'}
          </Text>
          <Text
            style={[
              styles.intervalTitle,
              isContando && styles.intervalCountdownText,
            ]}>
            {isContando
              ? formatarMMSS(intervalo.segundos_restantes)
              : `Descanso: ${intervalo.rotulo}`}
          </Text>
        </View>

        <View style={styles.intervalActions}>
          {isContando ? (
            <>
              <View style={styles.stepGroup}>
                <Pressable
                  onPress={() => onAjustarIntervalo(-30)}
                  style={({ pressed }) => [
                    styles.stepBtn,
                    pressed && { opacity: 0.75 },
                  ]}>
                  <Text style={styles.stepBtnText}>-30 seg</Text>
                </Pressable>

                <View style={styles.stepDivider} />

                <Pressable
                  onPress={() => onAjustarIntervalo(30)}
                  style={({ pressed }) => [
                    styles.stepBtn,
                    pressed && { opacity: 0.75 },
                  ]}>
                  <Text style={styles.stepBtnText}>+30 seg</Text>
                </Pressable>
              </View>

              <Pressable onPress={onPularIntervalo} style={styles.skipBtn}>
                <Text style={styles.skipBtnText}>Pular ⏭</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable onPress={onAdicionarOuEditar} style={styles.iconActionBtn}>
                <Text style={styles.iconActionText}>Editar</Text>
              </Pressable>
              <Pressable onPress={onRemoverIntervalo} style={styles.removeBtn}>
                <Text style={styles.removeBtnText}>✕</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
      <View style={styles.connectorLine} />
    </View>
  );
}

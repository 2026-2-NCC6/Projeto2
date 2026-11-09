import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { styles } from '@/components/perfil/MonthlyFrequencyCalendarCard.styles';
import { GlassCard } from '@/components/ui/GlassCard';
import {
  metricasPerfilService,
  type DiaCalendarioFrequencia,
  type SessaoEnriquecidaMetricas,
} from '@/services/sessao/metricasPerfilService';

interface MonthlyFrequencyCalendarCardProps {
  sessoesEnriquecidas: SessaoEnriquecidaMetricas[];
}

const CABECALHO_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export function MonthlyFrequencyCalendarCard({
  sessoesEnriquecidas,
}: MonthlyFrequencyCalendarCardProps) {
  const dataInicial = useMemo(() => new Date(), []);
  const [anoAtual, setAnoAtual] = useState(dataInicial.getFullYear());
  const [mesAtual, setMesAtual] = useState(dataInicial.getMonth());
  const [diaSelecionado, setDiaSelecionado] =
    useState<DiaCalendarioFrequencia | null>(null);

  const calendario = useMemo(
    () =>
      metricasPerfilService.gerarCalendarioMensal(
        sessoesEnriquecidas,
        anoAtual,
        mesAtual
      ),
    [sessoesEnriquecidas, anoAtual, mesAtual]
  );

  const slotsVaziosInicio = useMemo(
    () =>
      Array.from(
        { length: calendario.offsetInicioSemana },
        (_, idx) => `vazio-${idx}`
      ),
    [calendario.offsetInicioSemana]
  );

  function irParaMesAnterior() {
    setDiaSelecionado(null);
    if (mesAtual === 0) {
      setMesAtual(11);
      setAnoAtual((prev) => prev - 1);
    } else {
      setMesAtual((prev) => prev - 1);
    }
  }

  function irParaProximoMes() {
    setDiaSelecionado(null);
    if (mesAtual === 11) {
      setMesAtual(0);
      setAnoAtual((prev) => prev + 1);
    } else {
      setMesAtual((prev) => prev + 1);
    }
  }

  return (
    <GlassCard style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.sectionTitle}>
            CALENDÁRIO DE FREQUÊNCIA MENSAL
          </Text>
          <Text style={styles.sectionSubtitle}>
            {calendario.totalDiasTreinadosMes} dias treinados •{' '}
            {calendario.totalSessoesMes} sessões no mês
          </Text>
        </View>

        <View style={styles.monthSelector}>
          <Pressable onPress={irParaMesAnterior} style={styles.monthNavBtn}>
            <Text style={styles.monthNavBtnText}>◀</Text>
          </Pressable>

          <Text style={styles.monthTitleText}>{calendario.tituloMesAno}</Text>

          <Pressable onPress={irParaProximoMes} style={styles.monthNavBtn}>
            <Text style={styles.monthNavBtnText}>▶</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.calendarFrame}>
        {/* Cabeçalho dos dias da semana */}
        <View style={styles.weekDaysRow}>
          {CABECALHO_SEMANA.map((letra, idx) => (
            <View key={`sem-${idx}`} style={styles.weekDayCell}>
              <Text style={styles.weekDayLabel}>{letra}</Text>
            </View>
          ))}
        </View>

        {/* Grade de bolinhas dos dias do mês */}
        <View style={styles.daysGrid}>
          {slotsVaziosInicio.map((chave) => (
            <View key={chave} style={styles.dayCellWrapper}>
              <View style={styles.dayBubbleEmpty} />
            </View>
          ))}

          {calendario.dias.map((itemDia) => {
            const multiplasSessoes = itemDia.quantidadeSessoes >= 2;
            const selecionado =
              diaSelecionado?.chaveData === itemDia.chaveData;

            return (
              <View key={itemDia.chaveData} style={styles.dayCellWrapper}>
                <Pressable
                  onPress={() =>
                    setDiaSelecionado(selecionado ? null : itemDia)
                  }
                  style={[
                    styles.dayBubble,
                    itemDia.treinou && styles.dayBubbleTrained,
                    multiplasSessoes && styles.dayBubbleIntense,
                    itemDia.ehHoje &&
                      !itemDia.treinou &&
                      styles.dayBubbleToday,
                    selecionado && styles.dayBubbleSelected,
                  ]}>
                  <Text
                    style={[
                      styles.dayNumberText,
                      itemDia.treinou && styles.dayNumberTextTrained,
                    ]}>
                    {itemDia.dia}
                  </Text>
                  {itemDia.treinou ? <View style={styles.trainedDot} /> : null}
                </Pressable>
              </View>
            );
          })}
        </View>
      </View>

      {/* Detalhe quando o usuário toca em uma bolinha do calendário */}
      {diaSelecionado ? (
        <View style={styles.selectedDayBanner}>
          <Text style={styles.selectedDayText}>
            Dia {String(diaSelecionado.dia).padStart(2, '0')}/
            {String(mesAtual + 1).padStart(2, '0')}:{' '}
            {diaSelecionado.treinou
              ? `${diaSelecionado.quantidadeSessoes} ${
                  diaSelecionado.quantidadeSessoes === 1
                    ? 'sessão realizada'
                    : 'sessões realizadas'
                }`
              : 'Nenhum treino registrado'}
          </Text>
          {diaSelecionado.treinou ? (
            <Text style={styles.selectedDayScore}>
              +{diaSelecionado.pontuacaoDia} pts
            </Text>
          ) : null}
        </View>
      ) : null}

      {/* Legenda e selo de constância */}
      <View style={styles.legendRow}>
        <View style={styles.legendGroup}>
          <View style={styles.legendItem}>
            <View style={styles.legendBubbleEmpty} />
            <Text style={styles.legendLabel}>Sem treino</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.legendBubbleTrained} />
            <Text style={styles.legendLabel}>1 treino</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.legendBubbleIntense} />
            <Text style={styles.legendLabel}>2+ treinos</Text>
          </View>
        </View>

        <View style={styles.constancyBadge}>
          <Text style={styles.constancyBadgeText}>
            Constância: {calendario.percentualConstanciaMes}%
          </Text>
        </View>
      </View>
    </GlassCard>
  );
}


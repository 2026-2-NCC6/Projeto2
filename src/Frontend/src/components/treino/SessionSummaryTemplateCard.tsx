import { Image } from 'expo-image';
import React from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import type { CircuitoSessaoAtiva } from '@/components/treino/SessionCircuitsList';
import { styles } from '@/components/treino/SessionSummaryTemplateCard.styles';
import { GlassCard } from '@/components/ui/GlassCard';
import { FluxColors } from '@/constants/theme';
import { LIMITE_CARACTERES_LEGENDA } from '@/hooks/useResumoSessao';
import type { ResumoSessaoSnapshot } from '@/services/sessao/sessaoService';

interface SessionSummaryTemplateCardProps {
  resumo: ResumoSessaoSnapshot;
  legenda: string;
  fotoBackgroundUri: string | null;
  onChangeLegenda: (novaLegenda: string) => void;
  onTirarFoto: () => void;
  onEscolherFotoGaleria: () => void;
  onRemoverFoto: () => void;
  onAbrirFormularioManualCiclo: (circuito: CircuitoSessaoAtiva) => void;
}

export function SessionSummaryTemplateCard({
  resumo,
  legenda,
  fotoBackgroundUri,
  onChangeLegenda,
  onTirarFoto,
  onEscolherFotoGaleria,
  onRemoverFoto,
  onAbrirFormularioManualCiclo,
}: SessionSummaryTemplateCardProps) {
  const atingiuLimite = legenda.length >= LIMITE_CARACTERES_LEGENDA;

  return (
    <View style={styles.wrapper}>
      {/* Cabeçalho da Página */}
      <View style={styles.headerSection}>
        <Text style={styles.tag}>CONSOLIDAÇÃO DO TREINO</Text>
        <Text style={styles.screenTitle}>Resumo da Sessão</Text>
        <Text style={styles.screenSubtitle}>
          Personalize seu card quadrado estilo Strava com uma foto do treino ou
          use o fundo padrão com suas métricas e circuitos.
        </Text>
      </View>

      <GlassCard highlighted style={styles.postTemplateCard}>
        {/* Legenda em branco com placeholder e contador 140 caracteres */}
        <View style={styles.captionGroup}>
          <View style={styles.captionLabelRow}>
            <Text style={styles.captionLabel}>LEGENDA DA PUBLICAÇÃO</Text>
            <Text
              style={[
                styles.charCounter,
                atingiuLimite && styles.charCounterLimit,
              ]}>
              {legenda.length}/{LIMITE_CARACTERES_LEGENDA}
            </Text>
          </View>

          <TextInput
            value={legenda}
            onChangeText={onChangeLegenda}
            maxLength={LIMITE_CARACTERES_LEGENDA}
            multiline
            placeholder="Descreva como foi o treino..."
            placeholderTextColor={FluxColors.textMuted}
            style={styles.captionInput}
          />
        </View>

        {/* ================================================================ */}
        {/* IMAGEM QUADRADA (1:1) ESTILO STRAVA COM MÉTRICAS + CIRCUITOS     */}
        {/* ================================================================ */}
        <View style={styles.stravaSquareFrame}>
          {fotoBackgroundUri ? (
            <>
              <Image
                source={{ uri: fotoBackgroundUri }}
                style={styles.squareBackgroundImage}
                contentFit="cover"
              />
              <View style={styles.squareScrimOverlay} />
            </>
          ) : (
            <View style={styles.defaultCourtBg}>
              <View style={styles.courtGlowTopRight} />
              <View style={styles.courtGlowBottomLeft} />
            </View>
          )}

          {/* Topo da Imagem: Título da Sessão + Data + Contador de Circuitos */}
          <View style={styles.squareTopHud}>
            <View style={styles.brandLeftCol}>
              <View style={styles.brandBadgeRow}>
                <Text style={styles.brandLogoText}>⚡ FLUX</Text>
              </View>
              <Text style={styles.squareSessionTitle}>
                Sessão de Treino • Tennis • {resumo.dataSessaoFormatada}
              </Text>
            </View>

            <View style={styles.squareCountPill}>
              <Text style={styles.squareCountPillText}>
                {resumo.circuitos.length}{' '}
                {resumo.circuitos.length === 1 ? 'CIRCUITO' : 'CIRCUITOS'}
              </Text>
            </View>
          </View>

          {/* Base da Imagem: 4 Métricas Principais + Lista de Circuitos */}
          <View style={styles.squareBottomHud}>
            <View style={styles.stravaMetricsGrid}>
              <View style={styles.stravaMetricItem}>
                <Text style={styles.stravaMetricLabel}>TEMPO TOTAL</Text>
                <Text style={styles.stravaMetricValue}>
                  {resumo.tempoTotalFormatado}
                </Text>
              </View>

              <View style={styles.stravaMetricItem}>
                <Text style={styles.stravaMetricLabel}>PONTOS</Text>
                <Text
                  style={[
                    styles.stravaMetricValue,
                    styles.stravaMetricValueAccent,
                  ]}>
                  {resumo.pontuacaoTotal} pts
                </Text>
              </View>

              <View style={styles.stravaMetricItem}>
                <Text style={styles.stravaMetricLabel}>% MÉDIO ACERTO</Text>
                <Text style={styles.stravaMetricValue}>
                  {resumo.percentualMedioAcerto}%
                </Text>
              </View>

              <View style={styles.stravaMetricItem}>
                <Text style={styles.stravaMetricLabel}>TOTAL DE GOLPES</Text>
                <Text style={styles.stravaMetricValue}>
                  {resumo.totalGolpes}
                </Text>
              </View>
            </View>

            {/* Circuitos da Sessão dentro do próprio Template Quadrado */}
            <View style={styles.squareCircuitsBox}>
              <View style={styles.squareCircuitsHeaderRow}>
                <Text style={styles.squareCircuitsHeaderTitle}>
                  CIRCUITOS DA SESSÃO (TOQUE PARA EDITAR)
                </Text>
              </View>

              {resumo.circuitos.length === 0 ? (
                <Text style={styles.squareEmptyCircuitsText}>
                  Nenhum circuito registrado nesta sessão
                </Text>
              ) : (
                <ScrollView
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.squareCircuitsList}>
                  {resumo.circuitos.map((circ) => {
                    const tituloMeta =
                      circ.modo_definicao === 'numero_golpes'
                        ? `Meta: ${circ.meta_golpes ?? 0} golpes`
                        : `Meta: ${
                            circ.meta_tempo_rotulo ??
                            `${circ.meta_tempo_segundos ?? 0}s`
                          } • ${circ.meta_frequencia_min ?? 0} g/m`;

                    return (
                      <Pressable
                        key={circ.id}
                        onPress={() => onAbrirFormularioManualCiclo(circ)}
                        style={styles.squareCircuitRow}>
                        <Text
                          numberOfLines={1}
                          style={styles.squareCircuitMetaText}>
                          {tituloMeta}
                        </Text>

                        <View style={styles.squareCircuitRightGroup}>
                          <Text style={styles.squareCircuitStatsText}>
                            {circ.tempo_total_segundos}s • {circ.total_golpes}g •{' '}
                            {circ.percentual_acerto}%
                          </Text>

                          <View style={styles.squareCircuitPtsBadge}>
                            <Text style={styles.squareCircuitPtsText}>
                              {circ.pontuacao} pts
                            </Text>
                          </View>
                        </View>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          </View>
        </View>

        {/* Barra de Controles de Foto (Tirar Foto / Galeria / Remover) */}
        <View style={styles.photoActionsRow}>
          <Pressable onPress={onTirarFoto} style={styles.photoActionBtn}>
            <Text style={styles.photoActionEmoji}>📷</Text>
            <Text style={styles.photoActionLabel}>Tirar Foto</Text>
          </Pressable>

          <Pressable
            onPress={onEscolherFotoGaleria}
            style={styles.photoActionBtn}>
            <Text style={styles.photoActionEmoji}>🖼️</Text>
            <Text style={styles.photoActionLabel}>Adicionar Foto</Text>
          </Pressable>

          {fotoBackgroundUri ? (
            <Pressable
              onPress={onRemoverFoto}
              style={[styles.photoActionBtn, styles.photoActionBtnDanger]}>
              <Text style={styles.photoActionEmoji}>🗑️</Text>
              <Text style={styles.photoActionLabel}>Remover Foto</Text>
            </Pressable>
          ) : null}
        </View>
      </GlassCard>
    </View>
  );
}

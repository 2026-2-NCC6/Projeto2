import { Image } from 'expo-image';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { styles } from '@/components/feed/PostCard.styles';
import { GlassCard } from '@/components/ui/GlassCard';
import { sessaoService } from '@/services/sessao/sessaoService';
import type { Postagem } from '@/types/api';

interface PostCardProps {
  post: Postagem;
  authorLabel?: string;
  onCurtir: (idPostagem: string) => void;
  onAbrirPost?: (post: Postagem) => void;
}

export function PostCard({
  post,
  authorLabel = 'Atleta FLUX',
  onCurtir,
  onAbrirPost,
}: PostCardProps) {
  const template = sessaoService.interpretarTemplateDaPostagem(
    post.midia_url,
    post.criado_em
  );
  const legendaLimpa = post.legenda?.trim() ?? '';
  const totalComentarios = post.comentarios?.length ?? 0;

  return (
    <GlassCard style={styles.postCard}>
      {/* Cabeçalho do Atleta */}
      <View style={styles.postHeader}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarLetter}>
            {(authorLabel[0] ?? 'F').toUpperCase()}
          </Text>
        </View>
        <View style={styles.authorInfoCol}>
          <Text style={styles.postAuthor}>{authorLabel}</Text>
          <Text style={styles.postTime}>
            {new Date(post.criado_em).toLocaleString('pt-BR')}
          </Text>
        </View>
        <View
          style={
            post.visibilidade === 'privado'
              ? styles.workoutTagPrivate
              : styles.workoutTag
          }>
          <Text
            style={
              post.visibilidade === 'privado'
                ? styles.workoutTagTextPrivate
                : styles.workoutTagText
            }>
            {post.visibilidade === 'privado' ? '🔒 PRIVADO' : '🌐 PÚBLICO'}
          </Text>
        </View>
      </View>

      {/* Legenda Opcional (exibida apenas se o usuário preencheu) */}
      {legendaLimpa.length > 0 ? (
        <Text style={styles.postBody}>{legendaLimpa}</Text>
      ) : null}

      {/* Template Quadrado (1:1) Estilo Strava do Treino */}
      <Pressable
        onPress={() => onAbrirPost?.(post)}
        style={styles.stravaSquareFrame}>
        {template.fotoBackgroundUri ? (
          <>
            <Image
              source={{ uri: template.fotoBackgroundUri }}
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

        {/* Topo do Template */}
        <View style={styles.squareTopHud}>
          <View style={styles.brandLeftCol}>
            <Text style={styles.brandLogoText}>⚡ FLUX</Text>
            <Text style={styles.squareSessionTitle}>
              Sessão de Treino • Tennis • {template.dataSessaoFormatada}
            </Text>
          </View>

          <View style={styles.squareCountPill}>
            <Text style={styles.squareCountPillText}>
              {template.circuitos.length}{' '}
              {template.circuitos.length === 1 ? 'CIRCUITO' : 'CIRCUITOS'}
            </Text>
          </View>
        </View>

        {/* Base do Template: 4 Métricas + Circuitos da Sessão */}
        <View style={styles.squareBottomHud}>
          <View style={styles.stravaMetricsGrid}>
            <View style={styles.stravaMetricItem}>
              <Text style={styles.stravaMetricLabel}>TEMPO TOTAL</Text>
              <Text style={styles.stravaMetricValue}>
                {template.tempoTotalFormatado}
              </Text>
            </View>

            <View style={styles.stravaMetricItem}>
              <Text style={styles.stravaMetricLabel}>PONTOS</Text>
              <Text
                style={[
                  styles.stravaMetricValue,
                  styles.stravaMetricValueAccent,
                ]}>
                {template.pontuacaoTotal} pts
              </Text>
            </View>

            <View style={styles.stravaMetricItem}>
              <Text style={styles.stravaMetricLabel}>% MÉDIO ACERTO</Text>
              <Text style={styles.stravaMetricValue}>
                {template.percentualMedioAcerto}%
              </Text>
            </View>

            <View style={styles.stravaMetricItem}>
              <Text style={styles.stravaMetricLabel}>TOTAL DE GOLPES</Text>
              <Text style={styles.stravaMetricValue}>
                {template.totalGolpes}
              </Text>
            </View>
          </View>

          <View style={styles.squareCircuitsBox}>
            <Text style={styles.squareCircuitsHeaderTitle}>
              CIRCUITOS DA SESSÃO
            </Text>

            {template.circuitos.length === 0 ? (
              <Text style={styles.squareEmptyCircuitsText}>
                Sessão concluída sem circuitos detalhados
              </Text>
            ) : (
              <ScrollView
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.squareCircuitsList}>
                {template.circuitos.map((circ) => (
                  <View key={circ.id} style={styles.squareCircuitRow}>
                    <Text
                      numberOfLines={1}
                      style={styles.squareCircuitMetaText}>
                      {circ.tituloMeta}
                    </Text>

                    <View style={styles.squareCircuitRightGroup}>
                      <Text style={styles.squareCircuitStatsText}>
                        {circ.tempoSegundos}s • {circ.totalGolpes}g •{' '}
                        {circ.percentualAcerto}%
                      </Text>

                      <View style={styles.squareCircuitPtsBadge}>
                        <Text style={styles.squareCircuitPtsText}>
                          {circ.pontuacao} pts
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Pressable>

      {/* Rodapé enxuto: Apenas ícones de Curtir e Comentar */}
      <View style={styles.postActionsRow}>
        <Pressable
          onPress={() => onCurtir(post.id)}
          style={styles.iconActionButton}>
          <Text style={styles.iconActionEmoji}>❤️</Text>
        </Pressable>

        <Pressable
          onPress={() => onAbrirPost?.(post)}
          style={styles.iconActionButton}>
          <Text style={styles.iconActionEmoji}>💬</Text>
          {totalComentarios > 0 ? (
            <Text style={styles.iconActionCount}>{totalComentarios}</Text>
          ) : null}
        </Pressable>
      </View>
    </GlassCard>
  );
}

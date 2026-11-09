import React, { useMemo, useState } from 'react';
import { type LayoutChangeEvent, Text, View } from 'react-native';

import { styles } from '@/components/perfil/EvolutionLineChart.styles';

export interface PontoGraficoLinha {
  id: string;
  rotulo: string;
  subRotulo?: string;
  valorPrincipal: number;
  textoValorPrincipal: string;
  valorSecundario?: number;
  textoValorSecundario?: string;
}

interface EvolutionLineChartProps {
  pontos: PontoGraficoLinha[];
  varianteCor?: 'primary' | 'success';
  valorMaximoFixo?: number;
}

const ALTURA_PLOT = 132;
const PADDING_TOPO = 26;
const PADDING_BASE = 14;
const PADDING_LATERAL = 22;

interface CoordenadaCalculada {
  id: string;
  x: number;
  yPrincipal: number;
  ySecundario: number | null;
  textoValorPrincipal: string;
  textoValorSecundario?: string;
}

interface SegmentoReta {
  chave: string;
  left: number;
  top: number;
  width: number;
  anguloRad: number;
}

function calcularSegmentos(
  coords: Array<{ x: number; y: number }>,
  espessura: number
): SegmentoReta[] {
  const segmentos: SegmentoReta[] = [];
  for (let i = 0; i < coords.length - 1; i += 1) {
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const comprimento = Math.hypot(dx, dy);
    const anguloRad = Math.atan2(dy, dx);
    const meioX = (p1.x + p2.x) / 2;
    const meioY = (p1.y + p2.y) / 2;

    segmentos.push({
      chave: `seg-${i}`,
      left: meioX - comprimento / 2,
      top: meioY - espessura / 2,
      width: comprimento,
      anguloRad,
    });
  }
  return segmentos;
}

export function EvolutionLineChart({
  pontos,
  varianteCor = 'primary',
  valorMaximoFixo,
}: EvolutionLineChartProps) {
  const [larguraCanvas, setLarguraCanvas] = useState(0);

  function handleLayout(event: LayoutChangeEvent) {
    const { width } = event.nativeEvent.layout;
    if (width > 0 && Math.abs(width - larguraCanvas) > 1) {
      setLarguraCanvas(width);
    }
  }

  const { coordenadas, segmentosPrincipais, segmentosSecundarios } =
    useMemo(() => {
      if (larguraCanvas <= 0 || pontos.length === 0) {
        return {
          coordenadas: [] as CoordenadaCalculada[],
          segmentosPrincipais: [] as SegmentoReta[],
          segmentosSecundarios: [] as SegmentoReta[],
        };
      }

      const valores = pontos.flatMap((p) =>
        p.valorSecundario !== undefined
          ? [p.valorPrincipal, p.valorSecundario]
          : [p.valorPrincipal]
      );

      const maxVal = valorMaximoFixo ?? Math.max(...valores, 1);
      const minVal = 0;
      const amplitude = Math.max(1, maxVal - minVal);

      const larguraUtil = Math.max(1, larguraCanvas - PADDING_LATERAL * 2);
      const alturaUtil = ALTURA_PLOT - PADDING_TOPO - PADDING_BASE;

      const coords: CoordenadaCalculada[] = pontos.map((p, idx) => {
        const x =
          pontos.length === 1
            ? larguraCanvas / 2
            : PADDING_LATERAL + (idx / (pontos.length - 1)) * larguraUtil;

        const ratioPrincipal = Math.min(
          1,
          Math.max(0, (p.valorPrincipal - minVal) / amplitude)
        );
        const yPrincipal =
          PADDING_TOPO + (1 - ratioPrincipal) * alturaUtil;

        let ySecundario: number | null = null;
        if (p.valorSecundario !== undefined) {
          const ratioSec = Math.min(
            1,
            Math.max(0, (p.valorSecundario - minVal) / amplitude)
          );
          ySecundario = PADDING_TOPO + (1 - ratioSec) * alturaUtil;
        }

        return {
          id: p.id,
          x,
          yPrincipal,
          ySecundario,
          textoValorPrincipal: p.textoValorPrincipal,
          textoValorSecundario: p.textoValorSecundario,
        };
      });

      const segsPrincipais = calcularSegmentos(
        coords.map((c) => ({ x: c.x, y: c.yPrincipal })),
        2.5
      );

      const coordsComSecundario = coords.filter(
        (c): c is CoordenadaCalculada & { ySecundario: number } =>
          c.ySecundario !== null
      );
      const segsSecundarios =
        coordsComSecundario.length > 1
          ? calcularSegmentos(
              coordsComSecundario.map((c) => ({
                x: c.x,
                y: c.ySecundario,
              })),
              2
            )
          : [];

      return {
        coordenadas: coords,
        segmentosPrincipais: segsPrincipais,
        segmentosSecundarios: segsSecundarios,
      };
    }, [larguraCanvas, pontos, valorMaximoFixo]);

  const estiloLinhaPrincipal =
    varianteCor === 'success'
      ? styles.lineSegmentSuccess
      : styles.lineSegmentPrimary;

  const estiloPontoPrincipal =
    varianteCor === 'success'
      ? styles.pointDotSuccess
      : styles.pointDotPrimary;

  const estiloTextoPrincipal =
    varianteCor === 'success'
      ? styles.pointValueTextSuccess
      : styles.pointValueTextPrimary;

  return (
    <View style={styles.wrapper}>
      <View onLayout={handleLayout} style={styles.plotCanvas}>
        {/* Linhas horizontais de grade */}
        <View style={[styles.gridLine, { top: PADDING_TOPO }]} />
        <View
          style={[
            styles.gridLine,
            { top: Math.round(ALTURA_PLOT / 2) },
          ]}
        />
        <View
          style={[
            styles.gridLine,
            { top: ALTURA_PLOT - PADDING_BASE },
          ]}
        />

        {/* Série Secundária (quando presente, ex: Total de Golpes na Sessão) */}
        {segmentosSecundarios.map((seg) => (
          <View
            key={`sec-${seg.chave}`}
            style={[
              styles.lineSegmentSecondary,
              {
                left: seg.left,
                top: seg.top,
                width: seg.width,
                transform: [{ rotate: `${seg.anguloRad}rad` }],
              },
            ]}
          />
        ))}

        {/* Série Principal */}
        {segmentosPrincipais.map((seg) => (
          <View
            key={`pri-${seg.chave}`}
            style={[
              estiloLinhaPrincipal,
              {
                left: seg.left,
                top: seg.top,
                width: seg.width,
                transform: [{ rotate: `${seg.anguloRad}rad` }],
              },
            ]}
          />
        ))}

        {/* Vértices e Rótulos de Valor */}
        {coordenadas.map((c) => (
          <React.Fragment key={c.id}>
            {c.ySecundario !== null ? (
              <View
                style={[
                  styles.pointDotSecondary,
                  {
                    left: c.x - 4,
                    top: c.ySecundario - 4,
                  },
                ]}
              />
            ) : null}

            <View
              style={[
                estiloPontoPrincipal,
                {
                  left: c.x - 5,
                  top: c.yPrincipal - 5,
                },
              ]}
            />

            <View
              style={[
                styles.pointValueTag,
                {
                  left: c.x - 22,
                  top: Math.max(0, c.yPrincipal - 22),
                },
              ]}>
              <Text style={estiloTextoPrincipal}>
                {c.textoValorPrincipal}
              </Text>
              {c.textoValorSecundario ? (
                <Text style={styles.pointValueTextSecondary}>
                  {c.textoValorSecundario}
                </Text>
              ) : null}
            </View>
          </React.Fragment>
        ))}
      </View>

      {/* Eixo X com Rótulos das Sessões e Datas */}
      <View style={styles.xAxisRow}>
        {pontos.map((p) => (
          <View key={`axis-${p.id}`} style={styles.xAxisCol}>
            <Text style={styles.xAxisLabel}>{p.rotulo}</Text>
            {p.subRotulo ? (
              <Text style={styles.xAxisSubLabel}>{p.subRotulo}</Text>
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}


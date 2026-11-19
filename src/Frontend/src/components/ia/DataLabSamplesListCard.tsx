import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { styles } from '@/components/ia/DataLabSamplesListCard.styles';
import { PlotLinhas } from '@/components/ia/LiveHardwareTelemetryCard';
import { GlassCard } from '@/components/ui/GlassCard';
import { FluxColors } from '@/constants/theme';
import type { AmostraDatalabResponse, AmostraTreinoResponse, TelemetriaFrameItem } from '@/types/api';

interface DataLabSamplesListCardProps {
  amostras?: (AmostraDatalabResponse | AmostraTreinoResponse | any)[];
  onExcluirAmostra: (id: string) => void;
  onReiniciarOuExcluirLote?: (filtros: {
    ids?: string[];
    esporteId?: string;
    movimentoId?: string;
    articulacaoId?: string;
    agenteId?: string;
    reiniciarModelo?: boolean;
    totalExcluir: number;
  }) => Promise<void>;
  carregando?: boolean;
  modeloId?: string;
}

export function DataLabSamplesListCard({
  amostras = [],
  onExcluirAmostra,
  onReiniciarOuExcluirLote,
  carregando = false,
  modeloId = 'flux_tenis',
}: DataLabSamplesListCardProps) {
  // Estado retrátil do card
  const [expandido, setExpandido] = useState(true);

  // Estados dos filtros dinâmicos
  const [filtroGolpe, setFiltroGolpe] = useState<string>('todos');
  const [filtroPosicao, setFiltroPosicao] = useState<string>('todas');
  const [filtroArticulacao, setFiltroArticulacao] = useState<string>('todas');
  const [filtroAgente, setFiltroAgente] = useState<string>('todos');

  // Estado da amostra expandida para gráficos
  const [amostraAbertaId, setAmostraAbertaId] = useState<string | null>(null);

  // Modo de exibição do primeiro gráfico (Aceleração vs Giroscópio)
  const [modoGraficoTriaxial, setModoGraficoTriaxial] = useState<'accel' | 'gyro'>('accel');

  // Modal de confirmação para exclusão em lote / reiniciar modelo
  const [modalConfirmacaoVisivel, setModalConfirmacaoVisivel] = useState(false);
  const [processandoExclusao, setProcessandoExclusao] = useState(false);

  // 1. Extração dinâmica das opções de filtro presentes no dataset
  const opcoesGolpes = useMemo(() => {
    const mapa = new Map<string, string>();
    amostras.forEach((a) => {
      const id = a.movimento_id || a.tipo_movimento || 'desconhecido';
      const rotulo = a.movimento_nome || id.replace(/^tenis_|^padel_|^beach_tennis_/, '').toUpperCase();
      if (!mapa.has(id)) mapa.set(id, rotulo);
    });
    return Array.from(mapa.entries()).map(([value, label]) => ({ value, label }));
  }, [amostras]);

  const opcoesPosicoes = useMemo(() => {
    const set = new Set<string>();
    amostras.forEach((a) => {
      const pos = a.posicao_lateralidade || a.lateralidade;
      if (pos) set.add(pos.toLowerCase());
    });
    return Array.from(set).map((pos) => ({
      value: pos,
      label: pos.charAt(0).toUpperCase() + pos.slice(1),
    }));
  }, [amostras]);

  const opcoesArticulacoes = useMemo(() => {
    const mapa = new Map<string, string>();
    amostras.forEach((a) => {
      const id = a.articulacao_id || 'pulso';
      const rotulo = a.articulacao_nome || (id.charAt(0).toUpperCase() + id.slice(1));
      if (!mapa.has(id)) mapa.set(id, rotulo);
    });
    return Array.from(mapa.entries()).map(([value, label]) => ({ value, label }));
  }, [amostras]);

  const opcoesAgentes = useMemo(() => {
    const mapa = new Map<string, string>();
    amostras.forEach((a) => {
      const id = a.agente_id;
      const rotulo = a.agente_nome || id;
      if (id && !mapa.has(id)) mapa.set(id, rotulo);
    });
    return Array.from(mapa.entries()).map(([value, label]) => ({ value, label }));
  }, [amostras]);

  const temFiltroAtivo =
    filtroGolpe !== 'todos' ||
    filtroPosicao !== 'todas' ||
    filtroArticulacao !== 'todas' ||
    filtroAgente !== 'todos';

  function handleLimparFiltros() {
    setFiltroGolpe('todos');
    setFiltroPosicao('todas');
    setFiltroArticulacao('todas');
    setFiltroAgente('todos');
  }

  // 2. Aplicação dos filtros dinâmicos
  const amostrasFiltradas = useMemo(() => {
    return amostras.filter((a) => {
      const idMov = a.movimento_id || a.tipo_movimento;
      if (filtroGolpe !== 'todos' && idMov !== filtroGolpe && a.movimento_nome !== filtroGolpe) {
        return false;
      }

      const pos = (a.posicao_lateralidade || a.lateralidade || '').toLowerCase();
      if (filtroPosicao !== 'todas' && pos !== filtroPosicao) {
        return false;
      }

      const idArt = a.articulacao_id || '';
      if (filtroArticulacao !== 'todas' && idArt !== filtroArticulacao && a.articulacao_nome !== filtroArticulacao) {
        return false;
      }

      const idAg = a.agente_id || '';
      if (filtroAgente !== 'todos' && idAg !== filtroAgente && a.agente_nome !== filtroAgente) {
        return false;
      }

      return true;
    });
  }, [amostras, filtroGolpe, filtroPosicao, filtroArticulacao, filtroAgente]);

  // Rótulo explicativo dos filtros ativos para o diálogo de confirmação
  const rotuloFiltroAtivo = useMemo(() => {
    const partes: string[] = [];
    if (filtroGolpe !== 'todos') {
      const op = opcoesGolpes.find((o) => o.value === filtroGolpe);
      partes.push(`Golpe: ${op ? op.label : filtroGolpe}`);
    }
    if (filtroPosicao !== 'todas') {
      partes.push(`Posição: ${filtroPosicao}`);
    }
    if (filtroArticulacao !== 'todas') {
      const op = opcoesArticulacoes.find((o) => o.value === filtroArticulacao);
      partes.push(`Articulação: ${op ? op.label : filtroArticulacao}`);
    }
    if (filtroAgente !== 'todos') {
      const op = opcoesAgentes.find((o) => o.value === filtroAgente);
      partes.push(`Agente: ${op ? op.label : filtroAgente}`);
    }
    return partes.join(' • ');
  }, [filtroGolpe, filtroPosicao, filtroArticulacao, filtroAgente, opcoesGolpes, opcoesArticulacoes, opcoesAgentes]);

  async function handleConfirmarExclusao() {
    if (!onReiniciarOuExcluirLote) return;
    setProcessandoExclusao(true);
    try {
      if (temFiltroAtivo) {
        await onReiniciarOuExcluirLote({
          ids: amostrasFiltradas.map((a) => a.id),
          movimentoId: filtroGolpe !== 'todos' ? filtroGolpe : undefined,
          articulacaoId: filtroArticulacao !== 'todas' ? filtroArticulacao : undefined,
          agenteId: filtroAgente !== 'todos' ? filtroAgente : undefined,
          reiniciarModelo: amostrasFiltradas.length >= amostras.length,
          totalExcluir: amostrasFiltradas.length,
        });
      } else {
        await onReiniciarOuExcluirLote({
          reiniciarModelo: true,
          totalExcluir: amostras.length,
        });
      }
      setModalConfirmacaoVisivel(false);
    } catch {
      // Erro tratado pela mutation / toast
    } finally {
      setProcessandoExclusao(false);
    }
  }

  return (
    <>
      <GlassCard highlighted style={styles.card}>
      {/* 1. CABEÇALHO CLICÁVEL (RETRÁTIL) */}
      <Pressable
        onPress={() => setExpandido(!expandido)}
        style={styles.headerPressable}
        accessibilityRole="button"
        accessibilityLabel="Recolher ou expandir amostras catalogadas">
        <View style={styles.headerLeft}>
          <Text style={styles.cardTitle}>📦 Amostras Catalogadas</Text>
          <Text style={styles.cardSubtitle}>
            Consulte, filtre e analise os gráficos cinemáticos das amostras gravadas.
          </Text>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.badgeCount}>
            <Text style={styles.badgeCountText}>
              {amostrasFiltradas.length} de {amostras.length} itens
            </Text>
          </View>

          <View style={styles.toggleBadge}>
            <Text style={styles.toggleBadgeText}>{expandido ? '▲' : '▼'}</Text>
          </View>
        </View>
      </Pressable>

      {/* CORPO EXPANSÍVEL */}
      {expandido ? (
        <View style={styles.bodyContainer}>
          {/* 2. SEÇÃO DE FILTROS DINÂMICOS */}
          <View style={styles.filterSection}>
            <View style={styles.filterHeader}>
              <View style={styles.filterHeaderLeft}>
                <MaterialIcons name="tune" size={15} color={FluxColors.primaryLight} />
                <Text style={styles.filterHeaderTitle}>Filtros do Dataset</Text>
              </View>

              {temFiltroAtivo ? (
                <Pressable
                  onPress={handleLimparFiltros}
                  style={styles.filterClearBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Limpar todos os filtros">
                  <Text style={styles.filterClearText}>Limpar Filtros</Text>
                </Pressable>
              ) : null}
            </View>

            {/* Linha 1: Filtro de Golpes */}
            <View style={styles.filterRow}>
              <Text style={styles.filterRowLabel}>GOLPE:</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterChipsScroll}
                contentContainerStyle={styles.filterChipsContent}>
                <Pressable
                  onPress={() => setFiltroGolpe('todos')}
                  style={[styles.filterChip, filtroGolpe === 'todos' && styles.filterChipActive]}>
                  <Text
                    style={[
                      styles.filterChipText,
                      filtroGolpe === 'todos' && styles.filterChipTextActive,
                    ]}>
                    Todos ({amostras.length})
                  </Text>
                </Pressable>

                {opcoesGolpes.map((op) => {
                  const ativo = filtroGolpe === op.value;
                  const contagem = amostras.filter(
                    (a) => (a.movimento_id || a.tipo_movimento) === op.value
                  ).length;
                  return (
                    <Pressable
                      key={op.value}
                      onPress={() => setFiltroGolpe(ativo ? 'todos' : op.value)}
                      style={[styles.filterChip, ativo && styles.filterChipActive]}>
                      <Text
                        style={[
                          styles.filterChipText,
                          ativo && styles.filterChipTextActive,
                        ]}>
                        {op.label} ({contagem})
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Linha 2: Filtro de Posição / Lateralidade */}
            <View style={styles.filterRow}>
              <Text style={styles.filterRowLabel}>POSIÇÃO / LATERALIDADE:</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterChipsScroll}
                contentContainerStyle={styles.filterChipsContent}>
                <Pressable
                  onPress={() => setFiltroPosicao('todas')}
                  style={[styles.filterChip, filtroPosicao === 'todas' && styles.filterChipActive]}>
                  <Text
                    style={[
                      styles.filterChipText,
                      filtroPosicao === 'todas' && styles.filterChipTextActive,
                    ]}>
                    Todas
                  </Text>
                </Pressable>

                {opcoesPosicoes.map((op) => {
                  const ativo = filtroPosicao === op.value;
                  return (
                    <Pressable
                      key={op.value}
                      onPress={() => setFiltroPosicao(ativo ? 'todas' : op.value)}
                      style={[styles.filterChip, ativo && styles.filterChipActive]}>
                      <Text
                        style={[
                          styles.filterChipText,
                          ativo && styles.filterChipTextActive,
                        ]}>
                        {op.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Linha 3: Filtro de Articulação */}
            {opcoesArticulacoes.length > 0 ? (
              <View style={styles.filterRow}>
                <Text style={styles.filterRowLabel}>ARTICULAÇÃO:</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.filterChipsScroll}
                  contentContainerStyle={styles.filterChipsContent}>
                  <Pressable
                    onPress={() => setFiltroArticulacao('todas')}
                    style={[
                      styles.filterChip,
                      filtroArticulacao === 'todas' && styles.filterChipActive,
                    ]}>
                    <Text
                      style={[
                        styles.filterChipText,
                        filtroArticulacao === 'todas' && styles.filterChipTextActive,
                      ]}>
                      Todas
                    </Text>
                  </Pressable>

                  {opcoesArticulacoes.map((op) => {
                    const ativo = filtroArticulacao === op.value;
                    return (
                      <Pressable
                        key={op.value}
                        onPress={() => setFiltroArticulacao(ativo ? 'todas' : op.value)}
                        style={[styles.filterChip, ativo && styles.filterChipActive]}>
                        <Text
                          style={[
                            styles.filterChipText,
                            ativo && styles.filterChipTextActive,
                          ]}>
                          {op.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            ) : null}

            {/* Linha 4: Filtro de Agente de Teste */}
            {opcoesAgentes.length > 0 ? (
              <View style={styles.filterRow}>
                <Text style={styles.filterRowLabel}>AGENTE DE TESTE:</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.filterChipsScroll}
                  contentContainerStyle={styles.filterChipsContent}>
                  <Pressable
                    onPress={() => setFiltroAgente('todos')}
                    style={[styles.filterChip, filtroAgente === 'todos' && styles.filterChipActive]}>
                    <Text
                      style={[
                        styles.filterChipText,
                        filtroAgente === 'todos' && styles.filterChipTextActive,
                      ]}>
                      Todos
                    </Text>
                  </Pressable>

                  {opcoesAgentes.map((op) => {
                    const ativo = filtroAgente === op.value;
                    return (
                      <Pressable
                        key={op.value}
                        onPress={() => setFiltroAgente(ativo ? 'todos' : op.value)}
                        style={[styles.filterChip, ativo && styles.filterChipActive]}>
                        <Text
                          style={[
                            styles.filterChipText,
                            ativo && styles.filterChipTextActive,
                          ]}>
                          {op.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            ) : null}

            <View style={styles.filterSummaryRow}>
              <Text style={styles.filterSummaryText}>
                Exibindo {amostrasFiltradas.length} de {amostras.length} amostras
              </Text>

              {amostras.length > 0 && onReiniciarOuExcluirLote ? (
                <Pressable
                  onPress={() => setModalConfirmacaoVisivel(true)}
                  style={[styles.resetBtn, amostrasFiltradas.length === 0 && styles.resetBtnDisabled]}
                  disabled={amostrasFiltradas.length === 0 || processandoExclusao}
                  accessibilityRole="button"
                  accessibilityLabel={
                    temFiltroAtivo
                      ? `Excluir ${amostrasFiltradas.length} amostras filtradas`
                      : 'Reiniciar modelo e limpar todas as amostras'
                  }>
                  <MaterialIcons
                    name={temFiltroAtivo ? 'delete-sweep' : 'restart-alt'}
                    size={15}
                    color="#EF4444"
                  />
                  <Text style={styles.resetBtnText}>
                    {temFiltroAtivo
                      ? `Apagar Filtradas (${amostrasFiltradas.length})`
                      : 'Reiniciar Modelo (Apagar Todas)'}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>

          {/* 3. LISTAGEM DE AMOSTRAS EXPANDÍVEIS */}
          {amostrasFiltradas.length === 0 ? (
            <View style={styles.emptyBox}>
              <MaterialIcons name="inbox" size={32} color={FluxColors.textSecondary} />
              <Text style={styles.emptyText}>
                {carregando
                  ? 'Carregando amostras...'
                  : temFiltroAtivo
                    ? 'Nenhuma amostra encontrada com os filtros selecionados.'
                    : 'Nenhuma amostra gravada ainda. Conecte o sensor e capture o primeiro movimento!'}
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {amostrasFiltradas.map((amostra: any) => {
                const aberta = amostraAbertaId === amostra.id;
                const hora = new Date(amostra.coletado_em).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });
                const dataFormatada = new Date(amostra.coletado_em).toLocaleDateString([], {
                  day: '2-digit',
                  month: '2-digit',
                });

                const nomeMovimento = amostra.movimento_nome || amostra.tipo_movimento || 'Movimento';
                const nomeEsporte = amostra.esporte_nome || amostra.esporte || 'Tênis';
                const nomeArticulacao = amostra.articulacao_nome || 'Pulso';
                const posicao = (amostra.posicao_lateralidade || amostra.lateralidade || 'direita').toUpperCase();
                const nomeAgente = amostra.agente_nome ? ` • ${amostra.agente_nome}` : '';

                // Extração segura dos frames
                let framesArr: TelemetriaFrameItem[] = [];
                if (Array.isArray(amostra.frames)) {
                  framesArr = amostra.frames;
                } else if (typeof amostra.frames_json === 'string') {
                  try {
                    framesArr = JSON.parse(amostra.frames_json);
                  } catch {
                    framesArr = [];
                  }
                }

                return (
                  <View
                    key={amostra.id}
                    style={[styles.sampleCard, aberta && styles.sampleCardActive]}>
                    {/* CABEÇALHO DO ITEM (TOQUE PARA EXPANDIR / RECOLHER) */}
                    <Pressable
                      onPress={() => setAmostraAbertaId(aberta ? null : amostra.id)}
                      style={styles.sampleHeaderPressable}
                      accessibilityRole="button"
                      accessibilityLabel={`Amostra de ${nomeMovimento}`}>
                      <View style={styles.sampleLeft}>
                        <View style={styles.sampleTopRow}>
                          <View style={styles.sampleTypeBadge}>
                            <Text style={styles.sampleTypeText}>
                              {nomeEsporte} • {nomeMovimento}
                            </Text>
                          </View>

                          <View style={styles.samplePositionBadge}>
                            <Text style={styles.samplePositionText}>
                              {posicao} ({nomeArticulacao})
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.sampleMetaText}>
                          {amostra.total_frames || framesArr.length} frames • {amostra.duracao_ms} ms
                        </Text>

                        <Text style={styles.sampleMetaSub}>
                          {dataFormatada} às {hora} por {amostra.autor_username || 'dev'}{nomeAgente}
                        </Text>

                        {amostra.notas ? (
                          <Text style={styles.sampleNote}>"{amostra.notas}"</Text>
                        ) : null}
                      </View>

                      <View style={styles.sampleActionsRow}>
                        <View style={styles.expandIconBtn}>
                          <MaterialIcons
                            name={aberta ? 'expand-less' : 'expand-more'}
                            size={20}
                            color={FluxColors.primaryLight}
                          />
                        </View>

                        <Pressable
                          onPress={() => onExcluirAmostra(amostra.id)}
                          style={styles.deleteBtn}
                          accessibilityLabel="Excluir amostra do dataset">
                          <MaterialIcons name="delete-outline" size={17} color="#EF4444" />
                        </Pressable>
                      </View>
                    </Pressable>

                    {/* CONTEÚDO EXPANDIDO: MÉTRICAS + 2 GRÁFICOS DE LINHAS */}
                    {aberta ? (
                      <SampleTelemetryDetails
                        frames={framesArr}
                        duracaoMs={amostra.duracao_ms}
                        taxaHz={amostra.taxa_amostragem_hz ?? 20}
                        modoTriaxial={modoGraficoTriaxial}
                        onChangeModoTriaxial={setModoGraficoTriaxial}
                      />
                    ) : null}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      ) : null}
      </GlassCard>

      {/* MODAL DE CONFIRMAÇÃO DE REINICIALIZAÇÃO / EXCLUSÃO EM LOTE */}
      <Modal
        visible={modalConfirmacaoVisivel}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!processandoExclusao) setModalConfirmacaoVisivel(false);
        }}>
        <View style={styles.resetModalOverlay}>
          <View style={styles.resetModalCard}>
            <View style={styles.resetModalHeader}>
              <MaterialIcons
                name={temFiltroAtivo ? 'delete-sweep' : 'warning'}
                size={22}
                color="#EF4444"
              />
              <Text style={styles.resetModalTitle}>
                {temFiltroAtivo ? 'Excluir Amostras Filtradas?' : 'Reiniciar Modelo de IA?'}
              </Text>
            </View>

            <Text style={styles.resetModalBody}>
              {temFiltroAtivo
                ? `Você está prestes a excluir definitivamente ${amostrasFiltradas.length} amostra(s) correspondente(s) aos filtros: "${rotuloFiltroAtivo}".`
                : `Você está prestes a APAGAR TODAS as ${amostras.length} amostras do banco de dados e do disco, reiniciando o modelo "${modeloId}".`}
            </Text>

            <View style={styles.resetModalAlertBox}>
              <Text style={styles.resetModalAlertText}>
                {temFiltroAtivo
                  ? '⚠️ Esta ação é irreversível. Os arquivos CSV/JSON vinculados a estas amostras serão removidos.'
                  : '⚠️ ATENÇÃO: Todas as amostras catalogadas, arquivos de dataset e versões treinadas do modelo serão excluídos. O modelo voltará ao estado inicial (v0).'}
              </Text>
            </View>

            <View style={styles.resetModalActions}>
              <Pressable
                onPress={() => setModalConfirmacaoVisivel(false)}
                style={styles.resetModalCancelBtn}
                disabled={processandoExclusao}>
                <Text style={styles.resetModalCancelText}>Cancelar</Text>
              </Pressable>

              <Pressable
                onPress={handleConfirmarExclusao}
                style={styles.resetModalConfirmBtn}
                disabled={processandoExclusao}>
                {processandoExclusao ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.resetModalConfirmText}>
                    {temFiltroAtivo ? 'Sim, Excluir' : 'Sim, Reiniciar Tudo'}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

interface SampleTelemetryDetailsProps {
  frames: TelemetriaFrameItem[];
  duracaoMs: number;
  taxaHz: number;
  modoTriaxial: 'accel' | 'gyro';
  onChangeModoTriaxial: (modo: 'accel' | 'gyro') => void;
}

function SampleTelemetryDetails({
  frames,
  duracaoMs,
  taxaHz,
  modoTriaxial,
  onChangeModoTriaxial,
}: SampleTelemetryDetailsProps) {
  // Séries temporais de aceleração
  const serieAx = useMemo(() => frames.map((f) => f.ax ?? 0), [frames]);
  const serieAy = useMemo(() => frames.map((f) => f.ay ?? 0), [frames]);
  const serieAz = useMemo(() => frames.map((f) => f.az ?? 0), [frames]);

  // Séries temporais de giroscópio
  const serieGx = useMemo(() => frames.map((f) => f.gx ?? 0), [frames]);
  const serieGy = useMemo(() => frames.map((f) => f.gy ?? 0), [frames]);
  const serieGz = useMemo(() => frames.map((f) => f.gz ?? 0), [frames]);

  // Série temporal da resultante |A|
  const serieRes = useMemo(() => {
    return frames.map((f) => {
      if (f.resultante_accel !== undefined) return f.resultante_accel;
      return Math.sqrt((f.ax ?? 0) ** 2 + (f.ay ?? 0) ** 2 + (f.az ?? 0) ** 2);
    });
  }, [frames]);

  // Métricas calculadas
  const maxAccel = useMemo(() => {
    if (serieRes.length === 0) return 0;
    return Math.max(...serieRes);
  }, [serieRes]);

  const maxGyro = useMemo(() => {
    if (frames.length === 0) return 0;
    return frames.reduce(
      (max, f) => Math.max(max, Math.abs(f.gx ?? 0), Math.abs(f.gy ?? 0), Math.abs(f.gz ?? 0)),
      0
    );
  }, [frames]);

  // Limites dinâmicos para o gráfico triaxial
  const minAccelY = useMemo(() => {
    const minVal = Math.min(0, ...serieAx, ...serieAy, ...serieAz);
    return Math.min(-25, Math.floor(minVal * 1.15));
  }, [serieAx, serieAy, serieAz]);

  const maxAccelY = useMemo(() => {
    const maxVal = Math.max(0, ...serieAx, ...serieAy, ...serieAz);
    return Math.max(25, Math.ceil(maxVal * 1.15));
  }, [serieAx, serieAy, serieAz]);

  const minGyroY = useMemo(() => {
    const minVal = Math.min(0, ...serieGx, ...serieGy, ...serieGz);
    return Math.min(-12, Math.floor(minVal * 1.2));
  }, [serieGx, serieGy, serieGz]);

  const maxGyroY = useMemo(() => {
    const maxVal = Math.max(0, ...serieGx, ...serieGy, ...serieGz);
    return Math.max(12, Math.ceil(maxVal * 1.2));
  }, [serieGx, serieGy, serieGz]);

  const maxResY = useMemo(() => {
    return Math.max(35, Math.ceil(maxAccel * 1.15));
  }, [maxAccel]);

  if (frames.length < 2) {
    return (
      <View style={styles.expandedContainer}>
        <Text style={styles.emptyText}>
          Amostra com dados insuficientes para traçado gráfico ({frames.length} frames).
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.expandedContainer}>
      {/* 1. GRADE DE MÉTRICAS DA AMOSTRA */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>|A| MÁX</Text>
          <Text style={styles.metricValue}>{maxAccel.toFixed(1)} m/s²</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>GIRO MÁX</Text>
          <Text style={styles.metricValue}>{maxGyro.toFixed(2)} rad/s</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>DURAÇÃO</Text>
          <Text style={styles.metricValue}>{duracaoMs} ms</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>FRAMES</Text>
          <Text style={styles.metricValue}>{frames.length} ({taxaHz.toFixed(0)}Hz)</Text>
        </View>
      </View>

      {/* SELETOR DO GRÁFICO 1: ACELERAÇÃO OU GIROSCÓPIO */}
      <View style={styles.chartSwitchRow}>
        <Text style={styles.chartSwitchLabel}>
          {modoTriaxial === 'accel'
            ? '📊 Gráfico 1: Aceleração nos 3 Eixos'
            : '🌀 Gráfico 1: Giroscópio nos 3 Eixos'}
        </Text>
        <View style={styles.chartSwitchTabs}>
          <Pressable
            onPress={() => onChangeModoTriaxial('accel')}
            style={[styles.chartTabBtn, modoTriaxial === 'accel' && styles.chartTabBtnActive]}>
            <Text
              style={[
                styles.chartTabBtnText,
                modoTriaxial === 'accel' && styles.chartTabBtnTextActive,
              ]}>
              Aceleração (X, Y, Z)
            </Text>
          </Pressable>
          <Pressable
            onPress={() => onChangeModoTriaxial('gyro')}
            style={[styles.chartTabBtn, modoTriaxial === 'gyro' && styles.chartTabBtnActive]}>
            <Text
              style={[
                styles.chartTabBtnText,
                modoTriaxial === 'gyro' && styles.chartTabBtnTextActive,
              ]}>
              Giroscópio (X, Y, Z)
            </Text>
          </Pressable>
        </View>
      </View>

      {/* GRÁFICO 1: ACELERAÇÃO TRIAXIAL (OU GIROSCÓPIO) */}
      <View style={styles.chartBox}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>
            {modoTriaxial === 'accel' ? 'Aceleração Triaxial (m/s²)' : 'Velocidade Angular (rad/s)'}
          </Text>
          <View style={styles.legendRow}>
            {modoTriaxial === 'accel' ? (
              <>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, styles.legendDotAx]} />
                  <Text style={styles.legendText}>Ax</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, styles.legendDotAy]} />
                  <Text style={styles.legendText}>Ay</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, styles.legendDotAz]} />
                  <Text style={styles.legendText}>Az</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, styles.legendDotGx]} />
                  <Text style={styles.legendText}>Gx</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, styles.legendDotGy]} />
                  <Text style={styles.legendText}>Gy</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, styles.legendDotGz]} />
                  <Text style={styles.legendText}>Gz</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {modoTriaxial === 'accel' ? (
          <PlotLinhas
            series={[
              { id: 'ax', nome: 'Ax', cor: '#EF4444', valores: serieAx },
              { id: 'ay', nome: 'Ay', cor: '#10B981', valores: serieAy },
              { id: 'az', nome: 'Az', cor: '#38BDF8', valores: serieAz },
            ]}
            minY={minAccelY}
            maxY={maxAccelY}
            altura={110}
            temLinhaZero={true}
          />
        ) : (
          <PlotLinhas
            series={[
              { id: 'gx', nome: 'Gx', cor: '#F43F5E', valores: serieGx },
              { id: 'gy', nome: 'Gy', cor: '#A855F7', valores: serieGy },
              { id: 'gz', nome: 'Gz', cor: '#06B6D4', valores: serieGz },
            ]}
            minY={minGyroY}
            maxY={maxGyroY}
            altura={110}
            temLinhaZero={true}
          />
        )}

        <View style={styles.chartFooter}>
          <Text style={styles.chartFooterText}>Início 0 ms</Text>
          <Text style={styles.chartFooterText}>
            {modoTriaxial === 'accel'
              ? `Escala: ${minAccelY} a +${maxAccelY} m/s²`
              : `Escala: ${minGyroY} a +${maxGyroY} rad/s`}
          </Text>
          <Text style={styles.chartFooterText}>Fim {duracaoMs} ms</Text>
        </View>
      </View>

      {/* GRÁFICO 2: ACELERAÇÃO RESULTANTE (|A|) */}
      <View style={styles.chartBox}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>💥 Gráfico 2: Aceleração Resultante |A|</Text>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendDotRes]} />
              <Text style={styles.legendText}>
                |A| Pico: {maxAccel.toFixed(1)} m/s²
              </Text>
            </View>
          </View>
        </View>

        <PlotLinhas
          series={[
            { id: 'res', nome: '|A|', cor: '#F59E0B', valores: serieRes },
          ]}
          minY={0}
          maxY={maxResY}
          altura={110}
          temLinhaZero={false}
          linhaReferenciaY={25}
        />

        <View style={styles.chartFooter}>
          <Text style={styles.chartFooterText}>Início 0 ms</Text>
          <Text style={styles.chartFooterText}>
            0 a {maxResY} m/s² (Tracejado: 25 m/s² corte de impacto)
          </Text>
          <Text style={styles.chartFooterText}>Fim {duracaoMs} ms</Text>
        </View>
      </View>
    </View>
  );
}

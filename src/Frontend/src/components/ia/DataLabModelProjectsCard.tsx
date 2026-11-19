import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { CreateModelModal } from '@/components/ia/CreateModelModal';
import { styles } from '@/components/ia/DataLabModelProjectsCard.styles';
import { GlassCard, PrimaryButton } from '@/components/ui/GlassCard';
import { GlassSelectBox } from '@/components/ui/GlassSelectBox';
import {
  useEstatisticasDataLab,
  useMovimentosDataLab,
  useProjetosModelosIA,
  useTreinarModeloIA,
} from '@/hooks';
import type {
  ProjetoModelo,
  TreinarModeloResultado,
} from '@/types/api';

const PROJETOS_PADRAO: ProjetoModelo[] = [
  {
    modelo_id: 'flux_tenis',
    nome: 'flux_tenis',
    esporte_id: 'tenis',
    total_versoes: 1,
    versao_ativa: 'v1.0.0',
    descricao: 'Detecção de Forehand, Backhand e Saque',
    versoes: [
      {
        versao: 'v1.0.0',
        caminho: 'storage/models/flux_tenis/v1.0.0',
        criado_em: new Date().toISOString(),
        acuracia: 94.2,
        total_amostras: 0,
        status: 'pronto',
        formato: 'json_pesos',
        classes: ['forehand', 'backhand', 'saque'],
      },
    ],
  },
  {
    modelo_id: 'flux_padel',
    nome: 'flux_padel',
    esporte_id: 'padel',
    total_versoes: 0,
    versao_ativa: null,
    descricao: 'Detecção de Bandeja, Vibora e Smash',
    versoes: [],
  },
];

const GOLPES_PADRAO_POR_ESPORTE: Record<string, string[]> = {
  tenis: ['Forehand', 'Backhand', 'Saque', 'Smash', 'Slice', 'Repouso'],
  padel: ['Bandeja', 'Vibora', 'Smash', 'Forehand', 'Backhand'],
  beach_tennis: ['Smash', 'Drop Shot', 'Forehand', 'Backhand', 'Saque'],
};

interface DataLabModelProjectsCardProps {
  onModeloSelecionado?: (modelo: ProjetoModelo) => void;
  onModeloTreinado?: (resultado: TreinarModeloResultado) => void;
}

export function DataLabModelProjectsCard({
  onModeloSelecionado,
  onModeloTreinado,
}: DataLabModelProjectsCardProps) {
  const router = useRouter();
  const { data: projetosData, isLoading: carregandoProjetos } = useProjetosModelosIA();
  const { data: estatisticas } = useEstatisticasDataLab();
  const treinarMutation = useTreinarModeloIA();

  // Estado de recolher/expandir o painel
  const [expandido, setExpandido] = useState(true);

  const [modeloIdAtivo, setModeloIdAtivo] = useState<string>('flux_tenis');
  const [versaoSelecionada, setVersaoSelecionada] = useState<string | null>(null);
  const [selectAbertoId, setSelectAbertoId] = useState<'modelo' | 'versao' | null>(null);
  const [modalCriarVisivel, setModalCriarVisivel] = useState(false);
  const [resultadoTreino, setResultadoTreino] = useState<TreinarModeloResultado | null>(null);

  const listaProjetos = useMemo(() => {
    if (projetosData && projetosData.length > 0) return projetosData;
    return PROJETOS_PADRAO;
  }, [projetosData]);

  const projetoAtivo: ProjetoModelo = useMemo(() => {
    return (
      listaProjetos.find((p) => p.modelo_id === modeloIdAtivo) ||
      listaProjetos[0] ||
      PROJETOS_PADRAO[0]
    );
  }, [listaProjetos, modeloIdAtivo]);

  // Movimentos cadastrados no catálogo para este esporte
  const { data: movimentosCadastrados } = useMovimentosDataLab(projetoAtivo.esporte_id);

  // Opções para o GlassSelectBox de Modelos (apenas o identificador/nome do modelo, ex: flux_tenis)
  const opcoesSelect = useMemo(() => {
    return listaProjetos.map((p) => ({
      label: p.modelo_id,
      value: p.modelo_id,
    }));
  }, [listaProjetos]);

  // Versões disponíveis para o modelo ativo
  const versoesDisponiveis = useMemo(() => {
    return projetoAtivo.versoes || [];
  }, [projetoAtivo.versoes]);

  // Opções para o GlassSelectBox de Versões (apenas a versão limpa)
  const opcoesVersoes = useMemo(() => {
    if (versoesDisponiveis.length === 0) {
      return [{ label: 'v0 (Não gerado)', value: 'v0' }];
    }
    return versoesDisponiveis.map((v) => ({
      label: v.versao,
      value: v.versao,
    }));
  }, [versoesDisponiveis]);

  // Calcula a próxima versão incremental (v1, v2, v3...)
  const proximaVersao = useMemo(() => {
    const versoes = projetoAtivo.versoes || [];
    if (versoes.length === 0) return 'v1';
    let maxNum = 0;
    for (const v of versoes) {
      const match = v.versao.match(/^v?(\d+)/i);
      if (match) {
        const n = parseInt(match[1], 10);
        if (!isNaN(n) && n > maxNum) maxNum = n;
      }
    }
    return maxNum > 0 ? `v${maxNum + 1}` : `v${versoes.length + 1}`;
  }, [projetoAtivo.versoes]);

  // Versão em que estamos / versão ativa selecionada
  const versaoAtual = useMemo(() => {
    if (
      versaoSelecionada &&
      (versoesDisponiveis.some((v) => v.versao === versaoSelecionada) || versaoSelecionada === 'v0')
    ) {
      return versaoSelecionada;
    }
    if (resultadoTreino?.versao) return resultadoTreino.versao;
    if (projetoAtivo.versao_ativa) return projetoAtivo.versao_ativa;
    if (versoesDisponiveis.length > 0) return versoesDisponiveis[0].versao;
    return 'v0 (Não gerado)';
  }, [versaoSelecionada, versoesDisponiveis, resultadoTreino, projetoAtivo.versao_ativa]);

  // Acurácia da versão selecionada para exibição no card de métricas
  const acuraciaVersao = useMemo(() => {
    if (resultadoTreino && resultadoTreino.versao === versaoAtual) {
      return `${resultadoTreino.acuracia}%`;
    }
    const ver = versoesDisponiveis.find((v) => v.versao === versaoAtual);
    if (ver && ver.acuracia != null && ver.acuracia > 0) {
      return `${ver.acuracia}%`;
    }
    return '--';
  }, [resultadoTreino, versaoAtual, versoesDisponiveis]);

  // Dicionário de distribuição por movimento
  const distribuicao = useMemo(() => {
    return estatisticas?.distribuicao_movimentos ?? {};
  }, [estatisticas]);

  // Lista consolidada de golpes cadastrados para aquele esporte (exibida em lista vertical)
  const listaGolpesEsporte = useMemo(() => {
    const mapa = new Map<string, number>();

    // 1. Adiciona movimentos cadastrados no banco para o esporte
    if (movimentosCadastrados && movimentosCadastrados.length > 0) {
      for (const m of movimentosCadastrados) {
        const qtd =
          distribuicao[m.nome] ??
          distribuicao[m.id] ??
          distribuicao[m.nome.toLowerCase()] ??
          0;
        mapa.set(m.nome, qtd);
      }
    } else {
      // 2. Fallback por esporte conhecido
      const golpesPadrao =
        GOLPES_PADRAO_POR_ESPORTE[projetoAtivo.esporte_id] || GOLPES_PADRAO_POR_ESPORTE.tenis;
      for (const nome of golpesPadrao) {
        const qtd = distribuicao[nome] ?? distribuicao[nome.toLowerCase()] ?? 0;
        mapa.set(nome, qtd);
      }
    }

    // 3. Inclui qualquer outro golpe que já possua amostras salvas
    for (const [chave, qtd] of Object.entries(distribuicao)) {
      if (!mapa.has(chave)) {
        mapa.set(chave, qtd);
      }
    }

    return Array.from(mapa.entries()).map(([nome, qtd]) => ({ nome, qtd }));
  }, [movimentosCadastrados, distribuicao, projetoAtivo.esporte_id]);

  // Total de amostras para o esporte do modelo selecionado
  const totalAmostrasEsporte = useMemo(() => {
    if (estatisticas?.distribuicao_esportes?.[projetoAtivo.esporte_id] !== undefined) {
      return estatisticas.distribuicao_esportes[projetoAtivo.esporte_id];
    }
    const somaGolpes = listaGolpesEsporte.reduce((acc, curr) => acc + curr.qtd, 0);
    if (somaGolpes > 0) return somaGolpes;
    return projetoAtivo.versoes?.[0]?.total_amostras ?? estatisticas?.total_amostras ?? 0;
  }, [estatisticas, projetoAtivo, listaGolpesEsporte]);

  // Maior quantidade de amostras de qualquer versão pronta já gerada para este modelo
  const amostrasUltimoTreino = useMemo(() => {
    const versoes = projetoAtivo.versoes || [];
    if (versoes.length === 0) return 0;
    let maxAmostras = 0;
    for (const v of versoes) {
      if (v.status === 'pronto' && typeof v.total_amostras === 'number') {
        if (v.total_amostras > maxAmostras) {
          maxAmostras = v.total_amostras;
        }
      }
    }
    return maxAmostras;
  }, [projetoAtivo.versoes]);

  // Diferença de amostras para a nova geração
  const diferencaAmostras = useMemo(() => {
    return totalAmostrasEsporte - amostrasUltimoTreino;
  }, [totalAmostrasEsporte, amostrasUltimoTreino]);

  // Regra: só é possível gerar um novo modelo caso o número de amostras tenha aumentado
  const podeGerarModelo = useMemo(() => {
    return totalAmostrasEsporte > 0 && totalAmostrasEsporte > amostrasUltimoTreino;
  }, [totalAmostrasEsporte, amostrasUltimoTreino]);

  const totalFrames = estatisticas?.total_frames ?? 0;

  function handleSelectModelo(novoId: string) {
    setModeloIdAtivo(novoId);
    setResultadoTreino(null);
    setVersaoSelecionada(null);
    setSelectAbertoId(null);
    const selecionado = listaProjetos.find((p) => p.modelo_id === novoId);
    if (selecionado) {
      onModeloSelecionado?.(selecionado);
    }
  }

  function handleNovoModeloCriado(novo: ProjetoModelo) {
    setModeloIdAtivo(novo.modelo_id);
    setResultadoTreino(null);
    setVersaoSelecionada(null);
    setSelectAbertoId(null);
    onModeloSelecionado?.(novo);
  }

  async function handleGerarModelo() {
    if (!projetoAtivo) return;
    try {
      const res = await treinarMutation.mutateAsync({
        modeloId: projetoAtivo.modelo_id,
        payload: {
          versao: proximaVersao,
          esporte_id: projetoAtivo.esporte_id,
        },
      });
      setResultadoTreino(res);
      setVersaoSelecionada(res.versao);
      onModeloTreinado?.(res);
    } catch {
      // Erro gerenciado pela mutation
    }
  }

  function handleIrParaTestador() {
    try {
      router.push({
        pathname: '/testador-ia' as any,
        params: {
          modeloId: projetoAtivo.modelo_id,
          versao: versaoAtual !== 'v0 (Não gerado)' ? versaoAtual : 'v1.0.0',
          esporteId: projetoAtivo.esporte_id,
          modeloNome: projetoAtivo.modelo_id,
        },
      });
    } catch (err) {
      console.error('Erro ao abrir testador:', err);
    }
  }

  const podeTestar =
    versaoAtual !== 'v0 (Não gerado)' &&
    ((projetoAtivo.versoes?.length ?? 0) > 0 || resultadoTreino !== null);

  const nomeEsporteRotulo =
    projetoAtivo.esporte_id === 'tenis'
      ? '🎾 Tênis'
      : projetoAtivo.esporte_id === 'padel'
        ? '🏸 Padel'
        : projetoAtivo.esporte_id === 'beach_tennis'
          ? '🏓 Beach Tennis'
          : `⚽ ${projetoAtivo.esporte_id.toUpperCase()}`;

  return (
    <GlassCard highlighted style={styles.card}>
      {/* 1. CABEÇALHO CLICÁVEL (RETRÁTIL) */}
      <Pressable
        onPress={() => setExpandido(!expandido)}
        style={styles.headerPressable}
        accessibilityRole="button"
        accessibilityLabel="Recolher ou expandir painel do modelo de IA">
        <View style={styles.headerLeft}>
          <Text style={styles.title}>{'🎯 Modelo de IA em Desenvolvimento'}</Text>
          <Text style={styles.subtitle}>
            {'Selecione o modelo e acompanhe o dataset.'}
          </Text>
        </View>

        <View style={styles.headerRight}>
          {!expandido ? (
            <Text style={styles.collapsedSummary} numberOfLines={1}>
              {`${projetoAtivo.modelo_id} • ${versaoAtual}`}
            </Text>
          ) : (
            <View style={styles.badgeStatus}>
              <Text style={styles.badgeStatusText}>{'🟢 MODELO ATIVO'}</Text>
            </View>
          )}

          <View style={styles.toggleBadge}>
            <Text style={styles.toggleBadgeText}>
              {expandido ? '▲' : '▼'}
            </Text>
          </View>
        </View>
      </Pressable>

      {/* CORPO EXPANSÍVEL */}
      {expandido ? (
        <View style={styles.bodyContainer}>
          {/* 2. SELECTBOX DE MODELOS & SELECTBOX DE VERSÕES DO MODELO */}
          <View style={styles.selectStack}>
            {/* SELECTBOX DO MODELO (EXIBE APENAS O NOME DO MODELO: flux_tenis) */}
            <View
              style={[
                styles.selectBoxContainer,
                selectAbertoId === 'modelo' ? styles.selectElevated : styles.selectModel,
              ]}>
              <GlassSelectBox
                label="MODELO ALVO"
                valor={projetoAtivo.modelo_id}
                opcoes={opcoesSelect}
                onSelect={handleSelectModelo}
                placeholder="Selecione o modelo"
                disabled={carregandoProjetos}
                aberto={selectAbertoId === 'modelo'}
                onToggleAberto={(open) => setSelectAbertoId(open ? 'modelo' : null)}
                onAdicionarNovo={() => {
                  setSelectAbertoId(null);
                  setModalCriarVisivel(true);
                }}
                labelAdicionarNovo="Criar Novo Modelo"
              />
            </View>

            {/* SELECTBOX DE VERSÕES RESPECTIVAS DO MODELO ATIVO */}
            <View
              style={[
                styles.selectBoxContainer,
                selectAbertoId === 'versao' ? styles.selectElevated : styles.selectVersion,
              ]}>
              <GlassSelectBox
                label="VERSÃO"
                valor={versaoAtual}
                opcoes={opcoesVersoes}
                onSelect={(val) => {
                  setVersaoSelecionada(val);
                  setSelectAbertoId(null);
                }}
                placeholder="Selecione a versão"
                disabled={carregandoProjetos || versoesDisponiveis.length === 0}
                aberto={selectAbertoId === 'versao'}
                onToggleAberto={(open) => setSelectAbertoId(open ? 'versao' : null)}
              />
            </View>
          </View>

          {/* 3. PAINEL DO DATASET CONSOLIDADO DO MODELO */}
          <View style={styles.datasetCard}>
            <View style={styles.detailsTopRow}>
              <Text style={styles.modelNameTag}>{projetoAtivo.modelo_id}</Text>
              <View style={styles.topBadgesRow}>
                <View style={styles.sportBadge}>
                  <Text style={styles.sportBadgeText}>{nomeEsporteRotulo}</Text>
                </View>
              </View>
            </View>

            {/* MÉTRICAS CHAVE: AMOSTRAS, FRAMES E ACURÁCIA */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>{'Amostras'}</Text>
                <Text style={styles.metricValue}>{totalAmostrasEsporte}</Text>
              </View>

              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>{'Frames'}</Text>
                <Text style={styles.metricValueSecondary}>{totalFrames}</Text>
              </View>

              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>{'Acurácia'}</Text>
                <Text style={styles.metricValueSecondary}>{acuraciaVersao}</Text>
              </View>
            </View>

            {/* LISTA VERTICAL DE GOLPES (UM EMBAIXO DO OUTRO) */}
            <View style={styles.strokesSection}>
              <View style={styles.strokesHeaderRow}>
                <Text style={styles.strokesTitle}>
                  {'GOLPES CADASTRADOS'}
                </Text>
                <Text style={styles.strokesSubBadge}>
                  {`${listaGolpesEsporte.length} golpes`}
                </Text>
              </View>

              <View style={styles.strokesList}>
                {listaGolpesEsporte.map(({ nome, qtd }) => {
                  const temAmostras = qtd > 0;
                  return (
                    <View
                      key={nome}
                      style={[styles.strokeRowItem, temAmostras && styles.strokeRowItemActive]}>
                      <View style={styles.strokeLeft}>
                        <View
                          style={[
                            styles.strokeIndicator,
                            temAmostras && styles.strokeIndicatorActive,
                          ]}
                        />
                        <Text
                          style={[
                            styles.strokeName,
                            temAmostras && styles.strokeNameActive,
                          ]}>
                          {nome}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.strokeBadge,
                          temAmostras && styles.strokeBadgeActive,
                        ]}>
                        <Text
                          style={[
                            styles.strokeBadgeText,
                            temAmostras && styles.strokeBadgeTextActive,
                          ]}>
                          {qtd === 1 ? '1 amostra' : `${qtd} amostras`}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* AÇÕES: GERAR MODELO E TESTAR MODELO */}
            <View style={styles.actionsRow}>
              <View style={styles.actionCol}>
                <PrimaryButton
                  label={
                    treinarMutation.isPending
                      ? 'Gerando Modelo...'
                      : podeGerarModelo
                        ? `Gerar Modelo (${proximaVersao})`
                        : 'Gerar Modelo'
                  }
                  variant="primary"
                  onPress={handleGerarModelo}
                  loading={treinarMutation.isPending}
                  disabled={carregandoProjetos || !podeGerarModelo || treinarMutation.isPending}
                />
              </View>

              <View style={styles.actionCol}>
                <PrimaryButton
                  label="🧪 Testar Modelo"
                  variant="ghost"
                  onPress={handleIrParaTestador}
                  disabled={carregandoProjetos || !podeTestar}
                />
              </View>
            </View>

            {/* AVALIAÇÃO & MÉTRICAS MLOPS */}
            <View style={styles.evaluationBtnRow}>
              <PrimaryButton
                label="📊 Avaliação & Métricas MLOps"
                variant="ghost"
                onPress={() =>
                  router.push({
                    pathname: '/avaliacao-ia' as any,
                    params: {
                      modeloId: projetoAtivo.modelo_id || 'flux_tenis',
                      esporteId: projetoAtivo.esporte_id || 'tenis',
                    },
                  })
                }
                disabled={carregandoProjetos || !podeTestar}
              />
            </View>

            {/* INFORMAÇÃO / AVISO SOBRE STATUS DO DATASET PARA GERAÇÃO */}
            {!podeGerarModelo ? (
              <View style={styles.blockedTrainBanner}>
                <Text style={styles.blockedTrainIcon}>{'ℹ️'}</Text>
                <Text style={styles.blockedTrainText}>
                  {totalAmostrasEsporte === 0
                    ? 'Nenhuma amostra catalogada no dataset. Grave movimentos para poder gerar o modelo.'
                    : `Dataset inalterado (${totalAmostrasEsporte} amostras). O número de amostras precisa aumentar para gerar uma nova versão (${proximaVersao}).`}
                </Text>
              </View>
            ) : (
              <View style={styles.readyTrainBanner}>
                <Text style={styles.readyTrainIcon}>{'✨'}</Text>
                <Text style={styles.readyTrainText}>
                  {amostrasUltimoTreino > 0
                    ? `Pronto para gerar ${proximaVersao}: +${diferencaAmostras} nova(s) amostra(s) no dataset (Total: ${totalAmostrasEsporte})!`
                    : `Pronto para gerar ${proximaVersao}: ${totalAmostrasEsporte} amostra(s) catalogada(s) no dataset!`}
                </Text>
              </View>
            )}

            {/* FEEDBACK DE ERRO NO TREINAMENTO */}
            {treinarMutation.isError ? (
              <View style={styles.trainErrorBanner}>
                <Text style={styles.trainErrorText}>
                  {`❌ ${
                    (treinarMutation.error as any)?.response?.data?.detail ||
                    (treinarMutation.error as any)?.message ||
                    'Falha ao gerar modelo.'
                  }`}
                </Text>
              </View>
            ) : null}

            {/* FEEDBACK DE GERAÇÃO COM SUCESSO */}
            {resultadoTreino ? (
              <View style={styles.trainSuccessBanner}>
                <Text style={styles.trainSuccessText}>
                  {`✅ Modelo ${resultadoTreino.versao} gerado com sucesso (${resultadoTreino.acuracia}% de acurácia com ${resultadoTreino.total_amostras} amostras)!`}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      ) : null}

      {/* 4. MODAL PARA CRIAR NOVO MODELO (SELEÇÃO DE ESPORTE E NOME) */}
      <CreateModelModal
        visivel={modalCriarVisivel}
        onFechar={() => setModalCriarVisivel(false)}
        onCriado={handleNovoModeloCriado}
      />
    </GlassCard>
  );
}

import type { DadosRegistroManualCiclo } from '@/components/treino/ManualCircuitResultModal';
import type { CircuitoSessaoAtiva } from '@/components/treino/SessionCircuitsList';
import type { MovimentoItem, RegistrarCircuitoRequest } from '@/types/api';

export interface ResultadoTickSessao {
  circuitosAtualizados: CircuitoSessaoAtiva[];
  idsCircuitosMetaTempoAtingida: string[];
  descansoFinalizadoNesteTick: boolean;
}

export interface ResultadoConclusaoCircuito {
  circuitosAtualizados: CircuitoSessaoAtiva[];
  circuitoConcluido: CircuitoSessaoAtiva | null;
  iniciouDescanso: boolean;
}

export interface ResultadoNovoGolpe {
  circuitosAtualizados: CircuitoSessaoAtiva[];
  atingiuMetaGolpes: boolean;
}

export interface ResumoSessaoSnapshot {
  dataSessaoFormatada: string;
  tempoTotalSegundos: number;
  tempoTotalFormatado: string;
  pontuacaoTotal: number;
  percentualMedioAcerto: number;
  totalGolpes: number;
  versaoModeloIa: string;
  legendaTemplate: string;
  circuitos: CircuitoSessaoAtiva[];
}

export interface CircuitoTemplatePost {
  id: string;
  tituloMeta: string;
  tempoSegundos: number;
  totalGolpes: number;
  percentualAcerto: number;
  pontuacao: number;
}

export interface TemplatePostagemTreino {
  tipo: 'flux_strava_v1';
  dataSessaoFormatada: string;
  tempoTotalFormatado: string;
  pontuacaoTotal: number;
  percentualMedioAcerto: number;
  totalGolpes: number;
  fotoBackgroundUri: string | null;
  circuitos: CircuitoTemplatePost[];
}

let resumoSessaoPendente: ResumoSessaoSnapshot | null = null;

/**
 * Serviço de domínio para regras de negócio da Sessão Ativa de Treino.
 * Isola cálculos biomecânicos, reordenação de circuitos, controle de intervalos
 * e montagem de payloads da camada de UI/Hooks.
 */
export const sessaoService = {
  /**
   * Formata segundos totais no padrão HH:MM:SS para o cronômetro da sessão.
   */
  formatarDuracaoSessao(segundosTotais: number): string {
    const horas = Math.floor(segundosTotais / 3600);
    const minutos = Math.floor((segundosTotais % 3600) / 60);
    const segundos = segundosTotais % 60;

    const hh = String(horas).padStart(2, '0');
    const mm = String(minutos).padStart(2, '0');
    const ss = String(segundos).padStart(2, '0');

    return `${hh}:${mm}:${ss}`;
  },

  /**
   * Renumera sequencialmente o índice de rodada de todos os circuitos da lista.
   */
  renumerarCircuitos(lista: CircuitoSessaoAtiva[]): CircuitoSessaoAtiva[] {
    return lista.map((item, idx) => ({
      ...item,
      numero_rodada: idx + 1,
    }));
  },

  /**
   * Finaliza os cálculos estatísticos e biomecânicos de um circuito:
   * - Frequência real (golpes/min)
   * - Percentual médio de acerto
   * - Pontuação ponderada
   * - Disparo automático do intervalo de descanso subsequente (se configurado)
   */
  finalizarCalculoCircuito(circ: CircuitoSessaoAtiva): CircuitoSessaoAtiva {
    const tempoFinal = Math.max(1, circ.tempo_total_segundos);
    const totalGolpes = circ.golpes.length;
    const frequenciaReal = Math.round((totalGolpes / tempoFinal) * 60);

    const somaPrecisao = circ.golpes.reduce((acc, g) => acc + g.precisao, 0);
    const percentualAcerto =
      totalGolpes > 0 ? Math.round((somaPrecisao / totalGolpes) * 100) : 0;

    const fatorFreq = 1 + Math.min(frequenciaReal, 60) / 100;
    const pontuacao = Math.round(
      totalGolpes * (percentualAcerto * 1.15) * fatorFreq
    );

    return {
      ...circ,
      status: 'concluido',
      hora_fim: new Date().toISOString(),
      tempo_total_segundos: tempoFinal,
      total_golpes: totalGolpes,
      frequencia_golpes_min: frequenciaReal,
      percentual_acerto: percentualAcerto,
      pontuacao,
      intervalo_apos: circ.intervalo_apos
        ? {
            ...circ.intervalo_apos,
            segundos_restantes: circ.intervalo_apos.duracao_total_segundos,
            status: 'contando',
          }
        : undefined,
    };
  },

  /**
   * Adiciona um novo circuito planejado ao final da lista e renumera.
   */
  adicionarCircuito(
    lista: CircuitoSessaoAtiva[],
    novoCircuito: CircuitoSessaoAtiva
  ): CircuitoSessaoAtiva[] {
    return this.renumerarCircuitos([...lista, novoCircuito]);
  },

  /**
   * Atualiza os dados de um circuito existente na lista.
   */
  atualizarCircuito(
    lista: CircuitoSessaoAtiva[],
    circuitoAtualizado: CircuitoSessaoAtiva
  ): CircuitoSessaoAtiva[] {
    return lista.map((c) =>
      c.id === circuitoAtualizado.id ? circuitoAtualizado : c
    );
  },

  /**
   * Remove um circuito da lista pelo ID e renumera os restantes.
   */
  excluirCircuito(
    lista: CircuitoSessaoAtiva[],
    idCircuito: string
  ): CircuitoSessaoAtiva[] {
    return this.renumerarCircuitos(lista.filter((c) => c.id !== idCircuito));
  },

  /**
   * Move um circuito uma posição para cima ou para baixo e renumera a lista.
   */
  moverOrdemCircuito(
    lista: CircuitoSessaoAtiva[],
    idCircuito: string,
    direcao: 'subir' | 'descer'
  ): CircuitoSessaoAtiva[] {
    const index = lista.findIndex((c) => c.id === idCircuito);
    if (index < 0) return lista;

    const targetIndex = direcao === 'subir' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= lista.length) return lista;

    const copia = [...lista];
    const [movido] = copia.splice(index, 1);
    copia.splice(targetIndex, 0, movido);
    return this.renumerarCircuitos(copia);
  },

  /**
   * Marca o circuito alvo como em execução e zera o cronômetro/golpes da rodada.
   */
  iniciarExecucaoCircuito(
    lista: CircuitoSessaoAtiva[],
    idCircuito: string
  ): CircuitoSessaoAtiva[] {
    return lista.map((c) =>
      c.id === idCircuito
        ? {
            ...c,
            status: 'executando',
            hora_inicio: new Date().toISOString(),
            tempo_total_segundos: 0,
            golpes: [],
          }
        : c
    );
  },

  /**
   * Conclui um circuito específico na lista e informa se o descanso subsequente iniciou.
   */
  concluirCircuitoNaLista(
    lista: CircuitoSessaoAtiva[],
    idCircuito: string
  ): ResultadoConclusaoCircuito {
    let circuitoConcluido: CircuitoSessaoAtiva | null = null;
    let iniciouDescanso = false;

    const circuitosAtualizados = lista.map((c) => {
      if (c.id !== idCircuito || c.status === 'concluido') return c;
      const calculado = this.finalizarCalculoCircuito(c);
      circuitoConcluido = calculado;
      iniciouDescanso = calculado.intervalo_apos?.status === 'contando';
      return calculado;
    });

    return {
      circuitosAtualizados,
      circuitoConcluido,
      iniciouDescanso,
    };
  },

  /**
   * Registra manualmente os dados executados de um ciclo pré-programado (quando o dispositivo não está conectado).
   */
  registrarResultadoManualNoCircuito(
    lista: CircuitoSessaoAtiva[],
    idCircuito: string,
    dados: DadosRegistroManualCiclo
  ): ResultadoConclusaoCircuito {
    let circuitoConcluido: CircuitoSessaoAtiva | null = null;
    let iniciouDescanso = false;

    const precisaoDecimal = Number(
      Math.min(1, Math.max(0, dados.percentualAcerto / 100)).toFixed(2)
    );
    const agoraIso = new Date().toISOString();

    const golpesRegistrados: MovimentoItem[] = Array.from(
      { length: dados.totalGolpes },
      () => ({
        tipo_movimento: dados.tipoGolpePredominante,
        precisao: precisaoDecimal,
        timestamp_execucao: agoraIso,
      })
    );

    const tempoFinal = Math.max(1, dados.tempoTotalSegundos);
    const frequenciaReal = Math.round((dados.totalGolpes / tempoFinal) * 60);
    const fatorFreq = 1 + Math.min(frequenciaReal, 60) / 100;
    const baseAcertoPontuacao =
      dados.golpesAcertados !== undefined ? dados.percentualAcerto : 75;
    const pontuacao = Math.round(
      dados.totalGolpes * (baseAcertoPontuacao * 1.15) * fatorFreq
    );

    const circuitosAtualizados = lista.map((c) => {
      if (c.id !== idCircuito) return c;

      const deveIniciarDescanso =
        c.status !== 'concluido' && Boolean(c.intervalo_apos);
      iniciouDescanso = deveIniciarDescanso;

      const atualizado: CircuitoSessaoAtiva = {
        ...c,
        status: 'concluido',
        hora_inicio: c.hora_inicio || agoraIso,
        hora_fim: agoraIso,
        tempo_total_segundos: tempoFinal,
        total_golpes: dados.totalGolpes,
        frequencia_golpes_min: frequenciaReal,
        percentual_acerto: dados.percentualAcerto,
        pontuacao,
        golpes: golpesRegistrados,
        intervalo_apos: c.intervalo_apos
          ? {
              ...c.intervalo_apos,
              segundos_restantes: deveIniciarDescanso
                ? c.intervalo_apos.duracao_total_segundos
                : c.intervalo_apos.segundos_restantes,
              status: deveIniciarDescanso
                ? 'contando'
                : c.intervalo_apos.status,
            }
          : undefined,
      };

      circuitoConcluido = atualizado;
      return atualizado;
    });

    return {
      circuitosAtualizados,
      circuitoConcluido,
      iniciouDescanso,
    };
  },

  /**
   * Registra um novo golpe recebido do bracelete BLE no circuito em execução.
   */
  registrarGolpeNoCircuito(
    lista: CircuitoSessaoAtiva[],
    idCircuito: string,
    novoGolpe: MovimentoItem
  ): ResultadoNovoGolpe {
    let atingiuMetaGolpes = false;

    const circuitosAtualizados = lista.map((c) => {
      if (c.id !== idCircuito || c.status !== 'executando') return c;

      const novosGolpes = [...c.golpes, novoGolpe];
      if (
        c.modo_definicao === 'numero_golpes' &&
        c.meta_golpes &&
        novosGolpes.length >= c.meta_golpes
      ) {
        atingiuMetaGolpes = true;
      }

      return {
        ...c,
        golpes: novosGolpes,
      };
    });

    return {
      circuitosAtualizados,
      atingiuMetaGolpes,
    };
  },

  /**
   * Processa 1 segundo de avanço nos cronômetros de circuito em execução e intervalos de descanso.
   */
  processarTickSegundo(
    lista: CircuitoSessaoAtiva[],
    idCircuitoExecutando: string | null
  ): ResultadoTickSessao {
    const idsCircuitosMetaTempoAtingida: string[] = [];
    let descansoFinalizadoNesteTick = false;

    const circuitosAtualizados = lista.map((c) => {
      let atualizado = c;

      if (c.id === idCircuitoExecutando && c.status === 'executando') {
        const novoTempo = c.tempo_total_segundos + 1;
        if (
          c.modo_definicao === 'tempo_frequencia' &&
          c.meta_tempo_segundos &&
          novoTempo >= c.meta_tempo_segundos
        ) {
          idsCircuitosMetaTempoAtingida.push(c.id);
        }
        atualizado = {
          ...atualizado,
          tempo_total_segundos: novoTempo,
        };
      }

      if (atualizado.intervalo_apos?.status === 'contando') {
        const novoRestante = Math.max(
          0,
          atualizado.intervalo_apos.segundos_restantes - 1
        );
        if (novoRestante === 0) {
          descansoFinalizadoNesteTick = true;
        }
        atualizado = {
          ...atualizado,
          intervalo_apos: {
            ...atualizado.intervalo_apos,
            segundos_restantes: novoRestante,
            status: novoRestante === 0 ? 'concluido' : 'contando',
          },
        };
      }

      return atualizado;
    });

    return {
      circuitosAtualizados,
      idsCircuitosMetaTempoAtingida,
      descansoFinalizadoNesteTick,
    };
  },

  /**
   * Configura um intervalo de descanso após determinado circuito.
   */
  configurarIntervalo(
    lista: CircuitoSessaoAtiva[],
    idCircuitoAlvo: string,
    duracaoSegundos: number,
    rotuloFormatado: string
  ): { circuitosAtualizados: CircuitoSessaoAtiva[]; iniciouAgora: boolean } {
    let iniciouAgora = false;

    const circuitosAtualizados = lista.map((c) => {
      if (c.id !== idCircuitoAlvo) return c;
      const deveIniciar = c.status === 'concluido';
      if (deveIniciar) {
        iniciouAgora = true;
      }
      return {
        ...c,
        intervalo_apos: {
          duracao_total_segundos: duracaoSegundos,
          segundos_restantes: duracaoSegundos,
          rotulo: rotuloFormatado,
          status: deveIniciar ? 'contando' : 'aguardando',
        },
      };
    });

    return { circuitosAtualizados, iniciouAgora };
  },

  /**
   * Ajusta em +/- segundos um intervalo de descanso que está em contagem regressiva.
   */
  ajustarIntervaloAtivo(
    lista: CircuitoSessaoAtiva[],
    idCircuito: string,
    deltaSegundos: number
  ): { circuitosAtualizados: CircuitoSessaoAtiva[]; zerouDescanso: boolean } {
    let zerouDescanso = false;

    const circuitosAtualizados = lista.map((c) => {
      if (c.id !== idCircuito || c.intervalo_apos?.status !== 'contando') {
        return c;
      }
      const novoRestante = Math.max(
        0,
        c.intervalo_apos.segundos_restantes + deltaSegundos
      );
      if (novoRestante === 0) {
        zerouDescanso = true;
      }
      return {
        ...c,
        intervalo_apos: {
          ...c.intervalo_apos,
          segundos_restantes: novoRestante,
          status: novoRestante === 0 ? 'concluido' : 'contando',
        },
      };
    });

    return { circuitosAtualizados, zerouDescanso };
  },

  /**
   * Pula imediatamente um intervalo de descanso ativo.
   */
  pularIntervalo(
    lista: CircuitoSessaoAtiva[],
    idCircuito: string
  ): CircuitoSessaoAtiva[] {
    return lista.map((c) =>
      c.id === idCircuito && c.intervalo_apos
        ? {
            ...c,
            intervalo_apos: {
              ...c.intervalo_apos,
              segundos_restantes: 0,
              status: 'concluido',
            },
          }
        : c
    );
  },

  /**
   * Remove o intervalo de descanso vinculado a um circuito.
   */
  removerIntervalo(
    lista: CircuitoSessaoAtiva[],
    idCircuito: string
  ): CircuitoSessaoAtiva[] {
    return lista.map((c) =>
      c.id === idCircuito ? { ...c, intervalo_apos: undefined } : c
    );
  },

  /**
   * Monta os payloads de todos os circuitos da sessão para persistência na API (SQLite + TinyDB NoSQL).
   */
  montarPayloadsCircuitosConcluidos(
    lista: CircuitoSessaoAtiva[],
    versaoModeloIa: string
  ): RegistrarCircuitoRequest[] {
    return lista.map((circ) => {
      const consolidado =
        circ.status === 'concluido' ? circ : this.finalizarCalculoCircuito(circ);

      const agoraIso = new Date().toISOString();
      const metadadosCircuito = {
        modo_definicao: consolidado.modo_definicao,
        meta_golpes: consolidado.meta_golpes ?? null,
        meta_tempo_segundos: consolidado.meta_tempo_segundos ?? null,
        meta_tempo_rotulo: consolidado.meta_tempo_rotulo ?? null,
        meta_frequencia_min: consolidado.meta_frequencia_min ?? null,
        tempo_total_segundos: consolidado.tempo_total_segundos,
        total_golpes: consolidado.total_golpes,
        frequencia_golpes_min: consolidado.frequencia_golpes_min,
        percentual_acerto: consolidado.percentual_acerto,
      };

      const movimentosComMetadados: MovimentoItem[] =
        consolidado.golpes.length > 0
          ? consolidado.golpes.map((g, idx) =>
              idx === 0
                ? {
                    ...g,
                    metadados_extras: {
                      ...(g.metadados_extras ?? {}),
                      ...metadadosCircuito,
                    },
                  }
                : g
            )
          : [
              {
                tipo_movimento: 'Ciclo Planejado',
                precisao: Number(
                  Math.min(1, Math.max(0, consolidado.percentual_acerto / 100)).toFixed(2)
                ),
                timestamp_execucao: agoraIso,
                metadados_extras: metadadosCircuito,
              },
            ];

      return {
        numero_rodada: consolidado.numero_rodada,
        hora_inicio: consolidado.hora_inicio || agoraIso,
        hora_fim: consolidado.hora_fim || agoraIso,
        pontuacao: consolidado.pontuacao,
        versao_modelo_ia: versaoModeloIa,
        movimentos: movimentosComMetadados,
      };
    });
  },

  /**
   * Consolida todas as métricas da sessão encerrada (tempo total, pontos, % médio de acerto,
   * total de golpes e lista de circuitos), monta o template do post pré-fabricado
   * e armazena temporariamente para a tela de Resumo da Sessão.
   */
  gerarERegistrarResumoSessao(
    listaCircuitos: CircuitoSessaoAtiva[],
    tempoTotalSegundos: number,
    versaoModeloIa: string
  ): ResumoSessaoSnapshot {
    const circuitosConsolidados = listaCircuitos.map((c) =>
      c.status === 'executando' ? this.finalizarCalculoCircuito(c) : c
    );

    const pontuacaoTotal = circuitosConsolidados.reduce(
      (acc, c) => acc + c.pontuacao,
      0
    );

    const todosGolpes = circuitosConsolidados.flatMap((c) => c.golpes);
    const totalGolpes = todosGolpes.length;

    const somaPrecisao = todosGolpes.reduce((acc, g) => acc + g.precisao, 0);
    const percentualMedioAcerto =
      totalGolpes > 0 ? Math.round((somaPrecisao / totalGolpes) * 100) : 0;

    const tempoTotalFormatado = this.formatarDuracaoSessao(tempoTotalSegundos);
    const dataSessaoFormatada = new Date().toLocaleDateString('pt-BR');

    const snapshot: ResumoSessaoSnapshot = {
      dataSessaoFormatada,
      tempoTotalSegundos,
      tempoTotalFormatado,
      pontuacaoTotal,
      percentualMedioAcerto,
      totalGolpes,
      versaoModeloIa,
      legendaTemplate: '',
      circuitos: circuitosConsolidados,
    };

    resumoSessaoPendente = snapshot;
    return snapshot;
  },

  obterResumoPendente(): ResumoSessaoSnapshot | null {
    return resumoSessaoPendente;
  },

  limparResumoPendente(): void {
    resumoSessaoPendente = null;
  },

  /**
   * Empacota o template quadrado (métricas + circuitos + foto opcional) em JSON para o campo midia_url da Postagem.
   */
  serializarTemplateParaPostagem(
    resumo: ResumoSessaoSnapshot,
    fotoBackgroundUri: string | null
  ): string {
    const payload: TemplatePostagemTreino = {
      tipo: 'flux_strava_v1',
      dataSessaoFormatada: resumo.dataSessaoFormatada,
      tempoTotalFormatado: resumo.tempoTotalFormatado,
      pontuacaoTotal: resumo.pontuacaoTotal,
      percentualMedioAcerto: resumo.percentualMedioAcerto,
      totalGolpes: resumo.totalGolpes,
      fotoBackgroundUri,
      circuitos: resumo.circuitos.map((c) => ({
        id: c.id,
        tituloMeta:
          c.modo_definicao === 'numero_golpes'
            ? `Meta: ${c.meta_golpes ?? 0} golpes`
            : `Meta: ${
                c.meta_tempo_rotulo ?? `${c.meta_tempo_segundos ?? 0}s`
              } • ${c.meta_frequencia_min ?? 0} g/m`,
        tempoSegundos: c.tempo_total_segundos,
        totalGolpes: c.total_golpes,
        percentualAcerto: c.percentual_acerto,
        pontuacao: c.pontuacao,
      })),
    };
    return JSON.stringify(payload);
  },

  /**
   * Reconstrói o TemplatePostagemTreino a partir do campo midia_url e criado_em de um post do Feed.
   */
  interpretarTemplateDaPostagem(
    midiaUrl?: string | null,
    criadoEmIso?: string
  ): TemplatePostagemTreino {
    const dataFallback = criadoEmIso
      ? new Date(criadoEmIso).toLocaleDateString('pt-BR')
      : new Date().toLocaleDateString('pt-BR');

    if (midiaUrl && midiaUrl.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(midiaUrl) as Partial<TemplatePostagemTreino>;
        if (parsed && parsed.tipo === 'flux_strava_v1') {
          return {
            tipo: 'flux_strava_v1',
            dataSessaoFormatada: parsed.dataSessaoFormatada ?? dataFallback,
            tempoTotalFormatado: parsed.tempoTotalFormatado ?? '00:00:00',
            pontuacaoTotal: parsed.pontuacaoTotal ?? 0,
            percentualMedioAcerto: parsed.percentualMedioAcerto ?? 0,
            totalGolpes: parsed.totalGolpes ?? 0,
            fotoBackgroundUri: parsed.fotoBackgroundUri ?? null,
            circuitos: Array.isArray(parsed.circuitos) ? parsed.circuitos : [],
          };
        }
      } catch {
        // Fallback para imagem simples caso não seja JSON
      }
    }

    return {
      tipo: 'flux_strava_v1',
      dataSessaoFormatada: dataFallback,
      tempoTotalFormatado: '00:00:00',
      pontuacaoTotal: 0,
      percentualMedioAcerto: 0,
      totalGolpes: 0,
      fotoBackgroundUri:
        midiaUrl && !midiaUrl.trim().startsWith('{') ? midiaUrl : null,
      circuitos: [],
    };
  },
};


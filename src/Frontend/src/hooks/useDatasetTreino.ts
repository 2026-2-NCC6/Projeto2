import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/services/api';
import type {
  AgenteTesteCreate,
  AgenteTesteItem,
  AmostraDatalabCreate,
  AmostraDatalabResponse,
  ArticulacaoItem,
  AvaliacaoModeloResponse,
  EsporteCreate,
  EsporteItem,
  EstatisticasDatasetResponse,
  MovimentoCreate,
  MovimentoItemDataLab,
  ProjetoModelo,
  ProjetoModeloCreate,
  TelemetriaFrameItem,
  TestarInferenciaResultado,
  TreinarModeloPayload,
  TreinarModeloResultado,
} from '@/types/api';

export const DATALAB_QUERY_KEY = ['datalab'] as const;

// ==========================
// ESPORTES
// ==========================
export function useEsportesDataLab() {
  return useQuery({
    queryKey: [...DATALAB_QUERY_KEY, 'esportes'],
    queryFn: () => api.get<EsporteItem[]>('/modelos-ia/catalogo/esportes'),
  });
}

export function useCriarEsporteDataLab() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dados: EsporteCreate) =>
      api.post<EsporteItem>('/modelos-ia/catalogo/esportes', dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...DATALAB_QUERY_KEY, 'esportes'] });
    },
  });
}

// ==========================
// ARTICULAÇÕES
// ==========================
export function useArticulacoesDataLab() {
  return useQuery({
    queryKey: [...DATALAB_QUERY_KEY, 'articulacoes'],
    queryFn: () => api.get<ArticulacaoItem[]>('/modelos-ia/catalogo/articulacoes'),
  });
}

// ==========================
// MOVIMENTOS (1:N com Esporte)
// ==========================
export function useMovimentosDataLab(esporteId?: string) {
  return useQuery({
    queryKey: [...DATALAB_QUERY_KEY, 'movimentos', esporteId ?? 'todos'],
    queryFn: () => {
      const query = esporteId ? `?esporte_id=${encodeURIComponent(esporteId)}` : '';
      return api.get<MovimentoItemDataLab[]>(`/modelos-ia/catalogo/movimentos${query}`);
    },
  });
}

export function useCriarMovimentoDataLab() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dados: MovimentoCreate) =>
      api.post<MovimentoItemDataLab>('/modelos-ia/catalogo/movimentos', dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...DATALAB_QUERY_KEY, 'movimentos'] });
    },
  });
}

// ==========================
// AGENTES DE TESTE (PERFIL ANTROPOMÉTRICO)
// ==========================
export function useAgentesDataLab() {
  return useQuery({
    queryKey: [...DATALAB_QUERY_KEY, 'agentes'],
    queryFn: () => api.get<AgenteTesteItem[]>('/modelos-ia/catalogo/agentes'),
  });
}

export function useCriarAgenteDataLab() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dados: AgenteTesteCreate) =>
      api.post<AgenteTesteItem>('/modelos-ia/catalogo/agentes', dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...DATALAB_QUERY_KEY, 'agentes'] });
    },
  });
}

// ==========================
// AMOSTRAS DE TREINO (DATASET)
// ==========================
export function useAmostrasDataLab(filtros?: { esporteId?: string; movimentoId?: string; agenteId?: string }) {
  return useQuery({
    queryKey: [...DATALAB_QUERY_KEY, 'amostras', filtros ?? {}],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filtros?.esporteId) params.append('esporte_id', filtros.esporteId);
      if (filtros?.movimentoId) params.append('movimento_id', filtros.movimentoId);
      if (filtros?.agenteId) params.append('agente_id', filtros.agenteId);
      const query = params.toString() ? `?${params.toString()}` : '';
      return api.get<AmostraDatalabResponse[]>(`/modelos-ia/dataset/amostras${query}`);
    },
  });
}

export function useEstatisticasDataLab() {
  return useQuery({
    queryKey: [...DATALAB_QUERY_KEY, 'estatisticas'],
    queryFn: () => api.get<EstatisticasDatasetResponse>('/modelos-ia/dataset/estatisticas'),
  });
}

export function useSalvarAmostraDataLab() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dados: AmostraDatalabCreate) =>
      api.post<AmostraDatalabResponse>('/modelos-ia/dataset/amostras', dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DATALAB_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['modelos-ia'] });
      queryClient.invalidateQueries({ queryKey: [...DATALAB_QUERY_KEY, 'estatisticas'] });
      queryClient.invalidateQueries({ queryKey: [...DATALAB_QUERY_KEY, 'amostras'] });
      queryClient.invalidateQueries({ queryKey: [...DATALAB_QUERY_KEY, 'modelos-projetos'] });
    },
  });
}

export function useExcluirAmostraDataLab() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (idAmostra: string) =>
      api.delete(`/modelos-ia/dataset/amostras/${idAmostra}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DATALAB_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['modelos-ia'] });
      queryClient.invalidateQueries({ queryKey: [...DATALAB_QUERY_KEY, 'estatisticas'] });
      queryClient.invalidateQueries({ queryKey: [...DATALAB_QUERY_KEY, 'amostras'] });
      queryClient.invalidateQueries({ queryKey: [...DATALAB_QUERY_KEY, 'modelos-projetos'] });
    },
  });
}

export function useReiniciarDatasetDataLab() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dados: {
      ids?: string[];
      esporte_id?: string;
      movimento_id?: string;
      articulacao_id?: string;
      agente_id?: string;
      reiniciar_modelo?: boolean;
    }) =>
      api.post<{ sucesso: boolean; total_excluidas: number; modelo_reiniciado: boolean }>(
        '/modelos-ia/dataset/reiniciar',
        dados
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DATALAB_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['modelos-ia'] });
      queryClient.invalidateQueries({ queryKey: [...DATALAB_QUERY_KEY, 'estatisticas'] });
      queryClient.invalidateQueries({ queryKey: [...DATALAB_QUERY_KEY, 'amostras'] });
      queryClient.invalidateQueries({ queryKey: [...DATALAB_QUERY_KEY, 'modelos-projetos'] });
    },
  });
}

// Aliases mantidos para compatibilidade
export const useAmostrasDataset = useAmostrasDataLab;
export const useEstatisticasDataset = useEstatisticasDataLab;
export const useSalvarAmostraDataset = useSalvarAmostraDataLab;
export const useExcluirAmostraDataset = useExcluirAmostraDataLab;
export const useReiniciarDataset = useReiniciarDatasetDataLab;

// ==========================
// MLOPS: PROJETOS E TREINAMENTO DE MODELOS
// ==========================
export function useProjetosModelosIA() {
  return useQuery({
    queryKey: [...DATALAB_QUERY_KEY, 'modelos-projetos'],
    queryFn: () => api.get<ProjetoModelo[]>('/modelos-ia/projetos'),
  });
}

export function useCriarProjetoModeloIA() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dados: ProjetoModeloCreate) =>
      api.post<ProjetoModelo>('/modelos-ia/projetos', dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...DATALAB_QUERY_KEY, 'modelos-projetos'] });
    },
  });
}

export function useTreinarModeloIA() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ modeloId, payload }: { modeloId: string; payload: TreinarModeloPayload }) =>
      api.post<TreinarModeloResultado>(`/modelos-ia/projetos/${encodeURIComponent(modeloId)}/treinar`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...DATALAB_QUERY_KEY, 'modelos-projetos'] });
      queryClient.invalidateQueries({ queryKey: ['modelos-ia'] });
    },
  });
}

export function useTestarInferenciaIA() {
  return useMutation({
    mutationFn: ({
      modeloId,
      versao,
      frames,
    }: {
      modeloId: string;
      versao?: string;
      frames?: TelemetriaFrameItem[];
    }) =>
      api.post<TestarInferenciaResultado>(
        `/modelos-ia/projetos/${encodeURIComponent(modeloId)}/testar`,
        { versao, frames }
      ),
  });
}

export function useAvaliacaoModeloIA(modeloId: string, versao?: string) {
  return useQuery({
    queryKey: [...DATALAB_QUERY_KEY, 'modelo-avaliacao', modeloId, versao || 'default'],
    queryFn: () => {
      const url = `/modelos-ia/projetos/${encodeURIComponent(modeloId)}/avaliacao${
        versao ? `?versao=${encodeURIComponent(versao)}` : ''
      }`;
      return api.get<AvaliacaoModeloResponse>(url);
    },
    enabled: Boolean(modeloId),
  });
}



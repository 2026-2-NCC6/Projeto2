import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { AUTH_QUERY_KEY } from '@/hooks/useAuth';
import { api } from '@/services/api';
import { offlineQueue } from '@/services/offlineQueue';
import type {
  Circuito,
  CircuitoCreate,
  MovimentosCircuitoNoSQL,
  Sessao,
  SessaoCreate,
  SessaoOfflineSyncRequest,
} from '@/types/api';

export function useSessoesUsuario(idUsuario?: string) {
  return useQuery({
    queryKey: ['sessoes', 'usuario', idUsuario],
    queryFn: () => api.get<Sessao[]>(`/sessoes/usuario/${idUsuario}`),
    enabled: Boolean(idUsuario),
  });
}

export function useDetalheSessao(idSessao?: string) {
  return useQuery({
    queryKey: ['sessoes', 'detalhe', idSessao],
    queryFn: () => api.get<Sessao>(`/sessoes/${idSessao}`),
    enabled: Boolean(idSessao),
  });
}

export function useMovimentosCircuito(idCircuito?: string) {
  return useQuery({
    queryKey: ['circuitos', 'movimentos', idCircuito],
    queryFn: () =>
      api.get<MovimentosCircuitoNoSQL>(`/sessoes/circuitos/${idCircuito}/movimentos`),
    enabled: Boolean(idCircuito),
  });
}

export function useIniciarSessao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dados: SessaoCreate) => api.post<Sessao>('/sessoes/', dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessoes'] });
    },
  });
}

export function useFinalizarSessao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (idSessao: string) => api.patch<Sessao>(`/sessoes/${idSessao}/finalizar`),
    onSuccess: (sessao) => {
      queryClient.invalidateQueries({ queryKey: ['sessoes'] });
      queryClient.setQueryData(['sessoes', 'detalhe', sessao.id], sessao);
    },
  });
}

export function useRegistrarCircuito() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ idSessao, dados }: { idSessao: string; dados: CircuitoCreate }) =>
      api.post<Circuito>(`/sessoes/${idSessao}/circuitos`, dados),
    onSuccess: (_circuito, variaveis) => {
      // Atualiza sessão, histórico e XP/Nível do usuário logado automaticamente
      queryClient.invalidateQueries({ queryKey: ['sessoes', 'detalhe', variaveis.idSessao] });
      queryClient.invalidateQueries({ queryKey: ['sessoes'] });
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    },
  });
}

export function useSalvarOuSincronizarSessaoOffline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessaoOffline: SessaoOfflineSyncRequest) => {
      try {
        return await api.post<Sessao>('/sessoes/sincronizar', sessaoOffline);
      } catch {
        // Caso esteja sem internet na quadra, guarda na fila local do AsyncStorage
        await offlineQueue.adicionarSessaoOffline(sessaoOffline);
        return null;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessoes'] });
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    },
  });
}


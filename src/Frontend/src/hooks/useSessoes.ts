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

export function useMapaMovimentosCircuitos(sessoes: Sessao[]) {
  const idsCircuitos = sessoes
    .flatMap((s) => s.circuitos ?? [])
    .filter((c) => Boolean(c.id && c.id_movimentos_nosql))
    .map((c) => c.id);

  const chaveIds = idsCircuitos.join(',');

  return useQuery({
    queryKey: ['circuitos', 'mapa-movimentos', chaveIds],
    queryFn: async () => {
      const mapa: Record<string, MovimentosCircuitoNoSQL> = {};
      await Promise.all(
        idsCircuitos.map(async (idCircuito) => {
          try {
            const doc = await api.get<MovimentosCircuitoNoSQL>(
              `/sessoes/circuitos/${idCircuito}/movimentos`
            );
            mapa[idCircuito] = doc;
          } catch {
            // Ignora caso algum documento NoSQL específico não seja encontrado
          }
        })
      );
      return mapa;
    },
    enabled: idsCircuitos.length > 0,
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

export function useExcluirSessao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (idSessao: string) => api.delete<void>(`/sessoes/${idSessao}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessoes'] });
      queryClient.invalidateQueries({ queryKey: ['circuitos'] });
      queryClient.invalidateQueries({ queryKey: ['social', 'feed'] });
      queryClient.invalidateQueries({ queryKey: ['social'] });
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


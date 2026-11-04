import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/services/api';
import type {
  Estabelecimento,
  EstabelecimentoCreate,
  FavoritoToggleResponse,
} from '@/types/api';

export function useEstabelecimentos(cidade?: string) {
  return useQuery({
    queryKey: ['estabelecimentos', cidade ?? 'todos'],
    queryFn: () =>
      api.get<Estabelecimento[]>(
        cidade ? `/estabelecimentos/?cidade=${encodeURIComponent(cidade)}` : '/estabelecimentos/'
      ),
  });
}

export function useMeusFavoritos() {
  return useQuery({
    queryKey: ['estabelecimentos', 'meus-favoritos'],
    queryFn: () => api.get<Estabelecimento[]>('/estabelecimentos/meus-favoritos'),
  });
}

export function useCadastrarEstabelecimento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dados: EstabelecimentoCreate) =>
      api.post<Estabelecimento>('/estabelecimentos/', dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estabelecimentos'] });
    },
  });
}

export function useFavoritarEstabelecimento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (idEstabelecimento: string) =>
      api.post<FavoritoToggleResponse>(`/estabelecimentos/${idEstabelecimento}/favoritar`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estabelecimentos'] });
    },
  });
}


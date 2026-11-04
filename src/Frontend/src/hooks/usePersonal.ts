import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/services/api';
import type { Cliente, ClienteCreate, ClienteUpdate, Sessao } from '@/types/api';

export function useMeusClientes() {
  return useQuery({
    queryKey: ['personal', 'clientes'],
    queryFn: () => api.get<Cliente[]>('/personal/clientes'),
  });
}

export function useSessoesDoCliente(idCliente?: string) {
  return useQuery({
    queryKey: ['personal', 'clientes', idCliente, 'sessoes'],
    queryFn: () => api.get<Sessao[]>(`/personal/clientes/${idCliente}/sessoes`),
    enabled: Boolean(idCliente),
  });
}

export function useAdicionarCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dados: ClienteCreate) => api.post<Cliente>('/personal/clientes', dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal', 'clientes'] });
    },
  });
}

export function useAtualizarCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ idCliente, dados }: { idCliente: string; dados: ClienteUpdate }) =>
      api.patch<Cliente>(`/personal/clientes/${idCliente}`, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal', 'clientes'] });
    },
  });
}


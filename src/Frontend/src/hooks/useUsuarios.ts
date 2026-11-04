import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { AUTH_QUERY_KEY } from '@/hooks/useAuth';
import { api } from '@/services/api';
import type { Usuario, UsuarioUpdate } from '@/types/api';

export function useUsuario(idUsuario?: string) {
  return useQuery({
    queryKey: ['usuarios', idUsuario],
    queryFn: () => api.get<Usuario>(`/usuarios/${idUsuario}`),
    enabled: Boolean(idUsuario),
  });
}

export function useBuscarUsuarios(termo: string) {
  return useQuery({
    queryKey: ['usuarios', 'buscar', termo],
    queryFn: () => api.get<Usuario[]>(`/usuarios/buscar?q=${encodeURIComponent(termo)}`),
    enabled: termo.trim().length > 0,
  });
}

export function useAtualizarPerfil() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dados: UsuarioUpdate) => api.patch<Usuario>('/usuarios/me', dados),
    onSuccess: (usuarioAtualizado) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, usuarioAtualizado);
      queryClient.invalidateQueries({ queryKey: ['usuarios', usuarioAtualizado.id] });
    },
  });
}


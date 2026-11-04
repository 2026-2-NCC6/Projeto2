import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/services/api';
import { tokenStorage } from '@/services/tokenStorage';
import type { LoginRequest, TokenResponse, Usuario, UsuarioCreate } from '@/types/api';

export const AUTH_QUERY_KEY = ['auth', 'me'] as const;

export function useUsuarioLogado() {
  return useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      const token = await tokenStorage.getToken();
      if (!token) return null;
      return api.get<Usuario>('/auth/me');
    },
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credenciais: LoginRequest) =>
      api.post<TokenResponse>('/auth/login', credenciais),
    onSuccess: async (resposta) => {
      await tokenStorage.setToken(resposta.access_token);
      queryClient.setQueryData(AUTH_QUERY_KEY, resposta.usuario);
    },
  });
}

export function useCadastro() {
  return useMutation({
    mutationFn: (dados: UsuarioCreate) => api.post<Usuario>('/usuarios/', dados),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await tokenStorage.removeToken();
    },
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      queryClient.clear();
    },
  });
}


import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/services/api';
import type {
  Comentario,
  ComentarioCreate,
  CurtidaToggleResponse,
  Postagem,
  PostagemCreate,
  SeguidoresResumo,
  SeguirToggleResponse,
} from '@/types/api';

export function useFeed() {
  return useQuery({
    queryKey: ['social', 'feed'],
    queryFn: () => api.get<Postagem[]>('/social/feed'),
  });
}

export function useSeguidores(idUsuario?: string) {
  return useQuery({
    queryKey: ['social', 'seguidores', idUsuario],
    queryFn: () => api.get<SeguidoresResumo>(`/social/seguidores/${idUsuario}`),
    enabled: Boolean(idUsuario),
  });
}

export function useAlternarSeguir() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (idUsuarioAlvo: string) =>
      api.post<SeguirToggleResponse>(`/social/seguir/${idUsuarioAlvo}`),
    onSuccess: (_res, idUsuarioAlvo) => {
      queryClient.invalidateQueries({ queryKey: ['social', 'seguidores', idUsuarioAlvo] });
      queryClient.invalidateQueries({ queryKey: ['social', 'feed'] });
    },
  });
}

export function usePublicarPostagem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dados: PostagemCreate) => api.post<Postagem>('/social/postagens', dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social', 'feed'] });
    },
  });
}

export function useCurtirPostagem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (idPostagem: string) =>
      api.post<CurtidaToggleResponse>(`/social/postagens/${idPostagem}/curtir`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social', 'feed'] });
    },
  });
}

export function useComentarPostagem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ idPostagem, dados }: { idPostagem: string; dados: ComentarioCreate }) =>
      api.post<Comentario>(`/social/postagens/${idPostagem}/comentarios`, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social', 'feed'] });
    },
  });
}


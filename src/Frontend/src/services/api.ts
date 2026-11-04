import Constants from 'expo-constants';

import { tokenStorage } from '@/services/tokenStorage';

/**
 * Descobre automaticamente o IP da máquina onde o Expo está rodando (para funcionar direto no iPhone via Wi-Fi),
 * ou usa a variável EXPO_PUBLIC_API_URL se definida.
 */
function resolveBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    const ip = debuggerHost.split(':')[0];
    return `http://${ip}:8000`;
  }

  return 'http://127.0.0.1:8000';
}

export const API_BASE_URL = resolveBaseUrl();

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function formatPydanticDetail(detail: unknown): string {
  if (typeof detail === 'string') {
    return detail;
  }

  if (Array.isArray(detail) && detail.length > 0) {
    const mensagens = detail.map((item) => {
      const campo = Array.isArray(item?.loc) ? item.loc[item.loc.length - 1] : 'campo';
      const tipo = item?.type ?? '';

      if (tipo === 'string_too_short') {
        const min = item?.ctx?.min_length ?? '';
        return `O campo "${campo}" deve ter pelo menos ${min} caracteres.`;
      }
      if (tipo === 'value_error' || String(item?.msg ?? '').includes('email')) {
        return `Informe um "${campo}" válido.`;
      }
      if (tipo === 'missing') {
        return `O campo "${campo}" é obrigatório.`;
      }
      return `Verifique o campo "${campo}".`;
    });

    return mensagens.join('\n');
  }

  return 'Não foi possível concluir a solicitação. Verifique os dados informados.';
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await tokenStorage.getToken();

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `Erro na requisição (${response.status})`;
    try {
      const errorBody = await response.json();
      if (errorBody?.detail) {
        errorMessage = formatPydanticDetail(errorBody.detail);
      }
    } catch {
      // mantém mensagem padrão caso não seja JSON
    }
    throw new ApiError(errorMessage, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

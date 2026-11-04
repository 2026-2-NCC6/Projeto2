import AsyncStorage from '@react-native-async-storage/async-storage';

import { api } from '@/services/api';
import type { Sessao, SessaoOfflineSyncRequest } from '@/types/api';

const OFFLINE_SESSIONS_KEY = '@flux:offline_sessions_queue';

export const offlineQueue = {
  async listarFila(): Promise<SessaoOfflineSyncRequest[]> {
    const raw = await AsyncStorage.getItem(OFFLINE_SESSIONS_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as SessaoOfflineSyncRequest[];
    } catch {
      return [];
    }
  },

  async adicionarSessaoOffline(sessao: SessaoOfflineSyncRequest): Promise<void> {
    const filaAtual = await this.listarFila();
    filaAtual.push(sessao);
    await AsyncStorage.setItem(OFFLINE_SESSIONS_KEY, JSON.stringify(filaAtual));
  },

  async sincronizarTudo(): Promise<Sessao[]> {
    const fila = await this.listarFila();
    if (fila.length === 0) return [];

    const sincronizadas: Sessao[] = [];
    const restantes: SessaoOfflineSyncRequest[] = [];

    for (const sessao of fila) {
      try {
        const resultado = await api.post<Sessao>('/sessoes/sincronizar', sessao);
        sincronizadas.push(resultado);
      } catch {
        restantes.push(sessao);
      }
    }

    await AsyncStorage.setItem(OFFLINE_SESSIONS_KEY, JSON.stringify(restantes));
    return sincronizadas;
  },
};


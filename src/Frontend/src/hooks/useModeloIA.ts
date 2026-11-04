import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

import { api, API_BASE_URL } from '@/services/api';
import type { ModalidadeTreino, ModeloIA } from '@/types/api';

const LOCAL_MODEL_META_PREFIX = '@flux:modelo_ia_meta:';

export interface ModeloIALocalInfo {
  versao: string;
  modalidade: ModalidadeTreino;
  localUri: string;
  atualizadoEm: string;
}

export function useModeloIAMaisRecente(modalidade: ModalidadeTreino = 'tenis') {
  return useQuery({
    queryKey: ['modelos-ia', 'mais-recente', modalidade],
    queryFn: () =>
      api.get<ModeloIA>(`/modelos-ia/mais-recente?modalidade=${encodeURIComponent(modalidade)}`),
  });
}

export function useSincronizarModeloOTA(modalidade: ModalidadeTreino = 'tenis') {
  return useMutation({
    mutationFn: async (): Promise<{ atualizado: boolean; info: ModeloIALocalInfo }> => {
      const storageKey = `${LOCAL_MODEL_META_PREFIX}${modalidade}`;
      const localRaw = await AsyncStorage.getItem(storageKey);
      const localInfo: ModeloIALocalInfo | null = localRaw ? JSON.parse(localRaw) : null;

      const remoto = await api.get<ModeloIA>(
        `/modelos-ia/mais-recente?modalidade=${encodeURIComponent(modalidade)}`
      );

      if (localInfo && localInfo.versao === remoto.versao) {
        return { atualizado: false, info: localInfo };
      }

      const downloadUrl = `${API_BASE_URL}/modelos-ia/${remoto.id}/download`;
      let localUri = downloadUrl;

      if (Platform.OS !== 'web') {
        const dir = new Directory(Paths.document, 'modelos_ia');
        if (!dir.exists) {
          dir.create();
        }
        const destino = new File(dir, `flux_${modalidade}_v${remoto.versao}.${remoto.formato}`);
        const downloaded = await File.downloadFileAsync(downloadUrl, destino);
        localUri = downloaded.uri;
      }

      const novaInfo: ModeloIALocalInfo = {
        versao: remoto.versao,
        modalidade,
        localUri,
        atualizadoEm: new Date().toISOString(),
      };

      await AsyncStorage.setItem(storageKey, JSON.stringify(novaInfo));
      return { atualizado: true, info: novaInfo };
    },
  });
}


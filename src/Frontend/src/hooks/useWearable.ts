import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  wearableService,
  type SavedWearableDevice,
  type WearableDeviceInfo,
} from '@/services/wearableService';

export type WearableConnectionStatus = 'desconectado' | 'conectando' | 'conectado';

export type { SavedWearableDevice, WearableDeviceInfo };

export function useWearable() {
  const inicial = wearableService.getDispositivoAtivo();
  const [status, setStatus] = useState<WearableConnectionStatus>(
    inicial ? 'conectado' : 'desconectado'
  );
  const [dispositivo, setDispositivo] = useState<WearableDeviceInfo | null>(inicial);
  const [dispositivosSalvos, setDispositivosSalvos] = useState<SavedWearableDevice[]>([]);
  const [idConectando, setIdConectando] = useState<string | null>(null);
  const [erroConexao, setErroConexao] = useState<string | null>(null);

  const infoPlataforma = useMemo(
    () => wearableService.verificarSuporteBluetooth(),
    []
  );

  const carregarDispositivosSalvos = useCallback(async () => {
    const lista = await wearableService.listarDispositivosSalvos();
    setDispositivosSalvos(lista);
  }, []);

  useEffect(() => {
    void carregarDispositivosSalvos();

    const cancelarInscricao = wearableService.inscreverMudancaEstado((dev) => {
      setDispositivo(dev);
      setStatus(dev ? 'conectado' : 'desconectado');
    });

    return cancelarInscricao;
  }, [carregarDispositivosSalvos]);

  const conectarDispositivo = useCallback(
    async (alvo?: { id?: string; nome?: string }): Promise<boolean> => {
      setErroConexao(null);
      setStatus('conectando');
      setIdConectando(alvo?.id ?? 'novo');

      try {
        const info = await wearableService.conectar(alvo);
        setDispositivo(info);
        setStatus('conectado');
        setIdConectando(null);
        await carregarDispositivosSalvos();
        return true;
      } catch {
        setStatus('desconectado');
        setDispositivo(null);
        setIdConectando(null);
        setErroConexao('Dispositivo não encontrado');
        return false;
      }
    },
    [carregarDispositivosSalvos]
  );

  const desconectarDispositivo = useCallback(async () => {
    await wearableService.desconectar();
    setDispositivo(null);
    setStatus('desconectado');
    setIdConectando(null);
    setErroConexao(null);
  }, []);

  return {
    status,
    estaConectado: status === 'conectado',
    estaConectando: status === 'conectando',
    idConectando,
    dispositivo,
    dispositivosSalvos,
    erroConexao,
    infoPlataforma,
    conectarDispositivo,
    desconectarDispositivo,
  };
}

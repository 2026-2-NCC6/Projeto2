import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  wearableService,
  type SavedWearableDevice,
  type TelemetriaIMUItem,
  type WearableDeviceInfo,
} from '@/services/wearableService';

export type WearableConnectionStatus = 'desconectado' | 'conectando' | 'conectado';

export type { SavedWearableDevice, TelemetriaIMUItem, WearableDeviceInfo };

export function useWearable() {
  const inicial = wearableService.getDispositivoAtivo();
  const [status, setStatus] = useState<WearableConnectionStatus>(
    inicial ? 'conectado' : 'desconectado'
  );
  const [dispositivo, setDispositivo] = useState<WearableDeviceInfo | null>(inicial);
  const [telemetriaAoVivo, setTelemetriaAoVivo] = useState<TelemetriaIMUItem | null>(
    wearableService.getUltimaTelemetria()
  );
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
      if (!dev) {
        setTelemetriaAoVivo(null);
      }
    });

    return cancelarInscricao;
  }, [carregarDispositivosSalvos]);

  useEffect(() => {
    let ultimoUpdate = 0;
    const cancelarTelemetria = wearableService.inscreverTelemetria((dados) => {
      const agora = Date.now();
      // Throttle de ~80ms para manter a interface fluida sem engasgos de re-render
      if (agora - ultimoUpdate >= 80) {
        ultimoUpdate = agora;
        setTelemetriaAoVivo(dados);
      }
    });

    return cancelarTelemetria;
  }, []);

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
        setTelemetriaAoVivo(null);
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
    setTelemetriaAoVivo(null);
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
    telemetriaAoVivo,
    erroConexao,
    infoPlataforma,
    conectarDispositivo,
    desconectarDispositivo,
  };
}

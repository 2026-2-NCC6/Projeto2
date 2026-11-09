import AsyncStorage from '@react-native-async-storage/async-storage';
import { PermissionsAndroid, Platform } from 'react-native';

import type { MovimentoItem } from '@/types/api';

export type WearablePlatformStrategy = 'web-bluetooth' | 'mobile-ble';

export interface WearableDeviceInfo {
  id: string;
  nome: string;
  bateria: number;
  modeloPlaca: string;
  versaoSoftware: string;
  plataforma: WearablePlatformStrategy;
  modoReal: boolean;
}

export interface SavedWearableDevice {
  id: string;
  nome: string;
  ultimaConexao: string;
}

const SAVED_DEVICES_STORAGE_KEY = '@flux:saved_wearables_v1';

// Limite máximo de tempo (ms) para tentativa de conexão/pareamento
export const CONNECTION_TIMEOUT_MS = 8000;

// Dispositivo padrão pré-registrado na lista de já conectados (Arduino UNO R4 WiFi)
const DEFAULT_KNOWN_DEVICES: SavedWearableDevice[] = [
  {
    id: 'FLUX-R4-UNO-WIFI',
    nome: 'FLUX-Tennis-R4',
    ultimaConexao: new Date().toISOString(),
  },
];

interface WebBluetoothCharacteristic {
  value?: DataView;
  readValue: () => Promise<DataView>;
  startNotifications?: () => Promise<WebBluetoothCharacteristic>;
  stopNotifications?: () => Promise<WebBluetoothCharacteristic>;
  addEventListener?: (type: string, listener: (event: any) => void) => void;
  removeEventListener?: (type: string, listener: (event: any) => void) => void;
}

// Tipagem mínima para a Web Bluetooth API do navegador (Chrome / Edge / Opera)
interface WebBluetoothGATTServer {
  connected: boolean;
  connect: () => Promise<WebBluetoothGATTServer>;
  disconnect: () => void;
  getPrimaryService?: (service: string | number) => Promise<{
    getCharacteristic: (
      characteristic: string | number
    ) => Promise<WebBluetoothCharacteristic>;
  }>;
}

interface WebBluetoothDevice {
  id: string;
  name?: string;
  gatt?: WebBluetoothGATTServer;
  watchAdvertisements?: () => Promise<void>;
  addEventListener?: (type: string, listener: () => void) => void;
}

interface NavigatorWithBluetooth {
  bluetooth?: {
    requestDevice: (options: {
      acceptAllDevices?: boolean;
      filters?: Array<{
        name?: string;
        namePrefix?: string;
        services?: Array<string | number>;
      }>;
      optionalServices?: Array<string | number>;
    }) => Promise<WebBluetoothDevice>;
    getDevices?: () => Promise<WebBluetoothDevice[]>;
  };
}

export const FLUX_BLE_CONFIG = {
  DEVICE_NAME_PREFIX: 'FLUX',
  BATTERY_SERVICE_UUID: 0x180f,
  BATTERY_LEVEL_CHAR_UUID: 0x2a19,
  CUSTOM_IMU_SERVICE_UUID: '4fafc201-1fb5-459e-8fcc-c5c9c331914b',
  DEVICE_INFO_CHAR_UUID: 'beb5483e-36e1-4688-b7f5-ea07361b26a9',
  CUSTOM_IMU_CHAR_UUID: 'beb5483e-36e1-4688-b7f5-ea07361b26a8',
};

function decodificarDataViewUTF8(view: DataView): string {
  const bytes = new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
  if (typeof TextDecoder !== 'undefined') {
    return new TextDecoder('utf-8').decode(bytes).replace(/\0/g, '').trim();
  }
  let resultado = '';
  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] !== 0) {
      resultado += String.fromCharCode(bytes[i]);
    }
  }
  return resultado.trim();
}

function comTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Dispositivo não encontrado'));
    }, ms);

    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

class WearableService {
  private webDevice: WebBluetoothDevice | null = null;
  private knownWebDevices = new Map<string, WebBluetoothDevice>();
  private mobileBleManager: any = null;
  private mobileConnectedDevice: any = null;
  private dispositivoAtivo: WearableDeviceInfo | null = null;
  private listeners = new Set<(dev: WearableDeviceInfo | null) => void>();

  public getDispositivoAtivo(): WearableDeviceInfo | null {
    return this.dispositivoAtivo;
  }

  public inscreverMudancaEstado(
    listener: (dev: WearableDeviceInfo | null) => void
  ): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notificarEstado(dev: WearableDeviceInfo | null) {
    this.dispositivoAtivo = dev;
    this.listeners.forEach((cb) => cb(dev));
  }

  public getEstrategiaPlataforma(): WearablePlatformStrategy {
    return Platform.OS === 'web' ? 'web-bluetooth' : 'mobile-ble';
  }

  public verificarSuporteBluetooth(): {
    suportado: boolean;
    estrategia: WearablePlatformStrategy;
    detalhe: string;
  } {
    const estrategia = this.getEstrategiaPlataforma();

    if (estrategia === 'web-bluetooth') {
      const nav =
        typeof navigator !== 'undefined'
          ? (navigator as unknown as NavigatorWithBluetooth)
          : undefined;
      const temWebBluetooth = Boolean(nav?.bluetooth);

      return {
        suportado: temWebBluetooth,
        estrategia,
        detalhe: temWebBluetooth
          ? 'Web Bluetooth API ativa (Chrome / Edge)'
          : 'Navegador sem suporte a Web Bluetooth (use Chrome ou Edge)',
      };
    }

    return {
      suportado: true,
      estrategia,
      detalhe: `Bluetooth Low Energy Nativo (${Platform.OS.toUpperCase()})`,
    };
  }

  /**
   * Lista os dispositivos já conectados anteriormente (salvos no AsyncStorage + cache do navegador)
   */
  public async listarDispositivosSalvos(): Promise<SavedWearableDevice[]> {
    try {
      const raw = await AsyncStorage.getItem(SAVED_DEVICES_STORAGE_KEY);
      let lista: SavedWearableDevice[] = raw
        ? JSON.parse(raw)
        : DEFAULT_KNOWN_DEVICES;

      if (!Array.isArray(lista) || lista.length === 0) {
        lista = DEFAULT_KNOWN_DEVICES;
      }

      // Se o navegador suportar navigator.bluetooth.getDevices(), sincroniza dispositivos autorizados
      if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
        const nav = navigator as unknown as NavigatorWithBluetooth;
        if (nav.bluetooth?.getDevices) {
          try {
            const autorizados = await nav.bluetooth.getDevices();
            for (const dev of autorizados) {
              if (dev.id) {
                this.knownWebDevices.set(dev.id, dev);
                const nomeDev = dev.name || 'FLUX-Tennis-R4';
                const jaExiste = lista.some(
                  (item) => item.id === dev.id || item.nome === nomeDev
                );
                if (!jaExiste) {
                  lista.unshift({
                    id: dev.id,
                    nome: nomeDev,
                    ultimaConexao: new Date().toISOString(),
                  });
                }
              }
            }
          } catch {
            // Ignora caso getDevices() esteja desabilitado nas flags do navegador
          }
        }
      }

      return lista;
    } catch {
      return DEFAULT_KNOWN_DEVICES;
    }
  }

  /**
   * Salva ou atualiza um dispositivo na lista de dispositivos já conectados
   */
  public async salvarDispositivoNoHistorico(
    dispositivo: Pick<SavedWearableDevice, 'id' | 'nome'>
  ): Promise<SavedWearableDevice[]> {
    const atual = await this.listarDispositivosSalvos();
    const filtrada = atual.filter(
      (d) => d.id !== dispositivo.id && d.nome !== dispositivo.nome
    );
    const novaLista: SavedWearableDevice[] = [
      {
        id: dispositivo.id,
        nome: dispositivo.nome,
        ultimaConexao: new Date().toISOString(),
      },
      ...filtrada,
    ];
    await AsyncStorage.setItem(
      SAVED_DEVICES_STORAGE_KEY,
      JSON.stringify(novaLista)
    );
    return novaLista;
  }

  /**
   * Inicia o pareamento/conexão com limite de tempo (timeout).
   * Se não encontrar ou falhar, lança erro "Dispositivo não encontrado".
   */
  public async conectar(
    alvo?: { id?: string; nome?: string },
    onDisconnected?: () => void
  ): Promise<WearableDeviceInfo> {
    const estrategia = this.getEstrategiaPlataforma();

    try {
      const handleRemoteDisconnect = () => {
        this.notificarEstado(null);
        onDisconnected?.();
      };

      const info =
        estrategia === 'web-bluetooth'
          ? await this.conectarViaWebBluetooth(alvo, handleRemoteDisconnect)
          : await this.conectarViaMobileBLE(alvo, handleRemoteDisconnect);

      await this.salvarDispositivoNoHistorico({
        id: info.id,
        nome: info.nome,
      });

      this.notificarEstado(info);
      return info;
    } catch {
      this.notificarEstado(null);
      throw new Error('Dispositivo não encontrado');
    }
  }

  private async conectarViaWebBluetooth(
    alvo?: { id?: string; nome?: string },
    onDisconnected?: () => void
  ): Promise<WearableDeviceInfo> {
    const nav =
      typeof navigator !== 'undefined'
        ? (navigator as unknown as NavigatorWithBluetooth)
        : undefined;

    if (!nav?.bluetooth) {
      throw new Error('Dispositivo não encontrado');
    }

    let device: WebBluetoothDevice | undefined = alvo?.id
      ? this.knownWebDevices.get(alvo.id)
      : undefined;

    // Se ainda não temos a referência em memória do dispositivo, abre o pareamento filtrando ou listando BLE
    if (!device) {
      const optionalServices = [
        FLUX_BLE_CONFIG.BATTERY_SERVICE_UUID,
        FLUX_BLE_CONFIG.CUSTOM_IMU_SERVICE_UUID,
        'device_information',
      ];

      if (alvo?.nome) {
        device = await comTimeout(
          nav.bluetooth.requestDevice({
            filters: [{ namePrefix: alvo.nome.slice(0, 4) }],
            optionalServices,
          }),
          CONNECTION_TIMEOUT_MS
        );
      } else {
        device = await comTimeout(
          nav.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices,
          }),
          CONNECTION_TIMEOUT_MS
        );
      }
    }

    if (!device || !device.gatt) {
      throw new Error('Dispositivo não encontrado');
    }

    this.knownWebDevices.set(device.id, device);
    this.webDevice = device;

    if (onDisconnected && device.addEventListener) {
      device.addEventListener('gattserverdisconnected', () => {
        this.webDevice = null;
        onDisconnected();
      });
    }

    // Conecta ao servidor GATT aplicando o limite de requisição (timeout)
    const server = await comTimeout(
      device.gatt.connect(),
      CONNECTION_TIMEOUT_MS
    );

    if (!server || !server.connected) {
      throw new Error('Dispositivo não encontrado');
    }

    let bateria = 96;
    let modeloPlaca = 'Desconhecido';
    let versaoSoftware = 'N/A';

    if (server.getPrimaryService) {
      // 1. Lê o nível de bateria apenas 1x no início da sessão
      try {
        const batteryService = await comTimeout(
          server.getPrimaryService(FLUX_BLE_CONFIG.BATTERY_SERVICE_UUID),
          2500
        );
        const batteryChar = await batteryService.getCharacteristic(
          FLUX_BLE_CONFIG.BATTERY_LEVEL_CHAR_UUID
        );
        const value = await batteryChar.readValue();
        bateria = value.getUint8(0);
      } catch {
        bateria = 96;
      }

      // 2. Lê o Modelo da Placa e Versão do Software embarcados apenas 1x no handshake!
      try {
        const fluxService = await comTimeout(
          server.getPrimaryService(FLUX_BLE_CONFIG.CUSTOM_IMU_SERVICE_UUID),
          2500
        );
        const deviceInfoChar = await fluxService.getCharacteristic(
          FLUX_BLE_CONFIG.DEVICE_INFO_CHAR_UUID
        );
        const rawInfo = await deviceInfoChar.readValue();
        const textoInfo = decodificarDataViewUTF8(rawInfo);

        if (textoInfo.includes('|')) {
          const [modeloLido, versaoLida] = textoInfo.split('|');
          if (modeloLido) modeloPlaca = modeloLido.trim();
          if (versaoLida) versaoSoftware = versaoLida.trim();
        } else if (textoInfo) {
          modeloPlaca = textoInfo;
        }
      } catch {
        // Fallback caso o firmware antigo ainda não exponha a característica de metadados
        modeloPlaca = 'Arduino UNO R4 WiFi';
        versaoSoftware = 'v1.0.0';
      }
    }

    return {
      id: device.id || alvo?.id || 'FLUX-R4-BLE',
      nome: device.name || alvo?.nome || 'FLUX-Tennis-R4',
      bateria,
      modeloPlaca,
      versaoSoftware,
      plataforma: 'web-bluetooth',
      modoReal: true,
    };
  }

  private async conectarViaMobileBLE(
    alvo?: { id?: string; nome?: string },
    onDisconnected?: () => void
  ): Promise<WearableDeviceInfo> {
    if (Platform.OS === 'android') {
      const apiLevel = Number(Platform.Version);
      if (apiLevel >= 31) {
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        const scanOk =
          result['android.permission.BLUETOOTH_SCAN'] ===
          PermissionsAndroid.RESULTS.GRANTED;
        const connectOk =
          result['android.permission.BLUETOOTH_CONNECT'] ===
          PermissionsAndroid.RESULTS.GRANTED;

        if (!scanOk || !connectOk) {
          throw new Error('Dispositivo não encontrado');
        }
      } else {
        const fineLoc = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (fineLoc !== PermissionsAndroid.RESULTS.GRANTED) {
          throw new Error('Dispositivo não encontrado');
        }
      }
    }

    let BleManagerClass: any = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const blePlx = require('react-native-ble-plx');
      BleManagerClass = blePlx.BleManager;
    } catch {
      throw new Error('Dispositivo não encontrado');
    }

    if (!this.mobileBleManager) {
      this.mobileBleManager = new BleManagerClass();
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.mobileBleManager?.stopDeviceScan();
        reject(new Error('Dispositivo não encontrado'));
      }, CONNECTION_TIMEOUT_MS);

      this.mobileBleManager.startDeviceScan(
        null,
        { allowDuplicates: false },
        async (error: any, scannedDevice: any) => {
          if (error) {
            clearTimeout(timeout);
            this.mobileBleManager?.stopDeviceScan();
            reject(new Error('Dispositivo não encontrado'));
            return;
          }

          const deviceName: string =
            scannedDevice?.name || scannedDevice?.localName || '';
          const matchTarget = alvo?.nome
            ? deviceName.toUpperCase().includes(alvo.nome.toUpperCase()) ||
              scannedDevice?.id === alvo.id
            : deviceName
                .toUpperCase()
                .includes(FLUX_BLE_CONFIG.DEVICE_NAME_PREFIX) ||
              deviceName.toUpperCase().includes('ESP') ||
              deviceName.toUpperCase().includes('TENNIS');

          if (deviceName && matchTarget) {
            clearTimeout(timeout);
            this.mobileBleManager.stopDeviceScan();

            try {
              const connected = await comTimeout<any>(
                this.mobileBleManager.connectToDevice(scannedDevice.id),
                CONNECTION_TIMEOUT_MS
              );
              await connected.discoverAllServicesAndCharacteristics();
              this.mobileConnectedDevice = connected;

              if (onDisconnected) {
                connected.onDisconnected(() => {
                  this.mobileConnectedDevice = null;
                  onDisconnected();
                });
              }

              resolve({
                id: connected.id,
                nome: deviceName,
                bateria: 96,
                modeloPlaca: 'Arduino UNO R4 WiFi',
                versaoSoftware: 'v1.0.0',
                plataforma: 'mobile-ble',
                modoReal: true,
              });
            } catch {
              reject(new Error('Dispositivo não encontrado'));
            }
          }
        }
      );
    });
  }

  public async desconectar(): Promise<void> {
    if (this.webDevice?.gatt?.connected) {
      this.webDevice.gatt.disconnect();
    }
    this.webDevice = null;

    if (this.mobileConnectedDevice) {
      try {
        await this.mobileConnectedDevice.cancelConnection();
      } catch {
        // Ignora caso já esteja desconectado
      }
      this.mobileConnectedDevice = null;
    }

    this.notificarEstado(null);
  }

  /**
   * Converte um payload bruto real recebido via BLE do sistema embarcado em um MovimentoItem.
   * Aceita exclusivamente pacotes reais de golpe no formato estruturado:
   * "TIPO_GOLPE|PRECISAO|VELOCIDADE" (ex.: "Forehand|0.94|102.4").
   * Pacotes de status/keepalive como "FLUX_READY" ou "PKT:..." são ignorados.
   */
  private interpretarPacoteGolpeBLE(payloadBruto: string): MovimentoItem | null {
    const limpo = payloadBruto.trim();
    if (!limpo || limpo === 'FLUX_READY' || limpo.startsWith('PKT:')) {
      return null;
    }

    if (!limpo.includes('|')) {
      return null;
    }

    const partes = limpo.split('|');
    const tipo = partes[0]?.trim();
    const precisaoLida = parseFloat(partes[1]);
    const velLida = parseFloat(partes[2]);

    if (!tipo || isNaN(precisaoLida)) {
      return null;
    }

    const precisao = Math.min(1, Math.max(0, precisaoLida));
    const velocidade = !isNaN(velLida) ? velLida : undefined;

    return {
      tipo_movimento: tipo,
      precisao: Number(precisao.toFixed(2)),
      velocidade_pico:
        velocidade !== undefined ? Number(velocidade.toFixed(1)) : undefined,
      aceleracao_max:
        velocidade !== undefined
          ? Number((velocidade * 0.33).toFixed(1))
          : undefined,
      timestamp_execucao: new Date().toISOString(),
    };
  }

  /**
   * Inicia a escuta em tempo real dos golpes enviados via Bluetooth pelo dispositivo wearable
   * durante a execução de um circuito. Sem qualquer simulação: apenas pacotes reais vindos
   * da característica GATT do hardware são repassados.
   */
  public async iniciarEscutaGolpesDispositivo(
    onGolpeRecebido: (golpe: MovimentoItem) => void
  ): Promise<() => void> {
    let ultimoPayloadProcessado = '';

    if (
      Platform.OS === 'web' &&
      this.webDevice?.gatt?.connected &&
      this.webDevice.gatt.getPrimaryService
    ) {
      try {
        const service = await this.webDevice.gatt.getPrimaryService(
          FLUX_BLE_CONFIG.CUSTOM_IMU_SERVICE_UUID
        );
        const characteristic = await service.getCharacteristic(
          FLUX_BLE_CONFIG.CUSTOM_IMU_CHAR_UUID
        );

        const handleNotification = (event: any) => {
          const dv: DataView | undefined =
            event?.target?.value ?? characteristic.value;
          if (!dv) return;
          const texto = decodificarDataViewUTF8(dv);
          if (!texto || texto === ultimoPayloadProcessado) return;
          ultimoPayloadProcessado = texto;

          const golpe = this.interpretarPacoteGolpeBLE(texto);
          if (golpe) {
            onGolpeRecebido(golpe);
          }
        };

        if (characteristic.startNotifications && characteristic.addEventListener) {
          await characteristic.startNotifications();
          characteristic.addEventListener(
            'characteristicvaluechanged',
            handleNotification
          );

          return () => {
            try {
              characteristic.removeEventListener?.(
                'characteristicvaluechanged',
                handleNotification
              );
              void characteristic.stopNotifications?.();
            } catch {
              // Ignora caso o dispositivo tenha desconectado
            }
          };
        }
      } catch {
        // Sem conexão GATT ativa com a característica de telemetria
      }
    }

    return () => {};
  }
}

export const wearableService = new WearableService();

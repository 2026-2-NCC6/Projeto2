import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LiveHardwareTelemetryCard } from '@/components/ia/LiveHardwareTelemetryCard';
import { SavedDevicesCard } from '@/components/treino/SavedDevicesCard';
import { WearableHeader } from '@/components/treino/WearableHeader';
import { WearableStatusCard } from '@/components/treino/WearableStatusCard';
import { ToastPopup, type ToastData } from '@/components/ui/ToastPopup';
import { useWearable, type SavedWearableDevice } from '@/hooks';
import { styles } from '@/styles/hardware.styles';

export default function HardwareScreen() {
  const {
    estaConectado,
    estaConectando,
    idConectando,
    dispositivo,
    dispositivosSalvos,
    telemetriaAoVivo,
    conectarDispositivo,
    desconectarDispositivo,
  } = useWearable();

  const [toast, setToast] = useState<ToastData | null>(null);

  async function handleConectarItem(item?: SavedWearableDevice) {
    const conectado = await conectarDispositivo(
      item ? { id: item.id, nome: item.nome } : undefined
    );
    setToast(
      conectado
        ? { mensagem: 'Arduino UNO R4 conectado com sucesso!', tipo: 'sucesso' }
        : { mensagem: 'Dispositivo Bluetooth não encontrado', tipo: 'erro' }
    );
  }

  async function handleDesconectar() {
    await desconectarDispositivo();
    setToast({ mensagem: 'Dispositivo Bluetooth desconectado', tipo: 'sucesso' });
  }

  function handleAcessarInfoDispositivo() {
    setToast({
      mensagem: `Hardware: ${dispositivo?.nome || 'Arduino UNO R4 WiFi'} • MPU-6050 6 Eixos`,
      tipo: 'sucesso',
    });
  }

  return (
    <View style={styles.root}>
      <View style={styles.glowOrb} />

      <ToastPopup toast={toast} onHide={() => setToast(null)} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* CABEÇALHO DO HARDWARE */}
          <WearableHeader
            estaConectado={estaConectado}
            estaConectando={estaConectando}
            tag="MONITOR DE SENSOR • ARDUINO BLE"
            titulo="Hardware & Telemetria Ao Vivo"
          />

          {/* STATUS DE CONEXÃO E HARDWARE (IDÊNTICO AO DE TREINO) */}
          <WearableStatusCard
            estaConectado={estaConectado}
            dispositivo={dispositivo}
            telemetria={telemetriaAoVivo}
            onDesconectar={handleDesconectar}
            onAcessarInfoDispositivo={handleAcessarInfoDispositivo}
          />

          {/* GRÁFICO PROGREDINDO AO VIVO (OSCILOSCÓPIO) */}
          <LiveHardwareTelemetryCard estaConectado={estaConectado} />

          {/* DISPOSITIVOS SALVOS (QUANDO DESCONECTADO) */}
          {!estaConectado ? (
            <SavedDevicesCard
              dispositivos={dispositivosSalvos}
              estaConectando={estaConectando}
              idConectando={idConectando}
              onConectarDispositivo={handleConectarItem}
            />
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}


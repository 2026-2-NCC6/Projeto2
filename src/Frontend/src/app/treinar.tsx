import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SavedDevicesCard } from '@/components/treino/SavedDevicesCard';
import { StartWorkoutDock } from '@/components/treino/StartWorkoutDock';
import { WearableHeader } from '@/components/treino/WearableHeader';
import { WearableStatusCard } from '@/components/treino/WearableStatusCard';
import { ToastPopup, type ToastData } from '@/components/ui/ToastPopup';
import { useWearable, type SavedWearableDevice } from '@/hooks';
import { styles } from '@/styles/treinar.styles';

export default function TreinarScreen() {
  const router = useRouter();
  const {
    estaConectado,
    estaConectando,
    idConectando,
    dispositivo,
    dispositivosSalvos,
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
        ? { mensagem: 'Dispositivo conectado com sucesso!', tipo: 'sucesso' }
        : { mensagem: 'Dispositivo não encontrado', tipo: 'erro' }
    );
  }

  async function handleDesconectar() {
    await desconectarDispositivo();
    setToast({ mensagem: 'Dispositivo desconectado', tipo: 'sucesso' });
  }

  function handleAcessarInfoDispositivo() {
    setToast({
      mensagem: 'Ficha do dispositivo em breve disponível!',
      tipo: 'sucesso',
    });
  }

  function handleIniciarTreino() {
    router.push('/sessao');
  }

  return (
    <View style={styles.root}>
      <View style={styles.glowOrb} />

      <ToastPopup toast={toast} onHide={() => setToast(null)} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <WearableHeader
            estaConectado={estaConectado}
            estaConectando={estaConectando}
          />

          <WearableStatusCard
            estaConectado={estaConectado}
            dispositivo={dispositivo}
            onDesconectar={handleDesconectar}
            onAcessarInfoDispositivo={handleAcessarInfoDispositivo}
          />

          {!estaConectado ? (
            <SavedDevicesCard
              dispositivos={dispositivosSalvos}
              estaConectando={estaConectando}
              idConectando={idConectando}
              onConectarDispositivo={handleConectarItem}
            />
          ) : null}
        </ScrollView>

        <StartWorkoutDock
          estaConectado={estaConectado}
          onIniciarTreino={handleIniciarTreino}
        />
      </SafeAreaView>
    </View>
  );
}

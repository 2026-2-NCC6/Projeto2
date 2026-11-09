import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { styles } from '@/components/treino/SavedDevicesCard.styles';
import { GlassCard, PrimaryButton } from '@/components/ui/GlassCard';
import type { SavedWearableDevice } from '@/hooks';

interface DeviceItemBoxProps {
  item: SavedWearableDevice;
  estaConectandoEste: boolean;
  desabilitado: boolean;
  onConectar: (item: SavedWearableDevice) => void;
}

function DeviceItemBox({
  item,
  estaConectandoEste,
  desabilitado,
  onConectar,
}: DeviceItemBoxProps) {
  return (
    <View style={styles.deviceItem}>
      <View style={styles.deviceMeta}>
        <Text style={styles.deviceName}>{item.nome}</Text>
        <Text style={styles.deviceId}>ID: {item.id}</Text>
      </View>

      <PrimaryButton
        label="Conectar"
        variant="primary"
        loading={estaConectandoEste}
        disabled={desabilitado}
        onPress={() => onConectar(item)}
        style={styles.connectBtn}
      />
    </View>
  );
}

interface SavedDevicesCardProps {
  dispositivos: SavedWearableDevice[];
  estaConectando: boolean;
  idConectando: string | null;
  onConectarDispositivo: (item?: SavedWearableDevice) => void;
}

export function SavedDevicesCard({
  dispositivos,
  estaConectando,
  idConectando,
  onConectarDispositivo,
}: SavedDevicesCardProps) {
  const [expandido, setExpandido] = useState(false);

  return (
    <GlassCard style={styles.devicesSectionCard}>
      <Pressable
        onPress={() => setExpandido((prev) => !prev)}
        style={styles.collapsibleHeaderPressable}>
        <View style={styles.headerLeftGroup}>
          <Text style={styles.sectionTitle}>DISPOSITIVOS JÁ CONECTADOS</Text>
          <Text style={styles.devicesSubTitle}>
            {expandido
              ? 'Selecione um aparelho conhecido para iniciar o pareamento'
              : 'Toque para exibir ou ocultar seus aparelhos Bluetooth'}
          </Text>
        </View>

        <View style={styles.headerRightGroup}>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{dispositivos.length}</Text>
          </View>
          <View style={styles.chevronBadge}>
            <Text style={styles.chevronText}>{expandido ? '▲' : '▼'}</Text>
          </View>
        </View>
      </Pressable>

      {expandido ? (
        <View style={styles.expandedContent}>
          <View style={styles.deviceList}>
            {dispositivos.map((item) => {
              const esteConectando = estaConectando && idConectando === item.id;
              return (
                <DeviceItemBox
                  key={item.id}
                  item={item}
                  estaConectandoEste={esteConectando}
                  desabilitado={estaConectando && !esteConectando}
                  onConectar={onConectarDispositivo}
                />
              );
            })}
          </View>

          <PrimaryButton
            label="Procurar Outro Dispositivo Bluetooth"
            variant="ghost"
            loading={estaConectando && idConectando === 'novo'}
            disabled={estaConectando}
            onPress={() => onConectarDispositivo(undefined)}
          />
        </View>
      ) : null}
    </GlassCard>
  );
}

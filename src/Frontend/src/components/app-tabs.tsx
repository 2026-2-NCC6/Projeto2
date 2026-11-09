import {
  Tabs,
  TabList,
  TabSlot,
  TabTrigger,
  type TabTriggerSlotProps,
} from 'expo-router/ui';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { styles } from '@/components/app-tabs.styles';
import { AuthScreen } from '@/components/auth-screen';
import { FluxColors } from '@/constants/theme';
import { useUsuarioLogado } from '@/hooks';

const TAB_ITEMS = [
  { name: 'home', href: '/' as const, label: 'Home', icon: '⚡' },
  { name: 'treinar', href: '/treinar' as const, label: 'Treino', icon: '🎾' },
  { name: 'perfil', href: '/perfil' as const, label: 'Perfil', icon: '👤' },
];

export default function AppTabs() {
  const { data: usuario, isLoading } = useUsuarioLogado();
  const insets = useSafeAreaInsets();

  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={FluxColors.primary} />
      </View>
    );
  }

  if (!usuario) {
    return <AuthScreen />;
  }

  return (
    <View style={styles.root}>
      <Tabs>
        <TabSlot style={{ flex: 1 }} />
        <TabList asChild>
          <View
            style={StyleSheet.flatten([
              styles.glassTabBar,
              { bottom: Math.max(insets.bottom, 12) },
            ])}>
            {TAB_ITEMS.map((tab) => (
              <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
                <GlassTabButton label={tab.label} icon={tab.icon} />
              </TabTrigger>
            ))}
            <TabTrigger name="sessao" href="/sessao" style={{ display: 'none' }} />
            <TabTrigger
              name="resumo-sessao"
              href={'/resumo-sessao' as never}
              style={{ display: 'none' }}
            />
            <TabTrigger
              name="configuracoes"
              href={'/configuracoes' as never}
              style={{ display: 'none' }}
            />
            <TabTrigger
              name="editar-perfil"
              href={'/editar-perfil' as never}
              style={{ display: 'none' }}
            />
          </View>
        </TabList>
      </Tabs>
    </View>
  );
}

function GlassTabButton({
  isFocused,
  label,
  icon,
  style,
  ref,
  ...props
}: TabTriggerSlotProps & { label: string; icon: string }) {
  return (
    <Pressable
      {...props}
      ref={ref as React.ComponentProps<typeof Pressable>['ref']}
      style={StyleSheet.flatten([
        typeof style !== 'function' ? style : undefined,
        styles.tabTrigger,
        isFocused && styles.tabTriggerActive,
      ])}>
      <Text style={styles.tabIcon}>{icon}</Text>
      <Text
        style={StyleSheet.flatten([
          styles.tabLabel,
          isFocused && styles.tabLabelActive,
        ])}>
        {label}
      </Text>
    </Pressable>
  );
}

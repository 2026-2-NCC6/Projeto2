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

import { AuthScreen } from '@/components/auth-screen';
import { FluxColors, MaxContentWidth, Radius } from '@/constants/theme';
import { useUsuarioLogado } from '@/hooks';

const TAB_ITEMS = [
  { name: 'feed', href: '/' as const, label: 'Feed', icon: '⚡' },
  { name: 'treinar', href: '/treinar' as const, label: 'Treinar', icon: '🎾' },
  { name: 'arenas', href: '/arenas' as const, label: 'Arenas', icon: '🏟️' },
  { name: 'personal', href: '/personal' as const, label: 'Personal', icon: '📊' },
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
              styles.tabBarWrapper,
              { paddingBottom: Math.max(insets.bottom, 12) },
            ])}>
            <View style={styles.glassTabBar}>
              {TAB_ITEMS.map((tab) => (
                <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
                  <GlassTabButton label={tab.label} icon={tab.icon} />
                </TabTrigger>
              ))}
            </View>
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
  ...props
}: TabTriggerSlotProps & { label: string; icon: string }) {
  return (
    <Pressable
      {...props}
      style={StyleSheet.flatten([
        style,
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: FluxColors.background,
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: FluxColors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  glassTabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(18, 20, 32, 0.92)',
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: FluxColors.glassBorderActive,
    paddingVertical: 8,
    paddingHorizontal: 8,
    width: '100%',
    maxWidth: MaxContentWidth,
    justifyContent: 'space-between',
    shadowColor: FluxColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 10,
  },
  tabTrigger: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: Radius.lg,
    gap: 2,
  },
  tabTriggerActive: {
    backgroundColor: FluxColors.primarySoft,
    borderWidth: 1,
    borderColor: FluxColors.primary,
  },
  tabIcon: {
    fontSize: 16,
  },
  tabLabel: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  tabLabelActive: {
    color: FluxColors.text,
  },
});

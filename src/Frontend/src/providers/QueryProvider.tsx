import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { focusManager, onlineManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import * as Network from 'expo-network';
import React, { useEffect } from 'react';
import { AppState, type AppStateStatus, Platform } from 'react-native';

import { offlineQueue } from '@/services/offlineQueue';

const isBrowserOrNative = Platform.OS !== 'web' || typeof window !== 'undefined';

if (isBrowserOrNative) {
  onlineManager.setEventListener((setOnline) => {
    let initialized = false;

    const subscription = Network.addNetworkStateListener((state) => {
      initialized = true;
      const isOnline = Boolean(state.isConnected);
      setOnline(isOnline);

      if (isOnline) {
        offlineQueue.sincronizarTudo().catch(() => {});
      }
    });

    Network.getNetworkStateAsync()
      .then((state) => {
        if (!initialized) {
          setOnline(Boolean(state.isConnected));
        }
      })
      .catch(() => {});

    return () => subscription.remove();
  });
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 horas de cache persistido no AsyncStorage
      staleTime: 1000 * 30, // 30 segundos
      retry: 1,
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: isBrowserOrNative ? AsyncStorage : undefined,
  key: '@flux:react_query_cache',
});

function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active');
  }
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', onAppStateChange);
    return () => subscription.remove();
  }, []);

  if (!isBrowserOrNative) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}>
      {children}
    </PersistQueryClientProvider>
  );
}

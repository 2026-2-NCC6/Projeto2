import React, { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';

import { styles } from '@/components/ui/ToastPopup.styles';

export interface ToastData {
  mensagem: string;
  tipo: 'sucesso' | 'erro';
}

interface ToastPopupProps {
  toast: ToastData | null;
  onHide: () => void;
  durationMs?: number;
}

export function ToastPopup({ toast, onHide, durationMs = 3000 }: ToastPopupProps) {
  const toastAnim = useRef(new Animated.Value(0)).current;
  const onHideRef = useRef(onHide);
  onHideRef.current = onHide;

  useEffect(() => {
    if (!toast) return;

    toastAnim.setValue(0);
    Animated.spring(toastAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 7,
      tension: 80,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start(() => onHideRef.current());
    }, durationMs);

    return () => clearTimeout(timer);
  }, [toast, durationMs, toastAnim]);

  if (!toast) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toastWrapper,
        {
          opacity: toastAnim,
          transform: [
            {
              translateY: toastAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-24, 0],
              }),
            },
            {
              scale: toastAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.92, 1],
              }),
            },
          ],
        },
      ]}>
      <View
        style={[
          styles.toastPopup,
          toast.tipo === 'erro' ? styles.toastPopupError : styles.toastPopupSuccess,
        ]}>
        <Text style={styles.toastIcon}>{toast.tipo === 'erro' ? '⚠️' : '✅'}</Text>
        <Text style={styles.toastText}>{toast.mensagem}</Text>
      </View>
    </Animated.View>
  );
}

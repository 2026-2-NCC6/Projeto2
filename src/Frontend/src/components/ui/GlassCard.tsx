import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from 'react-native';

import { styles } from '@/components/ui/GlassCard.styles';
import { FluxColors } from '@/constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  highlighted?: boolean;
}

export function GlassCard({ children, style, highlighted = false }: GlassCardProps) {
  return (
    <View style={[styles.card, highlighted && styles.cardHighlighted, style]}>
      {children}
    </View>
  );
}

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'ghost' | 'danger';
  style?: ViewStyle;
}

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.buttonBase,
        variant === 'primary' && styles.buttonPrimary,
        variant === 'ghost' && styles.buttonGhost,
        variant === 'danger' && styles.buttonDanger,
        pressed && !isDisabled && styles.buttonPressed,
        isDisabled && styles.buttonDisabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={FluxColors.text} size="small" />
      ) : (
        <Text
          style={[
            styles.buttonText,
            variant === 'ghost' && { color: FluxColors.primaryLight },
          ]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

interface GlassInputProps extends TextInputProps {
  label?: string;
}

export function GlassInput({ label, style, ...props }: GlassInputProps) {
  return (
    <View style={styles.inputWrapper}>
      {label ? <Text style={styles.inputLabel}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={FluxColors.textMuted}
        style={[styles.input, style]}
        {...props}
      />
    </View>
  );
}

interface MetricPillProps {
  label: string;
  value: string | number;
  accent?: boolean;
}

export function MetricPill({ label, value, accent = false }: MetricPillProps) {
  return (
    <View style={[styles.metricPill, accent && styles.metricPillAccent]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, accent && { color: FluxColors.primaryLight }]}>
        {value}
      </Text>
    </View>
  );
}

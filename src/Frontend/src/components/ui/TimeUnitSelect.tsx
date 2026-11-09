import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { styles } from '@/components/ui/TimeUnitSelect.styles';

export type UnidadeTempo = 'seg' | 'min';

interface TimeUnitSelectProps {
  value: UnidadeTempo;
  onChange: (novaUnidade: UnidadeTempo) => void;
}

const OPCOES: Array<{ valor: UnidadeTempo; label: string }> = [
  { valor: 'seg', label: 'seg' },
  { valor: 'min', label: 'min' },
];

export function TimeUnitSelect({ value, onChange }: TimeUnitSelectProps) {
  const [aberto, setAberto] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={() => setAberto((prev) => !prev)}
        style={[styles.selectTrigger, aberto && styles.selectTriggerOpen]}>
        <Text style={styles.selectedText}>{value}</Text>
        <Text style={styles.chevron}>{aberto ? '▲' : '▼'}</Text>
      </Pressable>

      {aberto ? (
        <View style={styles.dropdownMenu}>
          {OPCOES.map((op) => {
            const ativo = op.valor === value;
            return (
              <Pressable
                key={op.valor}
                onPress={() => {
                  onChange(op.valor);
                  setAberto(false);
                }}
                style={[styles.optionItem, ativo && styles.optionItemActive]}>
                <Text
                  style={[styles.optionText, ativo && styles.optionTextActive]}>
                  {op.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}


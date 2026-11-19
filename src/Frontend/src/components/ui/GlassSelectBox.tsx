import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { styles } from '@/components/ui/GlassSelectBox.styles';

export interface SelectOption {
  label: string;
  value: string;
}

interface GlassSelectBoxProps {
  label?: string;
  valor: string;
  opcoes: Array<SelectOption | string>;
  onSelect: (valor: string) => void;
  placeholder?: string;
  icone?: string;
  disabled?: boolean;
  onAdicionarNovo?: () => void;
  labelAdicionarNovo?: string;
  aberto?: boolean;
  onToggleAberto?: (aberto: boolean) => void;
}

export function GlassSelectBox({
  label,
  valor,
  opcoes,
  onSelect,
  placeholder = 'Selecione uma opção',
  icone,
  disabled = false,
  onAdicionarNovo,
  labelAdicionarNovo,
  aberto: abertoProp,
  onToggleAberto,
}: GlassSelectBoxProps) {
  const [abertoInterno, setAbertoInterno] = useState(false);
  const isAberto = abertoProp !== undefined ? abertoProp : abertoInterno;

  function setAberto(novoAberto: boolean) {
    if (onToggleAberto) {
      onToggleAberto(novoAberto);
    } else {
      setAbertoInterno(novoAberto);
    }
  }

  // Normaliza opções para o formato { label, value }
  const opcoesNormalizadas: SelectOption[] = opcoes.map((item) =>
    typeof item === 'string' ? { label: item, value: item } : item
  );

  const opcaoSelecionada = opcoesNormalizadas.find((op) => op.value === valor);
  const textoExibicao = opcaoSelecionada ? opcaoSelecionada.label : placeholder;

  function handleSelect(itemValue: string) {
    onSelect(itemValue);
    setAberto(false);
  }

  function handleAddPress() {
    setAberto(false);
    onAdicionarNovo?.();
  }

  return (
    <View style={[styles.container, isAberto && styles.containerOpen]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <Pressable
        onPress={() => !disabled && setAberto(!isAberto)}
        disabled={disabled}
        accessibilityRole="combobox"
        accessibilityState={{ expanded: isAberto }}
        style={[
          styles.trigger,
          isAberto && styles.triggerActive,
          disabled && styles.triggerDisabled,
        ]}>
        <View style={styles.triggerLeft}>
          {icone ? <Text style={styles.triggerIcon}>{icone}</Text> : null}
          <Text
            style={opcaoSelecionada ? styles.triggerText : styles.placeholderText}
            numberOfLines={1}>
            {textoExibicao}
          </Text>
        </View>

        <Text style={styles.chevron}>{isAberto ? '▲' : '▼'}</Text>
      </Pressable>

      {/* Backdrop transparente para fechar ao tocar fora */}
      {isAberto && (
        <Pressable
          style={styles.backdrop}
          onPress={() => setAberto(false)}
          accessibilityLabel="Fechar seleção"
        />
      )}

      {/* Menu Dropdown de Opções Flutuante com zIndex superior */}
      {isAberto && (
        <View style={styles.dropdownMenu}>
          <ScrollView
            style={styles.optionsScroll}
            contentContainerStyle={styles.optionsScrollContent}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}>
            {opcoesNormalizadas.map((opcao) => {
              const ativo = opcao.value === valor;
              return (
                <Pressable
                  key={opcao.value}
                  onPress={() => handleSelect(opcao.value)}
                  style={[styles.optionItem, ativo && styles.optionItemActive]}>
                  <Text
                    style={[styles.optionText, ativo && styles.optionTextActive]}>
                    {opcao.label}
                  </Text>
                  {ativo ? <Text style={styles.checkMark}>✓</Text> : null}
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Botão de Adicionar Novo Item */}
          {onAdicionarNovo && labelAdicionarNovo ? (
            <View>
              <View style={styles.divider} />
              <Pressable onPress={handleAddPress} style={styles.addNewButton}>
                <Text style={styles.addNewIcon}>➕</Text>
                <Text style={styles.addNewText}>{labelAdicionarNovo}</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}

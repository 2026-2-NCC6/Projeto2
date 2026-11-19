import React, { useState } from 'react';
import { Modal, Text, TextInput, View } from 'react-native';

import { styles } from '@/components/ia/AddOptionModal.styles';
import { PrimaryButton } from '@/components/ui/GlassCard';

interface AddOptionModalProps {
  visivel: boolean;
  titulo: string;
  subtitulo: string;
  placeholder: string;
  tag: string;
  onConfirmar: (valor: string) => void;
  onFechar: () => void;
}

export function AddOptionModal({
  visivel,
  titulo,
  subtitulo,
  placeholder,
  tag,
  onConfirmar,
  onFechar,
}: AddOptionModalProps) {
  const [texto, setTexto] = useState('');

  function handleSalvar() {
    const limpo = texto.trim();
    if (!limpo) return;
    onConfirmar(limpo);
    setTexto('');
  }

  function handleClose() {
    setTexto('');
    onFechar();
  }

  return (
    <Modal
      visible={visivel}
      transparent
      animationType="fade"
      onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <Text style={styles.tag}>{tag}</Text>
            <Text style={styles.title}>{titulo}</Text>
            <Text style={styles.subtitle}>{subtitulo}</Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            value={texto}
            onChangeText={setTexto}
            autoFocus
            onSubmitEditing={handleSalvar}
          />

          <View style={styles.actionsRow}>
            <View style={styles.actionCol}>
              <PrimaryButton
                label="Cancelar"
                variant="ghost"
                onPress={handleClose}
              />
            </View>
            <View style={styles.actionCol}>
              <PrimaryButton
                label="Adicionar"
                variant="primary"
                disabled={!texto.trim()}
                onPress={handleSalvar}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}


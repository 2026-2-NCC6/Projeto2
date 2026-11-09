import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { styles } from '@/components/treino/SessionActionModal.styles';
import { GlassCard, PrimaryButton } from '@/components/ui/GlassCard';

export type SessionModalType = 'encerrar' | 'descartar' | null;

interface SessionActionModalProps {
  tipo: SessionModalType;
  carregando: boolean;
  onFechar: () => void;
  onConfirmarEncerramento: () => void;
  onConfirmarDescarte: () => void;
}

export function SessionActionModal({
  tipo,
  carregando,
  onFechar,
  onConfirmarEncerramento,
  onConfirmarDescarte,
}: SessionActionModalProps) {
  if (!tipo) return null;

  const isEncerrar = tipo === 'encerrar';

  return (
    <Modal
      visible={Boolean(tipo)}
      transparent
      animationType="fade"
      onRequestClose={onFechar}>
      <Pressable
        style={styles.backdrop}
        onPress={carregando ? undefined : onFechar}>
        <Pressable
          style={styles.modalContainer}
          onPress={(e) => e.stopPropagation()}>
          <GlassCard highlighted style={styles.modalCard}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconEmoji}>{isEncerrar ? '🏁' : '🗑️'}</Text>
            </View>

            <Text style={styles.modalTitle}>
              {isEncerrar
                ? 'Tem certeza que deseja encerrar a sessão?'
                : 'Tem certeza que deseja descartar a sessão?'}
            </Text>

            <Text style={styles.modalDescription}>
              {isEncerrar
                ? 'Ao confirmar, o treino será finalizado e você será levado para o resumo da sessão com o template de publicação.'
                : 'Essa sessão não será salva no histórico e todos os dados atuais serão descartados.'}
            </Text>

            {isEncerrar ? (
              <View style={styles.buttonsRow}>
                <PrimaryButton
                  label="Não"
                  variant="ghost"
                  disabled={carregando}
                  onPress={onFechar}
                  style={styles.halfButton}
                />
                <PrimaryButton
                  label="Sim"
                  variant="primary"
                  loading={carregando}
                  onPress={onConfirmarEncerramento}
                  style={styles.halfButton}
                />
              </View>
            ) : (
              <View style={styles.buttonsRow}>
                <PrimaryButton
                  label="Não"
                  variant="ghost"
                  disabled={carregando}
                  onPress={onFechar}
                  style={styles.halfButton}
                />
                <PrimaryButton
                  label="Sim"
                  variant="danger"
                  loading={carregando}
                  onPress={onConfirmarDescarte}
                  style={styles.halfButton}
                />
              </View>
            )}
          </GlassCard>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

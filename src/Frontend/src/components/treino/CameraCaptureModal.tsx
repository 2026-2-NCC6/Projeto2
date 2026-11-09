import React, { useEffect, useRef, useState } from 'react';
import { Modal, Platform, Pressable, Text, View } from 'react-native';

import { styles } from '@/components/treino/CameraCaptureModal.styles';
import { GlassCard, PrimaryButton } from '@/components/ui/GlassCard';

interface CameraCaptureModalProps {
  visivel: boolean;
  onFechar: () => void;
  onFotoCapturada: (dataUrl: string) => void;
}

export function CameraCaptureModal({
  visivel,
  onFechar,
  onFotoCapturada,
}: CameraCaptureModalProps) {
  const videoRef = useRef<any>(null);
  const streamRef = useRef<any>(null);
  const [erroCamera, setErroCamera] = useState<string | null>(null);

  useEffect(() => {
    if (!visivel || Platform.OS !== 'web') return;
    setErroCamera(null);

    let cancelado = false;

    async function iniciarStream() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: 720, height: 720 },
          audio: false,
        });
        if (cancelado) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        setErroCamera(
          'Não foi possível acessar a câmera diretamente. Você pode escolher uma foto da galeria.'
        );
      }
    }

    void iniciarStream();

    return () => {
      cancelado = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t: any) => t.stop());
        streamRef.current = null;
      }
    };
  }, [visivel]);

  if (!visivel) return null;

  function handleCapturarQuadrado() {
    const video = videoRef.current;
    if (!video || typeof document === 'undefined') return;

    const vw = video.videoWidth || 640;
    const vh = video.videoHeight || 640;
    const lado = Math.min(vw, vh);
    const sx = (vw - lado) / 2;
    const sy = (vh - lado) / 2;

    const canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, sx, sy, lado, lado, 0, 0, 720, 720);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    onFotoCapturada(dataUrl);
  }

  return (
    <Modal
      visible={visivel}
      transparent
      animationType="fade"
      onRequestClose={onFechar}>
      <Pressable style={styles.backdrop} onPress={onFechar}>
        <Pressable
          style={styles.modalContainer}
          onPress={(e) => e.stopPropagation()}>
          <GlassCard highlighted style={styles.modalCard}>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.tag}>FOTO DO TREINO • FORMATO 1:1</Text>
                <Text style={styles.title}>Capturar Foto de Fundo</Text>
              </View>
              <Pressable onPress={onFechar} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </Pressable>
            </View>

            <View style={styles.squarePreviewBox}>
              {erroCamera ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{erroCamera}</Text>
                </View>
              ) : Platform.OS === 'web' ? (
                React.createElement('video', {
                  ref: videoRef,
                  playsInline: true,
                  muted: true,
                  style: {
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  },
                })
              ) : null}
            </View>

            <View style={styles.actionsRow}>
              <PrimaryButton
                label="Cancelar"
                variant="ghost"
                onPress={onFechar}
                style={styles.halfBtn}
              />
              <PrimaryButton
                label="📸 Tirar Foto"
                variant="primary"
                disabled={Boolean(erroCamera)}
                onPress={handleCapturarQuadrado}
                style={styles.halfBtn}
              />
            </View>
          </GlassCard>
        </Pressable>
      </Pressable>
    </Modal>
  );
}


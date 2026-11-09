import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { styles } from '@/components/feed/PostCard.styles';
import { GlassCard, GlassInput } from '@/components/ui/GlassCard';
import type { Postagem } from '@/types/api';

interface PostCardProps {
  post: Postagem;
  authorLabel?: string;
  onCurtir: (idPostagem: string) => void;
  onComentar: (idPostagem: string, texto: string) => Promise<void> | void;
}

export function PostCard({
  post,
  authorLabel = 'Atleta FLUX',
  onCurtir,
  onComentar,
}: PostCardProps) {
  const [textoComentario, setTextoComentario] = useState('');

  async function handleEnviarComentario() {
    const limpo = textoComentario.trim();
    if (!limpo) return;
    await onComentar(post.id, limpo);
    setTextoComentario('');
  }

  return (
    <GlassCard style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarLetter}>
            {(authorLabel[0] ?? 'F').toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.postAuthor}>{authorLabel}</Text>
          <Text style={styles.postTime}>
            {new Date(post.criado_em).toLocaleString('pt-BR')}
          </Text>
        </View>
        {post.id_sessao ? (
          <View style={styles.workoutTag}>
            <Text style={styles.workoutTagText}>TREINO FLUX</Text>
          </View>
        ) : null}
      </View>

      {post.legenda ? <Text style={styles.postBody}>{post.legenda}</Text> : null}

      <View style={styles.postActions}>
        <Pressable onPress={() => onCurtir(post.id)} style={styles.actionPill}>
          <Text style={styles.actionPillText}>🔥 Kudos / Curtir</Text>
        </Pressable>
        <Text style={styles.commentCount}>
          💬 {post.comentarios?.length ?? 0} comentários
        </Text>
      </View>

      {post.comentarios && post.comentarios.length > 0 ? (
        <View style={styles.commentsList}>
          {post.comentarios.map((c) => (
            <View key={c.id} style={styles.commentItem}>
              <Text style={styles.commentText}>{c.texto}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.commentInputRow}>
        <View style={{ flex: 1 }}>
          <GlassInput
            placeholder="Comentar treino..."
            value={textoComentario}
            onChangeText={setTextoComentario}
          />
        </View>
        <Pressable onPress={handleEnviarComentario} style={styles.sendCommentBtn}>
          <Text style={styles.sendCommentText}>Enviar</Text>
        </Pressable>
      </View>
    </GlassCard>
  );
}


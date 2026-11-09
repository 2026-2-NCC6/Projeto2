import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { styles } from '@/components/feed/FeedHeaderSearch.styles';
import { GlassCard } from '@/components/ui/GlassCard';
import { FluxColors } from '@/constants/theme';
import type { Usuario } from '@/types/api';

interface FeedHeaderSearchProps {
  buscaTermo: string;
  onChangeBuscaTermo: (termo: string) => void;
  usuariosEncontrados: Usuario[];
  idUsuarioLogado?: string;
  onSeguirUsuario: (idUsuario: string) => void;
}

export function FeedHeaderSearch({
  buscaTermo,
  onChangeBuscaTermo,
  usuariosEncontrados,
  idUsuarioLogado,
  onSeguirUsuario,
}: FeedHeaderSearchProps) {
  const [buscaExpandida, setBuscaExpandida] = useState(false);

  const listaFiltrada = usuariosEncontrados.filter(
    (u) => u.id !== idUsuarioLogado
  );

  function handleAlternarBusca() {
    setBuscaExpandida((prev) => {
      const novoEstado = !prev;
      if (!novoEstado) {
        onChangeBuscaTermo('');
      }
      return novoEstado;
    });
  }

  return (
    <View style={styles.wrapper}>
      {/* Topo da Home: Comunidade Flux + Botão de Busca no canto superior direito */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.tagText}>COMUNIDADE FLUX</Text>
          <Text style={styles.screenTitle}>Feed de Atividades</Text>
        </View>

        <Pressable
          onPress={handleAlternarBusca}
          style={[
            styles.searchToggleBtn,
            buscaExpandida && styles.searchToggleBtnActive,
          ]}>
          <Text style={styles.searchToggleIcon}>
            {buscaExpandida ? '✕' : '🔍'}
          </Text>
        </Pressable>
      </View>

      {/* Barra de Busca Expansível + Lista de Pesquisa estilo Instagram */}
      {buscaExpandida ? (
        <GlassCard style={styles.expandedSearchDrawer}>
          <View style={styles.searchBarRow}>
            <Text style={styles.searchInputIcon}>🔍</Text>
            <TextInput
              value={buscaTermo}
              onChangeText={onChangeBuscaTermo}
              autoFocus
              placeholder="Pesquisar atletas por nome ou @username..."
              placeholderTextColor={FluxColors.textMuted}
              style={styles.searchInput}
            />
            {buscaTermo.length > 0 ? (
              <Pressable
                onPress={() => onChangeBuscaTermo('')}
                style={styles.clearQueryBtn}>
                <Text style={styles.clearQueryText}>✕</Text>
              </Pressable>
            ) : null}
          </View>

          {buscaTermo.trim().length > 0 ? (
            listaFiltrada.length === 0 ? (
              <View style={styles.emptySearchBox}>
                <Text style={styles.emptySearchText}>
                  Nenhum atleta encontrado para "{buscaTermo.trim()}"
                </Text>
              </View>
            ) : (
              <View style={styles.resultsList}>
                {listaFiltrada.map((u) => (
                  <View key={u.id} style={styles.userRow}>
                    <View style={styles.userLeft}>
                      <View style={styles.userAvatar}>
                        <Text style={styles.userAvatarText}>
                          {(u.nome[0] ?? 'A').toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.userInfoCol}>
                        <Text style={styles.userRowName}>{u.nome}</Text>
                        <Text style={styles.userRowSub}>
                          @{u.username} • {u.tipo_perfil}
                        </Text>
                      </View>
                    </View>

                    <Pressable
                      onPress={() => onSeguirUsuario(u.id)}
                      style={styles.followBtn}>
                      <Text style={styles.followBtnText}>Seguir</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            )
          ) : null}
        </GlassCard>
      ) : null}
    </View>
  );
}


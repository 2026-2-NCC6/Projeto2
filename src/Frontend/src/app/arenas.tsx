import React, { useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  GlassCard,
  GlassInput,
  PrimaryButton,
} from '@/components/ui/GlassCard';
import { BottomTabInset, FluxColors, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import {
  useCadastrarEstabelecimento,
  useEstabelecimentos,
  useFavoritarEstabelecimento,
  useMeusFavoritos,
} from '@/hooks';

export default function ArenasScreen() {
  const [filtroCidade, setFiltroCidade] = useState('');
  const [aba, setAba] = useState<'todas' | 'favoritas' | 'nova'>('todas');

  const { data: arenas = [], isLoading, refetch } = useEstabelecimentos(
    filtroCidade.trim() || undefined
  );
  const { data: favoritas = [] } = useMeusFavoritos();
  const favoritarMutation = useFavoritarEstabelecimento();
  const cadastrarMutation = useCadastrarEstabelecimento();

  const [nome, setNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('SP');
  const [telefone, setTelefone] = useState('');

  const idsFavoritos = new Set(favoritas.map((f) => f.id));
  const listaExibida = aba === 'favoritas' ? favoritas : arenas;

  async function handleCadastrarArena() {
    if (!nome.trim() || !cnpj.trim() || !endereco.trim() || !cidade.trim()) return;
    await cadastrarMutation.mutateAsync({
      nome: nome.trim(),
      cnpj: cnpj.trim(),
      endereco: endereco.trim(),
      cidade: cidade.trim(),
      estado: estado.trim().toUpperCase().slice(0, 2),
      telefone: telefone.trim() || null,
    });
    setNome('');
    setCnpj('');
    setEndereco('');
    setCidade('');
    setTelefone('');
    setAba('todas');
  }

  return (
    <View style={styles.root}>
      <View style={styles.glowOrb} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor={FluxColors.primary}
            />
          }>
          <View>
            <Text style={styles.tag}>ECOSSISTEMA PARCEIRO • SMART ARENAS</Text>
            <Text style={styles.screenTitle}>Arenas & Clubes</Text>
          </View>

          <View style={styles.segmentRow}>
            <Pressable
              onPress={() => setAba('todas')}
              style={[styles.segmentBtn, aba === 'todas' && styles.segmentBtnActive]}>
              <Text style={styles.segmentText}>Todas ({arenas.length})</Text>
            </Pressable>
            <Pressable
              onPress={() => setAba('favoritas')}
              style={[styles.segmentBtn, aba === 'favoritas' && styles.segmentBtnActive]}>
              <Text style={styles.segmentText}>⭐ Favoritas ({favoritas.length})</Text>
            </Pressable>
            <Pressable
              onPress={() => setAba('nova')}
              style={[styles.segmentBtn, aba === 'nova' && styles.segmentBtnActive]}>
              <Text style={styles.segmentText}>+ Nova</Text>
            </Pressable>
          </View>

          {aba === 'nova' ? (
            <GlassCard highlighted style={styles.formCard}>
              <Text style={styles.sectionTitle}>CADASTRAR ESTABELECIMENTO PARCEIRO</Text>
              <GlassInput
                label="Nome da Arena / Academia"
                placeholder="Smart Tennis Arena"
                value={nome}
                onChangeText={setNome}
              />
              <GlassInput
                label="CNPJ"
                placeholder="12.345.678/0001-90"
                value={cnpj}
                onChangeText={setCnpj}
              />
              <GlassInput
                label="Endereço"
                placeholder="Av. das Quadras, 500"
                value={endereco}
                onChangeText={setEndereco}
              />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 2 }}>
                  <GlassInput
                    label="Cidade"
                    placeholder="São Paulo"
                    value={cidade}
                    onChangeText={setCidade}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <GlassInput
                    label="UF"
                    placeholder="SP"
                    maxLength={2}
                    value={estado}
                    onChangeText={setEstado}
                  />
                </View>
              </View>
              <GlassInput
                label="Telefone"
                placeholder="(11) 99999-0000"
                value={telefone}
                onChangeText={setTelefone}
              />
              <PrimaryButton
                label="Salvar Estabelecimento"
                onPress={handleCadastrarArena}
                loading={cadastrarMutation.isPending}
              />
            </GlassCard>
          ) : (
            <>
              <GlassCard>
                <GlassInput
                  label="Filtrar por Cidade"
                  placeholder="Digite o nome da cidade..."
                  value={filtroCidade}
                  onChangeText={setFiltroCidade}
                />
              </GlassCard>

              {listaExibida.length === 0 ? (
                <GlassCard style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>Nenhuma arena encontrada</Text>
                  <Text style={styles.emptySub}>
                    Toque na aba "+ Nova" para cadastrar a Smart Tennis Arena!
                  </Text>
                </GlassCard>
              ) : (
                listaExibida.map((arena) => {
                  const isFav = idsFavoritos.has(arena.id);
                  return (
                    <GlassCard key={arena.id} highlighted={isFav} style={styles.arenaCard}>
                      <View style={styles.arenaHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.arenaTitle}>{arena.nome}</Text>
                          <Text style={styles.arenaLocation}>
                            📍 {arena.endereco} — {arena.cidade}/{arena.estado}
                          </Text>
                          {arena.telefone ? (
                            <Text style={styles.arenaPhone}>📞 {arena.telefone}</Text>
                          ) : null}
                        </View>
                        <Pressable
                          onPress={() => favoritarMutation.mutate(arena.id)}
                          style={[styles.favBtn, isFav && styles.favBtnActive]}>
                          <Text style={styles.favIcon}>{isFav ? '★' : '☆'}</Text>
                        </Pressable>
                      </View>
                    </GlassCard>
                  );
                })
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: FluxColors.background,
  },
  glowOrb: {
    position: 'absolute',
    top: -110,
    left: -50,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: FluxColors.primaryGlow,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: BottomTabInset + 32,
    gap: Spacing.three,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  tag: {
    color: FluxColors.primaryLight,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  screenTitle: {
    color: FluxColors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(14, 16, 26, 0.8)',
    borderRadius: Radius.pill,
    padding: 4,
    borderWidth: 1,
    borderColor: FluxColors.glassBorder,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.pill,
    alignItems: 'center',
  },
  segmentBtnActive: {
    backgroundColor: FluxColors.primary,
  },
  segmentText: {
    color: FluxColors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  formCard: {
    gap: 12,
  },
  sectionTitle: {
    color: FluxColors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.9,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 6,
  },
  emptyTitle: {
    color: FluxColors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  emptySub: {
    color: FluxColors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
  arenaCard: {
    gap: 8,
  },
  arenaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  arenaTitle: {
    color: FluxColors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  arenaLocation: {
    color: FluxColors.textSecondary,
    fontSize: 13,
    marginTop: 3,
  },
  arenaPhone: {
    color: FluxColors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  favBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(12, 14, 24, 0.75)',
    borderWidth: 1,
    borderColor: FluxColors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favBtnActive: {
    backgroundColor: FluxColors.primarySoft,
    borderColor: FluxColors.primary,
  },
  favIcon: {
    color: FluxColors.primaryLight,
    fontSize: 22,
  },
});


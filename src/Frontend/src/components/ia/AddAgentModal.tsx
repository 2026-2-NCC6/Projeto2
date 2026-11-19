import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { styles } from '@/components/ia/AddAgentModal.styles';
import { PrimaryButton } from '@/components/ui/GlassCard';
import type { AgenteTesteCreate } from '@/types/api';

interface AddAgentModalProps {
  visivel: boolean;
  onConfirmar: (dados: AgenteTesteCreate) => void;
  onFechar: () => void;
  salvando?: boolean;
}

export function AddAgentModal({
  visivel,
  onConfirmar,
  onFechar,
  salvando = false,
}: AddAgentModalProps) {
  const [nome, setNome] = useState('');
  const [sexoBiologico, setSexoBiologico] = useState<'masculino' | 'feminino'>('masculino');
  const [idade, setIdade] = useState('25');
  const [altura, setAltura] = useState('178');
  const [peso, setPeso] = useState('75');

  // Alavancas de membros
  const [bracoDireito, setBracoDireito] = useState('65');
  const [bracoEsquerdo, setBracoEsquerdo] = useState('65');
  const [pernaDireita, setPernaDireita] = useState('90');
  const [pernaEsquerda, setPernaEsquerda] = useState('90');

  // Tronco e cabeça
  const [torax, setTorax] = useState('96');
  const [peito, setPeito] = useState('98');
  const [cabeca, setCabeca] = useState('57');
  const [notas, setNotas] = useState('');

  function handleSalvar() {
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) return;

    const payload: AgenteTesteCreate = {
      nome: nomeLimpo,
      sexo_biologico: sexoBiologico,
      idade: Number(idade) || 25,
      altura_cm: Number(altura) || 175,
      peso_kg: Number(peso) || 70,
      braco_direito_cm: Number(bracoDireito) || undefined,
      braco_esquerdo_cm: Number(bracoEsquerdo) || undefined,
      perna_direita_cm: Number(pernaDireita) || undefined,
      perna_esquerda_cm: Number(pernaEsquerda) || undefined,
      torax_cm: Number(torax) || undefined,
      peito_cm: Number(peito) || undefined,
      cabeca_cm: Number(cabeca) || undefined,
      notas: notas.trim() || undefined,
    };

    onConfirmar(payload);
    setNome('');
    setNotas('');
  }

  function handleClose() {
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
            <Text style={styles.tag}>FICHA BIOMÉTRICA & ANTROPOMÉTRICA</Text>
            <Text style={styles.title}>Cadastrar Agente de Teste</Text>
            <Text style={styles.subtitle}>
              Medidas corporais e de alavanca para normalização biomecânica do modelo de IA.
            </Text>
          </View>

          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {/* DADOS BÁSICOS */}
            <Text style={styles.sectionTitle}>1. Identificação Geral</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>NOME DO ATLETA / VOLUNTÁRIO *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ex: Carlos Silva (Atleta 02)"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={nome}
                onChangeText={setNome}
                autoFocus
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>SEXO BIOLÓGICO *</Text>
              <View style={styles.genderToggleRow}>
                <Pressable
                  style={[
                    styles.genderBtn,
                    sexoBiologico === 'masculino' && styles.genderBtnActive,
                  ]}
                  onPress={() => setSexoBiologico('masculino')}>
                  <Text
                    style={[
                      styles.genderBtnText,
                      sexoBiologico === 'masculino' && styles.genderBtnTextActive,
                    ]}>
                    Masculino
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.genderBtn,
                    sexoBiologico === 'feminino' && styles.genderBtnActive,
                  ]}
                  onPress={() => setSexoBiologico('feminino')}>
                  <Text
                    style={[
                      styles.genderBtnText,
                      sexoBiologico === 'feminino' && styles.genderBtnTextActive,
                    ]}>
                    Feminino
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.rowFields}>
              <View style={styles.thirdCol}>
                <Text style={styles.fieldLabel}>IDADE (ANOS)</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={idade}
                  onChangeText={setIdade}
                />
              </View>
              <View style={styles.thirdCol}>
                <Text style={styles.fieldLabel}>ALTURA (CM)</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={altura}
                  onChangeText={setAltura}
                />
              </View>
              <View style={styles.thirdCol}>
                <Text style={styles.fieldLabel}>PESO (KG)</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={peso}
                  onChangeText={setPeso}
                />
              </View>
            </View>

            {/* MEMBROS SUPERIORES */}
            <Text style={styles.sectionTitle}>2. Membros Superiores (Alavancas de Braço)</Text>
            <View style={styles.rowFields}>
              <View style={styles.halfCol}>
                <Text style={styles.fieldLabel}>BRAÇO DIREITO (CM)</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  placeholder="Ex: 65"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  value={bracoDireito}
                  onChangeText={setBracoDireito}
                />
              </View>
              <View style={styles.halfCol}>
                <Text style={styles.fieldLabel}>BRAÇO ESQUERDO (CM)</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  placeholder="Ex: 65"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  value={bracoEsquerdo}
                  onChangeText={setBracoEsquerdo}
                />
              </View>
            </View>

            {/* MEMBROS INFERIORES */}
            <Text style={styles.sectionTitle}>3. Membros Inferiores (Alavancas de Perna)</Text>
            <View style={styles.rowFields}>
              <View style={styles.halfCol}>
                <Text style={styles.fieldLabel}>PERNA DIREITA (CM)</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  placeholder="Ex: 90"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  value={pernaDireita}
                  onChangeText={setPernaDireita}
                />
              </View>
              <View style={styles.halfCol}>
                <Text style={styles.fieldLabel}>PERNA ESQUERDA (CM)</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  placeholder="Ex: 90"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  value={pernaEsquerda}
                  onChangeText={setPernaEsquerda}
                />
              </View>
            </View>

            {/* TRONCO E CABEÇA */}
            <Text style={styles.sectionTitle}>4. Eixo Central (Tronco & Cabeça)</Text>
            <View style={styles.rowFields}>
              <View style={styles.thirdCol}>
                <Text style={styles.fieldLabel}>TÓRAX (CM)</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  placeholder="Ex: 96"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  value={torax}
                  onChangeText={setTorax}
                />
              </View>
              <View style={styles.thirdCol}>
                <Text style={styles.fieldLabel}>PEITO (CM)</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  placeholder="Ex: 98"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  value={peito}
                  onChangeText={setPeito}
                />
              </View>
              <View style={styles.thirdCol}>
                <Text style={styles.fieldLabel}>CABEÇA (CM)</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  placeholder="Ex: 57"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  value={cabeca}
                  onChangeText={setCabeca}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>OBSERVAÇÕES BIOMECÂNICAS</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ex: Atleta profissional com flexibilidade acima da média"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                value={notas}
                onChangeText={setNotas}
              />
            </View>
          </ScrollView>

          <View style={styles.footerActions}>
            <View style={styles.actionCol}>
              <PrimaryButton label="Cancelar" variant="ghost" onPress={handleClose} />
            </View>
            <View style={styles.actionCol}>
              <PrimaryButton
                label={salvando ? 'Salvando...' : 'Cadastrar Agente'}
                onPress={handleSalvar}
                loading={salvando}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

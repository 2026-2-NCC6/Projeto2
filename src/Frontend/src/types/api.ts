export type TipoPerfil = 'atleta' | 'personal' | 'desenvolvedor';
export type ModalidadeTreino = 'tenis' | 'musculacao';
export type VisibilidadePost = 'publico' | 'seguidores' | 'privado';

export interface Usuario {
  id: string;
  nome: string;
  username: string;
  email: string;
  tipo_perfil: TipoPerfil;
  foto_perfil_url?: string | null;
  bio?: string | null;
  privado: boolean;
  xp_total: number;
  nivel: number;
  criado_em: string;
}

export interface UsuarioCreate {
  nome: string;
  username: string;
  email: string;
  senha: string;
  tipo_perfil?: TipoPerfil;
  foto_perfil_url?: string | null;
  bio?: string | null;
  privado?: boolean;
}

export interface UsuarioUpdate {
  nome?: string;
  username?: string;
  tipo_perfil?: TipoPerfil;
  foto_perfil_url?: string | null;
  bio?: string | null;
  privado?: boolean;
}

export interface LoginRequest {
  identificador: string;
  senha: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  usuario: Usuario;
}

export interface MovimentoItem {
  tipo_movimento: string;
  precisao: number;
  velocidade_pico?: number | null;
  aceleracao_max?: number | null;
  timestamp_execucao?: string | null;
  metadados_extras?: Record<string, unknown> | null;
}

export interface MovimentosCircuitoNoSQL {
  id_nosql: string;
  id_sessao: string;
  id_circuito: string;
  versao_modelo_ia: string;
  total_movimentos: number;
  precisao_media: number;
  registrado_em: string;
  movimentos: MovimentoItem[];
}

export interface Circuito {
  id: string;
  id_sessao: string;
  id_movimentos_nosql?: string | null;
  numero_rodada: number;
  hora_inicio: string;
  hora_fim?: string | null;
  pontuacao: number;
}

export interface CircuitoCreate {
  numero_rodada: number;
  hora_inicio: string;
  hora_fim?: string | null;
  pontuacao: number;
  versao_modelo_ia?: string;
  movimentos?: MovimentoItem[];
}

export interface Sessao {
  id: string;
  id_usuario: string;
  id_estabelecimento?: string | null;
  id_cliente?: string | null;
  modalidade: ModalidadeTreino;
  data_inicio: string;
  data_fim?: string | null;
  pontuacao_total: number;
  circuitos: Circuito[];
}

export interface SessaoCreate {
  id_usuario?: string | null;
  id_estabelecimento?: string | null;
  id_cliente?: string | null;
  modalidade?: ModalidadeTreino;
}

export interface SessaoOfflineSyncRequest {
  id_estabelecimento?: string | null;
  id_cliente?: string | null;
  modalidade: ModalidadeTreino;
  data_inicio: string;
  data_fim?: string | null;
  circuitos: CircuitoCreate[];
}

export interface Estabelecimento {
  id: string;
  nome: string;
  cnpj: string;
  endereco: string;
  cidade: string;
  estado: string;
  telefone?: string | null;
  parceiro_ativo: boolean;
}

export interface EstabelecimentoCreate {
  nome: string;
  cnpj: string;
  endereco: string;
  cidade: string;
  estado: string;
  telefone?: string | null;
  parceiro_ativo?: boolean;
}

export interface FavoritoToggleResponse {
  favoritado: boolean;
  id_estabelecimento: string;
  favoritado_em?: string | null;
}

export interface Cliente {
  id: string;
  id_personal: string;
  id_aluno: string;
  status: 'ativo' | 'inativo';
  observacoes?: string | null;
  data_vinculo: string;
}

export interface ClienteCreate {
  id_aluno: string;
  observacoes?: string | null;
}

export interface ClienteUpdate {
  status?: 'ativo' | 'inativo';
  observacoes?: string | null;
}

export interface Comentario {
  id: string;
  id_postagem: string;
  id_usuario: string;
  texto: string;
  criado_em: string;
}

export interface ComentarioCreate {
  texto: string;
}

export interface Postagem {
  id: string;
  id_usuario: string;
  id_sessao?: string | null;
  legenda?: string | null;
  midia_url?: string | null;
  visibilidade: VisibilidadePost;
  criado_em: string;
  comentarios: Comentario[];
}

export interface PostagemCreate {
  id_sessao?: string | null;
  legenda?: string | null;
  midia_url?: string | null;
  visibilidade?: VisibilidadePost;
}

export interface CurtidaToggleResponse {
  curtido: boolean;
  id_postagem: string;
  total_curtidas: number;
}

export interface SeguirToggleResponse {
  seguindo: boolean;
  id_seguido: string;
  status?: string | null;
}

export interface SeguidoresResumo {
  id_usuario: string;
  total_seguidores: number;
  total_seguindo: number;
  seguidores_ids: string[];
  seguindo_ids: string[];
}

export interface ModeloIA {
  id: string;
  versao: string;
  modalidade: ModalidadeTreino;
  formato: string;
  acuracia?: number | null;
  caminho_arquivo: string;
  changelog?: string | null;
  ativo: boolean;
  criado_em: string;
}

export interface TelemetriaFrameItem {
  frame_id: number;
  timestamp_ms: number;
  ax: number;
  ay: number;
  az: number;
  gx: number;
  gy: number;
  gz: number;
  resultante_accel?: number;
  temperatura?: number;
}

export interface AmostraTreinoCreate {
  esporte?: string;
  tipo_movimento: string;
  lateralidade: string;
  empunhadura?: string | null;
  taxa_amostragem_hz: number;
  duracao_ms: number;
  frames: TelemetriaFrameItem[];
  notas?: string | null;
}

export interface AmostraTreinoResponse {
  id: string;
  esporte: string;
  tipo_movimento: string;
  lateralidade: string;
  empunhadura?: string | null;
  taxa_amostragem_hz: number;
  duracao_ms: number;
  total_frames: number;
  frames: TelemetriaFrameItem[];
  notas?: string | null;
  autor_id: string;
  autor_username?: string | null;
  coletado_em: string;
}

export interface EstatisticasDatasetResponse {
  total_amostras: number;
  total_frames: number;
  distribuicao_movimentos: Record<string, number>;
  distribuicao_esportes?: Record<string, number>;
}

// ============================================================================
// ENTIDADES DO BANCO PARALELO DE IA (DATALAB & BIOMECÂNICA)
// ============================================================================

export interface EsporteItem {
  id: string;
  nome: string;
  icone: string;
  descricao?: string | null;
  ativo: boolean;
  criado_em: string;
}

export interface EsporteCreate {
  id?: string;
  nome: string;
  icone?: string;
  descricao?: string;
}

export interface ArticulacaoItem {
  id: string;
  nome: string;
  icone: string;
  possui_lateralidade: boolean;
  descricao?: string | null;
}

export interface MovimentoItemDataLab {
  id: string;
  nome: string;
  esporte_id: string;
  articulacao_padrao_id?: string | null;
  descricao?: string | null;
  ativo: boolean;
  criado_em: string;
}

export interface MovimentoCreate {
  id?: string;
  nome: string;
  esporte_id: string;
  articulacao_padrao_id?: string;
  descricao?: string;
}

export interface AgenteTesteItem {
  id: string;
  nome: string;
  sexo_biologico: 'masculino' | 'feminino';
  idade: number;
  peso_kg: number;
  altura_cm: number;
  braco_direito_cm?: number | null;
  braco_esquerdo_cm?: number | null;
  perna_direita_cm?: number | null;
  perna_esquerda_cm?: number | null;
  torax_cm?: number | null;
  peito_cm?: number | null;
  cabeca_cm?: number | null;
  notas?: string | null;
  criado_em: string;
}

export interface AgenteTesteCreate {
  nome: string;
  sexo_biologico: 'masculino' | 'feminino';
  idade: number;
  peso_kg: number;
  altura_cm: number;
  braco_direito_cm?: number;
  braco_esquerdo_cm?: number;
  perna_direita_cm?: number;
  perna_esquerda_cm?: number;
  torax_cm?: number;
  peito_cm?: number;
  cabeca_cm?: number;
  notas?: string;
}

export interface AmostraDatalabCreate {
  agente_id: string;
  esporte_id: string;
  movimento_id: string;
  articulacao_id: string;
  posicao_lateralidade: 'direita' | 'esquerda' | 'central';
  taxa_amostragem_hz: number;
  duracao_ms: number;
  frames: TelemetriaFrameItem[];
  notas?: string | null;
}

export interface AmostraDatalabResponse {
  id: string;
  agente_id: string;
  agente_nome?: string | null;
  esporte_id: string;
  esporte_nome?: string | null;
  movimento_id: string;
  movimento_nome?: string | null;
  articulacao_id: string;
  articulacao_nome?: string | null;
  posicao_lateralidade: 'direita' | 'esquerda' | 'central';
  taxa_amostragem_hz: number;
  duracao_ms: number;
  total_frames: number;
  frames: TelemetriaFrameItem[];
  notas?: string | null;
  autor_id: string;
  autor_username?: string | null;
  coletado_em: string;
}

export interface VersaoModeloProjeto {
  versao: string;
  caminho: string;
  criado_em: string;
  acuracia: number;
  total_amostras: number;
  status: string;
  formato: string;
  classes: string[];
}

export interface ProjetoModelo {
  modelo_id: string;
  nome: string;
  esporte_id: string;
  descricao: string;
  total_versoes: number;
  versao_ativa: string | null;
  versoes: VersaoModeloProjeto[];
}

export interface ProjetoModeloCreate {
  modelo_id: string;
  nome: string;
  esporte_id: string;
  descricao?: string;
  classes_alvo?: string[];
}

export interface TreinarModeloPayload {
  versao: string;
  esporte_id?: string;
  classes?: string[];
}

export interface TreinarModeloResultado {
  sucesso: boolean;
  modelo_id: string;
  versao: string;
  esporte_id: string;
  acuracia: number;
  classes: string[];
  total_amostras: number;
  diretorio: string;
  arquivos_gerados: string[];
  metrics: {
    acuracia: number;
    f1_score: number;
    matriz_confusao: Record<string, Record<string, number>>;
    total_amostras_avaliadas: number;
    tempo_treinamento_ms: number;
    latencia_media_inferencia_ms: number;
    avaliado_em: string;
  };
}

export interface FatorDeterminanteItem {
  feature: string;
  titulo: string;
  descricao: string;
  valor: string;
  impacto_decisao: 'alto' | 'medio' | 'baixo';
}

export interface TestarInferenciaResultado {
  modelo_id: string;
  versao: string;
  golpe_detectado: string;
  confianca: number;
  probabilidades_por_golpe: Record<string, number>;
  latencia_ms: number;
  features_extraidas?: Record<string, number>;
  fatores_determinantes?: FatorDeterminanteItem[];
}

export interface MetricaClasseAvaliacao {
  classe: string;
  nome: string;
  precisao: number;
  revocacao: number;
  f1_score: number;
  amostras: number;
}

export interface ImportanciaFeatureAvaliacao {
  feature: string;
  label: string;
  importancia: number;
}

export interface DistribuicaoClasseAvaliacao {
  classe: string;
  nome: string;
  quantidade: number;
  percentual: number;
}

export interface VersaoProgressaoItem {
  versao: string;
  criado_em: string;
  total_amostras: number;
  acuracia: number;
  f1_score: number;
  latencia_ms: number;
  is_ativa: boolean;
}

export interface PontoAmostraScatter {
  id: string;
  classe: string;
  x: number;
  y: number;
  is_outlier: boolean;
  classe_predita?: string | null;
}

export interface CentroideScatter {
  classe: string;
  nome: string;
  x: number;
  y: number;
  std_x: number;
  std_y: number;
  total: number;
}

export interface ProjecaoScatterItem {
  id: string;
  titulo: string;
  eixo_x_nome: string;
  eixo_x_unidade: string;
  eixo_y_nome: string;
  eixo_y_unidade: string;
  min_x: number;
  max_x: number;
  min_y: number;
  max_y: number;
  distancia_centroides: number;
  centroides: CentroideScatter[];
  pontos: PontoAmostraScatter[];
}

export interface MetricasVersaoDetalhada {
  versao: string;
  acuracia: number;
  f1_score: number;
  total_amostras: number;
  tempo_treinamento_ms: number;
  latencia_media_inferencia_ms: number;
  avaliado_em: string;
  classes: string[];
  matriz_confusao: Record<string, Record<string, number>>;
  metricas_por_classe: MetricaClasseAvaliacao[];
  importancia_features: ImportanciaFeatureAvaliacao[];
  distribuicao_amostras: DistribuicaoClasseAvaliacao[];
  projecoes_scatter?: ProjecaoScatterItem[];
}

export interface AvaliacaoModeloResponse {
  modelo_id: string;
  nome: string;
  esporte_id: string;
  versao_ativa: string | null;
  versao_selecionada: string;
  todas_versoes: string[];
  progressao_versoes: VersaoProgressaoItem[];
  metricas_versao: MetricasVersaoDetalhada;
}




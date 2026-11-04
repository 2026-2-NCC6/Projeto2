export type TipoPerfil = 'atleta' | 'personal' | 'iniciante';
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


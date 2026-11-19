"""
Seed Completo da Plataforma FLUX.
Popula o banco relacional SQLite e o armazenamento NoSQL TinyDB com:
- Usuários de todos os perfis (Atleta, Personal, Desenvolvedor)
- Rede de seguidores e vínculos de mentoria (Atleta x Treinador)
- Estabelecimentos esportivos e parceiros favoritados
- Histórico completo de treinos com métricas biomecânicas realistas (Sessões + Circuitos)
- Telemetria NoSQL particionada de golpes (TinyDB) para alimentar a inspeção de circuitos
- Feed social com templates Strava 1:1 pré-fabricados, curtidas e comentários
"""

from datetime import datetime, timedelta, timezone
import json
import random
import sys
from typing import Any
import uuid

from app.core.database import SessionLocal, engine
from app.core.security import gerar_hash_senha
from app.models import (
    Base,
    Circuito,
    Cliente,
    Comentario,
    Curtida,
    Estabelecimento,
    EstabelecimentoFavorito,
    Postagem,
    Seguidor,
    Sessao,
    Usuario,
)
from app.repositories.movimento_nosql_repository import MovimentoNoSQLRepository
from app.repositories.usuario_repository import UsuarioRepository

# ---------------------------------------------------------------------------
# 1. USUÁRIOS BASE DA PLATAFORMA
# ---------------------------------------------------------------------------

USUARIOS_INICIAIS = [
    {
        "nome": "Lucas Silva",
        "username": "lucastennis",
        "email": "atleta@flux.com",
        "senha_plana": "123456",
        "tipo_perfil": "atleta",
        "foto_perfil_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
        "bio": "🎾 Tenista Amador Competitivo • Smart Tennis Arena | Foco em subida de ranking e biomecânica com o bracelete FLUX.",
        "xp_total": 5420,
        "nivel": 6,
    },
    {
        "nome": "Carlos Mendes",
        "username": "carlospersonal",
        "email": "personal@flux.com",
        "senha_plana": "123456",
        "tipo_perfil": "personal",
        "foto_perfil_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        "bio": "🏆 Treinador CBT Nível II & Especialista em Biomecânica do Tênis | Preparação física e análise cinemática de atletas FLUX.",
        "xp_total": 8250,
        "nivel": 8,
    },
    {
        "nome": "Marina Costa",
        "username": "marinacosta",
        "email": "iniciante@flux.com",
        "senha_plana": "123456",
        "tipo_perfil": "atleta",
        "foto_perfil_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
        "bio": "🎾 Apaixonada por tênis e beach tennis! Evoluindo consistência, saque e forehand com o sensor FLUX.",
        "xp_total": 2150,
        "nivel": 3,
    },
    {
        "nome": "Rodrigo Sousa",
        "username": "rodrigosousa",
        "email": "rodrigo@flux.com",
        "senha_plana": "123456",
        "tipo_perfil": "atleta",
        "foto_perfil_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
        "bio": "🎾 Tenista de fim de semana & Beach Tennis | Monitorando rotação e potência de golpe.",
        "xp_total": 3100,
        "nivel": 4,
    },
    {
        "nome": "Equipe Dev FLUX",
        "username": "devlab",
        "email": "dev@flux.com",
        "senha_plana": "123456",
        "tipo_perfil": "desenvolvedor",
        "foto_perfil_url": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
        "bio": "🔬 Laboratório de IA, Coleta de Dataset e MLOps Biomecânico • FLUX Core Team",
        "xp_total": 9999,
        "nivel": 10,
    },
]

# ---------------------------------------------------------------------------
# 2. ESTABELECIMENTOS ESPORTIVOS
# ---------------------------------------------------------------------------

ESTABELECIMENTOS_INICIAIS = [
    {
        "nome": "Arena Morumbi Tennis & Padel",
        "cnpj": "12.345.678/0001-90",
        "endereco": "Av. Giovanni Gronchi, 3200",
        "cidade": "São Paulo",
        "estado": "SP",
        "telefone": "(11) 3740-9900",
        "parceiro_ativo": True,
    },
    {
        "nome": "Clube Paulistano - Quadras de Saibro",
        "cnpj": "98.765.432/0001-10",
        "endereco": "Rua Colômbia, 777 - Jardim América",
        "cidade": "São Paulo",
        "estado": "SP",
        "telefone": "(11) 3065-2000",
        "parceiro_ativo": True,
    },
    {
        "nome": "Smart Tennis Center Vila Mariana",
        "cnpj": "45.123.789/0001-55",
        "endereco": "Rua Domingos de Morais, 1800",
        "cidade": "São Paulo",
        "estado": "SP",
        "telefone": "(11) 5571-3344",
        "parceiro_ativo": True,
    },
]

# ---------------------------------------------------------------------------
# AUXILIARES PARA GERAÇÃO BIOMECÂNICA
# ---------------------------------------------------------------------------

def _gerar_golpes_circuito(
    total_golpes: int,
    percentual_acerto_alvo: float,
    data_circuito: datetime,
) -> list[dict[str, Any]]:
    """Gera uma lista de golpes com acelerações e rotações biomecânicas realistas."""
    movimentos = []
    tipos = ["tenis_forehand", "tenis_backhand", "tenis_saque"]
    pesos = [0.60, 0.30, 0.10]

    for i in range(total_golpes):
        tipo = random.choices(tipos, weights=pesos, k=1)[0]
        # Determina precisão com base no alvo da rodada
        base_prec = (percentual_acerto_alvo / 100.0) + random.uniform(-0.06, 0.05)
        precisao = max(0.65, min(0.99, round(base_prec, 3)))

        if tipo == "tenis_forehand":
            vel = round(random.uniform(105.0, 138.0), 1)
            accel = round(random.uniform(36.0, 56.0), 1)
        elif tipo == "tenis_backhand":
            vel = round(random.uniform(92.0, 122.0), 1)
            accel = round(random.uniform(48.0, 78.0), 1)
        else:
            vel = round(random.uniform(130.0, 172.0), 1)
            accel = round(random.uniform(55.0, 88.0), 1)

        timestamp = data_circuito + timedelta(seconds=i * 12)
        movimentos.append({
            "tipo_movimento": tipo,
            "precisao": precisao,
            "velocidade_pico": vel,
            "aceleracao_max": accel,
            "timestamp_execucao": timestamp.isoformat(),
            "metadados_extras": {
                "spin_rpm": int(random.uniform(1400, 2800)),
                "ponto_contato_sweetspot": precisao >= 0.88,
            },
        })

    return movimentos


def _formatar_tempo_hhmmss(segundos: int) -> str:
    h = segundos // 3600
    m = (segundos % 3600) // 60
    s = segundos % 60
    return f"{h:02d}:{m:02d}:{s:02d}"


# ---------------------------------------------------------------------------
# SEED PRINCIPAL
# ---------------------------------------------------------------------------

def seed_plataforma(force_reset: bool = False) -> None:
    """Popula completamente a plataforma FLUX."""
    print("================================================================")
    print("🚀 INICIANDO SEED DA PLATAFORMA FLUX (ATLETAS, TREINOS & SOCIAL)")
    print("================================================================")

    Base.metadata.create_all(bind=engine)
    nosql_repo = MovimentoNoSQLRepository()

    with SessionLocal() as session:
        # Se force_reset estiver ativo, limpa postagens, sessões e relacionamentos
        if force_reset:
            print("[seed] Reset forçado ativo: limpando treinos e postagens anteriores...")
            session.query(Comentario).delete()
            session.query(Curtida).delete()
            session.query(Postagem).delete()
            session.query(Circuito).delete()
            session.query(Sessao).delete()
            session.query(EstabelecimentoFavorito).delete()
            session.query(Cliente).delete()
            session.query(Seguidor).delete()
            session.commit()

        # -------------------------------------------------------------------
        # 1. USUÁRIOS
        # -------------------------------------------------------------------
        print("\n[1/6] Sincronizando usuários base...")
        usuario_map: dict[str, Usuario] = {}
        for dados in USUARIOS_INICIAIS:
            user = (
                session.query(Usuario)
                .filter((Usuario.email == dados["email"]) | (Usuario.username == dados["username"]))
                .first()
            )
            if not user:
                user = Usuario(
                    nome=dados["nome"],
                    username=dados["username"],
                    email=dados["email"],
                    senha_hash=gerar_hash_senha(dados["senha_plana"]),
                    tipo_perfil=dados["tipo_perfil"],
                    foto_perfil_url=dados.get("foto_perfil_url"),
                    bio=dados["bio"],
                    xp_total=dados["xp_total"],
                    nivel=dados["nivel"],
                )
                session.add(user)
                session.flush()
                print(f"  + Criado usuário @{user.username} ({user.tipo_perfil})")
            else:
                user.nome = dados["nome"]
                user.tipo_perfil = dados["tipo_perfil"]
                user.foto_perfil_url = dados.get("foto_perfil_url")
                user.bio = dados["bio"]
                user.xp_total = dados["xp_total"]
                user.nivel = dados["nivel"]
                session.flush()
                print(f"  • Atualizado usuário existente @{user.username}")
            usuario_map[user.username] = user

        session.commit()

        lucas = usuario_map["lucastennis"]
        carlos = usuario_map["carlospersonal"]
        marina = usuario_map["marinacosta"]
        rodrigo = usuario_map["rodrigosousa"]

        # -------------------------------------------------------------------
        # 2. REDE SOCIAL & SEGUIDORES
        # -------------------------------------------------------------------
        print("\n[2/6] Criando conexões e rede de seguidores...")
        conexoes = [
            (carlos.id, lucas.id),   # Carlos segue Lucas
            (marina.id, lucas.id),   # Marina segue Lucas
            (rodrigo.id, lucas.id),  # Rodrigo segue Lucas
            (lucas.id, carlos.id),   # Lucas segue Carlos
            (lucas.id, marina.id),   # Lucas segue Marina
            (marina.id, carlos.id),  # Marina segue Carlos
        ]
        for seguidor_id, seguido_id in conexoes:
            existe = (
                session.query(Seguidor)
                .filter_by(id_seguidor=seguidor_id, id_seguido=seguido_id)
                .first()
            )
            if not existe:
                session.add(Seguidor(id_seguidor=seguidor_id, id_seguido=seguido_id, status="aceito"))
        session.commit()
        print("  ✓ Vínculos de seguidores garantidos.")

        # -------------------------------------------------------------------
        # 3. VÍNCULOS PERSONAL - ALUNO (CLIENTES)
        # -------------------------------------------------------------------
        print("\n[3/6] Vinculando atletas ao treinador Carlos Mendes...")
        vinculos_coach = [
            (carlos.id, lucas.id, "Foco em terminação de braço no Forehand e velocidade no Saque"),
            (carlos.id, marina.id, "Adaptação para empunhadura semi-western e consistência de fundo"),
        ]
        for coach_id, aluno_id, obs in vinculos_coach:
            existe = session.query(Cliente).filter_by(id_personal=coach_id, id_aluno=aluno_id).first()
            if not existe:
                session.add(Cliente(id_personal=coach_id, id_aluno=aluno_id, status="ativo", observacoes=obs))
        session.commit()
        print("  ✓ Vínculos de mentoria esportiva estabelecidos.")

        # -------------------------------------------------------------------
        # 4. ESTABELECIMENTOS ESPORTIVOS
        # -------------------------------------------------------------------
        print("\n[4/6] Cadastrando estabelecimentos e arenas parceiras...")
        estab_map: dict[str, Estabelecimento] = {}
        for dados in ESTABELECIMENTOS_INICIAIS:
            estab = session.query(Estabelecimento).filter_by(cnpj=dados["cnpj"]).first()
            if not estab:
                estab = Estabelecimento(**dados)
                session.add(estab)
                session.flush()
                print(f"  + Arena cadastrada: {estab.nome}")
            estab_map[estab.nome] = estab
        session.commit()

        # Favorita estabelecimentos para Lucas
        for estab in estab_map.values():
            fav = (
                session.query(EstabelecimentoFavorito)
                .filter_by(id_usuario=lucas.id, id_estabelecimento=estab.id)
                .first()
            )
            if not fav:
                session.add(EstabelecimentoFavorito(id_usuario=lucas.id, id_estabelecimento=estab.id))
        session.commit()

        # -------------------------------------------------------------------
        # 5. SESSÕES DE TREINO, CIRCUITOS & TELEMETRIA NOSQL
        # -------------------------------------------------------------------
        print("\n[5/6] Gerando histórico de treinos biomecânicos e telemetria NoSQL...")

        # Verifica se o Lucas já possui sessões salvas
        sessoes_existentes = session.query(Sessao).filter_by(id_usuario=lucas.id).count()
        if sessoes_existentes > 0 and not force_reset:
            print(f"  • @{lucas.username} já possui {sessoes_existentes} sessões cadastradas. Pulando recriação.")
        else:
            agora = datetime.now(timezone.utc)
            arena_principal = list(estab_map.values())[0]
            arena_saibro = list(estab_map.values())[1]

            # Definição das 8 sessões do atleta Lucas
            definicoes_sessoes_lucas = [
                {
                    "dias_atras": 0,
                    "horas_atras": 3,
                    "duracao_minutos": 48,
                    "estabelecimento": arena_principal,
                    "circuitos": [
                        {"nome": "Aquecimento de Forehand Cruzado", "golpes": 50, "acerto": 94.0, "pontos": 310},
                        {"nome": "Rally de Fundo & Transição", "golpes": 50, "acerto": 92.5, "pontos": 290},
                        {"nome": "Saques Abertos & Chapados", "golpes": 42, "acerto": 95.0, "pontos": 240},
                    ],
                },
                {
                    "dias_atras": 1,
                    "horas_atras": 4,
                    "duracao_minutos": 42,
                    "estabelecimento": arena_saibro,
                    "circuitos": [
                        {"nome": "Voleios Rápidos na Rede", "golpes": 40, "acerto": 90.0, "pontos": 250},
                        {"nome": "Forehand de Ataque Acelerado", "golpes": 45, "acerto": 93.0, "pontos": 290},
                        {"nome": "Smash & Defesa Alta", "golpes": 33, "acerto": 89.0, "pontos": 220},
                    ],
                },
                {
                    "dias_atras": 3,
                    "horas_atras": 2,
                    "duracao_minutos": 55,
                    "estabelecimento": arena_principal,
                    "circuitos": [
                        {"nome": "Consistência de Bolas Longas", "golpes": 45, "acerto": 96.0, "pontos": 300},
                        {"nome": "Backhand Paralelo com Duas Mãos", "golpes": 40, "acerto": 93.0, "pontos": 260},
                        {"nome": "Forehand com Topspin Pesado", "golpes": 45, "acerto": 95.0, "pontos": 280},
                        {"nome": "Saque de Precisão no 'T'", "golpes": 35, "acerto": 96.0, "pontos": 180},
                    ],
                },
                {
                    "dias_atras": 5,
                    "horas_atras": 5,
                    "duracao_minutos": 35,
                    "estabelecimento": arena_principal,
                    "circuitos": [
                        {"nome": "Padrão de Movimento & Footwork", "golpes": 45, "acerto": 87.5, "pontos": 280},
                        {"nome": "Calibração de Spin com Sensor FLUX", "golpes": 43, "acerto": 90.0, "pontos": 310},
                    ],
                },
                {
                    "dias_atras": 8,
                    "horas_atras": 3,
                    "duracao_minutos": 44,
                    "estabelecimento": arena_saibro,
                    "circuitos": [
                        {"nome": "Saque Slice Aberto", "golpes": 40, "acerto": 91.0, "pontos": 260},
                        {"nome": "Forehand Inside-Out", "golpes": 44, "acerto": 93.0, "pontos": 290},
                        {"nome": "Backhand Curto Cruzado", "golpes": 40, "acerto": 92.0, "pontos": 260},
                    ],
                },
                {
                    "dias_atras": 11,
                    "horas_atras": 4,
                    "duracao_minutos": 50,
                    "estabelecimento": arena_principal,
                    "circuitos": [
                        {"nome": "Devoluções de Primeiro Serviço", "golpes": 45, "acerto": 89.0, "pontos": 290},
                        {"nome": "Voleios de Bloqueio", "golpes": 45, "acerto": 92.0, "pontos": 310},
                        {"nome": "Forehand de Finalização", "golpes": 48, "acerto": 91.0, "pontos": 340},
                    ],
                },
                {
                    "dias_atras": 14,
                    "horas_atras": 2,
                    "duracao_minutos": 38,
                    "estabelecimento": arena_saibro,
                    "circuitos": [
                        {"nome": "Consistência de Fundo de Quadra", "golpes": 48, "acerto": 88.0, "pontos": 320},
                        {"nome": "Ritmo & Aceleração Angular", "golpes": 48, "acerto": 90.0, "pontos": 350},
                    ],
                },
                {
                    "dias_atras": 18,
                    "horas_atras": 5,
                    "duracao_minutos": 46,
                    "estabelecimento": arena_principal,
                    "circuitos": [
                        {"nome": "Calibração Inicial do Bracelete", "golpes": 40, "acerto": 90.0, "pontos": 250},
                        {"nome": "Forehand e Backhand Alternados", "golpes": 45, "acerto": 92.0, "pontos": 290},
                        {"nome": "Simulação de Tiebreak", "golpes": 45, "acerto": 93.0, "pontos": 280},
                    ],
                },
            ]

            sessoes_criadas_lucas = []

            for idx, def_s in enumerate(definicoes_sessoes_lucas):
                inicio = agora - timedelta(days=def_s["dias_atras"], hours=def_s["horas_atras"])
                fim = inicio + timedelta(minutes=def_s["duracao_minutos"])
                pontuacao_sessao = sum(c["pontos"] for c in def_s["circuitos"])

                sessao = Sessao(
                    id=str(uuid.uuid4()),
                    id_usuario=lucas.id,
                    id_estabelecimento=def_s["estabelecimento"].id,
                    modalidade="tenis",
                    data_inicio=inicio,
                    data_fim=fim,
                    pontuacao_total=pontuacao_sessao,
                )
                session.add(sessao)
                session.flush()

                circuitos_snapshot = []
                total_golpes_sessao = 0
                soma_precisao_sessao = 0.0

                for c_idx, c_info in enumerate(def_s["circuitos"]):
                    circ_inicio = inicio + timedelta(minutes=c_idx * 14)
                    circ_fim = circ_inicio + timedelta(minutes=12)
                    circ_id = str(uuid.uuid4())
                    doc_id = nosql_repo.gerar_doc_id(circ_id)

                    circuito = Circuito(
                        id=circ_id,
                        id_sessao=sessao.id,
                        id_movimentos_nosql=doc_id,
                        numero_rodada=c_idx + 1,
                        hora_inicio=circ_inicio,
                        hora_fim=circ_fim,
                        pontuacao=c_info["pontos"],
                    )
                    session.add(circuito)
                    session.flush()

                    # Gera telemetria NoSQL dos golpes no TinyDB
                    movimentos = _gerar_golpes_circuito(
                        total_golpes=c_info["golpes"],
                        percentual_acerto_alvo=c_info["acerto"],
                        data_circuito=circ_inicio,
                    )
                    nosql_repo.salvar_movimentos_circuito(
                        id_sessao=sessao.id,
                        id_circuito=circ_id,
                        versao_modelo_ia="v4",
                        movimentos=movimentos,
                    )

                    total_golpes_sessao += c_info["golpes"]
                    soma_precisao_sessao += (c_info["acerto"] * c_info["golpes"])

                    circuitos_snapshot.append({
                        "id": circ_id,
                        "tituloMeta": f"Meta: {c_info['golpes']} golpes • {c_info['nome']}",
                        "tempoSegundos": 12 * 60,
                        "totalGolpes": c_info["golpes"],
                        "percentualAcerto": c_info["acerto"],
                        "pontuacao": c_info["pontos"],
                    })

                media_acerto_sessao = (
                    round(soma_precisao_sessao / total_golpes_sessao, 1)
                    if total_golpes_sessao > 0
                    else 90.0
                )

                sessoes_criadas_lucas.append({
                    "sessao": sessao,
                    "inicio": inicio,
                    "duracao_segundos": def_s["duracao_minutos"] * 60,
                    "duracao_formatada": _formatar_tempo_hhmmss(def_s["duracao_minutos"] * 60),
                    "pontuacao_total": pontuacao_sessao,
                    "total_golpes": total_golpes_sessao,
                    "percentual_acerto": media_acerto_sessao,
                    "circuitos": circuitos_snapshot,
                })

            session.commit()
            print(f"  ✓ {len(sessoes_criadas_lucas)} sessões biomecânicas criadas com sucesso para @{lucas.username}!")

            # -------------------------------------------------------------------
            # 6. POSTAGENS DO FEED SOCIAL COM TEMPLATE STRAVA 1:1
            # -------------------------------------------------------------------
            print("\n[6/6] Publicando atividades e templates Strava no Feed social...")

            # Post 1 (Lucas - Treino de Hoje)
            s1 = sessoes_criadas_lucas[0]
            template_p1 = {
                "tipo": "flux_strava_v1",
                "dataSessaoFormatada": s1["inicio"].strftime("%d/%m/%Y"),
                "tempoTotalFormatado": s1["duracao_formatada"],
                "pontuacaoTotal": s1["pontuacao_total"],
                "percentualMedioAcerto": s1["percentual_acerto"],
                "totalGolpes": s1["total_golpes"],
                "fotoBackgroundUri": "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1200&q=80",
                "circuitos": s1["circuitos"],
            }
            post1 = Postagem(
                id=str(uuid.uuid4()),
                id_usuario=lucas.id,
                id_sessao=s1["sessao"].id,
                legenda=(
                    "Treino de alta intensidade hoje na Arena Morumbi! 🎾⚡ "
                    "Testando o modelo v4 do FLUX: mais de 140 golpes monitorados e precisão média de 93.5%. "
                    "O Forehand tá saindo muito limpo e potente!"
                ),
                midia_url=json.dumps(template_p1, ensure_ascii=False),
                visibilidade="publico",
                criado_em=s1["inicio"] + timedelta(minutes=50),
            )
            session.add(post1)
            session.flush()

            # Curtidas no Post 1
            session.add(Curtida(id_postagem=post1.id, id_usuario=carlos.id))
            session.add(Curtida(id_postagem=post1.id, id_usuario=marina.id))
            session.add(Curtida(id_postagem=post1.id, id_usuario=rodrigo.id))

            # Comentários no Post 1
            session.add(
                Comentario(
                    id_postagem=post1.id,
                    id_usuario=carlos.id,
                    texto="Show Lucas! A velocidade angular no término do golpe subiu bastante comparado à semana passada. Mantém esse ritmo!",
                    criado_em=s1["inicio"] + timedelta(minutes=55),
                )
            )
            session.add(
                Comentario(
                    id_postagem=post1.id,
                    id_usuario=marina.id,
                    texto="Que aula! Parabéns pela consistência, 93% de acerto com essa potência é surreal 🚀🎾",
                    criado_em=s1["inicio"] + timedelta(minutes=62),
                )
            )

            # Post 2 (Carlos Mendes - Dica Técnica Biomecânica de Ontem)
            post2 = Postagem(
                id=str(uuid.uuid4()),
                id_usuario=carlos.id,
                legenda=(
                    "Dica técnica de biomecânica para quem joga com o bracelete FLUX: "
                    "reparem na aceleração angular média (Gz) durante o swing. "
                    "Manter o punho firme no ponto de contato transfere muito mais energia cinética para a bola "
                    "sem sobrecarregar a articulação do cotovelo. Bons treinos a todos! 🎾🦾"
                ),
                midia_url="https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1200&q=80",
                visibilidade="publico",
                criado_em=agora - timedelta(days=1, hours=2),
            )
            session.add(post2)
            session.flush()
            session.add(Curtida(id_postagem=post2.id, id_usuario=lucas.id))
            session.add(Curtida(id_postagem=post2.id, id_usuario=marina.id))
            session.add(
                Comentario(
                    id_postagem=post2.id,
                    id_usuario=lucas.id,
                    texto="Essa dica da rotação de punho mudou meu forehand, professor! Valeu demais.",
                    criado_em=agora - timedelta(days=1, hours=1),
                )
            )

            # Post 3 (Marina Costa - Treino há 2 dias)
            post3 = Postagem(
                id=str(uuid.uuid4()),
                id_usuario=marina.id,
                legenda=(
                    "Fechando o segundo treino da semana com o bracelete FLUX! 🎾✨ "
                    "Ainda me adaptando à empunhadura semi-western, mas ver o percentual de acerto subir para 88% "
                    "dá uma motivação incrível! Rumo aos 90%!"
                ),
                midia_url="https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1200&q=80",
                visibilidade="publico",
                criado_em=agora - timedelta(days=2, hours=1),
            )
            session.add(post3)
            session.flush()
            session.add(Curtida(id_postagem=post3.id, id_usuario=lucas.id))
            session.add(Curtida(id_postagem=post3.id, id_usuario=carlos.id))
            session.add(
                Comentario(
                    id_postagem=post3.id,
                    id_usuario=carlos.id,
                    texto="Excelente progresso na terminação de golpe, Marina! No próximo treino vamos calibrar o saque.",
                    criado_em=agora - timedelta(days=2, minutes=45),
                )
            )
            session.add(
                Comentario(
                    id_postagem=post3.id,
                    id_usuario=rodrigo.id,
                    texto="Bora marcar um set qualquer dia desses! Parabéns pela evolução!",
                    criado_em=agora - timedelta(days=2, minutes=20),
                )
            )

            # Post 4 (Lucas - Sessão de 5 dias atrás)
            s4 = sessoes_criadas_lucas[3]
            template_p4 = {
                "tipo": "flux_strava_v1",
                "dataSessaoFormatada": s4["inicio"].strftime("%d/%m/%Y"),
                "tempoTotalFormatado": s4["duracao_formatada"],
                "pontuacaoTotal": s4["pontuacao_total"],
                "percentualMedioAcerto": s4["percentual_acerto"],
                "totalGolpes": s4["total_golpes"],
                "fotoBackgroundUri": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80",
                "circuitos": s4["circuitos"],
            }
            post4 = Postagem(
                id=str(uuid.uuid4()),
                id_usuario=lucas.id,
                id_sessao=s4["sessao"].id,
                legenda=(
                    "Sessão de calibração de spin e posicionamento de pernas. "
                    "Foco total em consistência de fundo de quadra. 🎾🔥"
                ),
                midia_url=json.dumps(template_p4, ensure_ascii=False),
                visibilidade="publico",
                criado_em=s4["inicio"] + timedelta(minutes=40),
            )
            session.add(post4)
            session.flush()
            session.add(Curtida(id_postagem=post4.id, id_usuario=carlos.id))
            session.add(Curtida(id_postagem=post4.id, id_usuario=marina.id))

            session.commit()
            print("  ✓ Publicações, curtidas e comentários do Feed criados com sucesso!")

    print("\n================================================================")
    print("✅ SEED CONCLUÍDO COM SUCESSO!")
    print("Credenciais disponíveis:")
    print("  • Atleta Principal:  atleta@flux.com   / 123456  (@lucastennis)")
    print("  • Personal Trainer:  personal@flux.com / 123456  (@carlospersonal)")
    print("  • Atleta Iniciante:  iniciante@flux.com/ 123456  (@marinacosta)")
    print("  • Desenvolvedor:     dev@flux.com      / 123456  (@devlab)")
    print("================================================================")


def seed_usuarios() -> None:
    """Função compatível chamada pelo lifespan do FastAPI (app/main.py)."""
    seed_plataforma(force_reset=False)


if __name__ == "__main__":
    reset = "--reset" in sys.argv or "--force" in sys.argv
    seed_plataforma(force_reset=reset)

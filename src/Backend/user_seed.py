from app.core.database import SessionLocal, engine
from app.core.security import gerar_hash_senha
from app.models import Base, Usuario
from app.repositories.usuario_repository import UsuarioRepository

USUARIOS_INICIAIS = [
    {
        "nome": "Lucas Silva",
        "username": "lucastennis",
        "email": "atleta@flux.com",
        "senha_plana": "123456",
        "tipo_perfil": "atleta",
        "bio": "Atleta de Tênis • Smart Tennis Arena",
        "xp_total": 2450,
        "nivel": 3,
    },
    {
        "nome": "Carlos Mendes",
        "username": "carlospersonal",
        "email": "personal@flux.com",
        "senha_plana": "123456",
        "tipo_perfil": "personal",
        "bio": "Treinador e Especialista em Biomecânica do Tênis",
        "xp_total": 5200,
        "nivel": 6,
    },
    {
        "nome": "Marina Costa",
        "username": "marinacosta",
        "email": "iniciante@flux.com",
        "senha_plana": "123456",
        "tipo_perfil": "atleta",
        "bio": "Começando no tênis com o bracelete FLUX!",
        "xp_total": 350,
        "nivel": 1,
    },
]


def seed_usuarios() -> None:
    """Popula o banco SQLite com usuários iniciais usando hash Argon2id (gerar_hash_senha)."""
    Base.metadata.create_all(bind=engine)

    with SessionLocal() as session:
        repo = UsuarioRepository(session)
        criados = 0

        for dados in USUARIOS_INICIAIS:
            existente = repo.get_by_email(dados["email"]) or repo.get_by_username(dados["username"])
            if existente:
                continue

            usuario = Usuario(
                nome=dados["nome"],
                username=dados["username"],
                email=dados["email"],
                senha_hash=gerar_hash_senha(dados["senha_plana"]),
                tipo_perfil=dados["tipo_perfil"],
                bio=dados["bio"],
                xp_total=dados["xp_total"],
                nivel=dados["nivel"],
            )
            session.add(usuario)
            criados += 1

        session.commit()
        if criados > 0:
            print(f"[user_seed] {criados} usuário(s) criado(s) com criptografia Argon2id.")
        else:
            print("[user_seed] Usuários iniciais já estavam cadastrados.")


if __name__ == "__main__":
    seed_usuarios()


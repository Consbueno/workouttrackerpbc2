import psycopg2
import psycopg2.extras
import psycopg2.pool
import os
from contextlib import contextmanager

_pool = None


def init_pool(app):
    global _pool
    db_url = app.config.get("DATABASE_URL")

    if db_url:
        # Supabase: DATABASE_URL já inclui host, porta, SSL etc.
        # Acrescentamos sslmode=require se não estiver na URL.
        if "sslmode" not in db_url:
            sep = "&" if "?" in db_url else "?"
            db_url = f"{db_url}{sep}sslmode=require"

        _pool = psycopg2.pool.ThreadedConnectionPool(
            2, 10,
            dsn=db_url,
            cursor_factory=psycopg2.extras.RealDictCursor,
        )
    else:
        # Desenvolvimento local: vars individuais
        _pool = psycopg2.pool.ThreadedConnectionPool(
            2, 10,
            host=app.config["DB_HOST"],
            port=app.config["DB_PORT"],
            dbname=app.config["DB_NAME"],
            user=app.config["DB_USER"],
            password=app.config["DB_PASSWORD"],
            sslmode=app.config.get("DB_SSLMODE", "prefer"),
            cursor_factory=psycopg2.extras.RealDictCursor,
        )


@contextmanager
def db():
    conn = _pool.getconn()
    try:
        cur = conn.cursor()

        # Injeta o user_id atual para as políticas de RLS.
        # SET LOCAL é restrito à transação atual — seguro com connection pool.
        try:
            from flask import g
            user_id = getattr(g, "user_id", None)
            if user_id is not None:
                cur.execute("SET LOCAL app.current_user_id = %s", (str(user_id),))
        except RuntimeError:
            # Fora do contexto Flask (ex: init_db) — sem SET LOCAL;
            # o role postgres tem bypass policy e opera normalmente.
            pass

        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        _pool.putconn(conn)


def query(sql, params=None):
    with db() as conn:
        cur = conn.cursor()
        cur.execute(sql, params or ())
        return cur.fetchall()


def query_one(sql, params=None):
    with db() as conn:
        cur = conn.cursor()
        cur.execute(sql, params or ())
        return cur.fetchone()


def execute(sql, params=None):
    with db() as conn:
        cur = conn.cursor()
        cur.execute(sql, params or ())
        try:
            return cur.fetchone()
        except Exception:
            return None


def init_db():
    """Executa schema.sql e seed.sql como role admin (bypassa RLS)."""
    base = os.path.dirname(os.path.abspath(__file__))
    with db() as conn:
        cur = conn.cursor()
        with open(os.path.join(base, "schema.sql"), encoding="utf-8") as f:
            cur.execute(f.read())
    try:
        with db() as conn:
            cur = conn.cursor()
            with open(os.path.join(base, "seed.sql"), encoding="utf-8") as f:
                cur.execute(f.read())
    except Exception as e:
        print(f"[DB] Seed skipped (probably already applied): {e}")

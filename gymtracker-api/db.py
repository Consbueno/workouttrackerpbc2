import psycopg2
import psycopg2.extras
import psycopg2.pool
import os
from contextlib import contextmanager

_pool = None


def init_pool(app):
    global _pool
    _pool = psycopg2.pool.ThreadedConnectionPool(
        minconn=2,
        maxconn=10,
        host=app.config["DB_HOST"],
        port=app.config["DB_PORT"],
        dbname=app.config["DB_NAME"],
        user=app.config["DB_USER"],
        password=app.config["DB_PASSWORD"],
        cursor_factory=psycopg2.extras.RealDictCursor,
    )


@contextmanager
def db():
    conn = _pool.getconn()
    try:
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

# GymTracker 16W — Setup

## Banco de dados: Supabase

### 1. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) → **New project**
2. Anote: **Project Ref**, **Region**, **Database Password**

### 2. Aplicar o schema + seed

No painel do Supabase: **SQL Editor → New query**

Cole e execute cada arquivo em ordem:

```
gymtracker-api/schema.sql   ← tabelas, triggers, índices, RLS
gymtracker-api/seed.sql     ← exercícios padrão
```

> O `schema.sql` habilita RLS com `FORCE` em todas as 13 tabelas.
> O seed roda como `postgres` (sem `app.current_user_id`), ativando o bypass policy.

### 3. Obter a connection string

Supabase Dashboard → **Project Settings → Database → Connection string → URI**

- Use **Direct connection** (porta 5432) para o backend com connection pool próprio (gunicorn).
- Use **Transaction pooler** (porta 6543) se querer o PgBouncer gerenciado pelo Supabase.

Formato:
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].supabase.com:5432/postgres
```

### 4. Configurar variáveis de ambiente do backend

```bash
cp gymtracker-api/.env.example gymtracker-api/.env
```

Edite `gymtracker-api/.env`:

```env
DATABASE_URL=postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].supabase.com:5432/postgres
SECRET_KEY=<string aleatória 64 chars>
JWT_SECRET_KEY=<outra string aleatória>
ANTHROPIC_API_KEY=sk-ant-api03-...
FRONTEND_URL=https://seu-dominio.com
```

---

## Desenvolvimento local (PostgreSQL local)

Se preferir rodar sem Supabase localmente:

```sql
CREATE USER gymtracker_user WITH PASSWORD 'gymtracker_pass';
CREATE DATABASE gymtracker OWNER gymtracker_user;
GRANT ALL PRIVILEGES ON DATABASE gymtracker TO gymtracker_user;
```

No `.env`, use as vars individuais (sem `DATABASE_URL`):

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gymtracker
DB_USER=gymtracker_user
DB_PASSWORD=gymtracker_pass
DB_SSLMODE=disable
```

O backend aplica `schema.sql` e `seed.sql` automaticamente no boot (`init_db()`).

> **RLS local:** Com PostgreSQL local conectado como `gymtracker_user`
> (não-owner), o RLS é aplicado. Com `postgres` (owner sem FORCE), é bypassado.
> O comportamento é idêntico ao Supabase em produção.

---

## Backend

```bash
cd gymtracker-api
pip install -r requirements.txt
flask --app app:create_app run --debug --port 5000
```

---

## Frontend

```bash
cd gymtracker-app
npm install
npm run dev        # http://localhost:5173
```

Variável de ambiente frontend (`gymtracker-app/.env.local`):
```env
VITE_API_URL=http://localhost:5000
```

---

## Build / Deploy (EasyPanel)

```bash
docker build -t gymtracker-api ./gymtracker-api
docker build -t gymtracker-app ./gymtracker-app
```

| Serviço | Porta | Protocolo destino |
|---------|-------|-------------------|
| gymtracker_api | 5000 | **HTTP** (SSL no proxy) |
| gymtracker_app | 80 | **HTTP** (SSL no proxy) |

No EasyPanel, defina `DATABASE_URL` como variável de ambiente do serviço `gymtracker_api`.

---

## Arquitetura RLS

```
Request HTTP
    │
    ▼
Flask before_request
    └─ JWT → g.user_id = 42
                │
                ▼
           db() context manager
               └─ SET LOCAL app.current_user_id = '42'
                              │
                              ▼
                    PostgreSQL / Supabase
                    └─ RLS policy: user_id = current_user_id()
                                               └─ = 42 ✓
```

Tabelas com `user_id` direto: política simples.
Tabelas sem `user_id` (blocos, splits, dias): política via JOIN/subquery até `training_programs.user_id`.
Operações admin (init_db/seed sem JWT): bypass policy para role `postgres`.

---

## Ícones PWA

Substitua os arquivos em `gymtracker-app/public/`:
- `favicon.ico` (32×32)
- `icon-192.png` (192×192)
- `icon-512.png` (512×512)

Use `public/icon.svg` como base via [realfavicongenerator.net](https://realfavicongenerator.net).

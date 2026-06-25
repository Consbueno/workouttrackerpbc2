# GymTracker 16W — Setup de Desenvolvimento

## Pré-requisitos

- Python 3.12+
- Node.js 20+
- PostgreSQL 16 rodando localmente

## 1. PostgreSQL — Criar banco

```sql
CREATE USER gymtracker_user WITH PASSWORD 'gymtracker_pass';
CREATE DATABASE gymtracker OWNER gymtracker_user;
GRANT ALL PRIVILEGES ON DATABASE gymtracker TO gymtracker_user;
```

## 2. Backend (Flask API)

```bash
cd gymtracker-api

# Copiar env
cp .env.example .env
# Editar .env: ajuste DB_PASSWORD e ANTHROPIC_API_KEY

# Instalar dependências
pip install -r requirements.txt

# Rodar (aplica schema.sql e seed.sql automaticamente no boot)
flask --app app:create_app run --debug --port 5000
```

O schema e seed são aplicados automaticamente na primeira execução via `init_db()`.

## 3. Frontend (React)

```bash
cd gymtracker-app

# Copiar env
cp .env.example .env.local
# VITE_API_URL=http://localhost:5000

# Instalar dependências
npm install

# Rodar em dev
npm run dev
```

Acesse: http://localhost:5173

## 4. Build para produção

```bash
# Backend
docker build -t gymtracker-api ./gymtracker-api

# Frontend
docker build -t gymtracker-app ./gymtracker-app
```

## Ícones PWA

Substitua os arquivos placeholder em `gymtracker-app/public/`:
- `favicon.ico` (32x32 ICO)
- `icon-192.png` (192x192 PNG)
- `icon-512.png` (512x512 PNG)

Use o `public/icon.svg` como base e converta via https://realfavicongenerator.net/

## Estrutura de serviços no EasyPanel

| Serviço | Tipo | Porta interna | Domínio |
|---------|------|---------------|---------|
| gymtracker_postgres | PostgreSQL | 5432 | — |
| gymtracker_api | App (Dockerfile) | 5000 → HTTP | api.dominio.com |
| gymtracker_app | App (Dockerfile) | 80 → HTTP | dominio.com |

> **IMPORTANTE:** No EasyPanel, configure o protocolo de destino como **HTTP** (não HTTPS). O SSL é gerenciado pelo proxy reverso do EasyPanel.

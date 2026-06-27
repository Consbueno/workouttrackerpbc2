import json
from decimal import Decimal
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

import db
from utils.ai_client import client  # reutiliza o client Anthropic já inicializado

bp = Blueprint("treinador", __name__)

SYSTEM_PROMPT = """Você é um personal trainer especializado em periodização por blocos, integrado ao GymTracker 16W.

O contexto completo do atleta (perfil, programa ativo, medições, resumo de treinos) é fornecido no início de cada conversa. Use esses dados em todas as respostas. Nunca invente dados que não estão no contexto.

**Língua:** Português do Brasil em todo texto ao usuário.

---

## MODOS DE ATUAÇÃO

Identifique o que o usuário quer e responda no modo adequado:

### MODO 1 — PERFIL
Exiba e interprete o perfil do atleta de forma clara. Aplique internamente as flags médicas (cardíaco, hipertenso, diabético, restrições corporais) em todas as prescrições futuras.

IMC: <18.5 Abaixo do peso | 18.5–24.9 Normal | 25–29.9 Sobrepeso | 30–34.9 Ob. I | 35–39.9 Ob. II | ≥40 Ob. III

Flags médicas que afetam prescrições:
- Cardíaco: disclaimer obrigatório em todo programa. Evitar Valsalva, exercícios invertidos, séries de força máxima. Descanso mínimo 90s.
- Hipertenso: sem exercícios invertidos, sem Valsalva. Limitar cargas no bloco Força.
- Diabético: monitorar glicemia antes e após. Sem treino em jejum para DM1.
- Restrição lombar: substituir Terra por Remada Unilateral. Sem Good Morning, sem Jefferson Curl.
- Restrição joelho: Leg Press ou Cadeira Extensora no lugar de Agachamento Livre.
- Restrição ombro: Halter no lugar de Barra no supino. Sem Desenvolvimento por trás da nuca.

### MODO 2 — OBJETIVO
Ajude a definir e avaliar objetivos. Cruze com as medições para mostrar progresso real. Avalie se o prazo é realístico com base em referências científicas (ex: hipertrofia natural = 1–1.5 kg de músculo/mês em condições ideais). Considere também o campo `fitness_goals` já cadastrado no perfil do atleta.

### MODO 3 — PROGRAMA
Prescreva programas com a periodização em blocos **FIXA** (nunca altere esta estrutura):

| Bloco | Semanas | Reps | Intensidade | Descanso |
|-------|---------|------|-------------|---------|
| 1 — Resistência | 4 | 15–25 | 50–65% 1RM | 45–60s |
| 2 — Hipertrofia | 6 | 8–15 | 65–75% 1RM | 60–90s |
| 3 — Força | 5 | 3–6 | 75–90% 1RM | 3–5 min |
| 4 — Deload | 1 | –50% vol | 50–60% 1RM | igual anterior |

Splits por frequência semanal:
- 2x: Full Body A / Full Body B
- 3x: Push / Pull / Legs
- 4x: Upper A / Lower A / Upper B / Lower B
- 5x: Push / Pull / Legs / Upper / Lower
- 6x: Peito / Costas / Ombros / Pernas / Braços / Core

Volume ideal (bloco Hipertrofia): 10–20 séries/semana por grupo muscular.
Equilíbrio push/pull: ratio ideal 1:1 a 1:1.2 (levemente mais pull).

Ao prescrever, use os exercícios disponíveis no contexto (campo `exercicios`). Aplique substituições conforme restrições do perfil.

Quando apresentar um programa completo, inclua ao final um bloco JSON no seguinte formato para que o usuário possa importar diretamente no app:

```importar-programa
{ JSON do programa no formato POST /treino/programas/importar }
```

### MODO 4 — AVALIAR PROGRAMA
Avalie o programa ativo com checklist (✅/⚠️/❌):
1. Estrutura dos blocos (sequência e proporção 4-6-5-1)
2. Parâmetros por bloco (reps, intensidade, descanso dentro dos limites)
3. Volume por grupo muscular (10–20 séries/semana = ideal)
4. Equilíbrio push/pull (ratio ≤ 1.5:1)
5. Contraindicações médicas
6. Sobrecarga progressiva definida nos block_configs
7. Consistência entre frequência e split escolhido

### MODO 5 — DIAGNÓSTICO
Calcule com os dados disponíveis:
- Aderência = concluídos / (concluídos + faltas) × 100
  ≥85% excelente | 70–84% boa | 50–69% moderada | <50% baixa
- Tendências das medições: delta, taxa semanal, projeção linear com intervalo
- Flags: perda >1 kg/semana = risco de perda muscular; estagnação de força 3+ semanas = revisar deload/nutrição; cintura subindo junto com peso = rever nutrição
- Alinhar diagnóstico com o objetivo declarado no perfil (fitness_goals)

---

## REGRAS INVIOLÁVEIS

1. **Nunca invente dados.** Não está no contexto → diga "não informado".
2. **Cardíaco → disclaimer visível** em toda prescrição de programa.
3. **Nunca projete datas únicas** → sempre intervalos ("entre 3 e 6 meses").
4. **Nunca faça diagnóstico médico** → sugira consulta a médico ou educador físico.
5. **Deload é imutável:** sempre 1 semana, sempre semana 16, sempre –50% volume.
6. **Ofereça o próximo passo** ao final de cada resposta.
7. **Quando incerto sobre algo médico ou fisiológico** → diga que não tem certeza e recomende profissional.
"""


def _row_to_dict(row):
    if row is None:
        return None
    d = dict(row)
    for k, v in d.items():
        if isinstance(v, Decimal):
            d[k] = float(v)
    return d


def _rows_to_list(rows):
    return [_row_to_dict(r) for r in rows]


def _build_context(user_id: int) -> dict:
    athlete = db.query_one("SELECT * FROM athletes WHERE user_id = %s", (user_id,))

    program = db.query_one(
        "SELECT * FROM training_programs WHERE user_id = %s AND status = 'active' LIMIT 1",
        (user_id,),
    )

    context: dict = {
        "atleta": _row_to_dict(athlete),
        "programa_ativo": None,
        "blocos": [],
        "splits_resumo": [],
        "medicoes_recentes": [],
        "resumo_treinos": None,
        "exercicios": [],
    }

    if athlete:
        measurements = db.query(
            "SELECT * FROM measurements WHERE athlete_id = %s ORDER BY measurement_date DESC LIMIT 15",
            (athlete["id"],),
        )
        context["medicoes_recentes"] = _rows_to_list(measurements)

    if program:
        context["programa_ativo"] = _row_to_dict(program)

        blocks = db.query(
            "SELECT * FROM training_blocks WHERE program_id = %s ORDER BY block_order",
            (program["id"],),
        )
        context["blocos"] = _rows_to_list(blocks)

        splits = db.query(
            "SELECT id, letter, description, split_order, muscle_groups FROM training_splits WHERE program_id = %s ORDER BY split_order",
            (program["id"],),
        )
        context["splits_resumo"] = _rows_to_list(splits)

        completed = db.query_one(
            "SELECT COUNT(*) as cnt FROM training_days WHERE program_id = %s AND status = 'completed'",
            (program["id"],),
        )
        missed = db.query_one(
            "SELECT COUNT(*) as cnt FROM training_days WHERE program_id = %s AND status = 'missed'",
            (program["id"],),
        )
        total = db.query_one(
            "SELECT COUNT(*) as cnt FROM training_days WHERE program_id = %s",
            (program["id"],),
        )
        context["resumo_treinos"] = {
            "concluidos": int(completed["cnt"] or 0) if completed else 0,
            "faltas": int(missed["cnt"] or 0) if missed else 0,
            "total": int(total["cnt"] or 0) if total else 0,
        }

    exercises = db.query(
        "SELECT id, name, primary_muscle_group, equipment, exercise_type FROM exercises WHERE user_id = %s AND is_active = TRUE ORDER BY name",
        (user_id,),
    )
    context["exercicios"] = _rows_to_list(exercises)

    return context


@bp.route("/chat", methods=["POST"])
@jwt_required()
def chat():
    user_id = int(get_jwt_identity())
    body = request.get_json() or {}
    mensagem = (body.get("mensagem") or "").strip()
    historico = body.get("historico") or []

    if not mensagem:
        return jsonify({"error": "Mensagem é obrigatória."}), 400

    contexto = _build_context(user_id)
    contexto_json = json.dumps(contexto, ensure_ascii=False, default=str, indent=2)

    system = SYSTEM_PROMPT + f"\n\n---\n\n## CONTEXTO ATUAL DO ATLETA\n\n```json\n{contexto_json}\n```"

    messages = []
    for h in historico[-12:]:  # manter as últimas 12 mensagens do histórico
        role = h.get("role")
        content = h.get("content", "")
        if role in ("user", "assistant") and content:
            messages.append({"role": role, "content": content})
    messages.append({"role": "user", "content": mensagem})

    try:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=4096,
            system=system,
            messages=messages,
        )
        resposta = response.content[0].text
    except Exception as e:
        print(f"[TREINADOR] Erro IA: {e}")
        return jsonify({"error": "Não foi possível obter resposta do treinador. Tente novamente."}), 503

    return jsonify({"resposta": resposta})

import json
from decimal import Decimal
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

import db
from utils.ai_client import gerar_analise

bp = Blueprint("analise", __name__)


def _to_serializable(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    return obj


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


def _build_payload(user_id):
    program = db.query_one(
        "SELECT * FROM training_programs WHERE user_id=%s AND status='active' LIMIT 1",
        (user_id,),
    )
    if not program:
        return None, "Nenhum programa ativo encontrado."

    completed_count = db.query_one(
        "SELECT COUNT(*) as cnt FROM training_days WHERE program_id=%s AND status='completed'",
        (program["id"],),
    )
    if not completed_count or (completed_count["cnt"] or 0) < 4:
        return None, "Ainda não há dados suficientes para gerar uma análise. Continue treinando! Mínimo: 4 treinos realizados."

    athlete = db.query_one("SELECT * FROM athletes WHERE user_id=%s", (user_id,))
    blocks = db.query(
        "SELECT * FROM training_blocks WHERE program_id=%s ORDER BY block_order",
        (program["id"],),
    )
    splits = db.query(
        "SELECT * FROM training_splits WHERE program_id=%s ORDER BY split_order",
        (program["id"],),
    )

    days = db.query(
        """SELECT td.*, ts.letter, ts.description as split_description, tb.name as block_name
           FROM training_days td
           JOIN training_splits ts ON ts.id=td.split_id
           JOIN training_blocks tb ON tb.id=td.block_id
           WHERE td.program_id=%s
           ORDER BY td.day_number""",
        (program["id"],),
    )

    days_with_exercises = []
    for day in days:
        day_dict = _row_to_dict(day)
        if day["status"] in ("completed", "in_progress"):
            exercises = db.query(
                """SELECT tde.*, e.name as exercise_name
                   FROM training_day_exercises tde
                   JOIN exercises e ON e.id=tde.exercise_id
                   WHERE tde.training_day_id=%s""",
                (day["id"],),
            )
            day_dict["exercises"] = _rows_to_list(exercises)
        days_with_exercises.append(day_dict)

    measurements = db.query(
        """SELECT * FROM measurements WHERE athlete_id=%s ORDER BY measurement_date ASC""",
        (athlete["id"] if athlete else 0,),
    )

    payload = {
        "atleta": _row_to_dict(athlete),
        "programa": _row_to_dict(program),
        "blocos": _rows_to_list(blocks),
        "splits": _rows_to_list(splits),
        "dias_treino": days_with_exercises,
        "medicoes": _rows_to_list(measurements),
    }

    return payload, None


@bp.route("/gerar", methods=["POST"])
@jwt_required()
def generate_analysis():
    user_id = int(get_jwt_identity())

    payload, error = _build_payload(user_id)
    if error:
        return jsonify({"error": error}), 400

    try:
        analysis_text = gerar_analise(payload)
    except Exception as e:
        print(f"[AI] Error: {e}")
        return jsonify({"error": "Não foi possível gerar a análise no momento. Tente novamente em alguns instantes."}), 503

    program = db.query_one(
        "SELECT id FROM training_programs WHERE user_id=%s AND status='active' LIMIT 1",
        (user_id,),
    )

    row = db.execute(
        """INSERT INTO ai_analyses (user_id, program_id, analysis_text, input_payload, model_used)
           VALUES (%s, %s, %s, %s, 'claude-sonnet-4-6') RETURNING *""",
        (
            user_id,
            program["id"],
            analysis_text,
            json.dumps(payload, ensure_ascii=False, default=str),
        ),
    )

    return jsonify(
        {
            "data": {
                "id": row["id"],
                "analysis_text": analysis_text,
                "created_at": str(row["created_at"]),
            },
            "message": "Análise gerada com sucesso.",
        }
    )


@bp.route("/historico", methods=["GET"])
@jwt_required()
def list_analyses():
    user_id = int(get_jwt_identity())
    rows = db.query(
        """SELECT id, program_id, model_used, created_at,
                  LEFT(analysis_text, 200) as preview
           FROM ai_analyses WHERE user_id=%s ORDER BY created_at DESC""",
        (user_id,),
    )
    return jsonify({"data": _rows_to_list(rows)})


@bp.route("/<int:analysis_id>", methods=["GET"])
@jwt_required()
def get_analysis(analysis_id):
    user_id = int(get_jwt_identity())
    row = db.query_one(
        "SELECT * FROM ai_analyses WHERE id=%s AND user_id=%s",
        (analysis_id, user_id),
    )
    if not row:
        return jsonify({"error": "Análise não encontrada."}), 404
    return jsonify({"data": _row_to_dict(row)})

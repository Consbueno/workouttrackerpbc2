import json
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

import db
from utils.validators import ExerciseSchema, AthleteSchema, GymSchema

bp = Blueprint("cadastros", __name__)
exercise_schema = ExerciseSchema()
athlete_schema = AthleteSchema()
gym_schema = GymSchema()


# ── EXERCÍCIOS ─────────────────────────────────────────────────────────────

@bp.route("/exercicios", methods=["GET"])
@jwt_required()
def list_exercises():
    user_id = int(get_jwt_identity())
    muscle = request.args.get("muscle_group")
    search = request.args.get("search", "").strip()

    sql = "SELECT * FROM exercises WHERE user_id = %s"
    params = [user_id]
    if muscle:
        sql += " AND primary_muscle_group = %s"
        params.append(muscle)
    if search:
        sql += " AND LOWER(name) LIKE LOWER(%s)"
        params.append(f"%{search}%")
    sql += " ORDER BY name ASC"

    rows = db.query(sql, params)
    return jsonify({"data": [dict(r) for r in rows]})


@bp.route("/exercicios", methods=["POST"])
@jwt_required()
def create_exercise():
    user_id = int(get_jwt_identity())
    try:
        data = exercise_schema.load(request.get_json() or {})
    except ValidationError as e:
        return jsonify({"error": "Dados inválidos.", "details": e.messages}), 400

    row = db.execute(
        """INSERT INTO exercises
           (user_id, name, primary_muscle_group, secondary_muscle_group, equipment, exercise_type, notes, is_active)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING *""",
        (
            user_id,
            data["name"],
            data["primary_muscle_group"],
            data.get("secondary_muscle_group"),
            data["equipment"],
            data["exercise_type"],
            data.get("notes"),
            data.get("is_active", True),
        ),
    )
    return jsonify({"data": dict(row), "message": "Exercício criado com sucesso."}), 201


@bp.route("/exercicios/<int:exercise_id>", methods=["PUT"])
@jwt_required()
def update_exercise(exercise_id):
    user_id = int(get_jwt_identity())
    try:
        data = exercise_schema.load(request.get_json() or {})
    except ValidationError as e:
        return jsonify({"error": "Dados inválidos.", "details": e.messages}), 400

    row = db.execute(
        """UPDATE exercises SET
           name=%s, primary_muscle_group=%s, secondary_muscle_group=%s,
           equipment=%s, exercise_type=%s, notes=%s, is_active=%s, updated_at=NOW()
           WHERE id=%s AND user_id=%s RETURNING *""",
        (
            data["name"],
            data["primary_muscle_group"],
            data.get("secondary_muscle_group"),
            data["equipment"],
            data["exercise_type"],
            data.get("notes"),
            data.get("is_active", True),
            exercise_id,
            user_id,
        ),
    )
    if not row:
        return jsonify({"error": "Exercício não encontrado."}), 404
    return jsonify({"data": dict(row), "message": "Exercício atualizado com sucesso."})


@bp.route("/exercicios/<int:exercise_id>/toggle", methods=["PATCH"])
@jwt_required()
def toggle_exercise(exercise_id):
    user_id = int(get_jwt_identity())
    row = db.execute(
        """UPDATE exercises SET is_active = NOT is_active, updated_at=NOW()
           WHERE id=%s AND user_id=%s RETURNING *""",
        (exercise_id, user_id),
    )
    if not row:
        return jsonify({"error": "Exercício não encontrado."}), 404
    status = "ativado" if row["is_active"] else "desativado"
    return jsonify({"data": dict(row), "message": f"Exercício {status} com sucesso."})


# ── ATLETA ──────────────────────────────────────────────────────────────────

@bp.route("/atleta", methods=["GET"])
@jwt_required()
def get_athlete():
    user_id = int(get_jwt_identity())
    row = db.query_one("SELECT * FROM athletes WHERE user_id = %s", (user_id,))
    if not row:
        return jsonify({"data": None})
    athlete = dict(row)
    if isinstance(athlete.get("body_restrictions"), str):
        athlete["body_restrictions"] = json.loads(athlete["body_restrictions"])
    return jsonify({"data": athlete})


@bp.route("/atleta", methods=["POST"])
@jwt_required()
def create_athlete():
    user_id = int(get_jwt_identity())
    existing = db.query_one("SELECT id FROM athletes WHERE user_id = %s", (user_id,))
    if existing:
        return jsonify({"error": "Perfil de atleta já existe. Use PUT para atualizar."}), 409

    try:
        data = athlete_schema.load(request.get_json() or {})
    except ValidationError as e:
        return jsonify({"error": "Dados inválidos.", "details": e.messages}), 400

    row = db.execute(
        """INSERT INTO athletes
           (user_id, full_name, birth_date, sex, weight_kg, height_cm,
            is_diabetic, is_hypertensive, is_cardiac, health_notes, body_restrictions)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING *""",
        (
            user_id,
            data["full_name"],
            str(data["birth_date"]),
            data["sex"],
            float(data["weight_kg"]),
            data["height_cm"],
            data.get("is_diabetic", False),
            data.get("is_hypertensive", False),
            data.get("is_cardiac", False),
            data.get("health_notes"),
            json.dumps(data.get("body_restrictions", []), ensure_ascii=False),
        ),
    )
    return jsonify({"data": dict(row), "message": "Perfil criado com sucesso."}), 201


@bp.route("/atleta", methods=["PUT"])
@jwt_required()
def update_athlete():
    user_id = int(get_jwt_identity())
    try:
        data = athlete_schema.load(request.get_json() or {})
    except ValidationError as e:
        return jsonify({"error": "Dados inválidos.", "details": e.messages}), 400

    row = db.execute(
        """UPDATE athletes SET
           full_name=%s, birth_date=%s, sex=%s, weight_kg=%s, height_cm=%s,
           is_diabetic=%s, is_hypertensive=%s, is_cardiac=%s,
           health_notes=%s, body_restrictions=%s, updated_at=NOW()
           WHERE user_id=%s RETURNING *""",
        (
            data["full_name"],
            str(data["birth_date"]),
            data["sex"],
            float(data["weight_kg"]),
            data["height_cm"],
            data.get("is_diabetic", False),
            data.get("is_hypertensive", False),
            data.get("is_cardiac", False),
            data.get("health_notes"),
            json.dumps(data.get("body_restrictions", []), ensure_ascii=False),
            user_id,
        ),
    )
    if not row:
        return jsonify({"error": "Perfil de atleta não encontrado."}), 404
    return jsonify({"data": dict(row), "message": "Perfil atualizado com sucesso."})


# ── ACADEMIAS ───────────────────────────────────────────────────────────────

@bp.route("/academias", methods=["GET"])
@jwt_required()
def list_gyms():
    user_id = int(get_jwt_identity())
    rows = db.query("SELECT * FROM gyms WHERE user_id = %s ORDER BY name ASC", (user_id,))
    return jsonify({"data": [dict(r) for r in rows]})


@bp.route("/academias", methods=["POST"])
@jwt_required()
def create_gym():
    user_id = int(get_jwt_identity())
    try:
        data = gym_schema.load(request.get_json() or {})
    except ValidationError as e:
        return jsonify({"error": "Dados inválidos.", "details": e.messages}), 400

    row = db.execute(
        """INSERT INTO gyms
           (user_id, name, address, phone, monthly_fee, payment_due_day, preferred_schedule, notes, is_active)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING *""",
        (
            user_id,
            data["name"],
            data.get("address"),
            data.get("phone"),
            float(data["monthly_fee"]) if data.get("monthly_fee") is not None else None,
            data.get("payment_due_day"),
            data.get("preferred_schedule"),
            data.get("notes"),
            data.get("is_active", True),
        ),
    )
    return jsonify({"data": dict(row), "message": "Academia criada com sucesso."}), 201


@bp.route("/academias/<int:gym_id>", methods=["PUT"])
@jwt_required()
def update_gym(gym_id):
    user_id = int(get_jwt_identity())
    try:
        data = gym_schema.load(request.get_json() or {})
    except ValidationError as e:
        return jsonify({"error": "Dados inválidos.", "details": e.messages}), 400

    row = db.execute(
        """UPDATE gyms SET
           name=%s, address=%s, phone=%s, monthly_fee=%s, payment_due_day=%s,
           preferred_schedule=%s, notes=%s, is_active=%s, updated_at=NOW()
           WHERE id=%s AND user_id=%s RETURNING *""",
        (
            data["name"],
            data.get("address"),
            data.get("phone"),
            float(data["monthly_fee"]) if data.get("monthly_fee") is not None else None,
            data.get("payment_due_day"),
            data.get("preferred_schedule"),
            data.get("notes"),
            data.get("is_active", True),
            gym_id,
            user_id,
        ),
    )
    if not row:
        return jsonify({"error": "Academia não encontrada."}), 404
    return jsonify({"data": dict(row), "message": "Academia atualizada com sucesso."})


@bp.route("/academias/<int:gym_id>/toggle", methods=["PATCH"])
@jwt_required()
def toggle_gym(gym_id):
    user_id = int(get_jwt_identity())
    row = db.execute(
        """UPDATE gyms SET is_active = NOT is_active, updated_at=NOW()
           WHERE id=%s AND user_id=%s RETURNING *""",
        (gym_id, user_id),
    )
    if not row:
        return jsonify({"error": "Academia não encontrada."}), 404
    status = "ativada" if row["is_active"] else "desativada"
    return jsonify({"data": dict(row), "message": f"Academia {status} com sucesso."})

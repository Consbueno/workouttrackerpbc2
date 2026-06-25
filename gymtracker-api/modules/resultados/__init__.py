from decimal import Decimal
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
import psycopg2

import db
from utils.validators import MeasurementSchema

bp = Blueprint("resultados", __name__)
measurement_schema = MeasurementSchema()


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


def _get_athlete_id(user_id):
    athlete = db.query_one("SELECT id FROM athletes WHERE user_id=%s", (user_id,))
    return athlete["id"] if athlete else None


@bp.route("/medicoes", methods=["GET"])
@jwt_required()
def list_measurements():
    user_id = int(get_jwt_identity())
    athlete_id = _get_athlete_id(user_id)
    if not athlete_id:
        return jsonify({"data": []})

    date_from = request.args.get("from")
    date_to = request.args.get("to")

    sql = "SELECT * FROM measurements WHERE athlete_id = %s"
    params = [athlete_id]
    if date_from:
        sql += " AND measurement_date >= %s"
        params.append(date_from)
    if date_to:
        sql += " AND measurement_date <= %s"
        params.append(date_to)
    sql += " ORDER BY measurement_date DESC"

    rows = db.query(sql, params)
    return jsonify({"data": _rows_to_list(rows)})


@bp.route("/medicoes", methods=["POST"])
@jwt_required()
def create_measurement():
    user_id = int(get_jwt_identity())
    athlete_id = _get_athlete_id(user_id)
    if not athlete_id:
        return jsonify({"error": "Perfil de atleta não encontrado."}), 400

    try:
        data = measurement_schema.load(request.get_json() or {})
    except ValidationError as e:
        return jsonify({"error": "Dados inválidos.", "details": e.messages}), 400

    try:
        row = db.execute(
            """INSERT INTO measurements
               (user_id, athlete_id, measurement_date, weight_kg, body_fat_pct,
                neck_cm, shoulders_cm, chest_cm,
                right_arm_relaxed_cm, right_arm_flexed_cm,
                left_arm_relaxed_cm, left_arm_flexed_cm,
                right_forearm_cm, left_forearm_cm,
                waist_cm, hip_cm,
                right_thigh_cm, left_thigh_cm,
                right_calf_cm, left_calf_cm,
                fasting_glucose, systolic_bp, diastolic_bp, resting_hr, notes)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
               RETURNING *""",
            (
                user_id,
                athlete_id,
                str(data["measurement_date"]),
                float(data["weight_kg"]) if data.get("weight_kg") is not None else None,
                float(data["body_fat_pct"]) if data.get("body_fat_pct") is not None else None,
                float(data["neck_cm"]) if data.get("neck_cm") is not None else None,
                float(data["shoulders_cm"]) if data.get("shoulders_cm") is not None else None,
                float(data["chest_cm"]) if data.get("chest_cm") is not None else None,
                float(data["right_arm_relaxed_cm"]) if data.get("right_arm_relaxed_cm") is not None else None,
                float(data["right_arm_flexed_cm"]) if data.get("right_arm_flexed_cm") is not None else None,
                float(data["left_arm_relaxed_cm"]) if data.get("left_arm_relaxed_cm") is not None else None,
                float(data["left_arm_flexed_cm"]) if data.get("left_arm_flexed_cm") is not None else None,
                float(data["right_forearm_cm"]) if data.get("right_forearm_cm") is not None else None,
                float(data["left_forearm_cm"]) if data.get("left_forearm_cm") is not None else None,
                float(data["waist_cm"]) if data.get("waist_cm") is not None else None,
                float(data["hip_cm"]) if data.get("hip_cm") is not None else None,
                float(data["right_thigh_cm"]) if data.get("right_thigh_cm") is not None else None,
                float(data["left_thigh_cm"]) if data.get("left_thigh_cm") is not None else None,
                float(data["right_calf_cm"]) if data.get("right_calf_cm") is not None else None,
                float(data["left_calf_cm"]) if data.get("left_calf_cm") is not None else None,
                data.get("fasting_glucose"),
                data.get("systolic_bp"),
                data.get("diastolic_bp"),
                data.get("resting_hr"),
                data.get("notes"),
            ),
        )
        return jsonify({"data": _row_to_dict(row), "message": "Medição registrada com sucesso."}), 201

    except psycopg2.errors.UniqueViolation:
        return jsonify({"error": "Já existe uma medição registrada para esta data."}), 409
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route("/medicoes/<int:measurement_id>", methods=["PUT"])
@jwt_required()
def update_measurement(measurement_id):
    user_id = int(get_jwt_identity())
    try:
        data = measurement_schema.load(request.get_json() or {})
    except ValidationError as e:
        return jsonify({"error": "Dados inválidos.", "details": e.messages}), 400

    row = db.execute(
        """UPDATE measurements SET
           weight_kg=%s, body_fat_pct=%s,
           neck_cm=%s, shoulders_cm=%s, chest_cm=%s,
           right_arm_relaxed_cm=%s, right_arm_flexed_cm=%s,
           left_arm_relaxed_cm=%s, left_arm_flexed_cm=%s,
           right_forearm_cm=%s, left_forearm_cm=%s,
           waist_cm=%s, hip_cm=%s,
           right_thigh_cm=%s, left_thigh_cm=%s,
           right_calf_cm=%s, left_calf_cm=%s,
           fasting_glucose=%s, systolic_bp=%s, diastolic_bp=%s, resting_hr=%s, notes=%s
           WHERE id=%s AND user_id=%s RETURNING *""",
        (
            float(data["weight_kg"]) if data.get("weight_kg") is not None else None,
            float(data["body_fat_pct"]) if data.get("body_fat_pct") is not None else None,
            float(data["neck_cm"]) if data.get("neck_cm") is not None else None,
            float(data["shoulders_cm"]) if data.get("shoulders_cm") is not None else None,
            float(data["chest_cm"]) if data.get("chest_cm") is not None else None,
            float(data["right_arm_relaxed_cm"]) if data.get("right_arm_relaxed_cm") is not None else None,
            float(data["right_arm_flexed_cm"]) if data.get("right_arm_flexed_cm") is not None else None,
            float(data["left_arm_relaxed_cm"]) if data.get("left_arm_relaxed_cm") is not None else None,
            float(data["left_arm_flexed_cm"]) if data.get("left_arm_flexed_cm") is not None else None,
            float(data["right_forearm_cm"]) if data.get("right_forearm_cm") is not None else None,
            float(data["left_forearm_cm"]) if data.get("left_forearm_cm") is not None else None,
            float(data["waist_cm"]) if data.get("waist_cm") is not None else None,
            float(data["hip_cm"]) if data.get("hip_cm") is not None else None,
            float(data["right_thigh_cm"]) if data.get("right_thigh_cm") is not None else None,
            float(data["left_thigh_cm"]) if data.get("left_thigh_cm") is not None else None,
            float(data["right_calf_cm"]) if data.get("right_calf_cm") is not None else None,
            float(data["left_calf_cm"]) if data.get("left_calf_cm") is not None else None,
            data.get("fasting_glucose"),
            data.get("systolic_bp"),
            data.get("diastolic_bp"),
            data.get("resting_hr"),
            data.get("notes"),
            measurement_id,
            user_id,
        ),
    )
    if not row:
        return jsonify({"error": "Medição não encontrada."}), 404
    return jsonify({"data": _row_to_dict(row), "message": "Medição atualizada com sucesso."})


@bp.route("/medicoes/evolucao", methods=["GET"])
@jwt_required()
def evolution():
    user_id = int(get_jwt_identity())
    athlete_id = _get_athlete_id(user_id)
    if not athlete_id:
        return jsonify({"data": []})

    rows = db.query(
        """SELECT measurement_date, weight_kg, body_fat_pct,
                  chest_cm, right_arm_relaxed_cm, waist_cm, hip_cm, right_thigh_cm,
                  fasting_glucose, systolic_bp, diastolic_bp, resting_hr
           FROM measurements WHERE athlete_id=%s
           ORDER BY measurement_date ASC""",
        (athlete_id,),
    )
    return jsonify({"data": _rows_to_list(rows)})

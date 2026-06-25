from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
)
from flask_bcrypt import generate_password_hash, check_password_hash
from marshmallow import ValidationError

import db
from utils.validators import RegisterSchema, LoginSchema

bp = Blueprint("auth", __name__)
register_schema = RegisterSchema()
login_schema = LoginSchema()


@bp.route("/register", methods=["POST"])
def register():
    try:
        data = register_schema.load(request.get_json() or {})
    except ValidationError as e:
        return jsonify({"error": "Dados inválidos.", "details": e.messages}), 400

    existing = db.query_one("SELECT id FROM users WHERE email = %s", (data["email"],))
    if existing:
        return jsonify({"error": "Este e-mail já está cadastrado."}), 409

    hashed = generate_password_hash(data["password"]).decode("utf-8")
    db.execute(
        "INSERT INTO users (email, password_hash, full_name) VALUES (%s, %s, %s)",
        (data["email"], hashed, data["full_name"]),
    )
    return jsonify({"message": "Conta criada com sucesso."}), 201


@bp.route("/login", methods=["POST"])
def login():
    try:
        data = login_schema.load(request.get_json() or {})
    except ValidationError as e:
        return jsonify({"error": "Dados inválidos.", "details": e.messages}), 400

    user = db.query_one(
        "SELECT * FROM users WHERE email = %s AND is_active = TRUE", (data["email"],)
    )
    if not user or not check_password_hash(user["password_hash"], data["password"]):
        return jsonify({"error": "E-mail ou senha inválidos."}), 401

    access_token = create_access_token(identity=str(user["id"]))
    refresh_token = create_refresh_token(identity=str(user["id"]))
    return jsonify(
        {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "id": user["id"],
                "email": user["email"],
                "full_name": user["full_name"],
            },
        }
    )


@bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return jsonify({"access_token": access_token})


@bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = db.query_one(
        "SELECT id, email, full_name, created_at FROM users WHERE id = %s", (user_id,)
    )
    if not user:
        return jsonify({"error": "Usuário não encontrado."}), 404
    return jsonify({"data": dict(user)})

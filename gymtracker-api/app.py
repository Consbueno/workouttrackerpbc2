from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from datetime import timedelta

from config import Config
import db as database

bcrypt = Bcrypt()
jwt = JWTManager()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(seconds=app.config["JWT_ACCESS_TOKEN_EXPIRES"])
    app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(seconds=app.config["JWT_REFRESH_TOKEN_EXPIRES"])

    CORS(app, origins=[app.config["FRONTEND_URL"], "http://localhost:5173", "http://localhost:3000"])
    bcrypt.init_app(app)
    jwt.init_app(app)

    database.init_pool(app)

    with app.app_context():
        try:
            database.init_db()
        except Exception as e:
            print(f"[DB] init_db error: {e}")

    from modules.auth import bp as auth_bp
    from modules.cadastros import bp as cadastros_bp
    from modules.treino import bp as treino_bp
    from modules.resultados import bp as resultados_bp
    from modules.analise import bp as analise_bp

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(cadastros_bp, url_prefix="/cadastros")
    app.register_blueprint(treino_bp, url_prefix="/treino")
    app.register_blueprint(resultados_bp, url_prefix="/resultados")
    app.register_blueprint(analise_bp, url_prefix="/analise")

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"error": "Token inválido ou expirado."}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({"error": "Token inválido ou expirado."}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({"error": "Token inválido ou expirado."}), 401

    @app.route("/health")
    def health():
        return jsonify({"status": "ok"})

    return app

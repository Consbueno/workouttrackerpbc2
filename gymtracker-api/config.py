import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret")
    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 3600))
    JWT_REFRESH_TOKEN_EXPIRES = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES", 2592000))

    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = int(os.getenv("DB_PORT", 5432))
    DB_NAME = os.getenv("DB_NAME", "gymtracker")
    DB_USER = os.getenv("DB_USER", "gymtracker_user")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")

    ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

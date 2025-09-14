import os
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    _env_file = os.getenv("SMARTCLINIC_ENV_FILE", ".env")
    model_config = SettingsConfigDict(env_file=_env_file, env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Smart Clinic API"
    environment: str = "development"

    # Database
    database_url: str = "sqlite:///./data.db"

    # Security
    jwt_secret_key: str = "CHANGE_ME_SUPER_SECRET"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24
    gemini_api_key: str = "AIzaSyAStzyhH_s9QSg1yqdp7XyABELh2phJHhM"

    # Notifications (optional)
    twilio_account_sid: str | None = None
    twilio_auth_token: str | None = None
    twilio_from_number: str | None = None
    alert_phone_number: str | None = None

    sendgrid_api_key: str | None = None
    alert_email_to: str | None = None
    alert_email_from: str | None = None


@lru_cache
def get_settings() -> Settings:
    return Settings()
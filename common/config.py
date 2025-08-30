import os
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./bot.db")
ADMIN_PANEL_TOKEN = os.getenv("ADMIN_PANEL_TOKEN", "dev-admin")
DEFAULT_TZ = os.getenv("DEFAULT_TZ", "Europe/Moscow")
FEEDBACK_CHAT = os.getenv("FEEDBACK_CHAT", "").strip()
YANDEX_EMAIL = os.getenv("YANDEX_EMAIL", "")
YANDEX_PASS = os.getenv("YANDEX_PASS", "")
USE_AI = os.getenv("USE_AI", "true").lower() in ("1","true","yes","on")












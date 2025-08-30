from typing import Dict, Any
from common.ai_provider import ai_provider

SYSTEM_PROMPT_RU = (
    "Ты — астрологический помощник. Пиши кратко, дружелюбно и по-деловому. "
    "Избегай пугающих формулировок и эзотерических страшилок. "
    "Давай 1–2 чётких вывода и 1 практический совет ‘что сделать’. "
    "Тон: поддерживающий, современный, без канцелярита."
)


async def generate_text(kind: str, user_ctx: Dict[str, Any], options: Dict[str, Any] | None = None) -> str:
    options = options or {}
    zodiac = user_ctx.get("zodiac", "—")
    name = user_ctx.get("name", "—")
    date_iso = user_ctx.get("date", "—")

    if kind == "daily":
        user_prompt = (
            f"Ежедневный прогноз для {name} ({zodiac}) на {date_iso}. "
            "Структура: Тема дня, Работа, Отношения, Энергия, Совет."
        )
    elif kind == "weekly":
        user_prompt = (
            f"Недельный прогноз для {name} ({zodiac}). Укажи основные акценты по дням и общий совет."
        )
    elif kind == "monthly":
        user_prompt = (
            f"Месячный прогноз для {name} ({zodiac}). Основные тенденции и ключевые даты."
        )
    elif kind == "natal_basic":
        user_prompt = (
            f"Натальная карта (базовая) для {name} ({zodiac}). Солнце, Луна, Асцендент — 3–4 предложения каждое."
        )
    elif kind == "synastry_basic":
        user_prompt = (
            f"Базовая совместимость. Пользователь: {name} ({zodiac}). Дай процентную оценку и 2–3 комментария."
        )
    elif kind == "lunar":
        user_prompt = (
            f"Фаза Луны на {date_iso} и один практический совет."
        )
    elif kind == "retro":
        user_prompt = (
            f"Ближайшие ретроградности и короткие рекомендации."
        )
    else:
        user_prompt = f"Астрологический совет: {kind}"

    return await ai_provider.generate(SYSTEM_PROMPT_RU, user_prompt)












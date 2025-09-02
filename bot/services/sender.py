import datetime as dt
from typing import Tuple
from aiogram import Bot
from aiogram import types
from sqlalchemy import select
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from bot.db.session import SessionLocal
from bot.db.models import User
from bot.services.ai import generate_text


async def send_today_for_user(bot: Bot, user_id: int) -> Tuple[bool, str | None]:
    """Сформировать и отправить ежедневный прогноз пользователю."""
    with SessionLocal() as s:
        u = s.execute(select(User).where(User.tg_id == user_id)).scalar_one_or_none()
        if not u or not u.zodiac:
            return False, "Сначала укажите знак: /start"

        tzname = u.tz or "UTC"
        now_utc = dt.datetime.now(dt.timezone.utc)
        try:
            local_now = now_utc.astimezone(ZoneInfo(tzname))
        except ZoneInfoNotFoundError:
            local_now = now_utc
        iso_date = str(local_now.date())

        user_ctx = {"zodiac": u.zodiac, "name": u.name or "", "date": iso_date}
        text = await generate_text("daily", user_ctx)

        try:
            await bot.send_message(user_id, text)
        except Exception as e:
            return False, f"Не удалось отправить: {e}"
        return True, None















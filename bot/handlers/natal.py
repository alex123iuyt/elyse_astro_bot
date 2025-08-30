from aiogram import Router, types
from aiogram.filters import Command
from sqlalchemy import select

from bot.db.session import SessionLocal
from bot.db.models import User


router = Router()


@router.message(types.Message.text == "🌀 Натальная карта")
@router.message(Command("наталка"))
async def natalka(m: types.Message):
    with SessionLocal() as s:
        u = s.execute(select(User).where(User.tg_id == m.from_user.id)).scalar_one_or_none()
    if not u or not u.birth_date:
        await m.answer("Сначала пройдите настройку профиля: /start"); return

    sun = u.zodiac or "—"
    if u.is_premium and u.premium_until and u.premium_until > u.created_at.date():
        text = (
            f"🌀 <b>Полная натальная карта</b>\n\n"
            f"☉ Солнце ({sun}): внутренний стержень, стремление проявлять лучшие качества знака.\n\n"
            f"☾ Луна: эмоциональная поддержка и интуиция помогают в решениях.\n\n"
            f"↑ Асцендент: гармоничное первое впечатление, уверенное движение к целям.\n\n"
            f"💡 Фокус: укрепляйте сильные стороны и мягко развивайте зоны роста."
        )
    else:
        text = (
            f"🌀 <b>Базовая натальная карта</b>\n\n"
            f"☉ Солнце ({sun}) — 1–2 предложения о ваших сильных сторонах.\n"
            f"☾ Луна — 1–2 предложения о эмоциональной стороне.\n"
            f"↑ Асцендент — 1–2 предложения о том, как вы выглядите миру.\n\n"
            f"⭐ Полный разбор доступен в премиум."
        )
    await m.answer(text, parse_mode="HTML")












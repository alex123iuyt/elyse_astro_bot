from aiogram import Router, F, types
from aiogram.filters import Command
from sqlalchemy import select

from bot.utils.keyboards import forecast_menu_kb
from bot.db.session import SessionLocal
from bot.db.models import User
from bot.services.ai import generate_text


router = Router()


@router.message(F.text == "🔮 Прогноз")
async def forecast_root(m: types.Message):
    await m.answer("Выберите период:", reply_markup=forecast_menu_kb())


@router.callback_query(F.data == "fc:day")
async def day_cb(cq: types.CallbackQuery):
    with SessionLocal() as s:
        u = s.execute(select(User).where(User.tg_id == cq.from_user.id)).scalar_one_or_none()
    if not u:
        await cq.message.edit_text("Сначала /start")
        await cq.answer(); return
    text = await generate_text("daily", {"zodiac": u.zodiac or "—", "name": u.name or "", "date": "сегодня"})
    await cq.message.edit_text(text)
    await cq.answer()


@router.callback_query(F.data == "fc:week")
async def week_cb(cq: types.CallbackQuery):
    with SessionLocal() as s:
        u = s.execute(select(User).where(User.tg_id == cq.from_user.id)).scalar_one_or_none()
    if not u:
        await cq.message.edit_text("Сначала /start"); await cq.answer(); return
    if not (u.is_premium and u.premium_until and u.premium_until > u.created_at.date()):
        await cq.message.edit_text("🔒 Недельный прогноз доступен в премиум. Откройте ⭐ Премиум в меню.")
        await cq.answer(); return
    text = await generate_text("weekly", {"zodiac": u.zodiac or "—", "name": u.name or ""})
    await cq.message.edit_text(text)
    await cq.answer()


@router.callback_query(F.data == "fc:month")
async def month_cb(cq: types.CallbackQuery):
    with SessionLocal() as s:
        u = s.execute(select(User).where(User.tg_id == cq.from_user.id)).scalar_one_or_none()
    if not u:
        await cq.message.edit_text("Сначала /start"); await cq.answer(); return
    if not (u.is_premium and u.premium_until and u.premium_until > u.created_at.date()):
        await cq.message.edit_text("🔒 Месячный прогноз доступен в премиум. Откройте ⭐ Премиум в меню.")
        await cq.answer(); return
    text = await generate_text("monthly", {"zodiac": u.zodiac or "—", "name": u.name or ""})
    await cq.message.edit_text(text)
    await cq.answer()















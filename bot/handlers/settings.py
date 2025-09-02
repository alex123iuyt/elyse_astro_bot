import re
import datetime as dt
from aiogram import Router, types
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import StatesGroup, State
from sqlalchemy import select
from zoneinfo import ZoneInfo

from bot.db.session import SessionLocal
from bot.db.models import User


router = Router()


class TimeState(StatesGroup):
    wait_time = State()


@router.message(Command("mysign"))
async def mysign(m: types.Message, state: FSMContext):
    await m.answer("Введите дату рождения в формате ДД.ММ:")


@router.message(FSMContext)  # placeholder; normally you'd add state for this flow
async def _noop(_: types.Message):
    pass


@router.message(Command("профиль"))
async def profile(m: types.Message):
    with SessionLocal() as s:
        u = s.execute(select(User).where(User.tg_id == m.from_user.id)).scalar_one_or_none()
    if not u:
        await m.answer("Сначала /start"); return
    await m.answer(
        (
            "👤 Профиль\n\n"
            f"Имя: {u.name or '—'}\n"
            f"Дата рождения: {u.birth_date or '—'}\n"
            f"Время рождения: {u.birth_time or '—'}\n"
            f"Город: {u.birth_city or '—'}\n"
            f"Часовой пояс: {u.tz}\n"
            f"Ежедневно в: {u.hour:02d}:{u.minute:02d}"
        )
    )















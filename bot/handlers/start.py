import re
import datetime as dt
from aiogram import Router, types
from aiogram.filters import CommandStart, Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import StatesGroup, State
from sqlalchemy import select

from bot.db.session import SessionLocal
from bot.db.models import User
from bot.utils.keyboards import bottom_nav_kb


router = Router()


class Onboarding(StatesGroup):
    name = State()
    bdate = State()
    btime = State()
    bcity = State()


@router.message(CommandStart())
async def start(m: types.Message, state: FSMContext):
    with SessionLocal() as s:
        u = s.execute(select(User).where(User.tg_id == m.from_user.id)).scalar_one_or_none()
        if not u:
            u = User(tg_id=m.from_user.id)
            s.add(u); s.commit()
    await m.answer("👋 Добро пожаловать! Настроим профиль.")

    with SessionLocal() as s:
        u = s.execute(select(User).where(User.tg_id == m.from_user.id)).scalar_one_or_none()
    if not u.name:
        await state.set_state(Onboarding.name); await m.answer("Как вас зовут?"); return
    if not u.birth_date:
        await state.set_state(Onboarding.bdate); await m.answer("Дата рождения (ДД.ММ.ГГГГ):"); return
    if not u.birth_time:
        await state.set_state(Onboarding.btime); await m.answer("Время рождения (HH:MM) или 'не знаю':"); return
    if not u.birth_city:
        await state.set_state(Onboarding.bcity); await m.answer("Город рождения:"); return

    await m.answer("Главное меню открыто.", reply_markup=bottom_nav_kb())


@router.message(Onboarding.name)
async def ob_name(m: types.Message, state: FSMContext):
    name = (m.text or '').strip()
    if not name:
        await m.answer("Пожалуйста, укажите имя."); return
    with SessionLocal() as s:
        u = s.execute(select(User).where(User.tg_id == m.from_user.id)).scalar_one_or_none()
        u.name = name; s.commit()
    await state.set_state(Onboarding.bdate)
    await m.answer("Дата рождения (ДД.ММ.ГГГГ):")


@router.message(Onboarding.bdate)
async def ob_bdate(m: types.Message, state: FSMContext):
    txt = (m.text or '').strip()
    mobj = re.match(r"^(\d{1,2})[.](\d{1,2})[.](\d{4})$", txt)
    if not mobj:
        await m.answer("Формат: ДД.ММ.ГГГГ"); return
    day, month, year = map(int, mobj.groups())
    try:
        d = dt.date(year, month, day)
    except Exception:
        await m.answer("Проверьте дату, пожалуйста."); return
    with SessionLocal() as s:
        u = s.execute(select(User).where(User.tg_id == m.from_user.id)).scalar_one_or_none()
        u.birth_date = d
        # Простейшее определение знака
        u.zodiac = _zodiac_by_date(day, month)
        s.commit()
    await state.set_state(Onboarding.btime)
    await m.answer("Время рождения (HH:MM) или 'не знаю':")


@router.message(Onboarding.btime)
async def ob_btime(m: types.Message, state: FSMContext):
    txt = (m.text or '').strip().lower()
    if txt != 'не знаю' and not re.match(r"^(?:[01]?\d|2[0-3]):[0-5]\d$", txt):
        await m.answer("Формат HH:MM или 'не знаю'"); return
    with SessionLocal() as s:
        u = s.execute(select(User).where(User.tg_id == m.from_user.id)).scalar_one_or_none()
        u.birth_time = 'не знаю' if txt == 'не знаю' else txt
        s.commit()
    await state.set_state(Onboarding.bcity)
    await m.answer("Город рождения:")


@router.message(Onboarding.bcity)
async def ob_bcity(m: types.Message, state: FSMContext):
    city = (m.text or '').strip()
    if not city:
        await m.answer("Укажите город рождения."); return
    with SessionLocal() as s:
        u = s.execute(select(User).where(User.tg_id == m.from_user.id)).scalar_one_or_none()
        u.birth_city = city; s.commit()
    await state.clear()
    await m.answer("Готово! Профиль сохранён.", reply_markup=bottom_nav_kb())


def _zodiac_by_date(day: int, month: int) -> str:
    ranges = [
        (1, 20, "Водолей"), (2, 19, "Рыбы"), (3, 21, "Овен"), (4, 20, "Телец"),
        (5, 21, "Близнецы"), (6, 22, "Рак"), (7, 23, "Лев"), (8, 23, "Дева"),
        (9, 23, "Весы"), (10, 23, "Скорпион"), (11, 22, "Стрелец"),
    ]
    if (month == 12 and day >= 22) or (month == 1 and day <= 19):
        return "Козерог"
    for m, d_start, sign in ranges[::-1]:
        if (month, day) >= (m, d_start):
            return sign
    return "Козерог"















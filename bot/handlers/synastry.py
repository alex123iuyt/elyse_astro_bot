import re
import hashlib, random
from aiogram import Router, types
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import StatesGroup, State


router = Router()


class SynState(StatesGroup):
    date = State()
    time = State()


@router.message(types.Message.text == "❤️ Совместимость")
@router.message(Command("совместимость"))
async def syn_start(m: types.Message, state: FSMContext):
    await state.set_state(SynState.date)
    await m.answer("Дата рождения партнёра (ДД.ММ.ГГГГ):")


@router.message(SynState.date)
async def syn_date(m: types.Message, state: FSMContext):
    txt = (m.text or '').strip()
    if not re.match(r"^(\d{1,2})[.](\d{1,2})[.](\d{4})$", txt):
        await m.answer("Формат: ДД.ММ.ГГГГ"); return
    await state.update_data(date=txt)
    await state.set_state(SynState.time)
    await m.answer("Время рождения (HH:MM) или 'не знаю':")


@router.message(SynState.time)
async def syn_done(m: types.Message, state: FSMContext):
    data = await state.get_data()
    date_str = data.get('date', '')
    time_str = (m.text or '').strip().lower()
    seed = int(hashlib.sha256(f"{m.from_user.id}|{date_str}|{time_str}".encode()).hexdigest(), 16) % 101
    comments = [
        "В любви — тёплая поддержка и взаимное вдохновение.",
        "В работе — важно заранее распределять роли и ожидания.",
        "Быт — планирование экономит время и силы.",
        "Не соревнуйтесь — усиливайте сильные стороны друг друга.",
    ]
    rnd = random.Random(seed)
    picks = "\n- " + "\n- ".join(rnd.sample(comments, k=3))
    await m.answer(f"❤️ Совместимость: <b>{seed}%</b>\n{picks}", parse_mode="HTML")
    await state.clear()












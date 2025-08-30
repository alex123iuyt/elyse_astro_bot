import datetime as dt
from aiogram import Router, types
from aiogram.filters import Command


router = Router()


@router.message(types.Message.text == "🌙 Луна и ретро")
@router.message(Command("луна"))
async def lunar_today(m: types.Message):
    phases = ["новолуние", "растущая", "полнолуние", "убывающая"]
    phase = phases[dt.date.today().toordinal() % 4]
    await m.answer(f"🌙 Луна сегодня: <b>{phase}</b>\nСовет: сохраняйте спокойный ритм дня.", parse_mode="HTML")


@router.message(Command("ретро"))
async def retro(m: types.Message):
    text = (
        "🔄 Ближайшие ретроградности:\n"
        "• Меркурий: 05.09 — 27.09\n"
        "• Марс: 12.11 — 02.01\n"
        "• Венера: 18.12 — 09.01"
    )
    await m.answer(text)












from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, InlineKeyboardMarkup, InlineKeyboardButton


def bottom_nav_kb() -> ReplyKeyboardMarkup:
    rows = [
        [KeyboardButton(text="🔮 Прогноз")],
        [KeyboardButton(text="🌀 Натальная карта"), KeyboardButton(text="❤️ Совместимость")],
        [KeyboardButton(text="🌙 Луна и ретро"), KeyboardButton(text="👤 Профиль")],
        [KeyboardButton(text="⭐ Премиум")],
    ]
    return ReplyKeyboardMarkup(keyboard=rows, resize_keyboard=True)


def forecast_menu_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="На день", callback_data="fc:day")],
        [InlineKeyboardButton(text="На неделю", callback_data="fc:week")],
        [InlineKeyboardButton(text="На месяц", callback_data="fc:month")],
    ])












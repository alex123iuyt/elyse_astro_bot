import os
import asyncio
import logging
from aiogram import Bot, Dispatcher, F, types
from aiogram.filters import CommandStart, Command
from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, InlineKeyboardMarkup, InlineKeyboardButton
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv()

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Инициализация бота
BOT_TOKEN = os.getenv("BOT_TOKEN")
ADMIN_ID = int(os.getenv("ADMIN_ID", "0")) if os.getenv("ADMIN_ID") else None
MINIAPP_URL = os.getenv("MINIAPP_URL", "http://localhost:3000")

if not BOT_TOKEN:
    logger.error("BOT_TOKEN не найден в переменных окружения!")
    exit(1)

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

# Главная клавиатура
def main_menu_kb():
    kb = ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="🔮 Гороскоп"), KeyboardButton(text="🌙 Лунный календарь")],
            [KeyboardButton(text="💫 Натальная карта"), KeyboardButton(text="❤️ Совместимость")],
            [KeyboardButton(text="🎯 Прогнозы"), KeyboardButton(text="⚙️ Настройки")]
        ],
        resize_keyboard=True,
        persistent=True
    )
    return kb

# Inline клавиатура для Mini App
def miniapp_inline_kb():
    kb = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="🌐 Открыть приложение", url=MINIAPP_URL)]
        ]
    )
    return kb

@dp.message(CommandStart())
async def start_command(message: types.Message):
    """Обработчик команды /start"""
    welcome_text = (
        f"👋 Добро пожаловать, {message.from_user.first_name}!\n\n"
        "🔮 **Elyse Astro Bot** — ваш персональный астрологический помощник!\n\n"
        "Здесь вы можете:\n"
        "• Получить персональный гороскоп\n"
        "• Изучить лунный календарь\n"
        "• Построить натальную карту\n"
        "• Проверить совместимость\n"
        "• Получить прогнозы на будущее\n\n"
        "Выберите интересующий раздел в меню ниже 👇"
    )
    
    await message.answer(
        welcome_text,
        reply_markup=main_menu_kb(),
        parse_mode="Markdown"
    )
    
    # Отправляем кнопку для открытия Mini App
    await message.answer(
        "🌐 Или откройте полную версию приложения:",
        reply_markup=miniapp_inline_kb()
    )

@dp.message(F.text == "🔮 Гороскоп")
async def horoscope_handler(message: types.Message):
    """Обработчик гороскопа"""
    await message.answer(
        "🔮 **Гороскоп**\n\n"
        "Для получения персонального гороскопа откройте веб-приложение 👇",
        reply_markup=miniapp_inline_kb(),
        parse_mode="Markdown"
    )

@dp.message(F.text == "🌙 Лунный календарь")
async def lunar_handler(message: types.Message):
    """Обработчик лунного календаря"""
    await message.answer(
        "🌙 **Лунный календарь**\n\n"
        "Актуальная информация о фазах луны доступна в приложении 👇",
        reply_markup=miniapp_inline_kb(),
        parse_mode="Markdown"
    )

@dp.message(F.text == "💫 Натальная карта")
async def natal_handler(message: types.Message):
    """Обработчик натальной карты"""
    await message.answer(
        "💫 **Натальная карта**\n\n"
        "Постройте свою персональную натальную карту в приложении 👇",
        reply_markup=miniapp_inline_kb(),
        parse_mode="Markdown"
    )

@dp.message(F.text == "❤️ Совместимость")
async def compatibility_handler(message: types.Message):
    """Обработчик совместимости"""
    await message.answer(
        "❤️ **Совместимость**\n\n"
        "Проверьте совместимость с партнером в приложении 👇",
        reply_markup=miniapp_inline_kb(),
        parse_mode="Markdown"
    )

@dp.message(F.text == "🎯 Прогнозы")
async def forecasts_handler(message: types.Message):
    """Обработчик прогнозов"""
    await message.answer(
        "🎯 **Прогнозы**\n\n"
        "Персональные прогнозы доступны в приложении 👇",
        reply_markup=miniapp_inline_kb(),
        parse_mode="Markdown"
    )

@dp.message(F.text == "⚙️ Настройки")
async def settings_handler(message: types.Message):
    """Обработчик настроек"""
    await message.answer(
        "⚙️ **Настройки**\n\n"
        "Настройте профиль и уведомления в приложении 👇",
        reply_markup=miniapp_inline_kb(),
        parse_mode="Markdown"
    )

@dp.message(Command("help"))
async def help_command(message: types.Message):
    """Обработчик команды /help"""
    help_text = (
        "🆘 **Помощь**\n\n"
        "**Доступные команды:**\n"
        "/start - Главное меню\n"
        "/help - Эта справка\n\n"
        "**Возможности бота:**\n"
        "• Персональные гороскопы\n"
        "• Лунный календарь\n"
        "• Натальные карты\n"
        "• Совместимость партнеров\n"
        "• Астрологические прогнозы\n\n"
        "Для полного функционала используйте веб-приложение 👇"
    )
    
    await message.answer(
        help_text,
        reply_markup=miniapp_inline_kb(),
        parse_mode="Markdown"
    )

async def main():
    """Главная функция запуска бота"""
    logger.info("🤖 Запускаем Elyse Astro Bot...")
    
    if ADMIN_ID:
        try:
            await bot.send_message(ADMIN_ID, "🤖 Бот запущен и готов к работе!")
        except Exception as e:
            logger.warning(f"Не удалось отправить сообщение админу: {e}")
    
    try:
        await dp.start_polling(bot)
    except Exception as e:
        logger.error(f"Ошибка при запуске бота: {e}")
    finally:
        await bot.session.close()

if __name__ == "__main__":
    asyncio.run(main())

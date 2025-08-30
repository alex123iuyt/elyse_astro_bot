import asyncio
from aiogram import Bot, Dispatcher, F, types
from aiogram.filters import CommandStart, Command
from aiogram.fsm.context import FSMContext
from common.config import BOT_TOKEN
from bot.utils.keyboards import bottom_nav_kb, forecast_menu_kb
from bot.handlers.start import router as start_router
from bot.handlers.forecast import router as forecast_router
from bot.handlers.natal import router as natal_router
from bot.handlers.synastry import router as syn_router
from bot.handlers.lunar import router as lunar_router
from bot.handlers.feedback import router as feedback_router


bot = Bot(BOT_TOKEN)
dp = Dispatcher()
dp.include_router(start_router)
dp.include_router(forecast_router)
dp.include_router(natal_router)
dp.include_router(syn_router)
dp.include_router(lunar_router)
dp.include_router(feedback_router)




async def main():
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())



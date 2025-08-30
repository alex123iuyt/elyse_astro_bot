import os
import smtplib
import ssl
import asyncio
import logging
import datetime as dt
import random, hashlib
import json
from functools import lru_cache
import re

import requests
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from aiogram import Bot, Dispatcher, F, types
from aiogram.filters import CommandStart, Command
from aiogram.types import (
    ReplyKeyboardMarkup, KeyboardButton,
    InlineKeyboardMarkup, InlineKeyboardButton, BotCommand, ReplyKeyboardRemove
)
from aiogram.fsm.state import StatesGroup, State
from aiogram.fsm.context import FSMContext
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from sqlalchemy import create_engine, select, String, Integer, Boolean, Date, DateTime
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session

from dotenv import load_dotenv
from openai import OpenAI

# -------------------- ENV / AI --------------------
load_dotenv()

USE_AI = os.getenv("USE_AI", "false").lower() in ("1", "true", "yes", "on")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY) if (USE_AI and OPENAI_API_KEY) else None

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(level=getattr(logging, LOG_LEVEL, logging.INFO),
                    format="%(asctime)s %(levelname)s %(name)s: %(message)s")
log = logging.getLogger("elyse.bot")
log.info(f"AI mode: {'ON' if client else 'OFF'} (LOG_LEVEL={LOG_LEVEL})")

logging.getLogger("apscheduler").setLevel(logging.WARNING)
logging.getLogger("aiogram").setLevel(logging.WARNING)
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("aiohttp").setLevel(logging.WARNING)


BOT_TOKEN = os.getenv("BOT_TOKEN")
ADMIN_ID = int(os.getenv("ADMIN_ID", "0")) or None
YANDEX_EMAIL = os.getenv("YANDEX_EMAIL", "alexeu123@yandex.ru")
YANDEX_PASS = os.getenv("YANDEX_PASS")
DEFAULT_TZ = os.getenv("DEFAULT_TZ", "Europe/Moscow")
FEEDBACK_CHAT_ENV = os.getenv("FEEDBACK_CHAT", "").strip()
FEEDBACK_TARGET: int | str | None = None
MINIAPP_URL = os.getenv("MINIAPP_URL", "").strip() or None

# -------------------- LINKS --------------------

OZON_URL = "https://www.ozon.ru/seller/elyse-2268717/?miniapp=seller_2268717"

# -------------------- OFFLINE TEMPLATES --------------------
# TEMPLATES = {
#     "Тема": [
#         "День про ясность и пару смелых решений.",
#         "Темп высокий, но всё под контролем.",
#         "Фокус на мелочах принесёт большой профит.",
#         "Хороший момент для перезапуска рутины."
#     ],
#     "Работа": [
#         "Заверши то, что долго откладывал.",
#         "Одно важное дело лучше трёх мелких.",
#         "Ставь чёткие рамки — и держись их.",
#         "Согласуй ожидания с коллегами заранее."
#     ],
#     "Отношения": [
#         "Чуть больше внимания близким — и всем легче.",
#         "Слушай, не спорь — так быстрее к согласию.",
#         "Не навязывай советы, просто будь рядом.",
#         "Тёплое сообщение кому-то улучшит день."
#     ],
#     "Деньги": [
#         "Микроплан по расходам даст спокойствие.",
#         "Избегай импульсивных покупок сегодня.",
#         "Наведи порядок в бюджете — это окупится.",
#         "Оцени цену времени, а не только денег."
#     ],
#     "Энергия": [
#         "Короткая прогулка и вода сотворят чудо.",
#         "Разгрузи голову: 10 минут без экрана.",
#         "Питайся проще, выспись глубже.",
#         "Растяжка+дыхание вернут тонус."
#     ],
#     "Совет": [
#         "Меньше драм — больше практики.",
#         "Не усложняй очевидное.",
#         "Выбери один приоритет и дожми.",
#         "Сделай то, что откладывал 5 минут."
#     ]
# }

# -------------------- Zodiac utils --------------------

ZODIACS = ["Овен","Телец","Близнецы","Рак","Лев","Дева","Весы","Скорпион","Стрелец","Козерог","Водолей","Рыбы"]
ZODIAC_ICON: dict[str, str] = {
    "Овен":"♈","Телец":"♉","Близнецы":"♊","Рак":"♋","Лев":"♌","Дева":"♍",
    "Весы":"♎","Скорпион":"♏","Стрелец":"♐","Козерог":"♑","Водолей":"♒","Рыбы":"♓",
}

def zodiac_by_date(day: int, month: int) -> str:
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

def offline_horoscope(zodiac: str, date_iso: str) -> str:
    seed = int(hashlib.sha256(f"{zodiac}|{date_iso}".encode()).hexdigest(), 16) % (10**8)
    rnd = random.Random(seed)
    pick = lambda k: rnd.choice(TEMPLATES[k])
    return (
        f"Тема дня: {pick('Тема')}\n"
        f"Работа/учёба: {pick('Работа')}\n"
        f"Отношения: {pick('Отношения')}\n"
        f"Энергия: {pick('Энергия')}\n"
        f"Совет: {pick('Совет')}"
    )

async def make_horoscope(zodiac: str, place: str, date_iso: str) -> str:
    if client is None:
        log.debug("Using OFFLINE horoscope")
        return offline_horoscope(zodiac, date_iso)
    prompt = f"""
Ты — астрологический помощник. Пиши кратко, дружелюбно, современно.
Дай прогноз на сегодня для знака: {zodiac}. Локация: {place}, дата: {date_iso}.
Структура:
1) Тема дня (1–2 фразы)
2) Работа/учёба (1 фраза)
3) Отношения (1 фраза)
4) Энергия/здоровье (1 фраза)
5) Совет (1 короткая фраза без клише)
Без обещаний «точного будущего». Без эзотерических перегибов.
"""
    try:
        resp = await asyncio.to_thread(lambda: client.chat.completions.create(
            model="gpt-5",
            messages=[
                {"role": "system", "content": "You are helpful and concise."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
        ))
        return resp.choices[0].message.content.strip()
    except Exception as e:
        log.warning(f"AI error -> OFFLINE fallback: {e}")
        return offline_horoscope(zodiac, date_iso)
    


# ---- Stats helpers ----


def _user_local_today(u: "User", now_utc: dt.datetime | None = None) -> dt.date:
    """Возвращает 'сегодня' в поясе пользователя."""
    now_utc = now_utc or dt.datetime.now(dt.timezone.utc)
    try:
        return now_utc.astimezone(ZoneInfo(u.tz or "UTC")).date()
    except ZoneInfoNotFoundError:
        return now_utc.date()

def get_stats() -> dict:
    """Собирает агрегаты по пользователям."""
    now_utc = dt.datetime.now(dt.timezone.utc)
    with Session(engine) as s:
        users: list[User] = s.scalars(select(User)).all()

    total = len(users)
    with_zodiac = sum(1 for u in users if u.zodiac)
    active = sum(1 for u in users if u.active)
    sent_today = sum(
        1 for u in users
        if u.last_sent_date and u.last_sent_date == _user_local_today(u, now_utc)
    )

    return {
        "total": total,
        "active": active,
        "with_zodiac": with_zodiac,
        "sent_today": sent_today,
    }


# -------------------- BOT / DISPATCHER --------------------

bot = Bot(BOT_TOKEN)
dp = Dispatcher()

async def safe_send(chat_id: int, text: str, **kwargs) -> bool:
    try:
        await bot.send_message(chat_id, text, **kwargs)
        return True
    except Exception as e:
        log.error(f"Telegram send_message failed for chat_id={chat_id}: {e}")
        return False

def _normalize_feedback_target(val: str) -> int | str | None:
    if not val:
        return None
    s = val.strip()
    if s.startswith("@"):
        return s
    try:
        n = int(s)
        if n > 0:
            return int(f"-100{n}")
        return n
    except Exception:
        return None
    

# --- Команда /stats ---

@dp.message(Command("stats"))
async def stats_cmd(m: types.Message):
    # Только админ (ENV ADMIN_ID)
    if ADMIN_ID and m.from_user.id != ADMIN_ID:
        await m.answer("Недоступно.")
        return

    st = get_stats()
    text = (
        "📊 Статистика бота\n"
        f"• Всего пользователей: {st['total']}\n"
        f"• Активных подписок: {st['active']}\n"
        f"• С выбранным знаком: {st['with_zodiac']}\n"
        f"• Получили прогноз сегодня: {st['sent_today']}\n"
    )
    await m.answer(text)

# --- Команда /export_users ---

@dp.message(Command("export_users"))
async def export_users(m: types.Message):
    if ADMIN_ID and m.from_user.id != ADMIN_ID:
        await m.answer("Недоступно.")
        return

    import csv, io
    with Session(engine) as s:
        users: list[User] = s.scalars(select(User)).all()

    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["tg_id", "zodiac", "tz", "hour", "minute", "active", "last_sent_date", "created_at", "updated_at"])
    for u in users:
        w.writerow([
            u.tg_id, u.zodiac or "", u.tz, u.hour, u.minute, int(u.active),
            u.last_sent_date or "", u.created_at, u.updated_at
        ])

    data = buf.getvalue().encode("utf-8")
    await bot.send_document(
        m.chat.id,
        types.input_file.BufferedInputFile(data, filename="users.csv")
    )

# --- Основное ---

@dp.startup()
async def set_commands(bot: Bot):
    global FEEDBACK_TARGET
    await bot.set_my_commands([
        BotCommand(command="menu", description="Открыть меню"),
        BotCommand(command="settings", description="Настройки"),
        BotCommand(command="setup", description="Мастер настройки"),
        BotCommand(command="today", description="Прогноз на сегодня"),
        BotCommand(command="stop", description="Отключить рассылку"),
        BotCommand(command="resume", description="Включить рассылку"),
        BotCommand(command="reset", description="Сбросить знак"),
        BotCommand(command="mysign", description="Определить знак по дате"),
        # BotCommand(command="mytime", description="Показать локальное время"),
        # BotCommand(command="mystate", description="Мои настройки (debug)"),
        # BotCommand(command="debug_send", description="Выслать прогноз (debug)"),
        # BotCommand(command="tick_now", description="Принудительный тик (debug)"),
        BotCommand(command="stats", description="Статистика (админ)"),

        # BotCommand(command="dbg", description="Алиас mystate"),
        # BotCommand(command="test_send", description="Алиас debug_send"),
    ])
    FEEDBACK_TARGET = _normalize_feedback_target(FEEDBACK_CHAT_ENV)
    if isinstance(FEEDBACK_TARGET, str) and FEEDBACK_TARGET.startswith("@"):
        try:
            chat = await bot.get_chat(FEEDBACK_TARGET)
            FEEDBACK_TARGET = chat.id
            log.info(f"Resolved feedback chat to id={FEEDBACK_TARGET}")
        except Exception as e:
            log.warning(f"Cannot resolve feedback chat {FEEDBACK_TARGET}: {e}")

# -------------------- DB --------------------
engine = create_engine(
    "sqlite:///bot.db",
    echo=False,
    future=True,
    pool_pre_ping=True,   # укрощает «разрывы» соединений
)

class Base(DeclarativeBase): ...
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    tg_id: Mapped[int] = mapped_column(Integer, unique=True, index=True)
    zodiac: Mapped[str | None] = mapped_column(String(20), nullable=True)
    tz: Mapped[str] = mapped_column(String(64), default="UTC")
    hour: Mapped[int] = mapped_column(Integer, default=9)
    minute: Mapped[int] = mapped_column(Integer, default=0)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_sent_date: Mapped[dt.date | None] = mapped_column(Date, nullable=True)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, default=lambda: dt.datetime.utcnow())
    updated_at: Mapped[dt.datetime] = mapped_column(DateTime, default=lambda: dt.datetime.utcnow(), onupdate=lambda: dt.datetime.utcnow())

engine = create_engine("sqlite:///bot.db", echo=False, future=True)
Base.metadata.create_all(engine)

# -------------------- UI --------------------
def main_menu_kb():
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="🔮 Прогноз на сегодня"), KeyboardButton(text="⚙️ Настройки")],
            [KeyboardButton(text="🛍 Смотреть товары")],
            [KeyboardButton(text="🧭 Открыть Mini App")],
            [KeyboardButton(text="💡 Идеи на улучшение / Есть проблемы?")],
            [KeyboardButton(text="🛑 Стоп-рассылка")],
        ],
        resize_keyboard=True
    )

def miniapp_inline_kb():
    if not MINIAPP_URL:
        return None
    return InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text="🧭 Открыть Mini App", url=MINIAPP_URL)]])

def settings_inline_kb(zodiac: str | None, hour: int, minute: int, tz: str | None):
    pretty_tz = tz or "не задан"
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text=f"🪐 Знак: {zodiac or 'не выбран'}", callback_data="st:change_z")],
        [InlineKeyboardButton(text="❓ Определить по дате", callback_data="st:z_from_birth")],
        [InlineKeyboardButton(text=f"⏰ Время: {hour:02d}:{minute:02d}", callback_data="st:change_time")],
        [InlineKeyboardButton(text=f"🌍 Часовой пояс: {pretty_tz}", callback_data="st:change_tz")],
    ])

def zodiac_inline_kb(prefix: str = "z"):
    rows = []
    for i in range(0, len(ZODIACS), 3):
        rows.append([InlineKeyboardButton(text=z, callback_data=f"{prefix}:{z}") for z in ZODIACS[i:i+3]])
    return InlineKeyboardMarkup(inline_keyboard=rows)

def shop_links_kb():
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🛒 Ozon Market", url=OZON_URL)],
    ])

# -------------------- OFFLINE JSON FORECASTS --------------------

FORECASTS_DIR = os.getenv("FORECASTS_DIR", "").strip() or None

def _month_file_candidates(for_date: dt.date) -> list[str]:
    """
    Кандидаты путей, от более специфичных к более общим.
    Поддерживаем:
      1) data/forecasts/YYYY/MM/forecasts_YYYY-MM.json (как раньше)
      2) data/forecasts/forecasts_YYYY-MM.json
      3) ./forecasts_YYYY-MM.json (в корне проекта)
      4) $FORECASTS_DIR/forecasts_YYYY-MM.json (если задано в .env)
    """
    year = f"{for_date.year:04d}"
    month = f"{for_date.month:02d}"
    fname = f"forecasts_{year}-{month}.json"

    base_dir = os.path.dirname(os.path.abspath(__file__))
    candidates = [
        os.path.join(base_dir, "data", "forecasts", year, month, fname),
        os.path.join(base_dir, "data", "forecasts", fname),
        os.path.join(base_dir, fname),
    ]
    if FORECASTS_DIR:
        candidates.insert(0, os.path.join(FORECASTS_DIR, fname))
    return candidates

@lru_cache(maxsize=12)
def _load_month_forecasts(for_date: dt.date) -> list[dict] | None:
    """
    Читаем первый существующий файл из кандидатов.
    Форматы поддерживаемые:
      - список объектов [{sign, date, ...}, ...]
      - объект {"forecasts": [...]}
    """
    for path in _month_file_candidates(for_date):
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            if isinstance(data, dict) and "forecasts" in data:
                logging.info(f"Loaded forecasts from {path} (dict)")
                return list(data["forecasts"])
            if isinstance(data, list):
                logging.info(f"Loaded forecasts from {path} (list)")
                return list(data)
        except FileNotFoundError:
            continue
        except Exception as e:
            logging.warning(f"Failed to load forecasts from {path}: {e}")
    logging.info("No monthly forecasts file found for %s", for_date.strftime("%Y-%m"))
    return None

def get_forecast(sign: str, iso_date: str) -> dict | None:
    try:
        d = dt.date.fromisoformat(iso_date)
    except Exception:
        return None
    month = _load_month_forecasts(d)
    if not month:
        return None
    s = (sign or "").strip()
    for item in month:
        if item.get("sign") == s and item.get("date") == iso_date:
            return item
    return None

def render_forecast_html(sign: str, iso_date: str, body_text: str | None = None, f: dict | None = None) -> str:
    if f:
        icon = f.get("icon") or ZODIAC_ICON.get(f.get("sign", ""), "🔮")
        sign = f.get("sign", "")
        date_str = f.get("date", "")
        theme = f.get("theme", "")
        work = f.get("work", "")
        relations = f.get("relations", "")
        money = f.get("money", "")
        energy = f.get("energy", "")
        advice = f.get("advice", "")
        return (
            f"{icon} <b>{sign}</b> — <b>{date_str}</b>\n\n"
            f"<b>Тема дня:</b> {theme}\n"
            f"💼 <b>Работа/учёба:</b> {work}\n"
            f"💖 <b>Отношения:</b> {relations}\n"
            f"💰 <b>Деньги:</b> {money}\n"
            f"⚡ <b>Энергия:</b> {energy}\n"
            f"💡 <b>Совет:</b> {advice}"
        )
    else:
        return f"{ZODIAC_ICON.get(sign,'🔮')} <b>{sign}</b> — <b>{iso_date}</b>\n\n{body_text or ''}"

def build_offline_forecast(sign: str, iso_date: str) -> dict:
    seed = int(hashlib.sha256(f"{sign}|{iso_date}".encode()).hexdigest(), 16) % (10**8)
    rnd = random.Random(seed)
    def pick(key: str) -> str:
        return rnd.choice(TEMPLATES[key])
    return {
        "date": iso_date,
        "sign": sign,
        "icon": ZODIAC_ICON.get(sign, "🔮"),
        "theme": pick("Тема"),
        "work": pick("Работа"),
        "relations": pick("Отношения"),
        "money": pick("Деньги"),
        "energy": pick("Энергия"),
        "advice": pick("Совет"),
    }
    seed = int(hashlib.sha256(f"{sign}|{iso_date}".encode()).hexdigest(), 16) % (10**8)
    rnd = random.Random(seed)
    def pick(key: str) -> str:
        return rnd.choice(TEMPLATES[key])
    return {
        "date": iso_date,
        "sign": sign,
        "icon": ZODIAC_ICON.get(sign, "🔮"),
        "theme": pick("Тема"),
        "work": pick("Работа"),
        "relations": pick("Отношения"),
        "money": pick("Деньги"),
        "energy": pick("Энергия"),
        "advice": pick("Совет"),
    }

# -------------------- FSM --------------------
class SetupWizard(StatesGroup):
    zodiac = State()
    time = State()
    confirm = State()

class Feedback(StatesGroup):
    wait = State()

class TzSetup(StatesGroup):
    wait_location = State()
    wait_manual_tz = State()

class BirthToZodiac(StatesGroup):
    wait_date = State()

class TimeState(StatesGroup):
    wait_time = State()

# -------------------- TZ utils --------------------
def resolve_tz_by_coords(lat: float, lon: float) -> str | None:
    try:
        r = requests.get(
            "https://timeapi.io/api/TimeZone/coordinate",
            params={"latitude": lat, "longitude": lon},
            timeout=6
        )
        if r.status_code == 200:
            data = r.json()
            tz = data.get("timeZone") or data.get("timezone")
            if tz and isinstance(tz, str):
                return tz
    except Exception as e:
        log.warning(f"timeapi.io failed: {e}")
    return None

# -------------------- SENDING --------------------
async def send_today_for_user(user_id: int):
    with Session(engine) as s:
        u = s.scalar(select(User).where(User.tg_id == user_id))
        if not u or not u.zodiac:
            return False, "Сначала выбери знак: /settings или /setup"

        tzname = u.tz or "UTC"
        now_utc = dt.datetime.now(dt.timezone.utc)
        try:
            local_now = now_utc.astimezone(ZoneInfo(tzname))
        except ZoneInfoNotFoundError:
            local_now = now_utc
            tzname = "UTC"

        iso = str(local_now.date())
        log.debug(f"[send_today] uid={user_id} tz={tzname} local_date={iso} sign={u.zodiac}")

        f = get_forecast(u.zodiac, iso)
        source = "JSON"
        body = None
        if f is None:
            if client is not None:
                try:
                    body = await make_horoscope(u.zodiac, place=tzname, date_iso=iso)
                    source = "AI"
                except Exception as e:
                    log.warning(f"[send_today] AI failed: {e}")
            if f is None and body is None:
                f = build_offline_forecast(u.zodiac, iso)
                source = "OFFLINE"

        msg = render_forecast_html(u.zodiac, iso, f=f) if f else render_forecast_html(u.zodiac, iso, body_text=body)
        ok = await safe_send(user_id, msg, parse_mode="HTML")
        log.info(f"[send_today] uid={user_id} sent={ok} source={source}")
        if not ok:
            return False, "Не удалось отправить сообщение пользователю."
        return True, None

# -------------------- SCHEDULER --------------------
scheduler = AsyncIOScheduler(
    timezone="UTC",
    job_defaults={
        "coalesce": True,
        "max_instances": 1,
        "misfire_grace_time": 30,
    },
)

async def minute_tick():
    """
    Раз в минуту проверяем локальное время активных пользователей (с указанным знаком).
    Отправляем прогноз 1 раз в день в окне ±60 сек относительно (hour:minute).
    """
    now_utc = dt.datetime.now(dt.timezone.utc)

    try:
        with Session(engine) as s:
            # фильтруем сразу в SQL — активные и со знаком
            stmt = (
                select(User)
                .where(User.active == True)
                .where(User.zodiac.is_not(None))
                .execution_options(yield_per=500)  # батчи из БД
            )
            result = s.execute(stmt)
            users_iter = result.scalars()

            # кэш локального «сейчас» по таймзонам
            tz_now_cache: dict[str, dt.datetime] = {}

            for u in users_iter:
                try:
                    tzname = u.tz or "UTC"
                    if tzname not in tz_now_cache:
                        try:
                            tz_now_cache[tzname] = now_utc.astimezone(ZoneInfo(tzname))
                        except ZoneInfoNotFoundError:
                            tz_now_cache[tzname] = now_utc  # fallback UTC

                    local_now = tz_now_cache[tzname]
                    # цель «сегодня» в локальном поясе юзера
                    target = local_now.replace(hour=u.hour, minute=u.minute, second=0, microsecond=0)
                    delta_sec = (local_now - target).total_seconds()

                    due_now = (-60 <= delta_sec < 60)  # окно срабатывания
                    not_sent_today = (u.last_sent_date or dt.date(1970, 1, 1)) != local_now.date()

                    if due_now and not_sent_today:
                        ok, _ = await send_today_for_user(u.tg_id)
                        if ok:
                            # короткая точечная запись только нужного пользователя
                            with Session(engine) as s2:
                                dbu = s2.get(User, u.id)
                                if dbu:
                                    dbu.last_sent_date = local_now.date()
                                    s2.commit()
                except Exception as e:
                    logging.getLogger("elyse.bot").warning(
                        f"minute_tick: user {getattr(u,'tg_id','?')} failed: {e}"
                    )
    except Exception as e:
        logging.getLogger("elyse.bot").error(f"minute_tick failed: {e}")

    """
    Раз в минуту проверяем локальное время активных пользователей.
    Отправляем прогноз 1 раз в день в его поясе, в окне ±60 сек.
    """
    now_utc = dt.datetime.now(dt.timezone.utc)

    with Session(engine) as s:
        users: list[User] = s.scalars(select(User).where(User.active == True)).all()

    log.debug(f"[tick] active_users={len(users)} now_utc={now_utc:%Y-%m-%d %H:%M:%S}")

    for u in users:
        try:
            tzname = u.tz or "UTC"
            try:
                local_now = now_utc.astimezone(ZoneInfo(tzname))
            except ZoneInfoNotFoundError:
                local_now = now_utc
                tzname = "UTC"

            target = local_now.replace(hour=u.hour, minute=u.minute, second=0, microsecond=0)
            delta_sec = (local_now - target).total_seconds()

            in_window = (-60 <= delta_sec < 60)
            same_hm = (local_now.hour == u.hour and local_now.minute == u.minute)
            not_sent_today = (u.last_sent_date or dt.date(1970, 1, 1)) != local_now.date()

            log.debug(
                f"[tick] uid={u.tg_id} tz={tzname} now={local_now:%Y-%m-%d %H:%M:%S} "
                f"target={u.hour:02d}:{u.minute:02d} delta={int(delta_sec)}s "
                f"in_window={in_window} same_hm={same_hm} "
                f"not_sent_today={not_sent_today} zodiac={'+' if u.zodiac else '-'}"
            )

            if (in_window or same_hm) and not_sent_today and u.zodiac:
                ok, err = await send_today_for_user(u.tg_id)
                log.debug(f"[tick->send] uid={u.tg_id} ok={ok} err={err}")
                if ok:
                    with Session(engine) as s2:
                        dbu = s2.scalar(select(User).where(User.id == u.id))
                        if dbu:
                            dbu.last_sent_date = local_now.date()
                            s2.commit()
                            log.debug(f"[tick] uid={u.tg_id} last_sent_date set to {dbu.last_sent_date}")
        except Exception as e:
            log.warning(f"[tick] user {getattr(u, 'tg_id', '?')} failed: {e}")

def schedule_jobs():
    # тик на нулевой секунде каждой минуты
    scheduler.add_job(
        minute_tick,
        "cron",
        second=0,
        id="minute_tick",
        replace_existing=True,
    )
    scheduler.start()

# -------------------- HANDЛERS --------------------
@dp.message(CommandStart())
async def start(m: types.Message):
    with Session(engine) as s:
        user = s.scalar(select(User).where(User.tg_id == m.from_user.id))
        if not user:
            user = User(tg_id=m.from_user.id, hour=9, minute=0, tz=DEFAULT_TZ or "UTC", active=True)
            s.add(user); s.commit()
        else:
            # автореактивация на вход
            user.active = True
            s.commit()
        zodiac = user.zodiac

    await m.answer("\u2060", reply_markup=ReplyKeyboardRemove())

    welcome_text = (
        "👋 Добро пожаловать в бот **Elyse**!\n\n"
        "Здесь вы получите ежедневные персональные гороскопы и сможете "
        "ознакомиться с нашей продукцией.\n\n"
        "📌 **Каталог продукции** доступен по кнопкам ниже:"
    )
    await safe_send(m.chat.id, welcome_text, parse_mode="Markdown", reply_markup=shop_links_kb())
    if MINIAPP_URL:
        await safe_send(m.chat.id, "Быстрый доступ к веб‑интерфейсу:", reply_markup=miniapp_inline_kb())

    if zodiac:
        await safe_send(m.chat.id, "\u2060", reply_markup=main_menu_kb())
    else:
        await safe_send(m.chat.id, "Выбери свой знак зодиака, чтобы начать получать прогнозы:",
                        reply_markup=zodiac_inline_kb("stz"))

@dp.message(Command("menu"))
async def menu(m: types.Message):
    await safe_send(m.chat.id, "\u2060", reply_markup=main_menu_kb())

@dp.message(F.text == "🔮 Прогноз на сегодня")
async def today_btn(m: types.Message):
    ok, err = await send_today_for_user(m.from_user.id)
    if not ok:
        await safe_send(m.chat.id, f"⚠️ {err}")

@dp.message(Command("shop"))
@dp.message(F.text == "🛍 Смотреть товары")
async def shop_cmd(m: types.Message):
    await safe_send(m.chat.id, "Каталог продукции:", reply_markup=shop_links_kb())

@dp.message(F.text == "⚙️ Настройки")
@dp.message(Command("settings"))
async def settings(m: types.Message):
    with Session(engine) as s:
        u = s.scalar(select(User).where(User.tg_id == m.from_user.id))
        if not u:
            await safe_send(m.chat.id, "Сначала /start"); return
        zodiac, hour, minute, tz = u.zodiac, u.hour, u.minute, u.tz
    text = (
        "Текущие настройки:\n"
        f"• Знак: {zodiac or 'не выбран'}\n"
        f"• Автоматический прогноз в: {hour:02d}:{minute:02d}\n"
        f"• Часовой пояс: {tz or 'не задан'}"
    )
    await safe_send(m.chat.id, text, reply_markup=settings_inline_kb(zodiac, hour, minute, tz))

@dp.message(Command("app"))
@dp.message(F.text == "🧭 Открыть Mini App")
async def open_app(m: types.Message):
    if MINIAPP_URL:
        await safe_send(m.chat.id, "Открой Mini App по кнопке ниже:", reply_markup=miniapp_inline_kb())
    else:
        await safe_send(m.chat.id, "URL Mini App не настроен. Добавь MINIAPP_URL в .env")

# --- Знак
@dp.callback_query(F.data == "st:change_z")
async def st_change_z(cq: types.CallbackQuery):
    await cq.message.edit_text("Выбери знак зодиака:", reply_markup=zodiac_inline_kb("stz"))
    await cq.answer()

@dp.callback_query(F.data.startswith("stz:"))
async def st_set_z(cq: types.CallbackQuery):
    z = cq.data.split(":", 1)[1]
    with Session(engine) as s:
        u = s.scalar(select(User).where(User.tg_id == cq.from_user.id))
        u.zodiac = z
        u.active = True  # реактивация
        s.commit()
        zodiac, hour, minute, tz = u.zodiac, u.hour, u.minute, u.tz
    await cq.message.edit_text(
        "Текущие настройки:\n"
        f"• Знак: {zodiac}\n"
        f"• Автоматический прогноз в: {hour:02d}:{minute:02d}\n"
        f"• Часовой пояс: {tz or 'не задан'}",
        reply_markup=settings_inline_kb(zodiac, hour, minute, tz)
    )
    await cq.answer()

# --- Определить по дате
@dp.callback_query(F.data == "st:z_from_birth")
async def z_from_birth_ask(cq: types.CallbackQuery, state: FSMContext):
    await state.set_state(BirthToZodiac.wait_date)
    await cq.message.edit_text(
        "Введи дату рождения в формате <b>ДД.ММ</b> или <b>ДД.ММ.ГГГГ</b>.\n"
        "Например: 07.01 или 07.01.1996",
        parse_mode="HTML"
    )
    await cq.answer()

@dp.message(BirthToZodiac.wait_date)
async def z_from_birth_save(m: types.Message, state: FSMContext):
    txt = (m.text or "").strip()
    mobj = re.match(r"^\s*(\d{1,2})[.\-/](\d{1,2})(?:[.\-/](\d{2,4}))?\s*$", txt)
    if not mobj:
        await safe_send(m.chat.id, "Не понял дату. Пример: 23.09 или 23.09.2001")
        return
    day = int(mobj.group(1))
    month = int(mobj.group(2))
    if not (1 <= month <= 12 and 1 <= day <= 31):
        await safe_send(m.chat.id, "Похоже на неверную дату, попробуй ещё раз.")
        return
    sign = zodiac_by_date(day, month)
    with Session(engine) as s:
        u = s.scalar(select(User).where(User.tg_id == m.from_user.id))
        if not u:
            await safe_send(m.chat.id, "Сначала /start"); return
        u.zodiac = sign
        u.active = True  # реактивация
        s.commit()
        hour, minute, tz = u.hour, u.minute, u.tz
    await state.clear()
    await safe_send(m.chat.id, f"Твой знак — <b>{sign}</b> {ZODIAC_ICON.get(sign,'')}. Сохранил в настройках ✅", parse_mode="HTML")
    await safe_send(m.chat.id,
        "Текущие настройки:\n"
        f"• Знак: {sign}\n"
        f"• Автоматический прогноз в: {hour:02d}:{minute:02d}\n"
        f"• Часовой пояс: {tz or 'не задан'}",
        reply_markup=settings_inline_kb(sign, hour, minute, tz)
    )

# --- Время HH:MM
@dp.callback_query(F.data == "st:change_time")
async def ask_time(cq: types.CallbackQuery, state: FSMContext):
    await state.set_state(TimeState.wait_time)
    await cq.message.edit_text("Введи время в формате <b>HH:MM</b> (например, 20:15).", parse_mode="HTML")
    await cq.answer()

@dp.message(TimeState.wait_time, F.text.regexp(r"^\s*(?:[01]?\d|2[0-3]):[0-5]\d\s*$"))
async def save_time(m: types.Message, state: FSMContext):
    hh, mm = map(int, re.findall(r"\d+", m.text))
    with Session(engine) as s:
        u = s.scalar(select(User).where(User.tg_id == m.from_user.id))
        if not u:
            await safe_send(m.chat.id, "Сначала /start"); return
        u.hour, u.minute = hh, mm
        u.active = True  # реактивация
        tz = u.tz or "UTC"

        now_utc = dt.datetime.now(dt.timezone.utc)
        try:
            local_now = now_utc.astimezone(ZoneInfo(tz))
        except ZoneInfoNotFoundError:
            local_now = now_utc
            tz = "UTC"

        target_today = local_now.replace(hour=hh, minute=mm, second=0, microsecond=0)
        u.last_sent_date = (local_now.date() - dt.timedelta(days=1)) if local_now <= target_today else local_now.date()
        s.commit()
        zodiac = u.zodiac

    await state.clear()
    await safe_send(m.chat.id, f"Ок! Буду присылать прогноз ежедневно в {hh:02d}:{mm:02d} по {tz}.")
    await safe_send(m.chat.id,
        "Текущие настройки:\n"
        f"• Знак: {zodiac or 'не выбран'}\n"
        f"• Автоматический прогноз в: {hh:02d}:{mm:02d}\n"
        f"• Часовой пояс: {tz}",
        reply_markup=settings_inline_kb(zodiac, hh, mm, tz)
    )

@dp.message(TimeState.wait_time)
async def bad_time(m: types.Message):
    await safe_send(m.chat.id, "Неверный формат. Пример: 08:00 или 19:45")

# --- Часовой пояс
@dp.callback_query(F.data == "st:change_tz")
async def change_tz(cq: types.CallbackQuery, state: FSMContext):
    kb = ReplyKeyboardMarkup(
        keyboard=[[KeyboardButton(text="📍 Определить автоматически", request_location=True)],
                  [KeyboardButton(text="Отмена")]],
        resize_keyboard=True, one_time_keyboard=True
    )
    await state.set_state(TzSetup.wait_location)
    await cq.message.answer("Отправь геолокацию кнопкой ниже, или напиши вручную IANA-таймзону (например, Europe/Samara).",
                            reply_markup=kb)
    await cq.answer()

@dp.message(TzSetup.wait_location, F.location)
async def tz_from_location(m: types.Message, state: FSMContext):
    lat = m.location.latitude
    lon = m.location.longitude
    tz = resolve_tz_by_coords(lat, lon)
    if not tz:
        await safe_send(m.chat.id, "Не удалось определить часовой пояс. Напиши вручную, например: Europe/Samara")
        await state.set_state(TzSetup.wait_manual_tz)
        return
    try:
        ZoneInfo(tz)
    except Exception:
        await safe_send(m.chat.id, "Сервис вернул непонятный часовой пояс. Напиши вручную, например: Europe/Samara")
        await state.set_state(TzSetup.wait_manual_tz)
        return
    with Session(engine) as s:
        u = s.scalar(select(User).where(User.tg_id == m.from_user.id))
        u.tz = tz
        u.active = True  # реактивация
        s.commit()
        zodiac, hour, minute = u.zodiac, u.hour, u.minute
    await state.clear()
    await safe_send(m.chat.id, "Часовой пояс сохранён ✅", reply_markup=ReplyKeyboardRemove())
    await safe_send(m.chat.id,
        "Текущие настройки:\n"
        f"• Знак: {zodiac or 'не выбран'}\n"
        f"• Автоматический прогноз в: {hour:02d}:{minute:02d}\n"
        f"• Часовой пояс: {tz}",
        reply_markup=settings_inline_kb(zodiac, hour, minute, tz)
    )

@dp.message(TzSetup.wait_location, F.text)
async def tz_maybe_manual(m: types.Message, state: FSMContext):
    await state.set_state(TzSetup.wait_manual_tz)
    await tz_manual(m, state)

@dp.message(TzSetup.wait_manual_tz)
async def tz_manual(m: types.Message, state: FSMContext):
    tz = (m.text or "").strip()
    if tz.lower() == "отмена":
        await state.clear()
        await safe_send(m.chat.id, "Отменено.", reply_markup=ReplyKeyboardRemove())
        return
    try:
        ZoneInfo(tz)
    except Exception:
        await safe_send(m.chat.id, "Неверная таймзона. Пример: Europe/Moscow, Europe/Samara, Asia/Almaty")
        return
    with Session(engine) as s:
        u = s.scalar(select(User).where(User.tg_id == m.from_user.id))
        u.tz = tz
        u.active = True  # реактивация
        s.commit()
        zodiac, hour, minute = u.zodiac, u.hour, u.minute
    await state.clear()
    await safe_send(m.chat.id, "Часовой пояс сохранён ✅", reply_markup=ReplyKeyboardRemove())
    await safe_send(m.chat.id,
        "Текущие настройки:\n"
        f"• Знак: {zodiac or 'не выбран'}\n"
        f"• Автоматический прогноз в: {hour:02d}:{minute:02d}\n"
        f"• Часовой пояс: {tz}",
        reply_markup=settings_inline_kb(zodiac, hour, minute, tz)
    )

# --- Команды today/stop/reset/mysign/mytime + DEBUG/ALIASES ---
@dp.message(Command("today"))
async def today_cmd(m: types.Message):
    ok, err = await send_today_for_user(m.from_user.id)
    if not ok:
        await safe_send(m.chat.id, f"⚠️ {err}")

@dp.message(Command("mytime"))
async def mytime_cmd(m: types.Message):
    with Session(engine) as s:
        u = s.scalar(select(User).where(User.tg_id == m.from_user.id))
    tz = (u.tz if u else DEFAULT_TZ) or "UTC"
    try:
        now = dt.datetime.now(dt.timezone.utc).astimezone(ZoneInfo(tz))
        await safe_send(m.chat.id, f"Твоё локальное время: <b>{now:%Y-%m-%d %H:%M}</b> ({tz})", parse_mode="HTML")
    except Exception:
        await safe_send(m.chat.id, f"Таймзона сохранена как '{tz}', но не распознана. Укажи корректную в /settings → «Часовой пояс».")    

@dp.message(Command("stop"))
@dp.message(F.text == "🛑 Стоп-рассылка")
async def stop(m: types.Message):
    with Session(engine) as s:
        u = s.scalar(select(User).where(User.tg_id == m.from_user.id))
        if not u:
            await safe_send(m.chat.id, "Не нашёл подписку. Нажми /start.")
            return
        u.active = False
        s.commit()
    await safe_send(m.chat.id, "Ок, отключил рассылку. Вернуться — /resume")

@dp.message(Command("resume"))
async def resume_cmd(m: types.Message):
    with Session(engine) as s:
        u = s.scalar(select(User).where(User.tg_id == m.from_user.id))
        if not u:
            await safe_send(m.chat.id, "Сначала /start")
            return
        u.active = True
        s.commit()
    await safe_send(m.chat.id, "Включил рассылку ✅")

@dp.message(Command("reset"))
async def reset_cmd(m: types.Message):
    with Session(engine) as s:
        u = s.scalar(select(User).where(User.tg_id == m.from_user.id))
        if not u:
            await safe_send(m.chat.id, "Сначала /start"); return
        u.zodiac = None
        s.commit()
    await safe_send(m.chat.id, "Ок, давай настроим заново. Выбери свой знак:",
                   reply_markup=zodiac_inline_kb("stz"))
    await safe_send(m.chat.id, "\u2060", reply_markup=ReplyKeyboardRemove())

@dp.message(Command("mysign"))
async def mysign_cmd(m: types.Message, state: FSMContext):
    await state.set_state(BirthToZodiac.wait_date)
    await safe_send(m.chat.id, "Введи дату рождения в формате ДД.ММ или ДД.ММ.ГГГГ.")

@dp.message(Command("mystate"))
# @dp.message(Command("dbg"))
async def mystate(m: types.Message):
    with Session(engine) as s:
        u: User | None = s.scalar(select(User).where(User.tg_id == m.from_user.id))
    if not u:
        await safe_send(m.chat.id, "Нет записи пользователя. Нажми /start.")
        return
    await safe_send(
        m.chat.id,
        ("Твои настройки (DEBUG):\n"
         f"• tg_id: {u.tg_id}\n"
         f"• active: {u.active}\n"
         f"• sign: {u.zodiac or '—'}\n"
         f"• tz: {u.tz}\n"
         f"• time: {u.hour:02d}:{u.minute:02d}\n"
         f"• last_sent_date: {u.last_sent_date}\n")
    )

# @dp.message(Command("debug_send"))
# @dp.message(Command("test_send"))
async def debug_send(m: types.Message):
    ok, err = await send_today_for_user(m.from_user.id)
    await safe_send(m.chat.id, f"send_today_for_user -> ok={ok} err={err}")

# @dp.message(Command("tick_now"))
# async def tick_now(m: types.Message):
#     await minute_tick()
#     await safe_send(m.chat.id, "tick() done")

# ----------- Feedback -----------
class FeedbackState(StatesGroup):
    wait = State()

@dp.message(F.text == "💡 Идеи на улучшение / Есть проблемы?")
async def feedback_start(m: types.Message, state: FSMContext):
    await state.set_state(FeedbackState.wait)
    await safe_send(m.chat.id, "Опиши идею или проблему одним сообщением — я перешлю разработчику.")

@dp.message(FeedbackState.wait)
async def feedback_collect(m: types.Message, state: FSMContext):
    txt = m.text or "(пусто)"
    if FEEDBACK_TARGET:
        try:
            await bot.send_message(
                FEEDBACK_TARGET,
                f"📝 Feedback от @{m.from_user.username or 'без_ника'} (id={m.from_user.id}):\n\n{txt}"
            )
        except Exception as e:
            log.warning(f"send feedback to {FEEDBACK_TARGET} failed: {e}")
    if YANDEX_PASS:
        try:
            ctx = ssl.create_default_context()
            with smtplib.SMTP_SSL("smtp.yandex.ru", 465, context=ctx) as server:
                server.login(YANDEX_EMAIL, YANDEX_PASS)
                subject = f"Feedback от {m.from_user.username or m.from_user.id}"
                body = f"userId: {m.from_user.id}\nusername: @{m.from_user.username}\n\n{txt}"
                msg = (
                    f"From: {YANDEX_EMAIL}\r\n"
                    f"To: {YANDEX_EMAIL}\r\n"
                    f"Subject: {subject}\r\n"
                    f"\r\n{body}"
                )
                server.sendmail(YANDEX_EMAIL, [YANDEX_EMAIL], msg.encode("utf-8"))
        except Exception as e:
            log.warning(f"email failed: {e}")
    await state.clear()
    await safe_send(m.chat.id, "Спасибо! Сообщение отправлено. 🙌")

# -------------------- Setup (знак + время) --------------------
@dp.message(Command("setup"))
async def setup_start(m: types.Message, state: FSMContext):
    await state.set_state(SetupWizard.zodiac)
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="Выбрать знак вручную", callback_data="wiz:pick")],
        [InlineKeyboardButton(text="❓ Определить по дате", callback_data="st:z_from_birth")],
    ])
    await safe_send(m.chat.id, "Шаг 1/2: выбери способ:", reply_markup=kb)

@dp.callback_query(SetupWizard.zodiac, F.data == "wiz:pick")
async def setup_pick(cq: types.CallbackQuery, state: FSMContext):
    await cq.message.edit_text("Шаг 1/2: выбери свой знак:", reply_markup=zodiac_inline_kb("wiz:z"))
    await cq.answer()

@dp.callback_query(SetupWizard.zodiac, F.data.startswith("wiz:z:"))
async def setup_zodiac(cq: types.CallbackQuery, state: FSMContext):
    z = cq.data.split(":", 2)[2]
    await state.update_data(zodiac=z)
    await state.set_state(SetupWizard.time)
    await cq.message.edit_text("Шаг 2/2: введи время в формате <b>HH:MM</b>", parse_mode="HTML")
    await cq.answer()
    await safe_send(cq.from_user.id, "\u2060", reply_markup=main_menu_kb())

@dp.message(SetupWizard.time, F.text.regexp(r"^\s*(?:[01]?\d|2[0-3]):[0-5]\d\s*$"))
async def setup_time(m: types.Message, state: FSMContext):
    hh, mm = map(int, re.findall(r"\d+", m.text))
    await state.update_data(hour=hh, minute=mm)
    data = await state.get_data()
    txt = (f"Проверь:\n• Знак: {data.get('zodiac','—')}\n• Автопрогноз в: {data['hour']:02d}:{data['minute']:02d}\n\nСохранить?")
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="✅ Сохранить", callback_data="setup:save")],
        [InlineKeyboardButton(text="🔁 Начать заново", callback_data="setup:restart")],
    ])
    await state.set_state(SetupWizard.confirm)
    await safe_send(m.chat.id, txt, reply_markup=kb)

@dp.callback_query(SetupWizard.confirm, F.data == "setup:restart")
async def setup_restart(cq: types.CallbackQuery, state: FSMContext):
    await state.clear()
    await setup_start(cq.message, state)
    await cq.answer()

@dp.callback_query(SetupWizard.confirm, F.data == "setup:save")
async def setup_save(cq: types.CallbackQuery, state: FSMContext):
    data = await state.get_data()
    with Session(engine) as s:
        u = s.scalar(select(User).where(User.tg_id == cq.from_user.id))
        if not u:
            u = User(tg_id=cq.from_user.id); s.add(u)
        if data.get("zodiac"):
            u.zodiac = data["zodiac"]
        u.hour = data["hour"]
        u.minute = data["minute"]
        u.active = True  # реактивация
        if not u.tz:
            u.tz = DEFAULT_TZ or "Europe/Moscow"
        now_utc = dt.datetime.now(dt.timezone.utc)
        try:
            local_now = now_utc.astimezone(ZoneInfo(u.tz))
        except ZoneInfoNotFoundError:
            local_now = now_utc
        target_today = local_now.replace(hour=u.hour, minute=u.minute, second=0, microsecond=0)
        u.last_sent_date = (local_now.date() - dt.timedelta(days=1)) if local_now <= target_today else local_now.date()
        s.commit()
    await state.clear()
    await cq.message.edit_text("Готово! Настройки сохранены. Прогнозы будут приходить ежедневно.")
    await safe_send(cq.from_user.id, "\u2060", reply_markup=main_menu_kb())
    await cq.answer()

# -------------------- APP --------------------
async def main():
    schedule_jobs()
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())

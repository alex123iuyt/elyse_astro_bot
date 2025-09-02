import datetime as dt
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
from sqlalchemy import select
from bot.db.session import SessionLocal
from bot.db.models import User
from aiogram import Bot


scheduler = AsyncIOScheduler(timezone="UTC", job_defaults={"coalesce": True, "max_instances": 1, "misfire_grace_time": 30})


async def send_today(bot: Bot, user: User) -> bool:
    # Placeholder: integrate with existing send today logic in main app
    # Here return False to avoid circular imports; main app should wire this
    return False


async def minute_tick(bot: Bot):
    now_utc = dt.datetime.now(dt.timezone.utc)
    with SessionLocal() as s:
        result = s.execute(select(User).where(User.active == True).where(User.zodiac.is_not(None)))
        for u in result.scalars():
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
                not_sent_today = (u.last_sent_date or dt.date(1970, 1, 1)) != local_now.date()
                if in_window and not_sent_today:
                    ok = await send_today(bot, u)
                    if ok:
                        u.last_sent_date = local_now.date()
                        s.commit()
            except Exception:
                continue


def start_scheduler(bot: Bot):
    scheduler.add_job(minute_tick, "cron", second=0, args=[bot], id="minute_tick", replace_existing=True)
    scheduler.start()















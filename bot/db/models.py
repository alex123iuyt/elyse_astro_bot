import datetime as dt
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, Integer, Boolean, Date, DateTime, ForeignKey, Text


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    tg_id: Mapped[int] = mapped_column(Integer, unique=True, index=True)
    name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    birth_date: Mapped[dt.date | None] = mapped_column(Date, nullable=True)
    birth_time: Mapped[str | None] = mapped_column(String(8), nullable=True)
    birth_city: Mapped[str | None] = mapped_column(String(120), nullable=True)
    tz: Mapped[str] = mapped_column(String(64), default="UTC")
    zodiac: Mapped[str | None] = mapped_column(String(20), nullable=True)
    hour: Mapped[int] = mapped_column(Integer, default=9)
    minute: Mapped[int] = mapped_column(Integer, default=0)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_premium: Mapped[bool] = mapped_column(Boolean, default=False)
    premium_until: Mapped[dt.date | None] = mapped_column(Date, nullable=True)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    role: Mapped[str | None] = mapped_column(String(20), nullable=True)  # support, content, manager
    last_sent_date: Mapped[dt.date | None] = mapped_column(Date, nullable=True)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, default=lambda: dt.datetime.utcnow())
    updated_at: Mapped[dt.datetime] = mapped_column(DateTime, default=lambda: dt.datetime.utcnow(), onupdate=lambda: dt.datetime.utcnow())


class ContentPack(Base):
    __tablename__ = "content_packs"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    key: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(200))
    type: Mapped[str] = mapped_column(String(32))  # daily/weekly/monthly/natal_basic/synastry_basic/lunar/retro
    source: Mapped[str] = mapped_column(String(16))  # template/ai/mixed
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    priority: Mapped[int] = mapped_column(Integer, default=0)
    locale: Mapped[str] = mapped_column(String(8), default="ru")
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, default=lambda: dt.datetime.utcnow())
    updated_at: Mapped[dt.datetime] = mapped_column(DateTime, default=lambda: dt.datetime.utcnow(), onupdate=lambda: dt.datetime.utcnow())


class Template(Base):
    __tablename__ = "templates"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    content_pack_id: Mapped[int] = mapped_column(Integer, ForeignKey("content_packs.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(200))
    body_md: Mapped[str] = mapped_column(Text)
    variables: Mapped[str | None] = mapped_column(Text, nullable=True)  # json
    created_by: Mapped[str | None] = mapped_column(String(64), nullable=True)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, default=lambda: dt.datetime.utcnow())


class AIPreset(Base):
    __tablename__ = "ai_presets"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    content_pack_id: Mapped[int] = mapped_column(Integer, ForeignKey("content_packs.id", ondelete="CASCADE"))
    provider: Mapped[str] = mapped_column(String(32), default="openai")
    model: Mapped[str] = mapped_column(String(64), default="gpt-4")
    system_prompt: Mapped[str] = mapped_column(Text)
    temperature: Mapped[float] = mapped_column()
    max_tokens: Mapped[int] = mapped_column(Integer, default=300)
    postprocess_rules: Mapped[str | None] = mapped_column(Text, nullable=True)  # json
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, default=lambda: dt.datetime.utcnow())


class AIGeneration(Base):
    __tablename__ = "ai_generations"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    content_pack_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    user_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    kind: Mapped[str] = mapped_column(String(32))
    provider: Mapped[str] = mapped_column(String(32))
    request: Mapped[str] = mapped_column(Text)  # json
    response: Mapped[str] = mapped_column(Text)
    ok: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, default=lambda: dt.datetime.utcnow())


class Schedule(Base):
    __tablename__ = "schedules"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(64))
    cron: Mapped[str] = mapped_column(String(64))
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    meta: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, default=lambda: dt.datetime.utcnow())
    updated_at: Mapped[dt.datetime] = mapped_column(DateTime, default=lambda: dt.datetime.utcnow(), onupdate=lambda: dt.datetime.utcnow())


class ModerationQueue(Base):
    __tablename__ = "moderation_queue"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    source: Mapped[str] = mapped_column(String(16))  # ai/manual
    ref_table: Mapped[str] = mapped_column(String(32))
    ref_id: Mapped[int] = mapped_column(Integer)
    text: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(16), default="pending")
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, default=lambda: dt.datetime.utcnow())
    updated_at: Mapped[dt.datetime] = mapped_column(DateTime, default=lambda: dt.datetime.utcnow(), onupdate=lambda: dt.datetime.utcnow())





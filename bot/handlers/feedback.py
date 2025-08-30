import ssl, smtplib
from aiogram import Router, F, types
from common.config import FEEDBACK_CHAT, YANDEX_EMAIL, YANDEX_PASS
from aiogram import Bot


router = Router()


@router.message(F.text == "💬 Фидбэк")
async def feedback_start(m: types.Message):
    await m.answer("Опишите идею или проблему одним сообщением — я перешлю разработчику.")


@router.message()
async def feedback_collect(m: types.Message, bot: Bot):
    # простой роут: если это явно не команда — считаем фидбэком
    if m.text and m.text.startswith("/"):
        return
    txt = m.text or "(пусто)"
    if FEEDBACK_CHAT:
        try:
            await bot.send_message(FEEDBACK_CHAT, f"📝 Feedback от @{m.from_user.username or 'без_ника'} (id={m.from_user.id}):\n\n{txt}")
        except Exception:
            pass
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
                    f"Subject: {subject}\r\n\r\n{body}"
                )
                server.sendmail(YANDEX_EMAIL, [YANDEX_EMAIL], msg.encode("utf-8"))
        except Exception:
            pass
    await m.answer("Спасибо! Сообщение отправлено.")












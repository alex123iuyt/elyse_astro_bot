from fastapi import FastAPI, HTTPException, Depends, Request, Form
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.security import HTTPBearer
import os
import json
from datetime import datetime, date
from typing import Optional, List
import sqlite3
from pydantic import BaseModel

# Models
class ContentPack(BaseModel):
    id: Optional[int] = None
    key: str
    title: str
    type: str  # daily, weekly, monthly, natal_basic, synastry_basic, lunar, retro
    source: str  # template, ai, mixed
    active: bool = True
    priority: int = 0
    locale: str = "ru"

class AIPreset(BaseModel):
    id: Optional[int] = None
    content_pack_id: int
    provider: str = "openai"
    model: str = "gpt-4"
    system_prompt: str
    temperature: float = 0.7
    max_tokens: int = 300

class Template(BaseModel):
    id: Optional[int] = None
    content_pack_id: int
    title: str
    body_markdown: str
    variables: dict = {}

# FastAPI app
app = FastAPI(title="Elyse Astro Admin", version="1.0.0")

# Templates
templates = Jinja2Templates(directory="templates")

# Security
security = HTTPBearer()
ADMIN_TOKEN = os.getenv("ADMIN_PANEL_TOKEN", "admin123")

def verify_token(token: str = Depends(security)):
    if token.credentials != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid token")
    return token.credentials

# Database connection
def get_db():
    conn = sqlite3.connect("../bot.db")
    conn.row_factory = sqlite3.Row
    return conn

def migrate_database():
    """Add missing columns to database if they don't exist"""
    conn = get_db()
    try:
        cursor = conn.cursor()
        
        # Add role column if it doesn't exist
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN role VARCHAR(20)")
            print("Added role column to users table")
        except Exception:
            pass  # Column already exists
        
        conn.commit()
    except Exception as e:
        print(f"Migration error: {e}")
    finally:
        conn.close()

# Run migration on startup
migrate_database()

# Routes
@app.get("/", response_class=HTMLResponse)
async def admin_dashboard(request: Request):
    conn = get_db()
    try:
        # Basic stats
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as total FROM users")
        total_users = cursor.fetchone()["total"]
        
        cursor.execute("SELECT COUNT(*) as active FROM users WHERE active = 1")
        active_users = cursor.fetchone()["active"]
        
        cursor.execute("SELECT COUNT(*) as premium FROM users WHERE is_premium = 1")
        premium_users = cursor.fetchone()["premium"]
        
        cursor.execute("SELECT COUNT(*) as today FROM users WHERE last_sent_date = ?", (date.today().isoformat(),))
        sent_today = cursor.fetchone()["today"]
        
        stats = {
            "total_users": total_users,
            "active_users": active_users,
            "premium_users": premium_users,
            "sent_today": sent_today
        }
        
        return templates.TemplateResponse("dashboard.html", {"request": request, "stats": stats})
    finally:
        conn.close()

@app.get("/users", response_class=HTMLResponse)
async def users_list(request: Request, query: str = ""):
    conn = get_db()
    try:
        cursor = conn.cursor()
        if query:
            cursor.execute("""
                SELECT * FROM users 
                WHERE name LIKE ? OR zodiac LIKE ? OR tg_id LIKE ?
                ORDER BY created_at DESC
            """, (f"%{query}%", f"%{query}%", f"%{query}%"))
        else:
            cursor.execute("SELECT * FROM users ORDER BY created_at DESC LIMIT 100")
        
        users = cursor.fetchall()
        return templates.TemplateResponse("users.html", {"request": request, "users": users, "query": query})
    finally:
        conn.close()

@app.get("/content", response_class=HTMLResponse)
async def content_packs(request: Request):
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT cp.*, COUNT(t.id) as templates_count 
            FROM content_packs cp 
            LEFT JOIN templates t ON cp.id = t.content_pack_id 
            GROUP BY cp.id
        """)
        packs = cursor.fetchall()
        return templates.TemplateResponse("content.html", {"request": request, "packs": packs})
    finally:
        conn.close()

@app.get("/subscriptions", response_class=HTMLResponse)
async def subscriptions_page(request: Request):
    conn = get_db()
    try:
        cursor = conn.cursor()
        
        # Get subscription statistics
        cursor.execute("SELECT COUNT(*) as total FROM users WHERE is_premium = 1")
        total_premium = cursor.fetchone()["total"]
        
        cursor.execute("SELECT COUNT(*) as active FROM users WHERE is_premium = 1 AND premium_until > ?", (date.today().isoformat(),))
        active_premium = cursor.fetchone()["active"]
        
        cursor.execute("SELECT COUNT(*) as expired FROM users WHERE is_premium = 1 AND premium_until <= ?", (date.today().isoformat(),))
        expired_premium = cursor.fetchone()["expired"]
        
        # Get premium users
        cursor.execute("""
            SELECT * FROM users 
            WHERE is_premium = 1 
            ORDER BY premium_until DESC
        """)
        premium_users = cursor.fetchall()
        
        stats = {
            "total_premium": total_premium,
            "active_premium": active_premium,
            "expired_premium": expired_premium,
            "monthly_revenue": "₽0"  # Placeholder for revenue calculation
        }
        
        return templates.TemplateResponse("subscriptions.html", {
            "request": request, 
            "stats": stats, 
            "premium_users": premium_users,
            "today": date.today()
        })
    finally:
        conn.close()

@app.get("/managers", response_class=HTMLResponse)
async def managers_page(request: Request):
    conn = get_db()
    try:
        cursor = conn.cursor()
        
        # Get manager statistics
        cursor.execute("SELECT COUNT(*) as total FROM users WHERE is_admin = 1 OR role IN ('support', 'content', 'manager')")
        total_managers = cursor.fetchone()["total"]
        
        cursor.execute("SELECT COUNT(*) as active FROM users WHERE (is_admin = 1 OR role IN ('support', 'content', 'manager')) AND active = 1")
        active_managers = cursor.fetchone()["active"]
        
        cursor.execute("SELECT COUNT(*) as support FROM users WHERE role = 'support' AND active = 1")
        support_managers = cursor.fetchone()["support"]
        
        cursor.execute("SELECT COUNT(*) as content FROM users WHERE role = 'content' AND active = 1")
        content_managers = cursor.fetchone()["content"]
        
        # Get managers
        cursor.execute("""
            SELECT * FROM users 
            WHERE is_admin = 1 OR role IN ('support', 'content', 'manager')
            ORDER BY created_at DESC
        """)
        managers = cursor.fetchall()
        
        # Add role and permissions for each manager
        for manager in managers:
            if manager["is_admin"]:
                manager["role"] = "admin"
                manager["permissions"] = ["Все разрешения"]
            else:
                role = manager.get("role", "manager")
                manager["role"] = role
                if role == "support":
                    manager["permissions"] = ["Просмотр пользователей", "Чат поддержки"]
                elif role == "content":
                    manager["permissions"] = ["Управление контентом", "Просмотр пользователей"]
                else:
                    manager["permissions"] = ["Просмотр пользователей"]
        
        stats = {
            "total_managers": total_managers,
            "active_managers": active_managers,
            "support_managers": support_managers,
            "content_managers": content_managers
        }
        
        return templates.TemplateResponse("managers.html", {
            "request": request, 
            "stats": stats, 
            "managers": managers
        })
    finally:
        conn.close()

@app.get("/ai", response_class=HTMLResponse)
async def ai_sandbox(request: Request):
    return templates.TemplateResponse("ai_sandbox.html", {"request": request})

@app.post("/api/ai/generate")
async def generate_ai_text(
    kind: str = Form(...),
    zodiac: str = Form(...),
    name: str = Form(...),
    date: str = Form(...),
    options: str = Form("{}")
):
    """AI генерация текста"""
    try:
        options_dict = json.loads(options)
        
        # Здесь должна быть интеграция с OpenAI
        # Пока возвращаем заглушку
        result = f"Сгенерирован {kind} для {name} ({zodiac}) на {date}"
        
        return {"text": result, "tokens": 150}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stats")
async def get_stats():
    """API для получения статистики"""
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as total FROM users")
        total_users = cursor.fetchone()["total"]
        
        cursor.execute("SELECT COUNT(*) as active FROM users WHERE active = 1")
        active_users = cursor.fetchone()["active"]
        
        cursor.execute("SELECT COUNT(*) as premium FROM users WHERE is_premium = 1")
        premium_users = cursor.fetchone()["premium"]
        
        return {
            "total_users": total_users,
            "active_users": active_users,
            "premium_users": premium_users
        }
    finally:
        conn.close()

# API endpoints for user management
@app.post("/api/users/{user_id}/premium")
async def toggle_user_premium(user_id: int, action: dict):
    """Toggle user premium status"""
    conn = get_db()
    try:
        cursor = conn.cursor()
        if action["action"] == "enable":
            cursor.execute("""
                UPDATE users 
                SET is_premium = 1, premium_until = date('now', '+30 days')
                WHERE tg_id = ?
            """, (user_id,))
        else:
            cursor.execute("""
                UPDATE users 
                SET is_premium = 0, premium_until = NULL
                WHERE tg_id = ?
            """, (user_id,))
        conn.commit()
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        conn.close()

@app.post("/api/users/{user_id}/extend-premium")
async def extend_user_premium(user_id: int, data: dict):
    """Extend user premium by specified days"""
    conn = get_db()
    try:
        cursor = conn.cursor()
        days = data.get("days", 30)
        cursor.execute("""
            UPDATE users 
            SET is_premium = 1, 
                premium_until = CASE 
                    WHEN premium_until IS NULL OR premium_until <= date('now') 
                    THEN date('now', '+' || ? || ' days')
                    ELSE date(premium_until, '+' || ? || ' days')
                END
            WHERE tg_id = ?
        """, (days, days, user_id))
        conn.commit()
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        conn.close()

@app.post("/api/users/{user_id}/active")
async def toggle_user_active(user_id: int, action: dict):
    """Toggle user active status"""
    conn = get_db()
    try:
        cursor = conn.cursor()
        active_status = 1 if action["action"] == "activate" else 0
        cursor.execute("UPDATE users SET active = ? WHERE tg_id = ?", (active_status, user_id))
        conn.commit()
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        conn.close()

# API endpoints for subscription management
@app.post("/api/subscriptions/bulk-extend")
async def bulk_extend_premium(data: dict):
    """Bulk extend premium for active premium users"""
    conn = get_db()
    try:
        cursor = conn.cursor()
        days = data.get("days", 30)
        cursor.execute("""
            UPDATE users 
            SET premium_until = CASE 
                WHEN premium_until IS NULL OR premium_until <= date('now') 
                THEN date('now', '+' || ? || ' days')
                ELSE date(premium_until, '+' || ? || ' days')
                END
            WHERE is_premium = 1 AND active = 1
        """, (days, days))
        conn.commit()
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        conn.close()

@app.get("/api/subscriptions/export")
async def export_subscriptions():
    """Export subscription data to CSV"""
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT name, tg_id, zodiac, is_premium, premium_until, created_at, last_sent_date
            FROM users 
            WHERE is_premium = 1
            ORDER BY premium_until DESC
        """)
        users = cursor.fetchall()
        
        # Create CSV content
        csv_content = "Name,Telegram ID,Zodiac,Premium,Premium Until,Created,Last Activity\n"
        for user in users:
            csv_content += f"{user['name'] or 'Unknown'},{user['tg_id']},{user['zodiac'] or 'Unknown'},{user['is_premium']},{user['premium_until'] or 'None'},{user['created_at']},{user['last_sent_date'] or 'None'}\n"
        
        from fastapi.responses import Response
        return Response(content=csv_content, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=subscriptions_export.csv"})
    finally:
        conn.close()

@app.post("/api/subscriptions/notify")
async def notify_premium_users(data: dict):
    """Send notification to premium users"""
    # This would integrate with the bot to send actual notifications
    # For now, just return success
    return {"success": True, "message": "Notification queued for premium users"}

# API endpoints for manager management
@app.post("/api/managers")
async def create_manager(data: dict):
    """Create a new manager"""
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE users 
            SET role = ?, active = 1
            WHERE tg_id = ?
        """, (data["role"], data["tg_id"]))
        conn.commit()
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        conn.close()

@app.put("/api/managers/{manager_id}")
async def update_manager(manager_id: int, data: dict):
    """Update manager role and permissions"""
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE users 
            SET role = ?
            WHERE tg_id = ?
        """, (data["role"], manager_id))
        conn.commit()
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        conn.close()

@app.post("/api/managers/{manager_id}/status")
async def toggle_manager_status(manager_id: int, action: dict):
    """Toggle manager active status"""
    conn = get_db()
    try:
        cursor = conn.cursor()
        active_status = 1 if action["action"] == "activate" else 0
        cursor.execute("UPDATE users SET active = ? WHERE tg_id = ?", (active_status, manager_id))
        conn.commit()
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        conn.close()

@app.delete("/api/managers/{manager_id}")
async def remove_manager(manager_id: int):
    """Remove manager role"""
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET role = NULL WHERE tg_id = ?", (manager_id,))
        conn.commit()
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        conn.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)




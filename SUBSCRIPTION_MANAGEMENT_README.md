# Subscription Management & Manager Roles - Elyse Astro Bot

## Overview
This document describes the new subscription management and manager roles features implemented in the Elyse Astro Bot.

## Features Implemented

### 1. Subscription Management System
- **Premium Status Tracking**: Users can have premium access with expiration dates
- **Admin Controls**: Admins can grant, extend, or revoke premium access
- **Web Admin Panel**: Full subscription management interface
- **Bulk Operations**: Mass premium extensions and notifications
- **Export Functionality**: CSV export of subscription data

### 2. Manager Roles System
- **Role-Based Access**: Different permission levels for managers
- **Support Managers**: Handle user support and basic user management
- **Content Managers**: Manage content and templates
- **General Managers**: Basic administrative functions
- **Web Admin Panel**: Role management interface

### 3. Enhanced Admin Panel
- **User Management**: View, search, and manage all users
- **Subscription Dashboard**: Premium user statistics and management
- **Manager Dashboard**: Role assignment and permission management
- **Real-time Updates**: Live data from the database

## Database Schema Updates

### New Fields Added
- `role` (VARCHAR(20)): Manager role (support, content, manager)
- `is_premium` (BOOLEAN): Premium status
- `premium_until` (DATE): Premium expiration date

### Database Migration
The system automatically adds missing columns on startup:
```python
def migrate_database():
    # Add role column if it doesn't exist
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN role VARCHAR(20)")
    except Exception:
        pass  # Column already exists
```

## Admin Commands

### Telegram Bot Commands
- `/give_premium <user_id> <days>` - Grant premium access
- `/add_manager <user_id> <role>` - Assign manager role
- `🛠 Админка` - Access admin menu

### Admin Menu Features
- 📦 Контент-пакеты - Content pack management
- 👥 Пользователи - User management
- ⭐ Подписки - Subscription management
- 👑 Менеджеры - Manager role management
- ✍️ AI генерация - AI text generation
- 🧩 Истории - Story management
- 🛠 Настройки бота - Bot settings

## Web Admin Panel

### Access
- URL: http://localhost:8000 (configurable via ADMIN_PANEL_URL)
- Authentication: Bearer token (ADMIN_PANEL_TOKEN)

### Pages
1. **Dashboard** - Overview statistics
2. **Users** - User list with search and management
3. **Subscriptions** - Premium user management
4. **Managers** - Role and permission management
5. **Content** - Content pack management
6. **AI Sandbox** - AI text generation testing

### API Endpoints

#### User Management
- `POST /api/users/{user_id}/premium` - Toggle premium status
- `POST /api/users/{user_id}/extend-premium` - Extend premium
- `POST /api/users/{user_id}/active` - Toggle user activity

#### Subscription Management
- `POST /api/subscriptions/bulk-extend` - Bulk premium extension
- `GET /api/subscriptions/export` - Export subscription data
- `POST /api/subscriptions/notify` - Send notifications

#### Manager Management
- `POST /api/managers` - Create manager
- `PUT /api/managers/{manager_id}` - Update manager
- `POST /api/managers/{manager_id}/status` - Toggle status
- `DELETE /api/managers/{manager_id}` - Remove manager

## Manager Roles & Permissions

### Support Manager (🎧)
- View user information
- Access support chat
- Basic user management

### Content Manager (📝)
- Manage content and templates
- View user information
- Content creation and editing

### General Manager (👤)
- Basic administrative functions
- User information viewing
- Limited system access

### Admin (👑)
- Full system access
- All permissions
- Cannot be downgraded

## Installation & Setup

### 1. Install Dependencies
```bash
cd admin
pip install -r requirements.txt
```

### 2. Environment Variables
```bash
ADMIN_PANEL_URL=http://localhost:8000
ADMIN_PANEL_TOKEN=your_secure_token
```

### 3. Start Admin Panel
```bash
cd admin
python app.py
```

### 4. Access Admin Panel
Open http://localhost:8000 in your browser

## Usage Examples

### Grant Premium Access
```bash
# In Telegram bot
/give_premium 123456789 30
```

### Assign Manager Role
```bash
# In Telegram bot
/add_manager 123456789 support
```

### Web Admin Panel
1. Navigate to Subscriptions page
2. View premium user statistics
3. Manage individual subscriptions
4. Export data for analysis

## Security Features

- Bearer token authentication
- Role-based access control
- Admin-only command execution
- Secure database operations
- Input validation and sanitization

## Future Enhancements

- Payment integration
- Automated subscription renewals
- Advanced analytics dashboard
- Multi-language support
- Mobile admin app
- API rate limiting
- Audit logging

## Troubleshooting

### Common Issues

1. **Admin Panel Not Starting**
   - Check if port 8000 is available
   - Verify all dependencies are installed
   - Check database connection

2. **Database Migration Errors**
   - Ensure database file is writable
   - Check SQLite version compatibility
   - Verify table structure

3. **Permission Denied Errors**
   - Verify admin token is correct
   - Check user role assignments
   - Ensure proper authentication

### Support
For technical support, contact the development team or check the logs for detailed error messages.

## Contributing

When adding new features:
1. Update database schema if needed
2. Add corresponding admin panel pages
3. Implement API endpoints
4. Add Telegram bot commands
5. Update documentation
6. Test thoroughly

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Maintainer**: Elyse Astro Bot Team

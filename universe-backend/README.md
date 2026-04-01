# 🎓 UniVerse – University Management Backend

A production-ready **FastAPI** backend for the UniVerse university management platform. Fully modular, JWT-secured, and React-frontend ready with camelCase API responses.

---

## 🚀 Quick Start

### Option A — Docker (Recommended, zero setup)

```bash
# Clone & start everything (API + PostgreSQL)
docker-compose up --build

# Seed sample data
docker exec universe_api python scripts/seed.py
```

API: http://localhost:8000 | Docs: http://localhost:8000/docs

---

### Option B — Local Setup

#### 1. Prerequisites
- Python 3.11+
- PostgreSQL 14+ running locally

#### 2. Clone & install
```bash
git clone <repo>
cd universe

python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### 3. Configure environment
```bash
cp .env.example .env
# Edit .env — set your DATABASE_URL and SECRET_KEY
```

#### 4. Create the database
```bash
psql -U postgres -c "CREATE DATABASE universe_db;"
```

#### 5. Run the server
```bash
uvicorn app.main:app --reload
```

#### 6. Seed sample data (optional)
```bash
python scripts/seed.py
```

---

## 📖 API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs ← Interactive, try all endpoints
- **ReDoc**: http://localhost:8000/redoc ← Clean reference docs

---

## 🔑 Sample Credentials (after seeding)

| Role    | Email                          | Password    |
|---------|--------------------------------|-------------|
| Admin   | admin@universe.edu             | admin123    |
| Faculty | priya.sharma@universe.edu      | faculty123  |
| Student | aditya.reddy@universe.edu      | student123  |
| Student | sneha.patel@universe.edu       | student123  |

---

## 🗂 Project Structure

```
universe/
├── app/
│   ├── main.py              # FastAPI app, middleware, router registration
│   ├── config.py            # Settings via pydantic-settings + .env
│   ├── database.py          # SQLAlchemy engine & session
│   ├── models/
│   │   └── __init__.py      # All SQLAlchemy ORM models
│   ├── schemas/
│   │   └── __init__.py      # All Pydantic request/response schemas (camelCase)
│   ├── routers/
│   │   ├── auth.py          # /auth — register, login, refresh, logout
│   │   ├── users.py         # /users — profile, admin CRUD
│   │   ├── announcements.py # /announcements — notices & alerts
│   │   ├── events.py        # /events — campus events & registration
│   │   ├── attendance.py    # /attendance — subject & day-wise tracking
│   │   ├── posts.py         # /posts — social feed, likes, comments
│   │   ├── timetable.py     # /timetable — class schedules
│   │   ├── jobs.py          # /jobs — placements & applications
│   │   └── notifications.py # /notifications — in-app alerts
│   ├── auth/
│   │   ├── utils.py         # JWT creation/decoding, bcrypt hashing
│   │   └── dependencies.py  # FastAPI Depends() guards (role-based)
│   └── utils/
│       ├── files.py         # File upload handler
│       └── pagination.py    # Pagination helpers
├── scripts/
│   └── seed.py              # Database seeder with sample data
├── alembic/                 # DB migrations
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
└── .env.example
```

---

## 🌐 API Reference

### Authentication

| Method | Endpoint         | Access | Description                   |
|--------|-----------------|--------|-------------------------------|
| POST   | /auth/register   | Public | Register new user             |
| POST   | /auth/login      | Public | Login, get JWT tokens         |
| POST   | /auth/refresh    | Public | Refresh access token          |
| POST   | /auth/logout     | Auth   | Logout (client discards token)|
| GET    | /auth/me         | Auth   | Get current user              |

### Users

| Method | Endpoint         | Access       | Description          |
|--------|-----------------|--------------|----------------------|
| GET    | /users/me        | Auth         | Get own profile      |
| PATCH  | /users/me        | Auth         | Update own profile   |
| POST   | /users/me/avatar | Auth         | Upload avatar        |
| GET    | /users           | Admin        | List all users       |
| GET    | /users/{id}      | Admin        | Get user by ID       |
| PATCH  | /users/{id}      | Admin        | Update any user      |
| DELETE | /users/{id}      | Admin        | Delete user          |

### Announcements

| Method | Endpoint                  | Access          | Description               |
|--------|--------------------------|-----------------|---------------------------|
| POST   | /announcements            | Faculty / Admin | Create announcement       |
| GET    | /announcements            | Auth            | List (filter: type/urgent)|
| GET    | /announcements/{id}       | Auth            | Get single                |
| DELETE | /announcements/{id}       | Admin           | Delete                    |

### Events

| Method | Endpoint                      | Access          | Description              |
|--------|------------------------------|-----------------|--------------------------|
| POST   | /events                       | Faculty / Admin | Create event             |
| GET    | /events                       | Auth            | List (filter/search)     |
| GET    | /events/{id}                  | Auth            | Get single               |
| POST   | /events/{id}/register         | Student         | Register for event       |
| DELETE | /events/{id}/register         | Student         | Cancel registration      |
| GET    | /events/my-registrations      | Student         | My registered events     |
| DELETE | /events/{id}                  | Admin           | Delete event             |

### Attendance

| Method | Endpoint                      | Access          | Description               |
|--------|------------------------------|-----------------|---------------------------|
| POST   | /attendance/mark              | Faculty / Admin | Mark single attendance    |
| POST   | /attendance/mark-bulk         | Faculty / Admin | Mark bulk attendance      |
| GET    | /attendance/me                | Student         | My subject-wise           |
| GET    | /attendance/me/daily          | Student         | My day-wise               |
| GET    | /attendance/me/summary        | Student         | My summary + overall %    |
| GET    | /attendance/student/{id}      | Faculty / Admin | Student's attendance      |
| GET    | /attendance/daily/{id}        | Faculty / Admin | Student's daily records   |

### Posts (Social Feed)

| Method | Endpoint                  | Access | Description              |
|--------|--------------------------|--------|--------------------------|
| POST   | /posts                    | Auth   | Create post              |
| GET    | /posts                    | Auth   | List posts (paginated)   |
| GET    | /posts/{id}               | Auth   | Get single post          |
| POST   | /posts/{id}/like          | Auth   | Like / unlike (toggle)   |
| POST   | /posts/{id}/comments      | Auth   | Add comment              |
| GET    | /posts/{id}/comments      | Auth   | Get comments             |
| DELETE | /posts/{id}               | Auth   | Delete (own or admin)    |

### Timetable

| Method | Endpoint            | Access | Description                   |
|--------|-------------------|--------|-------------------------------|
| POST   | /timetable         | Admin  | Add entry                     |
| GET    | /timetable         | Auth   | Get (auto-filtered by role)   |
| PUT    | /timetable/{id}    | Admin  | Update entry                  |
| DELETE | /timetable/{id}    | Admin  | Delete entry                  |

### Jobs & Placements

| Method | Endpoint              | Access  | Description          |
|--------|--------------------- |---------|----------------------|
| POST   | /jobs                 | Admin   | Post job             |
| GET    | /jobs                 | Auth    | List jobs            |
| GET    | /jobs/{id}            | Auth    | Get job              |
| POST   | /jobs/{id}/apply      | Student | Apply               |
| DELETE | /jobs/{id}/apply      | Student | Withdraw            |
| GET    | /jobs/{id}/applicants | Admin   | View applicants     |
| DELETE | /jobs/{id}            | Admin   | Delete job          |

### Notifications

| Method | Endpoint                        | Access | Description          |
|--------|---------------------------------|--------|----------------------|
| GET    | /notifications                  | Auth   | Get notifications    |
| GET    | /notifications/unread-count     | Auth   | Unread count         |
| POST   | /notifications/{id}/read        | Auth   | Mark as read         |
| POST   | /notifications/read-all         | Auth   | Mark all read        |
| POST   | /notifications/send             | Admin  | Send notification    |

---

## 📦 Frontend-Ready Response Shapes

All responses use **camelCase** and are directly usable in React without transformation.

### Event
```json
{
  "id": "uuid",
  "title": "HackVerse 2024",
  "date": "2024-11-10",
  "time": "09:00:00",
  "venue": "Main Auditorium",
  "description": "36-hour hackathon...",
  "category": "technical",
  "registered": true,
  "totalSlots": 200,
  "registeredCount": 87
}
```

### Post
```json
{
  "id": "uuid",
  "userName": "Aditya Reddy",
  "userRole": "student",
  "content": "Just finished the hackathon project!",
  "timePosted": "2024-11-01T14:32:00",
  "likes": 34,
  "comments": 8,
  "isLiked": false
}
```

### Announcement
```json
{
  "id": "uuid",
  "title": "Mid-Semester Exams",
  "body": "Exams from Nov 18–25...",
  "type": "exam",
  "date": "2024-11-18",
  "urgent": true,
  "createdBy": "Admin User"
}
```

### Attendance
```json
{
  "subject": "Data Structures",
  "present": 23,
  "total": 30,
  "percentage": 76.67
}
```

---

## 🔐 Authentication Flow

```
1. POST /auth/register  →  { accessToken, refreshToken, user }
2. POST /auth/login     →  { accessToken, refreshToken, user }

   All subsequent requests:
   Header: Authorization: Bearer <accessToken>

3. POST /auth/refresh   →  { accessToken, refreshToken, user }
   Body: { "refreshToken": "<token>" }
```

---

## 🗄 Database Migrations (Alembic)

```bash
# Create a new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback one step
alembic downgrade -1
```

---

## ⚙️ Environment Variables

| Variable                      | Default                           | Description               |
|-------------------------------|-----------------------------------|---------------------------|
| DATABASE_URL                  | postgresql://...                  | PostgreSQL connection URL |
| SECRET_KEY                    | (required)                        | JWT signing secret        |
| ALGORITHM                     | HS256                             | JWT algorithm             |
| ACCESS_TOKEN_EXPIRE_MINUTES   | 60                                | Access token TTL          |
| REFRESH_TOKEN_EXPIRE_DAYS     | 7                                 | Refresh token TTL         |
| ALLOWED_ORIGINS               | http://localhost:3000,...         | CORS allowed origins      |
| UPLOAD_DIR                    | uploads                           | File upload directory     |
| MAX_FILE_SIZE_MB              | 5                                 | Max upload size in MB     |
| DEBUG                         | True                              | Enable debug responses    |

---

## 🛡 Security Notes

- Passwords hashed with **bcrypt** (cost factor 12)
- JWTs signed with **HS256**, short-lived access tokens (60 min)
- Refresh tokens are long-lived (7 days) and separate
- Role guards on every sensitive endpoint via FastAPI `Depends()`
- CORS restricted to configured origins
- Input validated with **Pydantic v2** (strict types, length limits)
- File uploads validated for type and size before saving

---

## 🔄 Extending the API

1. Add model to `app/models/__init__.py`
2. Add schemas to `app/schemas/__init__.py`
3. Create router in `app/routers/your_module.py`
4. Register router in `app/main.py` with `app.include_router(...)`
5. Run `alembic revision --autogenerate -m "add your_module"` → `alembic upgrade head`

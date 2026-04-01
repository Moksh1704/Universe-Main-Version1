"""
UniVerse – University Management Platform
FastAPI Backend  |  REST API  |  JWT Auth  |  PostgreSQL
"""
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.exc import IntegrityError
from pathlib import Path

from app.config import settings
from app.database import engine, Base

# ── Import all models so SQLAlchemy can create tables ────────────────────────
import app.models  # noqa: F401

# ── Import routers ────────────────────────────────────────────────────────────
from app.routers import auth, users, announcements, events, attendance, posts, timetable, jobs, notifications

# ── Create upload directory ───────────────────────────────────────────────────
Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)

# ── Create DB tables (use Alembic migrations in production) ───────────────────
Base.metadata.create_all(bind=engine)

# ── FastAPI App ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="UniVerse API",
    description="""
## 🎓 UniVerse – University Management System

A production-ready backend for managing university operations including:
- **Authentication** – JWT-based login, registration, token refresh
- **Users** – Student & Faculty profiles with role-based access
- **Announcements** – Exam, holiday, result, and general notices
- **Events** – Campus events with registration management
- **Attendance** – Subject-wise and day-wise attendance tracking
- **Social Feed** – Posts, likes, and comments
- **Timetable** – Class schedules for students and faculty
- **Placements** – Job listings and student applications
- **Notifications** – In-app notification system

### Authentication
All endpoints (except `/auth/register` and `/auth/login`) require a Bearer token.
Get your token from `POST /auth/login`, then use `Authorization: Bearer <token>`.
    """,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static file serving for uploads ──────────────────────────────────────────
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# ── Global exception handlers ─────────────────────────────────────────────────
@app.exception_handler(IntegrityError)
async def integrity_error_handler(request: Request, exc: IntegrityError):
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={"detail": "A record with this data already exists.", "success": False},
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if settings.DEBUG:
        import traceback
        return JSONResponse(
            status_code=500,
            content={"detail": str(exc), "trace": traceback.format_exc(), "success": False},
        )
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred.", "success": False},
    )

# ── Register Routers ──────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(announcements.router)
app.include_router(events.router)
app.include_router(attendance.router)
app.include_router(posts.router)
app.include_router(timetable.router)
app.include_router(jobs.router)
app.include_router(notifications.router)

# ── Root & Health ─────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
        "redoc": "/redoc",
    }


@app.get("/health", tags=["Health"])
def health_check():
    from app.database import SessionLocal
    try:
        db = SessionLocal()
        db.execute(__import__("sqlalchemy").text("SELECT 1"))
        db.close()
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": db_status,
        "version": settings.APP_VERSION,
    }

"""
Main FastAPI application — Vercel serverless entry point.
All /api/* requests are routed here via vercel.json rewrites.
"""

import os
import sys

# Ensure project root is on path so `api.*` imports work in Vercel's Python runtime
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from api.routers import auth, campaigns, inbox, email_accounts, admin, webhooks, ai, settings, dashboard
from api.config import get_settings

app = FastAPI(
    title="Smartlead Dashboard API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# CORS — allow all origins in mock/dev, restrict to configured domain in production
_settings = get_settings()
_cors_origins = ["*"] if _settings.use_mock else [
    o.strip() for o in _settings.frontend_url.split(",") if o.strip()
] or ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/api")
app.include_router(campaigns.router, prefix="/api")
app.include_router(inbox.router, prefix="/api")
app.include_router(email_accounts.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(webhooks.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(settings.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")


@app.get("/api/health")
async def health_check():
    """Health check endpoint — also verifies config loads correctly."""
    from api.config import get_settings
    settings = get_settings()
    return {
        "status": "ok",
        "use_mock": settings.use_mock,
        "version": "1.0.0",
    }


# Vercel handler
handler = Mangum(app, lifespan="off")

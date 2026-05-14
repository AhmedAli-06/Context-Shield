import json
import logging

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

# Monkey-patch asyncpg to use unnamed prepared statements for pgbouncer compat
import asyncpg.connection as _asyncpg_conn
_original_prepare = _asyncpg_conn.Connection.prepare

async def _patched_prepare(self, query, *, timeout=None, name=None):
    return await _original_prepare(self, query, timeout=timeout, name=None)

_asyncpg_conn.Connection.prepare = _patched_prepare

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DATABASE_ECHO,
    pool_size=5,
    max_overflow=5,
    pool_pre_ping=True,
    pool_recycle=300,
    connect_args={
        "statement_cache_size": 0,
    },
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

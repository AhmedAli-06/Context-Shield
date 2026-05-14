import json
import logging

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

# Use asyncpg, but handle pgbouncer prepared statement conflicts
import asyncpg.connection
_orig_prepare = asyncpg.connection.Connection.prepare

async def _safe_prepare(self, query, *, timeout=None, name=None, **kwargs):
    try:
        return await _orig_prepare(self, query, timeout=timeout, name=name, **kwargs)
    except asyncpg.exceptions.DuplicatePreparedStatementError:
        await self.execute(f"DEALLOCATE ALL")
        return await _orig_prepare(self, query, timeout=timeout, name=name, **kwargs)

asyncpg.connection.Connection.prepare = _safe_prepare

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

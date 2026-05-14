import json
import logging
import uuid

from sqlalchemy import event
from sqlalchemy.dialects.postgresql.asyncpg import AsyncAdapt_asyncpg_dbapi
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

# Patch prepared statement name to be unique per connection to avoid pgbouncer conflicts
_orig_name_func = AsyncAdapt_asyncpg_dbapi.Connection._prepared_statement_name_func

def _patched_name_func(self):
    if self._prepared_statement_cache is not None:
        uid = str(uuid.uuid4()).replace("-", "_")
        return f"_asyncpg_stmt_{uid}"
    return None

AsyncAdapt_asyncpg_dbapi.Connection._prepared_statement_name_func = _patched_name_func

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

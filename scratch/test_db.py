import asyncio
from sqlalchemy.ext.asyncio import create_async_engine

async def test_conn():
    url = "postgresql+asyncpg://postgres.hinyheneofcedgyazcoi:ContextShield2025!@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres"
    engine = create_async_engine(url)
    try:
        async with engine.connect() as conn:
            print("SUCCESS")
    except Exception as e:
        print(f"FAILED: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(test_conn())

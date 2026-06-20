import time
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import DATABASE_URL


def wait_for_db(engine, timeout: int = 60, interval: float = 2.0):
    deadline = time.time() + timeout
    while True:
        try:
            with engine.connect():
                return
        except OperationalError:
            if time.time() > deadline:
                raise
            time.sleep(interval)

engine = create_engine(DATABASE_URL, future=True)
wait_for_db(engine)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

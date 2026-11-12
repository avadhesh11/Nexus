import os
import sys
from datetime import datetime, timedelta, UTC
from unittest.mock import MagicMock, patch
import pytest
from jose import jwt
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.compiler import compiles
from fastapi.testclient import TestClient

# Ensure backend root is on sys.path
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

# Set isolated test environment variables before importing app modules
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["JWT_SECRET"] = "nexus-test-secret-key-1234567890abcdef"
os.environ["JWT_ALGORITHM"] = "HS256"
os.environ["SUPABASE_URL"] = "https://dummy.supabase.co"
os.environ["SUPABASE_SERVICE_KEY"] = "dummy-service-key"
os.environ["REDIS_URL"] = "redis://localhost:6379/0"
os.environ["GEMINI_API_KEY"] = "dummy-gemini-key"

# Compile PostgreSQL UUID to SQLite TEXT and handle string bind parameters
@compiles(UUID, "sqlite")
def compile_uuid_sqlite(type_, compiler, **kw):
    return "TEXT"

orig_bind_processor = UUID.bind_processor

def custom_bind_processor(self, dialect):
    proc = orig_bind_processor(self, dialect)
    if proc is None:
        return None
    def process(value):
        if isinstance(value, str):
            import uuid as _uuid
            try:
                value = _uuid.UUID(value)
            except ValueError:
                pass
        return proc(value)
    return process

UUID.bind_processor = custom_bind_processor

# StaticPool SQLite in-memory database
test_engine = create_engine(
    "sqlite:///:memory:",
    poolclass=StaticPool,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

from app.main import app, limiter as main_limiter
from app.models import Base, User
from app.database import get_db
from app.routes.auth import limiter as auth_limiter, hash_password

# Disable rate limiters during tests
main_limiter.enabled = False
auth_limiter.enabled = False


@pytest.fixture(autouse=True)
def setup_and_teardown_tables():
    """Create all tables before each test and drop them after."""
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def db():
    """Provides a fresh isolated database session."""
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db):
    """FastAPI TestClient with overridden get_db dependency."""
    def _override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture(autouse=True)
def mock_external_services():
    """Mock Redis, Supabase, and Gemini clients so tests require no external services."""
    mock_redis = MagicMock()
    mock_redis.get.return_value = None
    mock_redis.set.return_value = True
    mock_redis.setex.return_value = True
    mock_redis.delete.return_value = 1
    mock_redis.scan_iter.return_value = []
    mock_redis.exists.return_value = 0

    mock_supabase = MagicMock()

    with patch("app.utils.redis_client.get_redis_client", return_value=mock_redis), \
         patch("app.utils.supabase_client.supabase", mock_supabase), \
         patch("app.rag.embedder.get_embedding", return_value=[0.1] * 768), \
         patch("app.rag.embedder.get_query_embedding", return_value=[0.1] * 768):
        yield


def create_test_jwt(user_id: str, email: str, token_type: str = "access", expires_delta: timedelta = timedelta(hours=1)) -> str:
    """Helper to generate JWT tokens for test requests."""
    expire = datetime.now(UTC) + expires_delta
    payload = {
        "sub": str(user_id),
        "email": email,
        "type": token_type,
        "exp": expire,
    }
    return jwt.encode(payload, os.environ["JWT_SECRET"], algorithm=os.environ["JWT_ALGORITHM"])


def make_test_user(db, email: str = "user@nexus.ai", password: str = "Password123!") -> User:
    """Helper to persist a user in the test database."""
    user = User(
        email=email,
        password=hash_password(password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

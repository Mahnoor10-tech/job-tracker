from itertools import count

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app


@pytest.fixture
def client():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture
def user_factory(client):
    emails = count(1)

    def make_user(email=None, password="correct-horse-battery"):
        suffix = next(emails)
        email = email or f"user{suffix}@example.com"
        registration = client.post(
            "/auth/register",
            json={
                "email": email,
                "username": f"User {suffix}",
                "password": password,
            },
        )
        assert registration.status_code == 201
        login = client.post(
            "/auth/login",
            data={"username": email, "password": password},
        )
        assert login.status_code == 200
        return {
            "user": registration.json(),
            "headers": {
                "Authorization": f"Bearer {login.json()['access_token']}"
            },
        }

    return make_user

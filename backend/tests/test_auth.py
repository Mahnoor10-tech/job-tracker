def test_register_and_normalize_email(client):
    response = client.post(
        "/auth/register",
        json={"email": " Person@Example.com ", "username": " Person ", "password": "long-password"},
    )
    assert response.status_code == 201
    assert response.json()["email"] == "person@example.com"
    assert response.json()["username"] == "Person"
    assert "hashed_password" not in response.json()


def test_reject_duplicate_email_case_insensitively(client, user_factory):
    user_factory(email="person@example.com")
    response = client.post(
        "/auth/register",
        json={"email": "PERSON@example.com", "username": "Other", "password": "long-password"},
    )
    assert response.status_code == 409


def test_reject_invalid_email(client):
    response = client.post(
        "/auth/register",
        json={"email": "not-an-email", "username": "Person", "password": "long-password"},
    )
    assert response.status_code == 422


def test_reject_short_password(client):
    response = client.post(
        "/auth/register",
        json={"email": "a@example.com", "username": "Person", "password": "short"},
    )
    assert response.status_code == 422


def test_login_returns_bearer_token(client, user_factory):
    user_factory()
    response = client.post(
        "/auth/login",
        data={"username": "user1@example.com", "password": "correct-horse-battery"},
    )
    assert response.status_code == 200
    assert response.json()["token_type"] == "bearer"
    assert response.json()["access_token"]


def test_login_rejects_wrong_password(client, user_factory):
    user_factory()
    response = client.post(
        "/auth/login",
        data={"username": "user1@example.com", "password": "incorrect-password"},
    )
    assert response.status_code == 401


def test_current_user_requires_token(client):
    assert client.get("/users/me").status_code == 401


def test_current_user_returns_authenticated_profile(client, user_factory):
    account = user_factory()
    response = client.get("/users/me", headers=account["headers"])
    assert response.status_code == 200
    assert response.json()["id"] == account["user"]["id"]


def test_health_endpoint(client):
    assert client.get("/api/health").json() == {"status": "ok"}

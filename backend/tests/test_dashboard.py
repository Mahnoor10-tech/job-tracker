from tests.test_applications import add_application


def test_dashboard_stats_and_status_breakdown_are_user_scoped(
    client, user_factory
):
    first = user_factory()
    second = user_factory()
    add_application(client, first["headers"], status="Applied")
    add_application(client, first["headers"], status="Interview")
    add_application(client, second["headers"], status="Offer")
    stats = client.get("/dashboard/stats", headers=first["headers"]).json()
    assert stats == {
        "total_applications": 2,
        "interviews": 1,
        "offers": 0,
        "rejected": 0,
    }
    breakdown = client.get(
        "/dashboard/status-breakdown", headers=first["headers"]
    ).json()
    assert {row["status"]: row["count"] for row in breakdown} == {
        "Applied": 1,
        "Interview": 1,
    }


def test_weekly_applications_returns_grouped_counts(client, user_factory):
    account = user_factory()
    add_application(client, account["headers"])
    response = client.get(
        "/dashboard/applications-per-week?weeks=4", headers=account["headers"]
    )
    assert response.status_code == 200
    assert sum(row["count"] for row in response.json()) == 1


def test_dashboard_requires_authentication(client):
    assert client.get("/dashboard/stats").status_code == 401

def add_application(client, headers, **values):
    payload = {"company": "Acme", "position": "Engineer", **values}
    return client.post("/applications", json=payload, headers=headers)


def test_create_application_and_initial_history(client, user_factory):
    account = user_factory()
    response = add_application(client, account["headers"])
    assert response.status_code == 201
    assert response.json()["status"] == "Applied"
    history = client.get(
        f"/applications/{response.json()['id']}/history", headers=account["headers"]
    )
    assert [entry["new_status"] for entry in history.json()] == ["Applied"]


def test_create_rejects_invalid_status(client, user_factory):
    account = user_factory()
    response = add_application(client, account["headers"], status="Hired")
    assert response.status_code == 422


def test_create_rejects_invalid_salary_range(client, user_factory):
    account = user_factory()
    response = add_application(
        client, account["headers"], salary_min=100000, salary_max=50000
    )
    assert response.status_code == 422


def test_list_search_filter_sort_and_pagination(client, user_factory):
    account = user_factory()
    add_application(client, account["headers"], company="Bravo", position="Designer")
    add_application(
        client, account["headers"], company="Alpha", position="Engineer", status="Interview"
    )
    response = client.get(
        "/applications?search=alpha&status=Interview&sort_by=company&descending=false&limit=1",
        headers=account["headers"],
    )
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["company"] == "Alpha"


def test_application_is_not_visible_to_another_user(client, user_factory):
    first = user_factory()
    second = user_factory()
    application = add_application(client, first["headers"]).json()
    response = client.get(
        f"/applications/{application['id']}", headers=second["headers"]
    )
    assert response.status_code == 404


def test_update_status_records_history(client, user_factory):
    account = user_factory()
    application = add_application(client, account["headers"]).json()
    response = client.put(
        f"/applications/{application['id']}",
        json={"status": "Interview"},
        headers=account["headers"],
    )
    assert response.status_code == 200
    history = client.get(
        f"/applications/{application['id']}/history", headers=account["headers"]
    ).json()
    assert [(entry["old_status"], entry["new_status"]) for entry in history] == [
        (None, "Applied"),
        ("Applied", "Interview"),
    ]


def test_same_status_update_does_not_add_history(client, user_factory):
    account = user_factory()
    application = add_application(client, account["headers"]).json()
    client.put(
        f"/applications/{application['id']}",
        json={"status": "Applied"},
        headers=account["headers"],
    )
    history = client.get(
        f"/applications/{application['id']}/history", headers=account["headers"]
    ).json()
    assert len(history) == 1


def test_delete_application(client, user_factory):
    account = user_factory()
    application = add_application(client, account["headers"]).json()
    response = client.delete(
        f"/applications/{application['id']}", headers=account["headers"]
    )
    assert response.status_code == 204
    assert client.get(
        f"/applications/{application['id']}", headers=account["headers"]
    ).status_code == 404


def test_application_routes_require_authentication(client):
    assert client.get("/applications").status_code == 401

from tests.test_applications import add_application


def test_create_list_update_and_delete_note(client, user_factory):
    account = user_factory()
    application = add_application(client, account["headers"]).json()
    created = client.post(
        f"/applications/{application['id']}/notes",
        json={"content": "  Follow up next week  "},
        headers=account["headers"],
    )
    assert created.status_code == 201
    note = created.json()
    assert note["content"] == "Follow up next week"
    listed = client.get(
        f"/applications/{application['id']}/notes", headers=account["headers"]
    )
    assert len(listed.json()) == 1
    edited = client.put(
        f"/notes/{note['id']}",
        json={"content": "Interview scheduled"},
        headers=account["headers"],
    )
    assert edited.json()["content"] == "Interview scheduled"
    deleted = client.delete(f"/notes/{note['id']}", headers=account["headers"])
    assert deleted.status_code == 204


def test_reject_blank_note(client, user_factory):
    account = user_factory()
    application = add_application(client, account["headers"]).json()
    response = client.post(
        f"/applications/{application['id']}/notes",
        json={"content": "  "},
        headers=account["headers"],
    )
    assert response.status_code == 422


def test_note_access_is_scoped_to_application_owner(client, user_factory):
    first = user_factory()
    second = user_factory()
    application = add_application(client, first["headers"]).json()
    note = client.post(
        f"/applications/{application['id']}/notes",
        json={"content": "Private"},
        headers=first["headers"],
    ).json()
    response = client.put(
        f"/notes/{note['id']}",
        json={"content": "Changed"},
        headers=second["headers"],
    )
    assert response.status_code == 404

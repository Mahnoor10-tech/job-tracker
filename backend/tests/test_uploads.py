def test_resume_upload_accepts_pdf(client, user_factory, tmp_path, monkeypatch):
    from app.routes import uploads

    monkeypatch.setattr(uploads, "UPLOAD_DIR", tmp_path)
    account = user_factory()
    response = client.post(
        "/uploads/resume",
        headers=account["headers"],
        files={"file": ("resume.pdf", b"%PDF-1.7 test document", "application/pdf")},
    )
    assert response.status_code == 201
    filename = response.json()["filename"]
    assert filename.startswith(f"{account['user']['id']}-resume-")
    assert (tmp_path / filename).read_bytes().startswith(b"%PDF-")


def test_cover_letter_upload_accepts_pdf(client, user_factory, tmp_path, monkeypatch):
    from app.routes import uploads

    monkeypatch.setattr(uploads, "UPLOAD_DIR", tmp_path)
    account = user_factory()
    response = client.post(
        "/uploads/cover-letter",
        headers=account["headers"],
        files={"file": ("letter.pdf", b"%PDF-1.4 letter", "application/pdf")},
    )
    assert response.status_code == 201
    assert "-cover-letter-" in response.json()["filename"]


def test_upload_rejects_non_pdf_extension(client, user_factory):
    account = user_factory()
    response = client.post(
        "/uploads/resume",
        headers=account["headers"],
        files={"file": ("resume.txt", b"%PDF-1.7 fake", "application/pdf")},
    )
    assert response.status_code == 415


def test_upload_rejects_invalid_pdf_content(client, user_factory):
    account = user_factory()
    response = client.post(
        "/uploads/resume",
        headers=account["headers"],
        files={"file": ("resume.pdf", b"not a pdf", "application/pdf")},
    )
    assert response.status_code == 415


def test_upload_rejects_oversized_pdf(client, user_factory):
    account = user_factory()
    content = b"%PDF-1.7" + b"x" * (5 * 1024 * 1024)
    response = client.post(
        "/uploads/resume",
        headers=account["headers"],
        files={"file": ("resume.pdf", content, "application/pdf")},
    )
    assert response.status_code == 413

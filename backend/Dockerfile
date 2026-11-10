FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /workspace/backend

COPY backend/requirements.txt ./requirements.txt
RUN python -m pip install --no-cache-dir --upgrade pip \
    && python -m pip install --no-cache-dir -r requirements.txt

COPY backend/alembic.ini ./alembic.ini
COPY backend/alembic ./alembic
COPY backend/app ./app
RUN mkdir -p uploads \
    && groupadd --system app \
    && useradd --system --gid app --home-dir /workspace app \
    && chown -R app:app /workspace

USER app
EXPOSE 8000

CMD ["sh", "-c", "alembic upgrade head && exec python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"]

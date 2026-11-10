# Job Application Tracker

A full-stack job search workspace for keeping applications, interview progress,
follow-up notes, and career documents organized in one place.

## Features

- Account registration, password hashing, and bearer-token authentication.
- Private job application CRUD with search, status filtering, sorting, and pagination.
- Application status history and notes.
- Dashboard totals, status breakdown, and weekly application activity.
- PDF resume and cover-letter uploads (5 MB maximum).
- Responsive React interface, Docker Compose, Alembic migrations, and automated CI.

## Technology stack

React, Vite, Tailwind CSS, Axios, React Router, Recharts, FastAPI, Pydantic,
SQLAlchemy, Alembic, PostgreSQL, Docker, Nginx, GitHub Actions, and pytest.

## Architecture

The React single-page app calls the FastAPI REST API. In development, Vite proxies
API requests to the local backend; in Docker, Nginx serves the frontend and proxies
API requests to the backend service. FastAPI uses SQLAlchemy for persistence and
Alembic for schema migrations. Uploaded files are stored in a Docker volume.

## Database tables and relationships

- `users`: unique email and password hash; one user owns many applications.
- `applications`: job details and current status; belongs to one user.
- `application_status_history`: records each status transition; belongs to an
  application.
- `notes`: application notes with creation and update timestamps; belongs to an
  application.
- `alembic_version`: Alembic's migration version marker.

Deleting a user or application cascades to its dependent application data.

## Folder structure

```text
backend/
  alembic/                 Database migration environment and revisions
  app/
    routes/                Authentication, applications, notes, dashboard, uploads
    auth.py                Password hashing and JWT helpers
    database.py            PostgreSQL engine and session dependency
    models.py              SQLAlchemy models
    schemas.py             Pydantic request/response validation
  tests/                   Backend API tests
  Dockerfile
frontend/
  src/
    components/            Shared navigation, cards, badges, and tables
    context/               Authentication state
    pages/                 Login, registration, dashboard, and application pages
    api.js                 Axios client
  Dockerfile
  nginx.conf
.github/workflows/ci.yml   Backend tests and frontend production build
docker-compose.yml
```

## Environment variables

Copy `.env.example` to `.env` at the repository root and replace the secret with a
random value of at least 32 characters. `.env` is ignored by Git.

| Variable | Purpose | Local example |
|---|---|---|
| `DATABASE_URL` | SQLAlchemy database connection | `postgresql://postgres:password@localhost:5432/jobtracker` |
| `SECRET_KEY` | Signs access tokens; use a random secret | Set your own value |
| `ALGORITHM` | JWT signing algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access-token lifetime | `30` |
| `POSTGRES_USER` | Compose PostgreSQL user | `postgres` |
| `POSTGRES_PASSWORD` | Compose PostgreSQL password | `jobtracker_local_only` |
| `POSTGRES_DB` | Compose database name | `jobtracker` |
| `API_PORT` | Host port for the Compose API | `8001` |
| `FRONTEND_PORT` | Host port for the Compose website | `5174` |

Compose constructs the backend's database URL using the internal `db` service
hostname. The root `DATABASE_URL` is used when running the backend directly on the
host. URL-encode special characters in database credentials.

## Run locally without Compose

1. Start PostgreSQL and make sure `.env` contains a host-accessible
   `DATABASE_URL`.
2. In PowerShell, from the repository root:

   ```powershell
   Copy-Item .env.example .env # Only needed on first setup; then set a random SECRET_KEY.
   cd backend
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   python -m pip install -r requirements.txt
   alembic upgrade head
   python -m uvicorn app.main:app --reload --port 8010
   ```

3. In a second terminal:

   ```powershell
   cd frontend
   npm.cmd install
   npm.cmd run dev
   ```

The frontend is at `http://localhost:5173`; the API and Swagger docs are at
`http://127.0.0.1:8010` and `http://127.0.0.1:8010/docs`.

## Run with Docker Compose

With Docker Desktop running, from the repository root:

```powershell
docker compose up --build
docker compose ps
```

Open the frontend at `http://localhost:5174` and Swagger at
`http://localhost:8001/docs`. These are the default host ports because `5173` and
`8000` may already be occupied by local development servers or other applications.
Override them with `FRONTEND_PORT` and `API_PORT` in `.env` if needed.

Stop the stack with `Ctrl+C`, then run `docker compose down`. This preserves the
PostgreSQL and upload volumes. To intentionally remove local database data as
well, run `docker compose down -v`.

The default PostgreSQL password is for local development only. Before deployment,
configure strong secrets, TLS, production CORS origins, database backups, and
durable private file storage. A public deployment has not been configured yet.

## Tests and builds

From the repository root:

```powershell
backend\venv\Scripts\python.exe -m pytest backend\tests -v
npm.cmd --prefix frontend run build
npm.cmd --prefix frontend run lint
```

The current backend suite contains 29 tests. GitHub Actions runs the backend tests
and frontend production build on pushes and pull requests.

## Screenshots and links

- GitHub repository: https://github.com/Mahnoor10-tech/job-tracker
- Local development screenshots can be captured from the running frontend.
- Deployment URL: not available yet; no hosting provider has been configured.

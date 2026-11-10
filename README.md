# Job Application Tracker

A fullstack application for managing job applications.

## Technology Stack

- React
- Tailwind CSS
- FastAPI
- Python
- PostgreSQL
- SQLAlchemy
- Alembic
- Docker
- GitHub Actions

## Features

- User authentication
- Job application management
- Status tracking
- Notes
- Dashboard statistics
- PDF uploads

## Project Status

Currently under development.

## Run locally

1. Copy `.env.example` to `.env` in the project root and replace `SECRET_KEY` with a
   long random value. The local `.env` is ignored by Git.
2. Start the `jobtracker-db` PostgreSQL container with Docker Desktop.
3. In PowerShell, from the project root:

   ```powershell
   cd backend
   .\venv\Scripts\Activate.ps1
   python -m pip install -r requirements.txt
   alembic upgrade head
   python -m uvicorn app.main:app --reload
   ```

4. In a second terminal, from the project root:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

The API docs are available at `http://127.0.0.1:8000/docs`; the frontend is at
`http://localhost:5173`. If port 8000 is already occupied, start the API with
`--port 8010` and set `VITE_API_URL=http://127.0.0.1:8010` in `frontend/.env.local`.

Run backend tests from the project root with
`backend\venv\Scripts\python.exe -m pytest backend\tests -v`.

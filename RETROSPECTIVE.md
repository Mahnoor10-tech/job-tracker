# Project Retrospective

## What was the hardest part?

Connecting the API, database migrations, authentication, and frontend into one
working application while keeping each user's applications and notes private.
Local development also required accounting for ports already used by other
services.

## What would you do differently?

I would start with a small end-to-end vertical slice (register, create one
application, and display it) before expanding the API and UI. I would also settle
the local and production environment configuration before adding more endpoints.

## What am I most proud of?

The application works across the full stack: users can authenticate, manage
applications and notes, view status history and dashboard statistics, and upload
validated PDFs. The backend has 29 passing tests, and the database schema is
versioned with Alembic.

## What do I want to learn next?

Production deployment, secure object storage for uploaded documents, database
backups, richer end-to-end browser tests, and improving accessibility and
performance.

## Final status

The code is pushed to the GitHub repository. Docker Compose and CI are configured;
a public production deployment and hosted screenshots still need a hosting
provider and its deployment credentials.

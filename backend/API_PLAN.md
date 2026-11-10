# API Plan

## Authentication

POST /auth/register
POST /auth/login
GET /users/me

## Applications

POST /applications
GET /applications
GET /applications/{id}
PUT /applications/{id}
DELETE /applications/{id}

## History

GET /applications/{id}/history

## Notes

POST /applications/{id}/notes
GET /applications/{id}/notes
PUT /notes/{id}
DELETE /notes/{id}

## Dashboard

GET /dashboard/stats
GET /dashboard/applications-per-week
GET /dashboard/status-breakdown

## Uploads

POST /uploads/resume
POST /uploads/cover-letter

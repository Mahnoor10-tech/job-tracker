# Job Tracker Database Plan

## 1. Users

- id: Primary key
- email: Unique email
- username: User display name
- hashed_password: Secure password hash
- created_at: Registration timestamp

## 2. Applications

- id: Primary key
- company: Company name
- position: Job title
- job_url: Job listing URL
- salary_min: Minimum salary
- salary_max: Maximum salary
- status: Current status
- date_applied: Application date
- user_id: Foreign key to users

## 3. Application Status History

- id: Primary key
- application_id: Foreign key to applications
- old_status: Previous status
- new_status: Updated status
- changed_at: Change timestamp

## 4. Notes

- id: Primary key
- application_id: Foreign key to applications
- content: Note text
- created_at: Creation timestamp
- updated_at: Update timestamp

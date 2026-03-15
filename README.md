# imeicheck

Monorepo with:

- `backend/`: Express + Sequelize API for IMEI services and payments
- `frontend/`: React + Vite + Tailwind client connected to backend API

## Quick start

### Backend

1. Create backend env file with required variables.
2. Run migrations.
3. Start API server.

### Frontend

1. Copy `frontend/.env.example` to `frontend/.env`.
2. Set `VITE_API_URL` to backend base URL.
3. Run `npm install` and `npm run dev` inside `frontend/`.

# Restaurant Deals Web

Frontend for the Restaurant Deals capstone.

## Stack
- React + TypeScript + Vite
- React Router
- Tailwind CSS

## Setup
```bash
npm install
cp .env.example .env
npm run dev
```

## Environment
- `VITE_API_URL` (example: `http://localhost:3000`)

## Current Routes
- `/` home
- `/deals` public deals list
- `/deals/:id` deal details + save favorite
- `/favorites` protected
- `/portal` protected (owner/admin)
- `/admin` protected (admin)
- `/login` login form

## Notes
- Auth token stored in `localStorage` key: `token`
- API envelope expected: `{ ok, data | error }`

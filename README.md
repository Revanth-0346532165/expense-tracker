# Finance Buddy

This app now includes a Node.js backend and database layer.

- Frontend state is loaded from `http://localhost:4000/api/state` when available.
- Backend persistence uses `lowdb` and stores data in `server/data/db.json`.
- LocalStorage/IndexedDB are still used as offline fallback.

## Run locally

1. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
2. Start both frontend and backend:
   ```bash
   npm run dev
   ```

The frontend runs via Vite and the backend API runs on port `4000`.

# InkWell — MERN Blogging Platform

A full-featured blogging platform built with **MongoDB, Express, React, Node.js (MERN)** and **TailwindCSS**.

## Features

- **Auth**: register/login (JWT), forgot/reset password (email), change password, protected routes
- **Rich text editor** (Quill) with image uploads, drafts & publishing
- **Categories & tags**: create, browse, filter
- **Comments**: add/edit/delete, basic spam heuristic + moderation queue for post authors
- **Subscriptions**: subscribe to authors or categories, in-app notifications on new posts/likes/comments
- **Analytics**: per-post and aggregate dashboards (views, likes, comments, shares) with Recharts
- **Social sharing**: Facebook, X/Twitter, LinkedIn, WhatsApp, Email — with share-count tracking
- **Profiles**: avatar, bio, social links, dedicated public author pages

## Tech Stack

- **Frontend**: React 18 (Vite), React Router, TailwindCSS, React-Quill, Recharts, Axios
- **Backend**: Node.js, Express, MongoDB + Mongoose, JWT, Multer, Nodemailer

## Project Structure

```
blogging-platform/
├── server/          # Express API
│   ├── config/       # DB connection
│   ├── controllers/  # Route handlers
│   ├── middleware/   # auth, upload, error handling
│   ├── models/       # Mongoose schemas
│   ├── routes/       # Express routers
│   ├── utils/        # token & email helpers
│   └── server.js     # entry point
└── client/          # React app (Vite)
    └── src/
        ├── api/        # axios instance
        ├── components/ # shared UI
        ├── context/    # auth context
        └── pages/      # route pages
```

---

## 1. Run Locally

### Prerequisites
- Node.js 18+
- A MongoDB database (local `mongod`, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)

### Backend

```bash
cd server
cp .env.example .env
# edit .env: set MONGO_URI, JWT_SECRET, CLIENT_URL=http://localhost:5173
# SMTP_* values are only needed for the "forgot password" email — Mailtrap.io works great for local testing
npm install
npm run dev          # starts on http://localhost:5000
```

### Frontend

```bash
cd client
cp .env.example .env
# VITE_API_URL=http://localhost:5000
npm install
npm run dev           # starts on http://localhost:5173
```

Open `http://localhost:5173` — the Vite dev server also proxies `/api` and `/uploads` to the backend, so `VITE_API_URL` can be left blank locally if you prefer relying on the proxy.

---

## 2. Deploy the Backend to Render

1. Push this repo to GitHub.
2. Go to [render.com](https://render.com) → **New +** → **Web Service** → connect your GitHub repo.
3. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Runtime**: Node
4. Add environment variables (Render dashboard → Environment):
   - `NODE_ENV=production`
   - `MONGO_URI` — your MongoDB Atlas connection string
   - `JWT_SECRET` — a long random string
   - `JWT_EXPIRE=7d`
   - `CLIENT_URL` — your deployed Vercel frontend URL (e.g. `https://your-app.vercel.app`) — required for CORS and password-reset links
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL`, `FROM_NAME` — your SMTP provider (Mailtrap, SendGrid, Gmail app password, etc.)
5. Deploy. Render will give you a URL like `https://blogging-platform-api.onrender.com`.

> A `render.yaml` (Blueprint) is included at the repo root if you'd rather deploy via **New + → Blueprint**.

> **Note**: Uploaded images are stored on Render's local disk, which is **ephemeral** on the free plan (files are lost on redeploy/restart). For production, swap the `multer` disk storage in `server/middleware/upload.js` for a cloud storage provider (e.g. Cloudinary, AWS S3, or Render Persistent Disks on a paid plan).

---

## 3. Deploy the Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project** → import the same GitHub repo.
2. Configure:
   - **Root Directory**: `client`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add environment variable:
   - `VITE_API_URL` = your Render backend URL (e.g. `https://blogging-platform-api.onrender.com`)
4. Deploy. Vercel will give you a URL like `https://your-app.vercel.app`.
5. Go back to Render and set `CLIENT_URL` to this Vercel URL, then redeploy the backend (needed for CORS to allow requests and for reset-password email links to point to the right place).

A `vercel.json` with an SPA rewrite rule is already included in `client/` so client-side routing (React Router) works correctly on refresh/direct links.

---

## 4. (Alternative) Deploy Frontend to Netlify

1. [netlify.com](https://netlify.com) → **Add new site** → **Import an existing project**.
2. **Base directory**: `client`, **Build command**: `npm run build`, **Publish directory**: `client/dist`.
3. Add environment variable `VITE_API_URL` (same as above).
4. Add a `_redirects` file (or Netlify's redirect rules) with `/* /index.html 200` for SPA routing — or add this to `client/public/_redirects`:
   ```
   /*  /index.html  200
   ```

---

## Environment Variable Summary

| Variable | Where | Description |
|---|---|---|
| `MONGO_URI` | server | MongoDB connection string |
| `JWT_SECRET` | server | Secret for signing JWTs |
| `JWT_EXPIRE` | server | Token lifetime, e.g. `7d` |
| `CLIENT_URL` | server | Deployed frontend URL (CORS + reset links) |
| `SMTP_*`, `FROM_EMAIL`, `FROM_NAME` | server | Email provider for password reset |
| `VITE_API_URL` | client | Deployed backend URL |

## Default Ports (local dev)
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`

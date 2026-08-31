# Intel Blossom Hub / BootMind — Full Stack Architecture

A complete bootcamp management and learning intelligence workspace.

## 🏗️ Architecture Overview

The project is structured with clean separation of concerns:

```
intel-blossom-hub/
├── frontend/             # React 18 + TanStack Router + Tailwind CSS SPA (Deployed on Vercel)
│   ├── src/              # Components, Pages, Routes, Hooks, Utilities, Styling
│   ├── public/           # Static media, favicons, logos
│   ├── vite.config.ts    # Standalone Vite SPA bundler configuration
│   ├── vercel.json       # Clean SPA deep link routing rewrites
│   └── .env.example      # Frontend environment variables template
│
├── backend/              # Node.js / Express REST API Service (Deployed on Render)
│   ├── src/              # Controllers, Services, Middlewares, REST Endpoints
│   ├── tsconfig.json     # NodeNext TypeScript compilation configuration
│   └── .env.example      # Backend environment variables template
│
└── README.md             # Architecture & Deployment Documentation
```

---

## ⚡ Key Principles Preserved

- **100% UI/UX Preservation**: All dashboards, trainee rosters, task submissions, meeting logs, quizzes, scorecards, and reports remain pixel-identical.
- **Zero Lock-in**: Antigravity is the single source of truth; all Lovable-specific and Nitro-specific build complexities have been replaced with standard Vite & Express pipelines.
- **Security & RLS**: Sensitive administrative keys (`SUPABASE_SERVICE_ROLE_KEY`) are restricted strictly to the Render Backend REST API and never exposed to client browsers.

---

## 🚀 Local Development Setup

### 1. Backend (REST API Service)
```bash
cd backend
npm install
npm run dev
# Starts REST API on http://localhost:3000
```

### 2. Frontend (Vite Single Page Application)
```bash
cd frontend
npm install
npm run dev
# Starts Frontend SPA on http://localhost:5173 (or http://localhost:8080)
```

---

## 🌐 Production Deployment Guide

### A. Deploy Backend to Render

1. Create a **Web Service** on [Render](https://render.com).
2. Connect your GitHub repository (`Sivani08/Bootcamp`).
3. Set **Root Directory**: `backend`
4. Set **Build Command**: `npm install && npm run build`
5. Set **Start Command**: `npm start`
6. Add Environment Variables:
   - `PORT`: `3000`
   - `SUPABASE_URL`: `https://your-project.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY`: `your-service-role-key`
   - `CLIENT_ORIGIN`: `https://bootcamp-psi-vert.vercel.app`

### B. Deploy Frontend to Vercel

1. Create a **Project** on [Vercel](https://vercel.com).
2. Connect your GitHub repository (`Sivani08/Bootcamp`).
3. Set **Root Directory**: `frontend`
4. Set **Framework Preset**: `Vite`
5. Set **Build Command**: `npm run build`
6. Set **Output Directory**: `dist`
7. Add Environment Variables:
   - `VITE_SUPABASE_URL`: `https://your-project.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: `your-publishable-key`
   - `VITE_API_BASE_URL`: `https://your-render-backend.onrender.com`

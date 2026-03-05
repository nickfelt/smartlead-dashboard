# Smartlead Client Dashboard

A multi-tenant client portal that gives your Smartlead clients a white-labeled view of their campaign performance, with self-serve billing via Stripe.

## Stack

- **Frontend**: React + Vite (TypeScript)
- **Backend**: FastAPI serverless functions on Vercel
- **Database**: Supabase (Postgres + Auth + Row-Level Security)
- **Payments**: Stripe
- **Deployment**: Vercel

## Project Structure

```
smartlead-dashboard/
├── frontend/          # React + Vite app
├── api/               # FastAPI serverless functions for Vercel
├── shared/            # Shared types/constants
├── supabase/
│   └── migrations/    # SQL migration files
├── .env.example       # Required environment variables
├── vercel.json        # Vercel deployment config
└── requirements.txt   # Python dependencies
```

## Getting Started

1. Copy `.env.example` to `.env` and fill in your values
2. Set `USE_MOCK=true` during development to use mock data
3. `cd frontend && npm install && npm run dev`

## Deployment

Deployed via Vercel. Push to `main` triggers a production deploy.
Custom domain: `app.feltmarketing.com`

# Soar — AI Travel Planner

Soar lets you build a day-by-day travel itinerary by swiping through YouTube Shorts. Like the videos that match your vibe, skip the rest, and get a personalised itinerary powered by Gemini AI.

---

## How it works

1. **Tell us where** — pick a destination, trip length, season, and activity vibes (hiking, dining, nightlife, etc.)
2. **Swipe the shorts** — a curated feed of location-specific YouTube Shorts plays in a card deck; swipe right to like, left to skip. The feed adapts in real time based on what you engage with.
3. **Get the itinerary** — liked video URLs are sent to the AI backend, which generates a detailed day-by-day plan grounded in the specific venues and neighbourhoods from those videos.

There is also a **YouTube mode** that pulls from your own liked videos, favourites, and playlists instead of the live Shorts feed.

---

## Architecture

The repo contains three independent services that run together:

```
frontend-main/          React + Vite frontend (TypeScript)
itinerary-backend-main/ Python / Flask AI backend
shorts-backend/         Node.js Shorts feed API
```

### Frontend (`frontend-main`)

- **React 18** with **React Router v6** and **TypeScript**
- Material Design 3 component system (custom, in `src/components/M3.tsx`)
- Auth via **Auth0** (`@auth0/auth0-react`)
- Three main flows:
  - `/create-trip` — trip details form → swipe feed → itinerary generation
  - `/create-trip-youtube` — same flow but sourced from the user's YouTube account
  - `/your-trip` — renders the generated itinerary with a day-by-day timeline
  - `/my-trips` — saved itineraries fetched from the backend
- Vite dev server proxies `/api/*` → `localhost:3000` (Shorts backend) and `/itinerary-api/*` → `localhost:8080` (Python backend)

### Shorts Backend (`shorts-backend`)

- Plain **Node.js** HTTP server (no framework)
- Uses **yt-dlp** to search YouTube for Shorts matching the destination and activity terms
- Rotates through keyword variants and applies a 100k-view floor to filter low-quality results
- Caches feed results for 20 minutes and CDN stream URLs for 90 minutes
- Endpoints:
  - `GET /api/feed?page=N&location=...&extra=...` — returns up to 8 Short video metadata objects
  - `GET /api/stream-url?v=VIDEO_ID` — resolves and returns the direct CDN URL as JSON
  - `GET /api/proxy?v=VIDEO_ID` — resolves the CDN URL and issues a 302 redirect

### Itinerary Backend (`itinerary-backend-main`)

- **Flask** with **Flask-CORS**
- Uses **Google Gemini 2.5 Flash** (`google-generativeai`) to generate itineraries as structured JSON
- Auth via **Auth0** JWT verification (RS256, JWKS endpoint)
- Itineraries are persisted in **Supabase** (Postgres)
- Endpoints:
  - `POST /generate_itinerary?prompt=...&video_urls=...` — generates a new itinerary
  - `POST /save_itinerary` — saves an itinerary to the authenticated user's account *(requires Bearer token)*
  - `GET /my_itineraries` — lists the user's saved itineraries *(requires Bearer token)*
  - `DELETE /delete_itinerary/<id>` — deletes a saved itinerary *(requires Bearer token)*

---

## Prerequisites

- **Node.js** 18+
- **Python** 3.10+
- **yt-dlp** installed and on your `PATH` (`pip install yt-dlp` or `brew install yt-dlp`)
- A **Google Cloud** project with the YouTube Data API v3 enabled
- A **Google AI Studio** API key (Gemini)
- An **Auth0** tenant with a Single Page Application and an API configured
- A **Supabase** project with an `itineraries` table (columns: `id`, `user_id`, `location`, `data`, `created_at`)

---

## Setup

### 1. Shorts backend

```bash
cd shorts-backend
node server.js
# Listens on http://localhost:3000
```

No dependencies to install — uses only Node built-ins and yt-dlp.

### 2. Itinerary backend

```bash
cd itinerary-backend-main
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file:

```env
GOOGLE_API_KEY=your_gemini_api_key

AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=https://your-api-identifier

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
```

Start the server:

```bash
python server.py
# Listens on http://localhost:8080
```

### 3. Frontend

```bash
cd frontend-main
npm install
```

Create a `.env` file:

```env
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your_auth0_spa_client_id
VITE_AUTH0_AUDIENCE=https://your-api-identifier
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

Start the dev server:

```bash
npm run dev
# Listens on http://localhost:5173
```

All three services need to be running at the same time for the full flow to work.

---

## Building for production

```bash
cd frontend-main
npm run build   # outputs to frontend-main/dist
```

The `public/_redirects` file is included for Netlify-style SPA deployments. For other hosts, configure your server to serve `index.html` for all routes.

The two backends can be deployed as standard WSGI (Flask via `wsgi.py`) and Node.js processes respectively. Make sure the frontend's proxy targets are updated to the production URLs, or configure your reverse proxy (nginx, Caddy, etc.) to route `/api/*` and `/itinerary-api/*` to the correct services.

---

## Project structure

```
frontend-main/
  src/
    components/M3.tsx           Material Design 3 component library
    pages/
      GetStartedScreen/         Landing page
      FormScreen/               Trip form + swipe feed (multi-step)
      YourTripScreen/           Generated itinerary view
      SavedTripsScreen/         User's saved trips
      OAuthCallback.tsx         Auth0 redirect handler
    utils/
      api.ts                    Itinerary backend API client
      types.ts                  Shared TypeScript types (ActivityTag enum)
      youtube.ts                YouTube Data API v3 helpers

itinerary-backend-main/
  server.py                     Flask app + all routes
  wsgi.py                       WSGI entry point for production
  prompts/
    system_prompt_vid_analysis.txt   Gemini system prompt
    prompt_with_vid_analysis.txt     Gemini user prompt template

shorts-backend/
  server.js                     Node.js Shorts feed + proxy server
```

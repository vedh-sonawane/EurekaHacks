# Soar

<img width="2000" height="2000" alt="blue logo no bg" src="https://github.com/user-attachments/assets/1c9f4416-3c63-4ecc-867b-fbd67dde1aff" />


> **Swipe travel videos. Get perfect itinerary.**

Soar is an travel planner that turns your YouTube Shorts feed into a personalised day-by-day itinerary. Swipe right on videos that match your vibe, and Gemini 2.5 Flash caters to you a specific travel plan inspired by what you liked and avoids what you disliked.

---

##  The Problem
Planning a trip is overwhelming. You spend hours researching travel content, blogs, videos, articles, saving videos, and then still end up with a generic itinerary like a blog post written in 2019.

---

##  How It Works

```
User swipes YouTube Shorts
        ↓
Liked video IDs → Video Analysis Backend
        ↓
OpenCV samples frames → Gemini Vision analyses content & location
        ↓
Video summaries + user preferences → Itinerary Backend
        ↓
Gemini 2.5 Flash generates a specific, named, timed day plan
        ↓
Rendered in the React frontend
```

1. **Enter your destination** and pick activity vibes (hiking, dining, nightlife, etc.)
2. **Swipe through YouTube Shorts** curated for your location — right to like, left to skip
3. **Review your selections**, then hit Generate
4. **Get a full day itinerary** with real venue names, transit directions, and timestamps — each activity linked back to the video that inspired it

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   React Frontend                    │
│         Vite + TypeScript + React Router            │
│  GetStarted → FormScreen (3-step) → YourTrip        │
└────────────────┬────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
┌──────────────┐  ┌──────────────────────┐
│ Shorts       │  │  Itinerary Backend   │
│ Backend      │  │  Flask · Python      │
│ Node.js      │  │  Gemini 2.5 Flash    │
│              │  │  Port 8080           │
│ /api/feed    │  └──────────┬───────────┘
│ /api/proxy   │             │
│ Port 3000    │             ▼
│              │  ┌──────────────────────┐
│ yt-dlp       │  │  Video Analysis      │
└──────────────┘  │  Backend             │
                  │  Flask · Python      │
                  │  Gemini Vision       │
                  │  OpenCV + yt-dlp     │
                  │  Port 8002           │
                  └──────────────────────┘
```

| Service | Stack | Responsibility |
|---|---|---|
| **Frontend** | React 18, TypeScript, Vite | 3-step trip builder, swipe UI, itinerary display |
| **Shorts Backend** | Node.js, yt-dlp | Fetch & proxy YouTube Shorts by location/activity query |
| **Itinerary Backend** | Python, Flask, Gemini 2.5 Flash | Generate structured day plans from user prefs + video analysis |
| **Video Analysis Backend** | Python, Flask, OpenCV, Gemini Vision | Sample video frames, extract location & activity context |

---

## Local Setup

### Prerequisites

- Node.js ≥ 18
- Python ≥ 3.10
- [`yt-dlp`](https://github.com/yt-dlp/yt-dlp) installed and on your `PATH`
- A [Google AI Studio](https://aistudio.google.com/) API key (Gemini)

---

### 1. Frontend

```bash
cd frontend-main
npm install
npm run dev
```

Runs at `http://localhost:5173`. The Vite dev server proxies `/api/*` to the Shorts backend.

---

### 2. Shorts Backend

```bash
node shorts-backend/server.js
```

Runs at `http://localhost:3000`. Requires `yt-dlp` on your PATH.

```bash
brew install yt-dlp

pip install yt-dlp
```

---

### 3. Video Analysis Backend

```bash
cd videoanalysis-backend-main
python -m venv venv
source venv/bin/activate       
venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file:

```env
GOOGLE_API_KEY=your_gemini_api_key_here
```

```bash
python app.py   # runs on port 8002
```

---

### 4. Itinerary Backend

```bash
cd itinerary-backend-main
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file:

```env
GOOGLE_API_KEY=your_gemini_api_key_here
VIDEO_ANALYSIS_PROD_URL=http://localhost:8002/analyze_videos
VIDEO_ANALYSIS_DEV_URL=http://localhost:8003/analyze_videos
```

```bash
python server.py   # runs on port 8080
```

---

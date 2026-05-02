import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ActivityTag } from "../../utils/types";

const ALL_TAGS = Object.values(ActivityTag);

type ShortVideo = { videoId: string; title: string; thumbnail: string; uploader: string; viewCount: number | null };

async function fetchShorts(location: string, page = 0): Promise<ShortVideo[]> {
  const res = await fetch(`/api/feed?page=${page}&location=${encodeURIComponent(location)}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.items ?? [];
}

const MOCK_ITINERARY = (location: string, tags: string[]) => ({
  location,
  activities: [
    { startTime: "8:00",  endTime: "9:30",  activity: "Breakfast at a local café",                                                                          location: `${location} City Center`       },
    { startTime: "10:00", endTime: "12:00", activity: tags.includes("Museum") || tags.includes("History") ? "Visit the main historical museum" : "Morning exploration walk", location: `${location} Old Town` },
    { startTime: "12:30", endTime: "13:30", activity: tags.includes("Dining") ? "Lunch at a renowned local restaurant" : "Lunch at a street food market",   location: `${location} Market Square`     },
    { startTime: "14:00", endTime: "16:00", activity: tags.includes("Hiking") ? "Scenic hike with city views" : tags.includes("Beach") ? "Afternoon at the beach" : "Explore the botanical gardens", location: `${location} East Side` },
    { startTime: "16:30", endTime: "18:00", activity: tags.includes("Shopping") ? "Shopping at local boutiques" : "Wander through the local markets",       location: `${location} Shopping District` },
    { startTime: "19:00", endTime: "21:00", activity: tags.includes("Nightlife") ? "Bar hopping in the nightlife district" : "Dinner at a rooftop restaurant", location: `${location} Skyline Avenue` },
  ],
});

// ── Shared styles ─────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  page:    { minHeight: "calc(100vh - 65px)", background: "#0f0f0f", color: "white", display: "flex", flexDirection: "column", alignItems: "center", padding: "3rem 2rem" },
  card:    { background: "#1a1a1a", borderRadius: "16px", padding: "2.5rem", width: "100%", maxWidth: "860px" },
  input:   { width: "100%", padding: "0.7rem 1rem", borderRadius: "8px", border: "1px solid #333", background: "#111", color: "white", fontSize: "1rem", boxSizing: "border-box" },
  label:   { display: "block", marginBottom: "0.4rem", color: "#aaa", fontSize: "0.9rem" },
  btn:     { padding: "0.8rem 2rem", borderRadius: "8px", border: "none", background: "#FE2858", color: "white", fontSize: "1rem", cursor: "pointer", fontWeight: "bold" },
  btnGhost:{ padding: "0.8rem 2rem", borderRadius: "8px", border: "1px solid #444", background: "transparent", color: "#aaa", fontSize: "1rem", cursor: "pointer" },
  stepBar: { display: "flex", gap: "0.5rem", marginBottom: "2.5rem", alignItems: "center" },
};

// ── Step indicator ────────────────────────────────────────────────────────────
function StepBar({ step }: { step: number }) {
  const labels = ["Trip Details", "Swipe Videos", "Review"];
  return (
    <div style={s.stepBar}>
      {labels.map((label, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <div style={{
            width: 30, height: 30, borderRadius: "50%", display: "flex",
            alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: "bold",
            background: step >= i ? "#FE2858" : "#333", color: "white",
          }}>{i + 1}</div>
          <span style={{ color: step === i ? "white" : "#666", fontSize: "0.95rem" }}>{label}</span>
          {i < 2 && <span style={{ color: "#444", margin: "0 0.4rem" }}>›</span>}
        </div>
      ))}
    </div>
  );
}

// ── Step 1: Trip Details ──────────────────────────────────────────────────────
type TripData = { location: string; startTime: string; endTime: string; tags: ActivityTag[]; comments: string };

function TripDetailsStep({ onNext }: { onNext: (data: TripData) => void }) {
  const [location,  setLocation]  = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime,   setEndTime]   = useState("21:00");
  const [tags,      setTags]      = useState<ActivityTag[]>([]);
  const [comments,  setComments]  = useState("");
  const [error,     setError]     = useState("");

  const toggle = (tag: ActivityTag) =>
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const handleNext = () => {
    if (!location || tags.length === 0) {
      setError("Please enter a destination and select at least one activity vibe.");
      return;
    }
    setError("");
    onNext({ location, startTime, endTime, tags, comments });
  };

  return (
    <div style={s.card}>
      <h2 style={{ marginTop: 0, marginBottom: "1.8rem", fontSize: "1.6rem" }}>Where are you going? 🌍</h2>

      {/* Two-column layout for destination + times */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={s.label}>Destination *</label>
          <input style={s.input} placeholder="e.g. Tokyo, Japan" value={location} onChange={e => setLocation(e.target.value)} />
        </div>
        <div>
          <label style={s.label}>Start time *</label>
          <input type="time" style={s.input} value={startTime} onChange={e => setStartTime(e.target.value)} />
        </div>
        <div>
          <label style={s.label}>End time *</label>
          <input type="time" style={s.input} value={endTime} onChange={e => setEndTime(e.target.value)} />
        </div>
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <label style={s.label}>Activity vibes * (pick at least one)</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {ALL_TAGS.map(tag => (
            <span key={tag} onClick={() => toggle(tag)} style={{
              padding: "0.35rem 0.85rem", borderRadius: "20px", cursor: "pointer", fontSize: "0.85rem",
              background: tags.includes(tag) ? "#FE2858" : "#2a2a2a",
              border: `1px solid ${tags.includes(tag) ? "#FE2858" : "#444"}`,
              color: "white", userSelect: "none", transition: "background 0.15s",
            }}>{tag}</span>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: "1.8rem" }}>
        <label style={s.label}>Special notes</label>
        <textarea
          style={{ ...s.input, height: "90px", resize: "vertical" } as React.CSSProperties}
          placeholder="e.g. vegetarian, wheelchair accessible..."
          value={comments}
          onChange={e => setComments(e.target.value)}
        />
      </div>

      {error && <p style={{ color: "#FE2858", marginBottom: "1rem", fontSize: "0.9rem" }}>{error}</p>}

      <button style={{ ...s.btn, minWidth: "220px" }} onClick={handleNext}>
        Next: Swipe Videos →
      </button>
    </div>
  );
}

// ── Step 2: Swipe Videos ──────────────────────────────────────────────────────
function SwipeStep({ location, onDone }: { location: string; onDone: (liked: string[]) => void }) {
  const [videos,  setVideos]  = useState<ShortVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [index,   setIndex]   = useState(0);
  const [liked,   setLiked]   = useState<string[]>([]);
  const [animDir, setAnimDir] = useState<"left" | "right" | null>(null);
  const animTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchShorts(location)
      .then(items => { setVideos(items); setLoading(false); })
      .catch(() => { setError("Couldn't load shorts — is the shorts backend running? (node shorts-backend/server.js)"); setLoading(false); });
  }, [location]);

  const swipe = (dir: "left" | "right") => {
    if (animTimeout.current || loading || videos.length === 0) return;
    const current = videos[index].videoId;
    setAnimDir(dir);
    animTimeout.current = setTimeout(() => {
      const newLiked = dir === "right" ? [...liked, current] : liked;
      if (dir === "right") setLiked(newLiked);
      setAnimDir(null);
      animTimeout.current = null;
      if (index + 1 >= videos.length) {
        onDone(newLiked);
      } else {
        setIndex(i => i + 1);
      }
    }, 350);
  };

  if (index >= videos.length && !loading) { onDone(liked); return null; }

  const current = videos[index];
  const remaining = videos.length - index;

  const cardAnim: React.CSSProperties = {
    transition: "transform 0.35s ease, opacity 0.35s ease",
    transform:  animDir === "right" ? "translateX(120%) rotate(15deg)" : animDir === "left" ? "translateX(-120%) rotate(-15deg)" : "none",
    opacity:    animDir ? 0 : 1,
  };

  return (
    <div style={{ ...s.card, maxWidth: "900px", display: "grid", gridTemplateColumns: "340px 1fr", gap: "3rem", alignItems: "center" }}>
      {/* Left: video card */}
      <div style={{ position: "relative" }}>
        {current && index + 1 < videos.length && (
          <div style={{ position: "absolute", inset: "8px -4px -8px", background: "#222", borderRadius: "16px", zIndex: 0 }} />
        )}
        <div style={{ ...cardAnim, position: "relative", zIndex: 1 }}>
          <div style={{ position: "relative", paddingTop: "177.78%", borderRadius: "12px", overflow: "hidden", background: "#111" }}>
            {loading ? (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#888" }}>
                Loading shorts…
              </div>
            ) : error ? (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", color: "#888", fontSize: "0.85rem", textAlign: "center" }}>
                {error}
              </div>
            ) : current ? (
              <video
                key={current.videoId}
                src={`/api/proxy?v=${current.videoId}`}
                poster={current.thumbnail}
                autoPlay
                loop
                muted
                playsInline
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : null}
          </div>
          {current && (
            <div style={{ padding: "0.6rem 0.2rem" }}>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "#ccc", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{current.title}</p>
              <p style={{ margin: "0.2rem 0 0", fontSize: "0.75rem", color: "#666" }}>{current.uploader}</p>
            </div>
          )}
        </div>
      </div>

      {/* Right: instructions + buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div>
          <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.6rem" }}>Swipe to build your trip 🎬</h2>
          <p style={{ color: "#888", fontSize: "0.95rem", lineHeight: 1.6 }}>
            Like the videos that match your travel vibe. We'll use them to personalise your itinerary.
          </p>
        </div>

        <div style={{ background: "#111", borderRadius: "10px", padding: "1rem 1.2rem", lineHeight: 2 }}>
          <div><span style={{ color: "#888" }}>Location:</span> <strong>{location}</strong></div>
          <div><span style={{ color: "#888" }}>Remaining:</span> <strong>{loading ? "…" : remaining}</strong></div>
          <div><span style={{ color: "#888" }}>Liked so far:</span> <strong>{liked.length}</strong></div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <button onClick={() => swipe("right")} disabled={loading || !!error} style={{
            ...s.btn, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem",
            padding: "0.9rem 1.5rem", fontSize: "1rem", opacity: loading || !!error ? 0.5 : 1,
          }}>
            👍 Love it
          </button>
          <button onClick={() => swipe("left")} disabled={loading || !!error} style={{
            ...s.btnGhost, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem",
            padding: "0.9rem 1.5rem", fontSize: "1rem", opacity: loading || !!error ? 0.5 : 1,
          }}>
            👎 Skip
          </button>
          <button onClick={() => onDone(liked)} style={{
            padding: "0.7rem 1.5rem", borderRadius: "8px", border: "1px solid #333",
            background: "transparent", color: "#666", fontSize: "0.9rem", cursor: "pointer",
          }}>
            Done — use {liked.length} liked video{liked.length !== 1 ? "s" : ""}
          </button>
        </div>

        <p style={{ color: "#555", fontSize: "0.82rem" }}>
          Tip: you can also use keyboard shortcuts — → to like, ← to skip.
        </p>
      </div>
    </div>
  );
}

// ── Step 3: Review & Generate ─────────────────────────────────────────────────
function ReviewStep({
  tripData,
  likedVideos,
  onBack,
  onGenerate,
}: {
  tripData: TripData;
  likedVideos: string[];
  onBack: () => void;
  onGenerate: () => void;
}) {
  return (
    <div style={s.card}>
      <h2 style={{ marginTop: 0, marginBottom: "1.5rem", fontSize: "1.6rem" }}>Review your trip 🗺️</h2>

      {/* Two-column: summary left, liked videos right */}
      <div style={{ display: "grid", gridTemplateColumns: likedVideos.length > 0 ? "1fr 1fr" : "1fr", gap: "2rem", marginBottom: "2rem" }}>
        <div style={{ background: "#111", borderRadius: "10px", padding: "1.2rem", lineHeight: 2.2 }}>
          <div><span style={{ color: "#888" }}>Destination:</span> <strong>{tripData.location}</strong></div>
          <div><span style={{ color: "#888" }}>Time:</span> <strong>{tripData.startTime} – {tripData.endTime}</strong></div>
          <div><span style={{ color: "#888" }}>Vibes:</span> <strong>{tripData.tags.join(", ")}</strong></div>
          {tripData.comments && <div><span style={{ color: "#888" }}>Notes:</span> <strong>{tripData.comments}</strong></div>}
          <div><span style={{ color: "#888" }}>Videos liked:</span> <strong>{likedVideos.length}</strong></div>
        </div>

        {likedVideos.length > 0 && (
          <div>
            <p style={{ color: "#aaa", fontSize: "0.9rem", marginBottom: "0.8rem" }}>Your liked videos:</p>
            <div style={{ display: "flex", gap: "0.6rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
              {likedVideos.map(id => (
                <div key={id} style={{ flexShrink: 0, width: "100px" }}>
                  <div style={{ position: "relative", paddingTop: "177.78%", borderRadius: "8px", overflow: "hidden", background: "#111" }}>
                    <img
                      src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
                      alt="liked short"
                      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "1rem" }}>
        <button style={s.btnGhost} onClick={onBack}>← Back</button>
        <button style={{ ...s.btn, flex: 1 }} onClick={onGenerate}>✈️ Generate My Itinerary</button>
      </div>
    </div>
  );
}

// ── Main FormScreen ───────────────────────────────────────────────────────────
export default function FormScreen() {
  const navigate = useNavigate();
  const [step,        setStep]        = useState(0);
  const [tripData,    setTripData]    = useState<TripData | null>(null);
  const [likedVideos, setLikedVideos] = useState<string[]>([]);

  const handleGenerate = () => {
    const itinerary = MOCK_ITINERARY(tripData!.location, tripData!.tags.map(String));
    localStorage.setItem("itinerary",     JSON.stringify(itinerary));
    localStorage.setItem("liked_videos",  JSON.stringify(likedVideos));
    navigate("/your-trip");
  };

  return (
    <div style={s.page}>
      <StepBar step={step} />
      {step === 0 && (
        <TripDetailsStep onNext={data => { setTripData(data); setStep(1); }} />
      )}
      {step === 1 && tripData && (
        <SwipeStep location={tripData.location} onDone={liked => { setLikedVideos(liked); setStep(2); }} />
      )}
      {step === 2 && tripData && (
        <ReviewStep
          tripData={tripData}
          likedVideos={likedVideos}
          onBack={() => setStep(1)}
          onGenerate={handleGenerate}
        />
      )}
    </div>
  );
}

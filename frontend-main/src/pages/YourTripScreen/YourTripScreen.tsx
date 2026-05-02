import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Sym, M3IconBtn, M3Button, M3FAB } from "../../components/M3";

interface Activity {
  startTime: string;
  endTime: string;
  activity: string;
  location: string;
}

interface Itinerary {
  location: string;
  days?: number;
  activities: Activity[];
}

const ACTIVITY_ICONS: Record<string, string> = {
  breakfast: "breakfast_dining", café: "local_cafe", coffee: "local_cafe",
  lunch: "lunch_dining", dinner: "restaurant", food: "restaurant", eat: "restaurant",
  museum: "museum", history: "account_balance", temple: "temple_hindu", church: "church",
  hike: "hiking", hiking: "hiking", trail: "hiking", mountain: "landscape",
  beach: "beach_access", ocean: "waves", swim: "pool",
  spa: "spa", massage: "self_improvement", relax: "self_improvement",
  nightlife: "nightlife", bar: "local_bar", club: "nightlife",
  shopping: "shopping_bag", market: "storefront",
  park: "park", garden: "local_florist", nature: "eco",
  tour: "tour", sightseeing: "photo_camera", photo: "photo_camera",
  transfer: "flight_takeoff", airport: "flight_takeoff", flight: "flight_takeoff",
  hotel: "hotel", check: "hotel",
};

function inferIcon(activity: string): string {
  const lower = activity.toLowerCase();
  for (const [kw, icon] of Object.entries(ACTIVITY_ICONS)) {
    if (lower.includes(kw)) return icon;
  }
  return "star";
}

export default function YourTripScreen() {
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [likedCount, setLikedCount] = useState(0);
  const [savedSnack, setSavedSnack] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("itinerary");
    const liked = localStorage.getItem("liked_videos");
    if (raw) setItinerary(JSON.parse(raw));
    if (liked) setLikedCount(JSON.parse(liked).length);
  }, []);

  const handleShare = () => {
    setSavedSnack(true);
    setTimeout(() => setSavedSnack(false), 2200);
  };

  if (!itinerary) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 24 }}>
        <div style={{ width: 80, height: 80, borderRadius: 20, background: "var(--m3-primary-container)", color: "var(--m3-on-primary-container)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <Sym name="map" size={40} fill={1} />
        </div>
        <div style={{ textAlign: "center" }}>
          <div className="display-font" style={{ fontSize: 24, fontWeight: 500 }}>No itinerary yet</div>
          <div style={{ color: "var(--m3-on-surface-variant)", marginTop: 6, fontSize: 14 }}>Plan a trip to get started.</div>
        </div>
        <M3Button icon="arrow_forward" onClick={() => navigate("/create-trip")}>Plan a trip</M3Button>
      </div>
    );
  }

  const first = itinerary.activities[0];
  const last = itinerary.activities[itinerary.activities.length - 1];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* App bar */}
      <div className="m3-appbar">
        <M3IconBtn icon="arrow_back" onClick={() => navigate("/")} />
        <div className="title">Your trip</div>
        <M3IconBtn icon="ios_share" onClick={handleShare} />
        <M3IconBtn icon="more_vert" />
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "0 0 96px" }}>
        {/* Hero banner */}
        <div
          style={{
            position: "relative",
            height: 240,
            margin: "0 16px 24px",
            borderRadius: "var(--m3-corner-xl)",
            overflow: "hidden",
            background: "linear-gradient(140deg, var(--m3-primary-container), var(--m3-tertiary-container))",
          }}
        >
          <div
            className="m3-blob"
            style={{
              position: "absolute", width: 260, height: 260, right: -80, top: -60,
              background: "radial-gradient(circle at 40% 40%, var(--m3-primary) 0%, transparent 70%)",
              opacity: 0.55,
            }}
          />
          <div style={{ position: "absolute", left: 24, bottom: 24, color: "var(--m3-on-primary-container)" }}>
            {itinerary.days && (
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", opacity: 0.8, marginBottom: 4 }}>
                {itinerary.days}-day itinerary
              </div>
            )}
            <h1
              className="display-font"
              style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 500, margin: 0, letterSpacing: "-0.01em" }}
            >
              {itinerary.location}
            </h1>
            <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 14, flexWrap: "wrap" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Sym name="schedule" size={16} /> {first.startTime} – {last.endTime}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Sym name="check_circle" size={16} fill={1} /> {itinerary.activities.length} activities
              </span>
              {likedCount > 0 && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <Sym name="play_circle" size={16} fill={1} /> {likedCount} video{likedCount > 1 ? "s" : ""} used
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Activity timeline */}
        <div style={{ padding: "0 24px", maxWidth: 800, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 className="display-font" style={{ fontSize: 22, fontWeight: 500, margin: 0 }}>Day plan</h2>
            <M3Button variant="text" icon="edit" onClick={() => navigate("/create-trip")}>Rebuild</M3Button>
          </div>

          {/* Timeline */}
          <div style={{ position: "relative", paddingLeft: 32 }}>
            <div style={{ position: "absolute", left: 15, top: 12, bottom: 12, width: 2, background: "var(--m3-outline-variant)" }} />

            {itinerary.activities.map((act, i) => (
              <div key={i} style={{ position: "relative", marginBottom: 14 }}>
                {/* Timeline dot */}
                <div
                  style={{
                    position: "absolute", left: -28, top: 14,
                    width: 18, height: 18, borderRadius: 9,
                    background: "var(--m3-primary-container)",
                    border: "3px solid var(--m3-surface)",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: 3, background: "var(--m3-primary)" }} />
                </div>

                <div className="m3-card outlined" style={{ padding: 0, overflow: "hidden" }}>
                  <div style={{ padding: "14px 16px" }}>
                    {/* Time row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--m3-on-surface-variant)", marginBottom: 8 }}>
                      <Sym name="schedule" size={14} />
                      {act.startTime} – {act.endTime}
                    </div>

                    {/* Activity row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                          background: "var(--m3-tertiary-container)",
                          color: "var(--m3-on-tertiary-container)",
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <Sym name={inferIcon(act.activity)} size={22} fill={1} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 16, fontWeight: 500 }}>{act.activity}</div>
                        <div
                          style={{
                            fontSize: 13, color: "var(--m3-on-surface-variant)",
                            display: "inline-flex", alignItems: "center", gap: 4, marginTop: 2,
                          }}
                        >
                          <Sym name="location_on" size={14} /> {act.location}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAB */}
      <div style={{ position: "absolute", right: 24, bottom: 24 }}>
        <M3FAB icon="add" label="Add activity" />
      </div>

      {/* Snackbar */}
      {savedSnack && (
        <div style={{ position: "fixed", left: "50%", bottom: 24, transform: "translateX(-50%)", zIndex: 30 }}>
          <div className="m3-snackbar">
            <Sym name="check_circle" size={18} fill={1} /> Trip saved · share link copied
          </div>
        </div>
      )}
    </div>
  );
}

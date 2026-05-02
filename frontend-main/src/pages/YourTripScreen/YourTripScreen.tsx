import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface Activity {
  startTime: string;
  endTime: string;
  activity: string;
  location: string;
}

interface Itinerary {
  location: string;
  activities: Activity[];
}

export default function YourTripScreen() {
  const navigate = useNavigate();
  const [itinerary,  setItinerary]  = useState<Itinerary | null>(null);
  const [likedCount, setLikedCount] = useState(0);

  useEffect(() => {
    const raw   = localStorage.getItem("itinerary");
    const liked = localStorage.getItem("liked_videos");
    if (raw)   setItinerary(JSON.parse(raw));
    if (liked) setLikedCount(JSON.parse(liked).length);
  }, []);

  if (!itinerary) return (
    <div style={{ minHeight: "calc(100vh - 65px)", background: "#0f0f0f", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ marginBottom: "1rem", color: "#888" }}>No itinerary found.</p>
        <button
          onClick={() => navigate("/create-trip")}
          style={{ padding: "0.7rem 1.5rem", background: "#FE2858", border: "none", borderRadius: "8px", color: "white", cursor: "pointer", fontWeight: "bold" }}
        >
          Plan a trip
        </button>
      </div>
    </div>
  );

  const first = itinerary.activities[0];
  const last  = itinerary.activities[itinerary.activities.length - 1];

  return (
    <div style={{ minHeight: "calc(100vh - 65px)", background: "#0f0f0f", color: "white", padding: "3rem 2rem" }}>
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <p style={{ color: "#888", margin: 0, fontSize: "0.95rem" }}>Here's what we've planned.</p>
            <h1 style={{ margin: "0.3rem 0 0.4rem", fontSize: "2.6rem", fontWeight: 800 }}>
              {itinerary.location}
            </h1>
            <p style={{ color: "#666", margin: 0 }}>
              {first.startTime} – {last.endTime} · {itinerary.activities.length} activities
              {likedCount > 0 && ` · inspired by ${likedCount} video${likedCount > 1 ? "s" : ""} you liked`}
            </p>
          </div>
          <button
            onClick={() => navigate("/create-trip")}
            style={{ background: "transparent", border: "1px solid #333", color: "#888", borderRadius: "6px", padding: "0.5rem 1.2rem", cursor: "pointer", fontSize: "0.9rem", whiteSpace: "nowrap" }}
          >
            ← Plan another trip
          </button>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid #1e1e1e", marginBottom: "2.5rem" }} />

        {/* Two-column activity grid on PC */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.2rem" }}>
          {itinerary.activities.map((act, i) => (
            <div key={i} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0,
                background: "#FE2858", display: "flex", alignItems: "center",
                justifyContent: "center", fontWeight: "bold", fontSize: "0.9rem",
              }}>{i + 1}</div>
              <div style={{ background: "#1a1a1a", borderRadius: "12px", padding: "1rem 1.2rem", flex: 1 }}>
                <div style={{ color: "#888", fontSize: "0.82rem", marginBottom: "0.3rem" }}>
                  {act.startTime} – {act.endTime}
                </div>
                <div style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                  {act.activity}
                </div>
                <div style={{ color: "#666", fontSize: "0.88rem" }}>{act.location}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

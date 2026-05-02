import { useNavigate } from "react-router-dom";
import wallpaper from "../../assets/wallpaper.jpg";

export default function GetStartedScreen() {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: "calc(100vh - 65px)",
      backgroundImage: `url(${wallpaper})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {/* Overlay */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)" }} />

      {/* Hero content — left-aligned on PC */}
      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", maxWidth: "960px",
        padding: "4rem 3rem",
      }}>
        <p style={{ color: "#FE2858", fontWeight: 700, fontSize: "0.95rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1rem" }}>
          AI-powered travel planning
        </p>
        <h1 style={{ color: "white", fontSize: "clamp(2.5rem, 5vw, 4.5rem)", fontWeight: 800, lineHeight: 1.1, margin: "0 0 1.25rem" }}>
          Swipe travel videos.<br />Get your perfect itinerary.
        </h1>
        <p style={{ color: "#bbb", fontSize: "1.15rem", maxWidth: "520px", lineHeight: 1.7, margin: "0 0 2.5rem" }}>
          Like the TikToks that match your vibe and we'll build a personalised day-by-day plan — in seconds.
        </p>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/create-trip")}
            style={{
              padding: "0.9rem 2.5rem", fontSize: "1.05rem",
              borderRadius: "50px", border: "none",
              background: "#FE2858", color: "white",
              cursor: "pointer", fontWeight: "bold",
              boxShadow: "0 4px 24px rgba(254,40,88,0.45)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 32px rgba(254,40,88,0.55)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "none"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 24px rgba(254,40,88,0.45)"; }}
          >
            Get Started ✈️
          </button>
          <button
            onClick={() => navigate("/create-trip")}
            style={{
              padding: "0.9rem 2.5rem", fontSize: "1.05rem",
              borderRadius: "50px", border: "1px solid rgba(255,255,255,0.25)",
              background: "rgba(255,255,255,0.08)", color: "white",
              cursor: "pointer", fontWeight: 500, backdropFilter: "blur(4px)",
            }}
          >
            See how it works
          </button>
        </div>

        {/* Social proof strip */}
        <div style={{ marginTop: "3rem", display: "flex", gap: "2.5rem", flexWrap: "wrap" }}>
          {[["🌍", "50+ destinations"], ["🎬", "TikTok-powered"], ["⚡", "Instant results"]].map(([icon, text]) => (
            <div key={text} style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#aaa", fontSize: "0.9rem" }}>
              <span style={{ fontSize: "1.1rem" }}>{icon}</span> {text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

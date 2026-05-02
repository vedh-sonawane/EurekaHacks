import { useNavigate } from "react-router-dom";
import { Sym, M3Button, M3IconBtn } from "../../components/M3";
import wallpaper from "../../assets/wallpaper.jpg";

const HOW_IT_WORKS = [
  {
    icon: "edit_location_alt",
    title: "Tell us where",
    body: "Pick a destination and the kind of trip you want.",
    bg: "var(--m3-primary-container)",
    fg: "var(--m3-on-primary-container)",
    chip: "var(--m3-primary)",
    chipFg: "var(--m3-on-primary)",
    num: "01",
  },
  {
    icon: "swipe",
    title: "Swipe the shorts",
    body: "Like videos that match your vibe; skip the rest.",
    bg: "var(--m3-secondary-container)",
    fg: "var(--m3-on-secondary-container)",
    chip: "var(--m3-secondary)",
    chipFg: "var(--m3-on-secondary)",
    num: "02",
  },
  {
    icon: "event_available",
    title: "Get the itinerary",
    body: "A day-by-day plan, inspired by what you liked.",
    bg: "var(--m3-tertiary-container)",
    fg: "var(--m3-on-tertiary-container)",
    chip: "var(--m3-tertiary)",
    chipFg: "var(--m3-on-tertiary)",
    num: "03",
  },
];

export default function GetStartedScreen() {
  const navigate = useNavigate();

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "auto" }}>
      {/* App bar */}
      <div className="m3-appbar" style={{ padding: "0 8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px", flex: 1 }}>
          <img src="/swipeandfly-icon-color.png" alt="Soar" style={{ width: 36, height: 36, borderRadius: 10 }} />
          <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.01em" }}>Soar</span>
        </div>
        <M3IconBtn icon="account_circle" />
      </div>

      <div style={{ padding: "12px 24px 32px", display: "flex", flexDirection: "column", gap: 32 }}>
        {/* Hero */}
        <div
          style={{
            position: "relative",
            borderRadius: "var(--m3-corner-2xl)",
            padding: "56px 40px 48px",
            backgroundImage: `linear-gradient(115deg, color-mix(in oklch, var(--m3-primary) 75%, transparent) 0%, color-mix(in oklch, var(--m3-tertiary) 30%, transparent) 55%, transparent 100%), url(${wallpaper})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            color: "#fff",
            overflow: "hidden",
            minHeight: 460,
            boxShadow: "0 1px 2px var(--m3-shadow), 0 8px 32px color-mix(in oklch, var(--m3-primary) 20%, transparent)",
          }}
        >
          {/* Organic accent blobs */}
          <div
            className="m3-blob"
            style={{
              position: "absolute", width: 360, height: 360, right: -100, top: -100,
              opacity: 0.55, mixBlendMode: "screen",
              background: "radial-gradient(circle at 35% 35%, oklch(75% 0.18 240) 0%, transparent 70%)",
            }}
          />
          <div
            style={{
              position: "absolute", width: 240, height: 240, right: 60, bottom: -80,
              opacity: 0.35, mixBlendMode: "screen",
              background: "radial-gradient(circle at 50% 50%, oklch(80% 0.15 200) 0%, transparent 70%)",
              borderRadius: "40% 60% 65% 35% / 60% 30% 70% 40%",
            }}
          />

          <div style={{ position: "relative", maxWidth: 620 }}>
            <div
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "6px 14px",
                background: "rgba(255,255,255,.18)", backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,.25)",
                borderRadius: 999, fontSize: 12, fontWeight: 600,
                letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 24,
              }}
            >
              <Sym name="auto_awesome" size={14} fill={1} /> AI travel planner
            </div>
            <h1
              className="display-font"
              style={{
                fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 500,
                lineHeight: 1.02, margin: 0, letterSpacing: "-0.025em",
                textShadow: "0 2px 24px rgba(0,0,0,.25)",
              }}
            >
              Swipe shorts.<br />Skip the planning.
            </h1>
            <p
              style={{
                fontSize: 18, lineHeight: 1.55, marginTop: 18, marginBottom: 32,
                maxWidth: 480, color: "rgba(255,255,255,.92)",
                textShadow: "0 1px 8px rgba(0,0,0,.35)",
              }}
            >
              Like the travel videos that match your vibe — we'll build a day-by-day
              itinerary you'll actually want to follow.
            </p>
            <M3Button icon="arrow_forward" onClick={() => navigate("/create-trip")}>
              Plan a trip
            </M3Button>
          </div>
        </div>

        {/* How it works */}
        <div>
          <h2
            className="display-font"
            style={{ fontSize: 24, fontWeight: 500, margin: "0 0 16px", color: "var(--m3-on-surface)" }}
          >
            Three taps to a perfect trip
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 12,
            }}
          >
            {HOW_IT_WORKS.map((s) => (
              <div
                key={s.num}
                style={{
                  padding: 24,
                  borderRadius: "var(--m3-corner-xl)",
                  background: s.bg,
                  color: s.fg,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between", marginBottom: 18,
                  }}
                >
                  <div
                    style={{
                      width: 48, height: 48, borderRadius: 14,
                      background: s.chip, color: s.chipFg,
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Sym name={s.icon} size={26} fill={1} />
                  </div>
                  <span
                    className="display-font"
                    style={{ fontSize: 32, fontWeight: 500, opacity: 0.35, letterSpacing: "-0.02em" }}
                  >
                    {s.num}
                  </span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 6 }}>{s.title}</div>
                <div style={{ fontSize: 14, opacity: 0.8, lineHeight: 1.5 }}>{s.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

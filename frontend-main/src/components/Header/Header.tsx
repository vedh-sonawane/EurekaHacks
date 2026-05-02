import type { CSSProperties } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/logo-no-background.svg";

const NAV_LINKS = [
  { label: "Plan a Trip", path: "/create-trip", external: false },
];

const STATIC_LINKS = [
  { label: "Shorts", href: "/shorts/" },
];

const navBtnStyle = (active: boolean): CSSProperties => ({
  background: active ? "#FE2858" : "transparent",
  border: active ? "none" : "1px solid #333",
  color: "white",
  borderRadius: "6px",
  padding: "0.45rem 1.1rem",
  cursor: "pointer",
  fontSize: "0.9rem",
  fontWeight: 500,
  transition: "background 0.15s",
  textDecoration: "none",
  display: "inline-block",
});

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header style={{
      background: "#0a0a0a",
      borderBottom: "1px solid #1e1e1e",
      padding: "0 2rem",
      height: "65px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "960px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <img
          src={logo}
          alt="SwipeAndFly"
          onClick={() => navigate("/")}
          style={{ height: "36px", cursor: "pointer" }}
        />
        <nav style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {NAV_LINKS.map(({ label, path }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              style={navBtnStyle(location.pathname === path)}
            >
              {label}
            </button>
          ))}
          {STATIC_LINKS.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              style={navBtnStyle(location.pathname.startsWith(href))}
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

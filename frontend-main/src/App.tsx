import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import GetStartedScreen from "./pages/GetStartedScreen/GetStartedScreen";
import FormScreen from "./pages/FormScreen/FormScreen";
import YourTripScreen from "./pages/YourTripScreen/YourTripScreen";
import SavedTripsScreen from "./pages/SavedTripsScreen/SavedTripsScreen";
import OAuthCallback from "./pages/OAuthCallback";
import "./App.css";
import "./m3.css";

function AppShell() {
  const location = useLocation();
  return (
    <div style={{ flex: 1, padding: 16, display: "flex", justifyContent: "center", overflow: "hidden" }}>
      <div
        key={location.pathname}
        className="m3-screen-enter"
        style={{
          width: "100%",
          maxWidth: 1280,
          height: "100%",
          borderRadius: 28,
          background: "var(--m3-surface)",
          color: "var(--m3-on-surface)",
          boxShadow: "0 1px 4px var(--m3-shadow)",
          overflow: "hidden",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Routes>
          <Route path="/" element={<GetStartedScreen />} />
          <Route path="/create-trip" element={<FormScreen />} />
          <Route path="/create-trip-youtube" element={<FormScreen mode="youtube" />} />
          <Route path="/your-trip" element={<YourTripScreen />} />
          <Route path="/my-trips" element={<SavedTripsScreen />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      {/* /oauth-callback must be outside AppShell — it's a bare popup page */}
      <Routes>
        <Route path="/oauth-callback" element={<OAuthCallback />} />
        <Route path="*" element={<AppShell />} />
      </Routes>
    </Router>
  );
}

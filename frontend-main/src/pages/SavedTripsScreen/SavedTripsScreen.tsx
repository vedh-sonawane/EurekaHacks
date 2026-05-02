import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Sym, M3Button, M3IconBtn } from "../../components/M3";
import { fetchMyItineraries, deleteItinerary, SavedItinerary } from "../../utils/api";

export default function SavedTripsScreen() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, loginWithRedirect, getAccessTokenSilently } = useAuth0();
  const [trips, setTrips] = useState<SavedItinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) { setLoading(false); return; }
    (async () => {
      try {
        const token = await getAccessTokenSilently();
        setTrips(await fetchMyItineraries(token));
      } catch {
        setError("Couldn't load your trips.");
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated, isLoading]);

  const handleLoad = (trip: SavedItinerary) => {
    localStorage.setItem("itinerary", JSON.stringify(trip.data));
    navigate("/your-trip");
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const token = await getAccessTokenSilently();
      await deleteItinerary(id, token);
      setTrips((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError("Couldn't delete that trip.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div className="m3-appbar">
        <M3IconBtn icon="arrow_back" onClick={() => navigate("/")} />
        <div className="title">My trips</div>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "12px 24px 96px", display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 720, display: "flex", flexDirection: "column", gap: 16 }}>

          {isLoading || loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, flexDirection: "column", gap: 12 }}>
              <div className="m3-blob" style={{ width: 60, height: 60 }} />
              <span style={{ color: "var(--m3-on-surface-variant)", fontSize: 14 }}>Loading…</span>
            </div>
          ) : !isAuthenticated ? (
            <div style={{ textAlign: "center", padding: "64px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <Sym name="lock" size={48} style={{ color: "var(--m3-on-surface-variant)" }} />
              <div>
                <div className="display-font" style={{ fontSize: 22, fontWeight: 500 }}>Sign in to see your saved trips</div>
                <div style={{ color: "var(--m3-on-surface-variant)", marginTop: 6, fontSize: 14 }}>Your itineraries are private to you.</div>
              </div>
              <M3Button icon="login" onClick={() => loginWithRedirect()}>Sign in</M3Button>
            </div>
          ) : trips.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <Sym name="luggage" size={48} style={{ color: "var(--m3-on-surface-variant)" }} />
              <div>
                <div className="display-font" style={{ fontSize: 22, fontWeight: 500 }}>No saved trips yet</div>
                <div style={{ color: "var(--m3-on-surface-variant)", marginTop: 6, fontSize: 14 }}>Generate an itinerary and save it here.</div>
              </div>
              <M3Button icon="arrow_forward" onClick={() => navigate("/create-trip")}>Plan a trip</M3Button>
            </div>
          ) : (
            <>
              <h1 className="display-font" style={{ fontSize: 28, fontWeight: 500, margin: 0 }}>
                {trips.length} saved trip{trips.length !== 1 ? "s" : ""}
              </h1>
              {error && <p style={{ color: "var(--m3-error)", fontSize: 14, margin: 0 }}>{error}</p>}
              {trips.map((trip) => {
                const date = new Date(trip.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
                const days = (trip.data as { days?: number }).days;
                return (
                  <div
                    key={trip.id}
                    className="m3-card outlined"
                    style={{ padding: 0, overflow: "hidden", display: "flex", alignItems: "stretch" }}
                  >
                    <button
                      onClick={() => handleLoad(trip)}
                      style={{
                        flex: 1, padding: "18px 20px", textAlign: "left", background: "none",
                        border: "none", cursor: "pointer", display: "flex", flexDirection: "column", gap: 6,
                      }}
                    >
                      <div style={{ fontSize: 18, fontWeight: 500, color: "var(--m3-on-surface)" }}>{trip.location}</div>
                      <div style={{ fontSize: 13, color: "var(--m3-on-surface-variant)", display: "flex", gap: 12 }}>
                        {days && <span><Sym name="calendar_today" size={13} /> {days} days</span>}
                        <span><Sym name="schedule" size={13} /> {date}</span>
                      </div>
                    </button>
                    <button
                      onClick={() => handleDelete(trip.id)}
                      disabled={deletingId === trip.id}
                      style={{
                        padding: "0 16px", background: "none", border: "none", cursor: "pointer",
                        color: "var(--m3-on-surface-variant)", borderLeft: "1px solid var(--m3-outline-variant)",
                        opacity: deletingId === trip.id ? 0.4 : 1,
                      }}
                    >
                      <Sym name="delete" size={20} />
                    </button>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

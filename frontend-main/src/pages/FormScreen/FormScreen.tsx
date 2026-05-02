import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ActivityTag } from "../../utils/types";
import { Sym, M3Button, M3IconBtn, M3FAB, M3Chip, M3TextField, M3Segmented, StepBar } from "../../components/M3";

const ALL_TAGS = Object.values(ActivityTag);
const SEASONS = ["Spring", "Summer", "Fall", "Winter"] as const;
type Season = (typeof SEASONS)[number];

const SEASON_ICONS: Record<Season, string> = {
  Spring: "local_florist",
  Summer: "wb_sunny",
  Fall: "eco",
  Winter: "ac_unit",
};

const TAG_ICONS: Partial<Record<ActivityTag, string>> = {
  [ActivityTag.Sightseeing]: "tour",
  [ActivityTag.Hiking]: "hiking",
  [ActivityTag.Dining]: "restaurant",
  [ActivityTag.Adventure]: "paragliding",
  [ActivityTag.Relaxation]: "self_improvement",
  [ActivityTag.Nightlife]: "nightlife",
  [ActivityTag.CulturalExperience]: "temple_buddhist",
  [ActivityTag.Camping]: "forest",
  [ActivityTag.Photography]: "photo_camera",
  [ActivityTag.Entertainment]: "theater_comedy",
  [ActivityTag.FamilyFun]: "family_restroom",
  [ActivityTag.ThemePark]: "attractions",
};

type ShortVideo = {
  videoId: string;
  title: string;
  thumbnail: string;
  uploader: string;
  viewCount: number | null;
};

async function fetchShorts(location: string, page = 0, extra = ""): Promise<ShortVideo[]> {
  const params = new URLSearchParams({ page: String(page), location });
  if (extra) params.set("extra", extra);
  const res = await fetch(`/api/feed?${params}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.items ?? [];
}

const MOCK_DAY_ACTIVITIES = (location: string, tags: string[], day: number) => [
  { startTime: "08:00", endTime: "09:30", activity: "Breakfast at a local café", location: `${location} City Center` },
  { startTime: "10:00", endTime: "12:00", activity: tags.includes("History") ? `Day ${day} museum visit` : `Morning walk — area ${day}`, location: `${location} District ${day}` },
  { startTime: "12:30", endTime: "13:30", activity: "Lunch", location: `${location} Market Square ${day}` },
  { startTime: "14:00", endTime: "16:00", activity: tags.includes("Hiking") ? `Trail ${day}` : tags.includes("Beach") ? `Beach ${day}` : `Gardens ${day}`, location: `${location} Zone ${day}` },
  { startTime: "19:00", endTime: "21:00", activity: "Dinner", location: `${location} Restaurant Row ${day}` },
];

const MOCK_ITINERARY = (location: string, tags: string[], days: number) => ({
  location,
  days_plan: Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    activities: MOCK_DAY_ACTIVITIES(location, tags, i + 1),
  })),
});

const TAG_KEYWORDS: Partial<Record<ActivityTag, string[]>> = {
  [ActivityTag.Sightseeing]: ["sightseeing", "landmark", "monument", "attractions", "tourist"],
  [ActivityTag.Hiking]: ["hike", "hiking", "trail", "trek", "mountain"],
  [ActivityTag.Dining]: ["food", "restaurant", "eat", "cuisine", "dining", "dish"],
  [ActivityTag.Adventure]: ["adventure", "extreme", "thrill", "adrenaline", "outdoor"],
  [ActivityTag.Relaxation]: ["relax", "peaceful", "calm", "tranquil", "retreat"],
  [ActivityTag.Nightlife]: ["nightlife", "bar", "club", "night", "party"],
  [ActivityTag.CulturalExperience]: ["culture", "cultural", "tradition", "local", "temple", "heritage"],
  [ActivityTag.Camping]: ["camp", "camping", "outdoors", "wilderness", "tent"],
  [ActivityTag.Photography]: ["photography", "photo", "instagram", "scenic", "viewpoint"],
  [ActivityTag.Entertainment]: ["entertainment", "show", "concert", "performance", "theater"],
  [ActivityTag.FamilyFun]: ["family", "kids", "family-friendly", "children", "playground"],
  [ActivityTag.ThemePark]: ["theme park", "amusement", "rides", "disney", "universal"],
};

function spreadSimilar(videos: ShortVideo[]): ShortVideo[] {
  if (videos.length <= 2) return videos;
  const stop = new Set(["a","an","the","in","at","of","to","and","for","with","my","your","this","is","on","from"]);
  const kw = (title: string) => new Set(title.toLowerCase().split(/\W+/).filter((w) => w.length > 3 && !stop.has(w)));
  const overlaps = (a: ShortVideo, b: ShortVideo) => { const ka = kw(a.title); for (const w of kw(b.title)) if (ka.has(w)) return true; return false; };
  const result = [...videos];
  for (let i = 0; i < result.length - 1; i++) {
    if (overlaps(result[i], result[i + 1])) {
      for (let j = i + 2; j < result.length; j++) {
        if (!overlaps(result[i], result[j])) { [result[i + 1], result[j]] = [result[j], result[i + 1]]; break; }
      }
    }
  }
  return result;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function inferTags(title: string): ActivityTag[] {
  const lower = title.toLowerCase();
  return ALL_TAGS.filter((tag) => TAG_KEYWORDS[tag]?.some((kw) => lower.includes(kw)));
}

const TAG_SEARCH_TERMS: Partial<Record<ActivityTag, string>> = {
  [ActivityTag.Sightseeing]: "sightseeing",
  [ActivityTag.Hiking]: "hiking", [ActivityTag.Dining]: "food tour",
  [ActivityTag.Adventure]: "adventure", [ActivityTag.Relaxation]: "relaxation",
  [ActivityTag.Nightlife]: "nightlife",
  [ActivityTag.CulturalExperience]: "cultural experience",
  [ActivityTag.Camping]: "camping",
  [ActivityTag.Photography]: "photography spots",
  [ActivityTag.Entertainment]: "entertainment",
  [ActivityTag.FamilyFun]: "family friendly", [ActivityTag.ThemePark]: "theme park",
};

const KNOWN_PLACES = [
  "japan","tokyo","osaka","kyoto","france","paris","italy","rome","milan","venice",
  "spain","madrid","barcelona","thailand","bangkok","phuket","indonesia","bali","jakarta",
  "vietnam","hanoi","india","mumbai","delhi","goa","china","beijing","shanghai",
  "korea","seoul","australia","sydney","melbourne","usa","america","new york","los angeles",
  "miami","hawaii","las vegas","uk","england","london","germany","berlin","munich",
  "netherlands","amsterdam","greece","athens","santorini","turkey","istanbul",
  "mexico","cancun","brazil","rio de janeiro","canada","toronto","vancouver",
  "singapore","malaysia","kuala lumpur","philippines","manila","cebu","palawan",
  "new zealand","auckland","queenstown","egypt","cairo","morocco","marrakech",
  "dubai","abu dhabi","uae","maldives","portugal","lisbon","porto","croatia","dubrovnik",
  "iceland","reykjavik","peru","lima","argentina","buenos aires","colombia","bogota",
  "switzerland","zurich","austria","vienna","czech republic","prague","hungary","budapest",
  "poland","warsaw","taiwan","taipei","hong kong","cambodia","siem reap",
  "nepal","kathmandu","kenya","nairobi","south africa","cape town","cuba","havana",
  "costa rica","jamaica","bahamas",
];

function parseLocationTerms(location: string): string[] {
  return location.toLowerCase().split(/[\s,]+/).filter((t) => t.length > 2);
}

function isLocationMatch(title: string, locationTerms: string[]): boolean {
  const lower = title.toLowerCase();
  if (locationTerms.some((t) => lower.includes(t))) return true;
  for (const place of KNOWN_PLACES) {
    if (lower.includes(place) && !locationTerms.some((t) => place.includes(t) || t.includes(place))) return false;
  }
  return true;
}

// ── Trip Details ──────────────────────────────────────────────────────────────
type TripData = { location: string; days: number; season: Season; tags: ActivityTag[]; comments: string };

type LocationSuggestion = { name: string; country: string; admin1?: string };

function TripDetailsStep({ onNext, onBack }: { onNext: (data: TripData) => void; onBack: () => void }) {
  const [location, setLocation] = useState("");
  const [days, setDays] = useState(5);
  const [season, setSeason] = useState<Season>("Spring");
  const [tags, setTags] = useState<ActivityTag[]>([]);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleTag = (tag: ActivityTag) =>
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);

  const handleLocationChange = (value: string) => {
    setLocation(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(value)}&count=6&language=en&format=json`);
        const data = await res.json();
        const results: LocationSuggestion[] = (data.results ?? []).map((r: { name: string; country: string; admin1?: string }) => ({ name: r.name, country: r.country, admin1: r.admin1 }));
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch { /* ignore */ }
    }, 300);
  };

  const selectSuggestion = (s: LocationSuggestion) => {
    const label = s.admin1 ? `${s.name}, ${s.admin1}, ${s.country}` : `${s.name}, ${s.country}`;
    setLocation(label);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleNext = () => {
    if (!location.trim() || tags.length === 0) {
      setError("Please enter a destination and select at least one activity vibe.");
      return;
    }
    setError("");
    onNext({ location, days, season, tags, comments: "" });
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* App bar */}
      <div className="m3-appbar">
        <M3IconBtn icon="arrow_back" onClick={onBack} />
        <div className="title">Plan a trip</div>
        <div style={{ padding: "0 16px" }}><StepBar step={0} /></div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", padding: "8px 24px 120px", display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 720, display: "flex", flexDirection: "column", gap: 28 }}>
          <div>
            <h1 className="display-font" style={{ fontSize: 36, fontWeight: 500, margin: 0, letterSpacing: "-0.01em" }}>Where to?</h1>
            <p style={{ color: "var(--m3-on-surface-variant)", marginTop: 8, fontSize: 15 }}>
              Tell us a bit about the trip and we'll find shorts to inspire it.
            </p>
          </div>

          {/* Destination with autocomplete */}
          <div style={{ position: "relative" }}>
            <M3TextField
              label="Destination"
              leadingIcon="location_on"
              value={location}
              onChange={(e) => handleLocationChange((e.target as HTMLInputElement).value)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
            />
            {showSuggestions && (
              <div style={{
                position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 100,
                background: "var(--m3-surface-container)", borderRadius: 12,
                boxShadow: "0 4px 16px var(--m3-shadow)", overflow: "hidden",
              }}>
                {suggestions.map((s, i) => {
                  const label = s.admin1 ? `${s.name}, ${s.admin1}, ${s.country}` : `${s.name}, ${s.country}`;
                  return (
                    <div
                      key={i}
                      onMouseDown={() => selectSuggestion(s)}
                      style={{
                        padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12,
                        borderBottom: i < suggestions.length - 1 ? "1px solid var(--m3-outline-variant)" : "none",
                        fontSize: 14,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--m3-surface-container-high)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <Sym name="location_on" size={18} style={{ color: "var(--m3-on-surface-variant)", flexShrink: 0 }} />
                      {label}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Days */}
          <div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: "var(--m3-on-surface-variant)" }}>Trip length</div>
              <div className="display-font" style={{ fontSize: 28, fontWeight: 500 }}>
                {days} <span style={{ fontSize: 14, color: "var(--m3-on-surface-variant)", fontWeight: 400 }}>day{days !== 1 ? "s" : ""}</span>
              </div>
            </div>
            <input type="range" min="1" max="14" value={days} onChange={(e) => setDays(+e.target.value)} />
          </div>

          {/* Season */}
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: "var(--m3-on-surface-variant)", marginBottom: 10 }}>Season</div>
            <M3Segmented
              value={season}
              onChange={(v) => setSeason(v as Season)}
              options={SEASONS.map((s) => ({ value: s, label: s, icon: SEASON_ICONS[s] }))}
              style={{ flexWrap: "wrap" }}
            />
          </div>

          {/* Vibes */}
          <div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: "var(--m3-on-surface-variant)" }}>What's your vibe?</div>
              <div style={{ fontSize: 12, color: "var(--m3-on-surface-variant)" }}>{tags.length} selected</div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {ALL_TAGS.map((tag) => (
                <M3Chip
                  key={tag}
                  icon={TAG_ICONS[tag]}
                  selected={tags.includes(tag)}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </M3Chip>
              ))}
            </div>
          </div>

          {error && (
            <p style={{ color: "var(--m3-error)", fontSize: 14, margin: 0 }}>{error}</p>
          )}
        </div>
      </div>

      {/* Bottom action bar */}
      <div
        style={{
          position: "sticky", bottom: 0, padding: 16,
          background: "linear-gradient(to top, var(--m3-surface) 60%, transparent)",
          display: "flex", justifyContent: "flex-end", gap: 12,
          borderTop: "1px solid var(--m3-outline-variant)",
        }}
      >
        <M3Button variant="text" onClick={onBack}>Cancel</M3Button>
        <M3Button icon="swipe" onClick={handleNext}>Next: Swipe videos</M3Button>
      </div>
    </div>
  );
}

// ── Swipe step ────────────────────────────────────────────────────────────────
function SwipeStep({
  tripData,
  onDone,
  onBack,
}: {
  tripData: TripData;
  onDone: (liked: string[]) => void;
  onBack: () => void;
}) {
  const { location, tags: initialTags, season } = tripData;
  const [queue, setQueue] = useState<ShortVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [index, setIndex] = useState(0);
  const [liked, setLiked] = useState<string[]>([]);
  const [animDir, setAnimDir] = useState<"left" | "right" | null>(null);
  const animTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const weights = useRef<Record<string, number>>(
    Object.fromEntries(ALL_TAGS.map((tag) => [tag, initialTags.includes(tag) ? 1.0 : 0.3])),
  );
  const pageRef = useRef(Math.floor(Math.random() * 6));
  const fetching = useRef(false);
  const seenIds = useRef(new Set<string>());

  const getNextExtra = () => {
    const candidates = Object.entries(weights.current).filter(([, w]) => w > 0.6).sort(([, a], [, b]) => b - a);
    const seasonTerm = season.toLowerCase();
    if (candidates.length === 0) return [location, "vacation", seasonTerm].filter(Boolean).join(" ");
    const total = candidates.reduce((sum, [, w]) => sum + w * w, 0);
    let rand = Math.random() * total;
    let chosen = candidates[0][0];
    for (const [tag, w] of candidates) { rand -= w * w; if (rand <= 0) { chosen = tag; break; } }
    const activity = TAG_SEARCH_TERMS[chosen as ActivityTag] ?? chosen.toLowerCase();
    return [location, "vacation", seasonTerm, activity].filter(Boolean).join(" ");
  };

  const locationTerms = parseLocationTerms(location);
  const GENERIC_TITLE = /places (on earth|in the world|around the world|you (must|need to|should) visit)|top \d+.*(places|destinations|spots|countries)|most (beautiful|amazing|incredible|stunning|underrated).*(places|destinations|countries|spots)|best (places|destinations|spots) (to visit|in the world|on earth)|\d+ (places|destinations|countries|cities) (that|you|to)/i;
  const filterRelevant = (items: ShortVideo[]): ShortVideo[] =>
    items.filter((v) => isLocationMatch(v.title, locationTerms) && !GENERIC_TITLE.test(v.title));

  const fetchMore = async () => {
    if (fetching.current) return;
    fetching.current = true;
    try {
      const extra = getNextExtra();
      const items = await fetchShorts(location, pageRef.current, extra);
      pageRef.current++;
      const fresh = spreadSimilar(shuffle(filterRelevant(items.filter((v) => !seenIds.current.has(v.videoId)))));
      fresh.forEach((v) => seenIds.current.add(v.videoId));
      if (fresh.length > 0) setQueue((prev) => [...prev, ...fresh]);
    } catch { /* silent */ } finally { fetching.current = false; }
  };

  useEffect(() => {
    let active = true;
    const startPage = pageRef.current;
    const extra = getNextExtra();
    (async () => {
      try {
        const items = await fetchShorts(location, startPage, extra);
        if (!active) return;
        pageRef.current = startPage + 1;
        const fresh = spreadSimilar(shuffle(filterRelevant(items.filter((v) => !seenIds.current.has(v.videoId)))));
        fresh.forEach((v) => seenIds.current.add(v.videoId));
        if (fresh.length > 0) setQueue(fresh);
        else setError("No videos found for this location.");
      } catch {
        if (active) setError("Couldn't load shorts — is the shorts backend running?");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (queue.length === 0) return;
    for (let ahead = 1; ahead <= 2; ahead++) {
      const el = videoRefs.current[index + ahead];
      const v = queue[index + ahead];
      if (el && v && !el.src) el.src = `/api/proxy?v=${v.videoId}`;
    }
    const currentEl = videoRefs.current[index];
    if (currentEl) {
      if (!currentEl.src) currentEl.src = `/api/proxy?v=${queue[index].videoId}`;
      currentEl.play().catch(() => {});
    }
    if (index > 0) videoRefs.current[index - 1]?.pause();
    if (queue.length - index <= 5) fetchMore();
  }, [index, queue]);

  const updateWeights = (video: ShortVideo, dir: "left" | "right") => {
    inferTags(video.title).forEach((tag) => {
      const w = weights.current[tag] ?? 0.3;
      const isDifferent = !initialTags.includes(tag);
      weights.current[tag] = dir === "right" ? Math.min(2.0, w + 0.3) : Math.max(0.0, w - (isDifferent ? 0.5 : 0.3));
    });
  };

  const swipe = (dir: "left" | "right") => {
    if (animTimeout.current || loading || queue.length === 0) return;
    const current = queue[index];
    updateWeights(current, dir);
    if (dir === "right") fetchMore();
    setAnimDir(dir);
    animTimeout.current = setTimeout(() => {
      const newLiked = dir === "right" ? [...liked, current.videoId] : liked;
      if (dir === "right") setLiked(newLiked);
      setAnimDir(null);
      animTimeout.current = null;
      if (index + 1 >= queue.length) onDone(newLiked);
      else setIndex((i) => i + 1);
    }, 350);
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") swipe("right");
      else if (e.key === "ArrowLeft") swipe("left");
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  if (!loading && queue.length > 0 && index >= queue.length) { onDone(liked); return null; }

  const current = queue[index];
  const remaining = queue.length - index;

  const cardAnim: React.CSSProperties = {
    transition: "transform 0.35s var(--m3-easing-emph), opacity 0.35s var(--m3-easing-emph)",
    transform: animDir === "right" ? "translateX(120%) rotate(14deg)" : animDir === "left" ? "translateX(-120%) rotate(-14deg)" : "none",
    opacity: animDir ? 0 : 1,
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* App bar */}
      <div className="m3-appbar">
        <M3IconBtn icon="arrow_back" onClick={onBack} />
        <div className="title">Swipe to inspire</div>
        <div style={{ padding: "0 16px" }}><StepBar step={1} /></div>
      </div>

      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 360px)",
          gap: 32,
          padding: "12px 32px 24px",
          alignItems: "center",
          maxWidth: 1100,
          width: "100%",
          margin: "0 auto",
          overflow: "hidden",
        }}
      >
        {/* Video card deck */}
        <div style={{ position: "relative", maxWidth: 380, justifySelf: "center", width: "100%", aspectRatio: "9/16" }}>
          {/* Shadow card */}
          {current && index + 1 < queue.length && (
            <div
              className="short-card"
              style={{ position: "absolute", inset: 0, transform: "translate(8px, 12px) rotate(2deg) scale(0.96)", opacity: 0.6, background: "var(--m3-surface-container-high)" }}
            />
          )}

          {/* Main card */}
          <div style={{ position: "absolute", inset: 0, ...cardAnim, boxShadow: "0 24px 60px var(--m3-shadow)", borderRadius: "var(--m3-corner-xl)", overflow: "hidden" }}>
            {/* Videos */}
            <div style={{ position: "relative", width: "100%", height: "100%", background: "var(--m3-surface-container-highest)" }}>
              {loading ? (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
                  <div className="m3-blob" style={{ width: 80, height: 80, animation: "m3-blob1 4s ease-in-out infinite" }} />
                  <span style={{ color: "var(--m3-on-surface-variant)", fontSize: 14 }}>Loading shorts…</span>
                </div>
              ) : error ? (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", textAlign: "center", color: "var(--m3-on-surface-variant)", fontSize: 14 }}>
                  {error}
                </div>
              ) : (
                queue.map((_, i) => (
                  <video
                    key={i}
                    ref={(el) => { videoRefs.current[i] = el; }}
                    loop muted playsInline preload="auto"
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", display: i === index ? "block" : "none" }}
                  />
                ))
              )}
            </div>

            {/* Swipe stamps */}
            {current && (
              <>
                <div style={{ position: "absolute", top: 80, left: 24, padding: "8px 16px", borderRadius: 10, border: "4px solid #34d399", color: "#34d399", fontWeight: 700, fontSize: 22, transform: "rotate(-12deg)", opacity: animDir === "right" ? 1 : 0, transition: "opacity .15s" }}>LIKED</div>
                <div style={{ position: "absolute", top: 80, right: 24, padding: "8px 16px", borderRadius: 10, border: "4px solid #f87171", color: "#f87171", fontWeight: 700, fontSize: 22, transform: "rotate(12deg)", opacity: animDir === "left" ? 1 : 0, transition: "opacity .15s" }}>SKIP</div>
              </>
            )}

            {/* Video info overlay */}
            {current && !loading && !error && (
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "48px 16px 16px", background: "linear-gradient(to top, rgba(0,0,0,.7), transparent)", color: "white" }}>
                <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 4 }}>{current.uploader}</div>
                <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>{current.title}</div>
              </div>
            )}
          </div>
        </div>

        {/* Controls panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Trip context */}
          <div className="m3-card filled" style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <Sym name="location_on" size={20} fill={1} style={{ color: "var(--m3-primary)" }} />
              <div style={{ fontSize: 16, fontWeight: 500 }}>{location}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ background: "var(--m3-surface-container-low)", borderRadius: 12, padding: "10px 12px" }}>
                <div style={{ fontSize: 11, color: "var(--m3-on-surface-variant)", textTransform: "uppercase", letterSpacing: ".06em" }}>Liked</div>
                <div className="display-font" style={{ fontSize: 24, fontWeight: 500, color: "var(--m3-primary)" }}>{liked.length}</div>
              </div>
              <div style={{ background: "var(--m3-surface-container-low)", borderRadius: 12, padding: "10px 12px" }}>
                <div style={{ fontSize: 11, color: "var(--m3-on-surface-variant)", textTransform: "uppercase", letterSpacing: ".06em" }}>Remaining</div>
                <div className="display-font" style={{ fontSize: 24, fontWeight: 500 }}>{loading ? "…" : remaining}</div>
              </div>
            </div>
          </div>

          {/* FAB controls */}
          <div style={{ display: "flex", gap: 14, alignItems: "center", justifyContent: "center" }}>
            <M3FAB icon="close" onClick={() => swipe("left")} disabled={loading || !!error} />
            <M3FAB icon="favorite" variant="primary" size="large" onClick={() => swipe("right")} disabled={loading || !!error} />
            <M3FAB icon="bookmark" onClick={() => swipe("right")} disabled={loading || !!error} />
          </div>
          <div style={{ textAlign: "center", fontSize: 12, color: "var(--m3-on-surface-variant)" }}>
            Skip · Love it · Save for later
          </div>

          {/* Keyboard hint + done */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 4px" }}>
            <div style={{ fontSize: 12, color: "var(--m3-on-surface-variant)" }}>
              <kbd style={{ padding: "2px 6px", background: "var(--m3-surface-container-high)", borderRadius: 4, fontFamily: "monospace" }}>←</kbd> skip &nbsp;
              <kbd style={{ padding: "2px 6px", background: "var(--m3-surface-container-high)", borderRadius: 4, fontFamily: "monospace" }}>→</kbd> love
            </div>
            <M3Button variant="text" onClick={() => onDone(liked)} disabled={liked.length === 0}>
              I'm done →
            </M3Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Review step ───────────────────────────────────────────────────────────────
function ReviewStep({
  tripData,
  likedVideos,
  onBack,
  onGenerate,
  generating,
}: {
  tripData: TripData;
  likedVideos: string[];
  onBack: () => void;
  onGenerate: () => void;
  generating?: boolean;
}) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div className="m3-appbar">
        <M3IconBtn icon="arrow_back" onClick={onBack} />
        <div className="title">Review</div>
        <div style={{ padding: "0 16px" }}><StepBar step={2} /></div>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "12px 32px 120px", display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 800, display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <h1 className="display-font" style={{ fontSize: 36, fontWeight: 500, margin: 0, letterSpacing: "-0.01em" }}>Looks good?</h1>
            <p style={{ color: "var(--m3-on-surface-variant)", marginTop: 6 }}>
              We'll build a {tripData.days}-day plan for {tripData.location} from {likedVideos.length} videos you liked.
            </p>
          </div>

          {/* Summary card */}
          <div className="m3-card filled" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--m3-outline-variant)" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--m3-primary)", letterSpacing: ".06em", textTransform: "uppercase" }}>Trip summary</div>
              <div className="display-font" style={{ fontSize: 28, fontWeight: 500, marginTop: 4 }}>{tripData.location}</div>
              <div style={{ color: "var(--m3-on-surface-variant)", marginTop: 2 }}>
                {tripData.days} days · {tripData.season}
              </div>
            </div>
            <div style={{ padding: 16, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {tripData.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "6px 12px", borderRadius: 8,
                    background: "var(--m3-surface-container-low)", fontSize: 13, fontWeight: 500,
                  }}
                >
                  {TAG_ICONS[tag] && <Sym name={TAG_ICONS[tag]!} size={16} />} {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Liked videos */}
          {likedVideos.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
                <h2 className="display-font" style={{ fontSize: 20, fontWeight: 500, margin: 0 }}>
                  Inspired by {likedVideos.length} video{likedVideos.length !== 1 ? "s" : ""}
                </h2>
                <M3Button variant="text" icon="refresh" onClick={onBack}>Swipe more</M3Button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 12 }}>
                {likedVideos.map((id) => (
                  <div key={id} style={{ aspectRatio: "9/16", position: "relative", overflow: "hidden", borderRadius: 16 }}>
                    <img
                      src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
                      alt="liked short"
                      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {tripData.comments && (
            <div className="m3-card outlined" style={{ padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--m3-on-surface-variant)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Your notes</div>
              <div style={{ fontSize: 14 }}>{tripData.comments}</div>
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          position: "sticky", bottom: 0, padding: 16,
          background: "linear-gradient(to top, var(--m3-surface) 60%, transparent)",
          display: "flex", justifyContent: "flex-end", gap: 12,
          borderTop: "1px solid var(--m3-outline-variant)",
        }}
      >
        <M3Button variant="outlined" icon="arrow_back" onClick={onBack}>Back</M3Button>
        <M3Button
          icon="auto_awesome"
          onClick={onGenerate}
          disabled={generating}
          style={{ opacity: generating ? 0.6 : 1 }}
        >
          {generating ? "Generating…" : "Generate itinerary"}
        </M3Button>
      </div>
    </div>
  );
}

// ── Main FormScreen ───────────────────────────────────────────────────────────
export default function FormScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [tripData, setTripData] = useState<TripData | null>(null);
  const [likedVideos, setLikedVideos] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const prompt = [
        `Create a ${tripData!.days}-day travel plan`,
        ` - Location: ${tripData!.location}`,
        " - Start time: 08:00",
        " - End time: 21:00",
        ` - Activities: ${tripData!.tags.join(", ")}`,
        ` - Season: ${tripData!.season}`,
        tripData!.comments ? ` - Special notes: ${tripData!.comments}` : null,
      ].filter(Boolean).join("\n");

      const videoUrls = likedVideos.map((id) => `https://www.youtube.com/watch?v=${id}`).join(",");
      const params = new URLSearchParams({ prompt });
      if (videoUrls) params.set("video_urls", videoUrls);

      const res = await fetch(`/itinerary-api/generate_itinerary?${params}`, { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const itinerary = { location: tripData!.location, days: tripData!.days, ...data.itinerary };
      localStorage.setItem("itinerary", JSON.stringify(itinerary));
      localStorage.setItem("liked_videos", JSON.stringify(likedVideos));
      navigate("/your-trip");
    } catch (e) {
      console.error("Itinerary backend unavailable, using mock:", e);
      const itinerary = MOCK_ITINERARY(tripData!.location, tripData!.tags.map(String), tripData!.days);
      localStorage.setItem("itinerary", JSON.stringify(itinerary));
      localStorage.setItem("liked_videos", JSON.stringify(likedVideos));
      navigate("/your-trip");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {step === 0 && (
        <TripDetailsStep
          onNext={(data) => { setTripData(data); setStep(1); }}
          onBack={() => navigate("/")}
        />
      )}
      {step === 1 && tripData && (
        <SwipeStep
          tripData={tripData}
          onDone={(liked) => { setLikedVideos(liked); setStep(2); }}
          onBack={() => setStep(0)}
        />
      )}
      {step === 2 && tripData && (
        <ReviewStep
          tripData={tripData}
          likedVideos={likedVideos}
          onBack={() => setStep(1)}
          onGenerate={handleGenerate}
          generating={generating}
        />
      )}
    </div>
  );
}

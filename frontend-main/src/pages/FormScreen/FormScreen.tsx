import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ActivityTag } from "../../utils/types";

const ALL_TAGS = Object.values(ActivityTag);
const SEASONS = ["Spring", "Summer", "Fall", "Winter"] as const;
type Season = (typeof SEASONS)[number];

type ShortVideo = {
  videoId: string;
  title: string;
  thumbnail: string;
  uploader: string;
  viewCount: number | null;
};

async function fetchShorts(
  location: string,
  page = 0,
  extra = "",
): Promise<ShortVideo[]> {
  const params = new URLSearchParams({ page: String(page), location });
  if (extra) params.set("extra", extra);
  const res = await fetch(`/api/feed?${params}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.items ?? [];
}

const MOCK_ITINERARY = (location: string, tags: string[]) => ({
  location,
  activities: [
    {
      startTime: "8:00",
      endTime: "9:30",
      activity: "Breakfast at a local café",
      location: `${location} City Center`,
    },
    {
      startTime: "10:00",
      endTime: "12:00",
      activity:
        tags.includes("Museum") || tags.includes("History")
          ? "Visit the main historical museum"
          : "Morning exploration walk",
      location: `${location} Old Town`,
    },
    {
      startTime: "12:30",
      endTime: "13:30",
      activity: tags.includes("Dining")
        ? "Lunch at a renowned local restaurant"
        : "Lunch at a street food market",
      location: `${location} Market Square`,
    },
    {
      startTime: "14:00",
      endTime: "16:00",
      activity: tags.includes("Hiking")
        ? "Scenic hike with city views"
        : tags.includes("Beach")
          ? "Afternoon at the beach"
          : "Explore the botanical gardens",
      location: `${location} East Side`,
    },
    {
      startTime: "16:30",
      endTime: "18:00",
      activity: tags.includes("Shopping")
        ? "Shopping at local boutiques"
        : "Wander through the local markets",
      location: `${location} Shopping District`,
    },
    {
      startTime: "19:00",
      endTime: "21:00",
      activity: tags.includes("Nightlife")
        ? "Bar hopping in the nightlife district"
        : "Dinner at a rooftop restaurant",
      location: `${location} Skyline Avenue`,
    },
  ],
});

// ── Tag → keyword map for inferring video content from title ──────────────────
const TAG_KEYWORDS: Partial<Record<ActivityTag, string[]>> = {
  [ActivityTag.Sightseeing]: [
    "sightseeing",
    "landmark",
    "monument",
    "attractions",
    "tourist",
  ],
  [ActivityTag.Beach]: ["beach", "ocean", "coast", "surf", "sand", "sea"],
  [ActivityTag.Hiking]: ["hike", "hiking", "trail", "trek", "mountain"],
  [ActivityTag.Dining]: [
    "food",
    "restaurant",
    "eat",
    "cuisine",
    "dining",
    "dish",
  ],
  [ActivityTag.Adventure]: [
    "adventure",
    "extreme",
    "thrill",
    "adrenaline",
    "outdoor",
  ],
  [ActivityTag.Relaxation]: [
    "relax",
    "peaceful",
    "calm",
    "tranquil",
    "retreat",
  ],
  [ActivityTag.Nightlife]: ["nightlife", "bar", "club", "night", "party"],
  [ActivityTag.Wildlife]: ["wildlife", "animals", "safari", "nature", "wild"],
  [ActivityTag.CulturalExperience]: [
    "culture",
    "cultural",
    "tradition",
    "local",
    "temple",
    "heritage",
  ],
  [ActivityTag.Festival]: [
    "festival",
    "celebration",
    "event",
    "carnival",
    "fair",
  ],
  [ActivityTag.RoadTrip]: [
    "road trip",
    "roadtrip",
    "drive",
    "driving",
    "scenic drive",
  ],
  [ActivityTag.Camping]: ["camp", "camping", "outdoors", "wilderness", "tent"],
  [ActivityTag.Spa]: ["spa", "massage", "wellness", "hot spring", "thermal"],
  [ActivityTag.Photography]: [
    "photography",
    "photo",
    "instagram",
    "scenic",
    "viewpoint",
  ],
  [ActivityTag.Entertainment]: [
    "entertainment",
    "show",
    "concert",
    "performance",
    "theater",
  ],
  [ActivityTag.History]: [
    "history",
    "historical",
    "ancient",
    "heritage",
    "ruins",
  ],
  [ActivityTag.FamilyFun]: [
    "family",
    "kids",
    "family-friendly",
    "children",
    "playground",
  ],
  [ActivityTag.ThemePark]: [
    "theme park",
    "amusement",
    "rides",
    "disney",
    "universal",
  ],
};

function spreadSimilar(videos: ShortVideo[]): ShortVideo[] {
  if (videos.length <= 2) return videos;
  const stop = new Set(["a","an","the","in","at","of","to","and","for","with","my","your","this","is","on","from"]);
  const kw = (title: string) =>
    new Set(title.toLowerCase().split(/\W+/).filter((w) => w.length > 3 && !stop.has(w)));
  const overlaps = (a: ShortVideo, b: ShortVideo) => {
    const ka = kw(a.title);
    for (const w of kw(b.title)) if (ka.has(w)) return true;
    return false;
  };
  const result = [...videos];
  for (let i = 0; i < result.length - 1; i++) {
    if (overlaps(result[i], result[i + 1])) {
      for (let j = i + 2; j < result.length; j++) {
        if (!overlaps(result[i], result[j])) {
          [result[i + 1], result[j]] = [result[j], result[i + 1]];
          break;
        }
      }
    }
  }
  return result;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function inferTags(title: string): ActivityTag[] {
  const lower = title.toLowerCase();
  return ALL_TAGS.filter((tag) =>
    TAG_KEYWORDS[tag]?.some((kw) => lower.includes(kw)),
  );
}

// Best YouTube search term for each activity — these produce far better short-form results
// than lowercasing the enum display value (e.g. "food tour" beats "dining", "historical sites" beats "history")
const TAG_SEARCH_TERMS: Partial<Record<ActivityTag, string>> = {
  [ActivityTag.Sightseeing]: "sightseeing",
  [ActivityTag.Beach]: "beach",
  [ActivityTag.Hiking]: "hiking",
  [ActivityTag.Dining]: "food tour",
  [ActivityTag.Adventure]: "adventure",
  [ActivityTag.Relaxation]: "relaxation",
  [ActivityTag.Nightlife]: "nightlife",
  [ActivityTag.Wildlife]: "wildlife",
  [ActivityTag.CulturalExperience]: "cultural experience",
  [ActivityTag.Festival]: "festival",
  [ActivityTag.RoadTrip]: "road trip",
  [ActivityTag.Camping]: "camping",
  [ActivityTag.Spa]: "spa wellness",
  [ActivityTag.Photography]: "photography spots",
  [ActivityTag.Entertainment]: "entertainment",
  [ActivityTag.History]: "historical sites",
  [ActivityTag.FamilyFun]: "family friendly",
  [ActivityTag.ThemePark]: "theme park",
};

// ── Location guard ────────────────────────────────────────────────────────────
// Known countries and major tourist cities. If a video title explicitly names
// one of these and it doesn't overlap with the user's destination, the video
// is from the wrong country and gets filtered out.
const KNOWN_PLACES = [
  "japan","tokyo","osaka","kyoto","hiroshima","sapporo",
  "france","paris","nice","lyon","bordeaux",
  "italy","rome","milan","venice","florence","naples","sicily",
  "spain","madrid","barcelona","seville","ibiza","mallorca",
  "thailand","bangkok","phuket","chiang mai","koh samui",
  "indonesia","bali","jakarta","lombok","yogyakarta",
  "vietnam","hanoi","ho chi minh","da nang","hoi an",
  "india","mumbai","delhi","goa","jaipur","agra","kerala",
  "china","beijing","shanghai","chengdu","guilin","xi'an",
  "korea","seoul","busan","jeju",
  "australia","sydney","melbourne","brisbane","cairns","perth",
  "usa","america","new york","los angeles","miami","chicago","hawaii","las vegas","san francisco","new orleans","orlando",
  "uk","england","london","edinburgh","scotland","ireland","dublin",
  "germany","berlin","munich","hamburg","frankfurt",
  "netherlands","amsterdam","rotterdam",
  "greece","athens","santorini","mykonos","crete",
  "turkey","istanbul","cappadocia","antalya",
  "mexico","cancun","mexico city","tulum","cabo","oaxaca",
  "brazil","rio de janeiro","sao paulo","salvador","florianopolis",
  "canada","toronto","vancouver","montreal","banff","quebec",
  "singapore",
  "malaysia","kuala lumpur","penang","langkawi",
  "philippines","manila","cebu","palawan","boracay",
  "new zealand","auckland","queenstown","rotorua",
  "egypt","cairo","luxor","aswan",
  "morocco","marrakech","casablanca","fez",
  "dubai","abu dhabi","uae",
  "maldives",
  "sri lanka","colombo","sigiriya",
  "portugal","lisbon","porto","algarve",
  "croatia","dubrovnik","split","zagreb",
  "iceland","reykjavik",
  "peru","lima","machu picchu","cusco",
  "argentina","buenos aires","patagonia",
  "colombia","bogota","cartagena","medellin",
  "switzerland","zurich","geneva","interlaken",
  "austria","vienna","salzburg","innsbruck",
  "czech republic","prague",
  "hungary","budapest",
  "poland","warsaw","krakow",
  "taiwan","taipei","tainan",
  "hong kong",
  "cambodia","siem reap","phnom penh",
  "myanmar","yangon","bagan",
  "nepal","kathmandu","pokhara",
  "kenya","nairobi","masai mara","mombasa",
  "south africa","cape town","johannesburg","safari",
  "cuba","havana",
  "costa rica","san jose","manuel antonio",
  "jamaica","montego bay","kingston",
  "bahamas","nassau",
];

function parseLocationTerms(location: string): string[] {
  return location.toLowerCase().split(/[\s,]+/).filter((t) => t.length > 2);
}

function isLocationMatch(title: string, locationTerms: string[]): boolean {
  const lower = title.toLowerCase();
  // Explicitly mentions the user's destination → always keep
  if (locationTerms.some((t) => lower.includes(t))) return true;
  // Mentions a known place that doesn't overlap with user's destination → reject
  for (const place of KNOWN_PLACES) {
    if (lower.includes(place) && !locationTerms.some((t) => place.includes(t) || t.includes(place))) {
      return false;
    }
  }
  // No recognisable location in title → neutral, trust the search term
  return true;
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "calc(100vh - 65px)",
    background: "#0f0f0f",
    color: "white",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "3rem 2rem",
  },
  card: {
    background: "#1a1a1a",
    borderRadius: "16px",
    padding: "2.5rem",
    width: "100%",
    maxWidth: "860px",
  },
  input: {
    width: "100%",
    padding: "0.7rem 1rem",
    borderRadius: "8px",
    border: "1px solid #333",
    background: "#111",
    color: "white",
    fontSize: "1rem",
    boxSizing: "border-box",
  },
  label: {
    display: "block",
    marginBottom: "0.4rem",
    color: "#aaa",
    fontSize: "0.9rem",
  },
  btn: {
    padding: "0.8rem 2rem",
    borderRadius: "8px",
    border: "none",
    background: "#FE2858",
    color: "white",
    fontSize: "1rem",
    cursor: "pointer",
    fontWeight: "bold",
  },
  btnGhost: {
    padding: "0.8rem 2rem",
    borderRadius: "8px",
    border: "1px solid #444",
    background: "transparent",
    color: "#aaa",
    fontSize: "1rem",
    cursor: "pointer",
  },
  stepBar: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "2.5rem",
    alignItems: "center",
  },
};

// ── Step indicator ────────────────────────────────────────────────────────────
function StepBar({ step }: { step: number }) {
  const labels = ["Trip Details", "Swipe Videos", "Review"];
  return (
    <div style={s.stepBar}>
      {labels.map((label, i) => (
        <div
          key={i}
          style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.85rem",
              fontWeight: "bold",
              background: step >= i ? "#FE2858" : "#333",
              color: "white",
            }}
          >
            {i + 1}
          </div>
          <span
            style={{
              color: step === i ? "white" : "#666",
              fontSize: "0.95rem",
            }}
          >
            {label}
          </span>
          {i < 2 && (
            <span style={{ color: "#444", margin: "0 0.4rem" }}>›</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Step 1: Trip Details ──────────────────────────────────────────────────────
type TripData = {
  location: string;
  seasons: Season[];
  tags: ActivityTag[];
  comments: string;
};

function TripDetailsStep({ onNext }: { onNext: (data: TripData) => void }) {
  const [location, setLocation] = useState("");
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [tags, setTags] = useState<ActivityTag[]>([]);
  const [comments, setComments] = useState("");
  const [error, setError] = useState("");

  const toggleSeason = (season: Season) =>
    setSeasons((prev) =>
      prev.includes(season)
        ? prev.filter((x) => x !== season)
        : [...prev, season],
    );

  const toggleTag = (tag: ActivityTag) =>
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );

  const handleNext = () => {
    if (!location || tags.length === 0) {
      setError(
        "Please enter a destination and select at least one activity vibe.",
      );
      return;
    }
    setError("");
    onNext({ location, seasons, tags, comments });
  };

  return (
    <div style={s.card}>
      <h2 style={{ marginTop: 0, marginBottom: "1.8rem", fontSize: "1.6rem" }}>
        Where are you going?
      </h2>

      <div style={{ marginBottom: "1.5rem" }}>
        <label style={s.label}>Destination *</label>
        <input
          style={s.input}
          placeholder="e.g. Tokyo, Japan"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <label style={s.label}>
          Season <span style={{ color: "#555" }}>(optional)</span>
        </label>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {SEASONS.map((season) => (
            <span
              key={season}
              onClick={() => toggleSeason(season)}
              style={{
                padding: "0.35rem 0.85rem",
                borderRadius: "20px",
                cursor: "pointer",
                fontSize: "0.85rem",
                background: seasons.includes(season) ? "#FE2858" : "#2a2a2a",
                border: `1px solid ${seasons.includes(season) ? "#FE2858" : "#444"}`,
                color: "white",
                userSelect: "none",
                transition: "background 0.15s",
              }}
            >
              {season}
            </span>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <label style={s.label}>Activity vibes * (pick at least one)</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {ALL_TAGS.map((tag) => (
            <span
              key={tag}
              onClick={() => toggleTag(tag)}
              style={{
                padding: "0.35rem 0.85rem",
                borderRadius: "20px",
                cursor: "pointer",
                fontSize: "0.85rem",
                background: tags.includes(tag) ? "#FE2858" : "#2a2a2a",
                border: `1px solid ${tags.includes(tag) ? "#FE2858" : "#444"}`,
                color: "white",
                userSelect: "none",
                transition: "background 0.15s",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: "1.8rem" }}>
        <label style={s.label}>Special notes</label>
        <textarea
          style={
            {
              ...s.input,
              height: "90px",
              resize: "vertical",
            } as React.CSSProperties
          }
          placeholder="e.g. vegetarian, wheelchair accessible..."
          value={comments}
          onChange={(e) => setComments(e.target.value)}
        />
      </div>

      {error && (
        <p
          style={{ color: "#FE2858", marginBottom: "1rem", fontSize: "0.9rem" }}
        >
          {error}
        </p>
      )}

      <button style={{ ...s.btn, minWidth: "220px" }} onClick={handleNext}>
        Next: Swipe Videos →
      </button>
    </div>
  );
}

// ── Step 2: Swipe Videos ──────────────────────────────────────────────────────
function SwipeStep({
  location,
  initialTags,
  seasons,
  onDone,
}: {
  location: string;
  initialTags: ActivityTag[];
  seasons: Season[];
  onDone: (liked: string[]) => void;
}) {
  const [queue, setQueue] = useState<ShortVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [index, setIndex] = useState(0);
  const [liked, setLiked] = useState<string[]>([]);
  const [animDir, setAnimDir] = useState<"left" | "right" | null>(null);
  const animTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Stable video element refs — never re-created, only src/display toggled (mirrors shorts/app.js)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Weight map: tag → score. Selected tags start at 1.0, others at 0.3.
  const weights = useRef<Record<string, number>>(
    Object.fromEntries(
      ALL_TAGS.map((tag) => [tag, initialTags.includes(tag) ? 1.0 : 0.3]),
    ),
  );
  const pageRef = useRef(Math.floor(Math.random() * 6));
  const fetching = useRef(false);
  const seenIds = useRef(new Set<string>());

  // Weighted-random pick: squaring the weight amplifies preference signal so
  // initial selections (1.0) dominate non-selected tags (0.3) and liked content
  // (up to 2.0) rises to the top quickly without completely crowding out variety.
  const getNextExtra = () => {
    // Only pick from tags the user selected (≥1.0) or has liked into (>0.6).
    // Non-selected neutral tags (0.3) are never used as search terms.
    const candidates = Object.entries(weights.current)
      .filter(([, w]) => w > 0.6)
      .sort(([, a], [, b]) => b - a);
    const seasonTerms = seasons.map((s) => s.toLowerCase()).join(" ");
    if (candidates.length === 0)
      return [location, "vacation", seasonTerms].filter(Boolean).join(" ");
    const total = candidates.reduce((sum, [, w]) => sum + w * w, 0);
    let rand = Math.random() * total;
    let chosen = candidates[0][0];
    for (const [tag, w] of candidates) {
      rand -= w * w;
      if (rand <= 0) { chosen = tag; break; }
    }
    const activity = TAG_SEARCH_TERMS[chosen as ActivityTag] ?? chosen.toLowerCase();
    return [location, "vacation", seasonTerms, activity].filter(Boolean).join(" ");
  };

  const locationTerms = parseLocationTerms(location);

  // Always enforce location first — wrong-country videos are never shown.
  // Then layer the tag filter on top; fall back to location-only if too few pass both.
  const GENERIC_TITLE = /places (on earth|in the world|around the world|you (must|need to|should) visit)|top \d+.*(places|destinations|spots|countries)|most (beautiful|amazing|incredible|stunning|underrated).*(places|destinations|countries|spots)|best (places|destinations|spots) (to visit|in the world|on earth)|\d+ (places|destinations|countries|cities) (that|you|to)/i;

  const filterRelevant = (items: ShortVideo[]): ShortVideo[] =>
    items.filter((v) => isLocationMatch(v.title, locationTerms) && !GENERIC_TITLE.test(v.title));

  // Subsequent-page fetcher (refills queue when running low).
  // Separate from the initial load so the StrictMode double-invoke
  // of the mount effect can't race with this and skip setLoading.
  const fetchMore = async () => {
    if (fetching.current) return;
    fetching.current = true;
    try {
      const extra = getNextExtra();
      const items = await fetchShorts(location, pageRef.current, extra);
      pageRef.current++;
      const fresh = spreadSimilar(shuffle(
        filterRelevant(items.filter((v) => !seenIds.current.has(v.videoId))),
      ));
      fresh.forEach((v) => seenIds.current.add(v.videoId));
      if (fresh.length > 0) setQueue((prev) => [...prev, ...fresh]);
    } catch {
      // silent — keep existing queue for refill failures
    } finally {
      fetching.current = false;
    }
  };

  // Initial load — uses an `active` flag so React StrictMode's double-invoke
  // doesn't fire setLoading(false) before the real fetch completes.
  useEffect(() => {
    let active = true;
    const startPage = pageRef.current;
    const extra = getNextExtra();
    (async () => {
      try {
        const items = await fetchShorts(location, startPage, extra);
        if (!active) return;
        pageRef.current = startPage + 1;
        const fresh = spreadSimilar(shuffle(
          filterRelevant(items.filter((v) => !seenIds.current.has(v.videoId))),
        ));
        fresh.forEach((v) => seenIds.current.add(v.videoId));
        if (fresh.length > 0) setQueue(fresh);
        else setError("No videos found for this location.");
      } catch {
        if (active)
          setError(
            "Couldn't load shorts — is the shorts backend running? (node shorts-backend/server.js)",
          );
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Mirror shorts/app.js: prefetch next 2, play current, pause previous
  useEffect(() => {
    if (queue.length === 0) return;
    for (let ahead = 1; ahead <= 2; ahead++) {
      const el = videoRefs.current[index + ahead];
      const v = queue[index + ahead];
      if (el && v && !el.src) el.src = `/api/proxy?v=${v.videoId}`;
    }
    const currentEl = videoRefs.current[index];
    if (currentEl) {
      if (!currentEl.src)
        currentEl.src = `/api/proxy?v=${queue[index].videoId}`;
      currentEl.play().catch(() => {});
    }
    if (index > 0) videoRefs.current[index - 1]?.pause();
    // Refill feed when running low — uses updated weights so next batch is better targeted
    if (queue.length - index <= 5) fetchMore();
  }, [index, queue]);

  // Update weights on each swipe, then let the next fetchMore use the new weights.
  // Tags inferred from the video title that differ from the user's stated preferences
  // get a heavier demerit on dislike, so the feed shifts away from them faster.
  const updateWeights = (video: ShortVideo, dir: "left" | "right") => {
    inferTags(video.title).forEach((tag) => {
      const w = weights.current[tag] ?? 0.3;
      const isDifferent = !initialTags.includes(tag);
      weights.current[tag] =
        dir === "right"
          ? Math.min(2.0, w + 0.3)
          : Math.max(0.0, w - (isDifferent ? 0.5 : 0.3));
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
      if (index + 1 >= queue.length) {
        onDone(newLiked);
      } else {
        setIndex((i) => i + 1);
      }
    }, 350);
  };

  if (!loading && queue.length > 0 && index >= queue.length) {
    onDone(liked);
    return null;
  }

  const current = queue[index];
  const remaining = queue.length - index;

  const cardAnim: React.CSSProperties = {
    transition: "transform 0.35s ease, opacity 0.35s ease",
    transform:
      animDir === "right"
        ? "translateX(120%) rotate(15deg)"
        : animDir === "left"
          ? "translateX(-120%) rotate(-15deg)"
          : "none",
    opacity: animDir ? 0 : 1,
  };

  return (
    <div
      style={{
        ...s.card,
        maxWidth: "900px",
        display: "grid",
        gridTemplateColumns: "340px 1fr",
        gap: "3rem",
        alignItems: "center",
      }}
    >
      {/* Left: video card */}
      <div style={{ position: "relative" }}>
        {current && index + 1 < queue.length && (
          <div
            style={{
              position: "absolute",
              inset: "8px -4px -8px",
              background: "#222",
              borderRadius: "16px",
              zIndex: 0,
            }}
          />
        )}
        <div style={{ ...cardAnim, position: "relative", zIndex: 1 }}>
          <div
            style={{
              position: "relative",
              paddingTop: "177.78%",
              borderRadius: "12px",
              overflow: "hidden",
              background: "#111",
            }}
          >
            {loading ? (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#888",
                }}
              >
                Loading shorts…
              </div>
            ) : error ? (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "1rem",
                  color: "#888",
                  fontSize: "0.85rem",
                  textAlign: "center",
                }}
              >
                {error}
              </div>
            ) : (
              // All video elements kept in DOM with stable position-based keys.
              // Only the current one is visible; src is set lazily — no re-mounts on swipe.
              queue.map((_, i) => (
                <video
                  key={i}
                  ref={(el) => {
                    videoRefs.current[i] = el;
                  }}
                  loop
                  muted
                  playsInline
                  preload="auto"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: i === index ? "block" : "none",
                  }}
                />
              ))
            )}
          </div>
          {current && (
            <div style={{ padding: "0.6rem 0.2rem" }}>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.82rem",
                  color: "#ccc",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {current.title}
              </p>
              <p
                style={{
                  margin: "0.2rem 0 0",
                  fontSize: "0.75rem",
                  color: "#666",
                }}
              >
                {current.uploader}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right: instructions + buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div>
          <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.6rem" }}>
            Swipe to build your trip
          </h2>
          <p style={{ color: "#888", fontSize: "0.95rem", lineHeight: 1.6 }}>
            Like the videos that match your travel vibe. We'll use them to
            personalise your itinerary.
          </p>
        </div>

        <div
          style={{
            background: "#111",
            borderRadius: "10px",
            padding: "1rem 1.2rem",
            lineHeight: 2,
          }}
        >
          <div>
            <span style={{ color: "#888" }}>Location:</span>{" "}
            <strong>{location}</strong>
          </div>
          <div>
            <span style={{ color: "#888" }}>Remaining:</span>{" "}
            <strong>{loading ? "…" : remaining}</strong>
          </div>
          <div>
            <span style={{ color: "#888" }}>Liked so far:</span>{" "}
            <strong>{liked.length}</strong>
          </div>
        </div>


        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          <button
            onClick={() => swipe("right")}
            disabled={loading || !!error}
            style={{
              ...s.btn,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.6rem",
              padding: "0.9rem 1.5rem",
              fontSize: "1rem",
              opacity: loading || !!error ? 0.5 : 1,
            }}
          >
            Love it
          </button>
          <button
            onClick={() => swipe("left")}
            disabled={loading || !!error}
            style={{
              ...s.btnGhost,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.6rem",
              padding: "0.9rem 1.5rem",
              fontSize: "1rem",
              opacity: loading || !!error ? 0.5 : 1,
            }}
          >
            Skip
          </button>
          <button
            onClick={() => onDone(liked)}
            style={{
              padding: "0.7rem 1.5rem",
              borderRadius: "8px",
              border: "1px solid #333",
              background: "transparent",
              color: "#666",
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
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
  generating,
}: {
  tripData: TripData;
  likedVideos: string[];
  onBack: () => void;
  onGenerate: () => void;
  generating?: boolean;
}) {
  return (
    <div style={s.card}>
      <h2 style={{ marginTop: 0, marginBottom: "1.5rem", fontSize: "1.6rem" }}>
        Review your trip
      </h2>

      {/* Two-column: summary left, liked videos right */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: likedVideos.length > 0 ? "1fr 1fr" : "1fr",
          gap: "2rem",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            background: "#111",
            borderRadius: "10px",
            padding: "1.2rem",
            lineHeight: 2.2,
          }}
        >
          <div>
            <span style={{ color: "#888" }}>Destination:</span>{" "}
            <strong>{tripData.location}</strong>
          </div>
          {tripData.seasons.length > 0 && (
            <div>
              <span style={{ color: "#888" }}>Season:</span>{" "}
              <strong>{tripData.seasons.join(", ")}</strong>
            </div>
          )}
          <div>
            <span style={{ color: "#888" }}>Vibes:</span>{" "}
            <strong>{tripData.tags.join(", ")}</strong>
          </div>
          {tripData.comments && (
            <div>
              <span style={{ color: "#888" }}>Notes:</span>{" "}
              <strong>{tripData.comments}</strong>
            </div>
          )}
          <div>
            <span style={{ color: "#888" }}>Videos liked:</span>{" "}
            <strong>{likedVideos.length}</strong>
          </div>
        </div>

        {likedVideos.length > 0 && (
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                color: "#aaa",
                fontSize: "0.9rem",
                marginBottom: "0.8rem",
              }}
            >
              Your liked videos:
            </p>
            <div
              style={{
                display: "flex",
                gap: "0.6rem",
                overflowX: "auto",
                paddingBottom: "0.5rem",
              }}
            >
              {likedVideos.map((id) => (
                <div key={id} style={{ flexShrink: 0, width: "100px" }}>
                  <div
                    style={{
                      position: "relative",
                      paddingTop: "177.78%",
                      borderRadius: "8px",
                      overflow: "hidden",
                      background: "#111",
                    }}
                  >
                    <img
                      src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
                      alt="liked short"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "1rem" }}>
        <button style={s.btnGhost} onClick={onBack}>
          ← Back
        </button>
        <button
          style={{ ...s.btn, flex: 1, opacity: generating ? 0.6 : 1 }}
          onClick={onGenerate}
          disabled={generating}
        >
          {generating ? "Generating…" : "Generate My Itinerary"}
        </button>
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
        "Create a one-day travel plan",
        ` - Location: ${tripData!.location}`,
        " - Start time: 08:00",
        " - End time: 21:00",
        ` - Activities: ${tripData!.tags.join(", ")}`,
        tripData!.seasons.length > 0
          ? ` - Season: ${tripData!.seasons.join(", ")}`
          : null,
        tripData!.comments ? ` - Special notes: ${tripData!.comments}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      const videoUrls = likedVideos
        .map((id) => `https://www.youtube.com/watch?v=${id}`)
        .join(",");
      const params = new URLSearchParams({ prompt });
      if (videoUrls) params.set("video_urls", videoUrls);

      const res = await fetch(`/itinerary-api/generate_itinerary?${params}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const itinerary = { location: tripData!.location, ...data.itinerary };
      localStorage.setItem("itinerary", JSON.stringify(itinerary));
      localStorage.setItem("liked_videos", JSON.stringify(likedVideos));
      navigate("/your-trip");
    } catch (e) {
      console.error("Itinerary backend unavailable, using mock:", e);
      const itinerary = MOCK_ITINERARY(
        tripData!.location,
        tripData!.tags.map(String),
      );
      localStorage.setItem("itinerary", JSON.stringify(itinerary));
      localStorage.setItem("liked_videos", JSON.stringify(likedVideos));
      navigate("/your-trip");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={s.page}>
      <StepBar step={step} />
      {step === 0 && (
        <TripDetailsStep
          onNext={(data) => {
            setTripData(data);
            setStep(1);
          }}
        />
      )}
      {step === 1 && tripData && (
        <SwipeStep
          location={tripData.location}
          initialTags={tripData.tags}
          seasons={tripData.seasons}
          onDone={(liked) => {
            setLikedVideos(liked);
            setStep(2);
          }}
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

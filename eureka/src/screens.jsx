// Screens — Welcome, Trip Details, Swipe, Review, Itinerary
// Each screen receives `nav` and `state` from App. Material You expressive.

const { useState, useEffect, useRef, useMemo } = React;

// ── Shared layout ──────────────────────────────────────────────────────────
function StepBar({ step, total = 4 }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={`m3-stepdot ${i < step ? 'done' : ''} ${i === step ? 'active' : ''}`} />
      ))}
    </div>
  );
}

// ── Welcome ────────────────────────────────────────────────────────────────
function WelcomeScreen({ nav }) {
  const { DESTINATIONS } = window.AppData;
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      <div className="m3-appbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--m3-primary-container)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--m3-on-primary-container)' }}>
            <Sym name="travel_explore" size={22} fill={1} />
          </div>
          <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-.01em' }}>SwipeAndFly</span>
        </div>
        <div className="title" />
        <M3IconBtn icon="account_circle" />
      </div>

      <div style={{ padding: '12px 24px 32px', display: 'flex', flexDirection: 'column', gap: 32 }}>
        {/* Hero — full-bleed travel image background */}
        <div style={{ position: 'relative', borderRadius: 'var(--m3-corner-2xl)', padding: '56px 40px 48px',
          backgroundImage: `linear-gradient(115deg, color-mix(in oklch, var(--m3-primary) 75%, transparent) 0%, color-mix(in oklch, var(--m3-tertiary) 30%, transparent) 55%, transparent 100%), url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80')`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          color: '#fff', overflow: 'hidden', minHeight: 460,
          boxShadow: '0 1px 2px var(--m3-shadow), 0 8px 32px color-mix(in oklch, var(--m3-primary) 20%, transparent)' }}>

          {/* expressive M3 organic shape — soft tonal accent */}
          <div className="m3-blob" style={{ position: 'absolute', width: 360, height: 360, right: -100, top: -100, opacity: .55, mixBlendMode: 'screen',
            background: 'radial-gradient(circle at 35% 35%, oklch(75% .18 240) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', width: 240, height: 240, right: 60, bottom: -80, opacity: .35, mixBlendMode: 'screen',
            background: 'radial-gradient(circle at 50% 50%, oklch(80% .15 200) 0%, transparent 70%)',
            borderRadius: '40% 60% 65% 35% / 60% 30% 70% 40%' }} />

          <div style={{ position: 'relative', maxWidth: 620 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px',
              background: 'rgba(255,255,255,.18)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,.25)',
              borderRadius: 999, fontSize: 12, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 24 }}>
              <Sym name="auto_awesome" size={14} fill={1} /> AI travel planner
            </div>
            <h1 className="display-font" style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 500, lineHeight: 1.02, margin: 0, letterSpacing: '-.025em',
              textShadow: '0 2px 24px rgba(0,0,0,.25)' }}>
              Swipe shorts.<br />Skip the planning.
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.55, marginTop: 18, marginBottom: 32, maxWidth: 480, color: 'rgba(255,255,255,.92)',
              textShadow: '0 1px 8px rgba(0,0,0,.35)' }}>
              Like the travel videos that match your vibe — we'll build a day-by-day itinerary you'll actually want to follow.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <M3Button icon="arrow_forward" onClick={() => nav('details')}>Plan a trip</M3Button>
            </div>
          </div>
        </div>

        {/* How it works — three colored M3 tonal cards */}
        <div>
          <h2 className="display-font" style={{ fontSize: 24, fontWeight: 500, margin: '0 0 16px' }}>Three taps to a perfect trip</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
            {[
              { icon: 'edit_location_alt', title: 'Tell us where',     body: 'Pick a destination and the kind of trip you want.',
                bg: 'var(--m3-primary-container)',   fg: 'var(--m3-on-primary-container)',   chip: 'var(--m3-primary)',   chipFg: 'var(--m3-on-primary)' },
              { icon: 'swipe',              title: 'Swipe the shorts',  body: 'Like videos that match your vibe; skip the rest.',
                bg: 'var(--m3-secondary-container)', fg: 'var(--m3-on-secondary-container)', chip: 'var(--m3-secondary)', chipFg: 'var(--m3-on-secondary)' },
              { icon: 'event_available',    title: 'Get the itinerary', body: 'A day-by-day plan, inspired by what you liked.',
                bg: 'var(--m3-tertiary-container)',  fg: 'var(--m3-on-tertiary-container)',  chip: 'var(--m3-tertiary)',  chipFg: 'var(--m3-on-tertiary)' },
            ].map((s, i) => (
              <div key={i} style={{ padding: 24, borderRadius: 'var(--m3-corner-xl)',
                background: s.bg, color: s.fg, position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: s.chip, color: s.chipFg,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sym name={s.icon} size={26} fill={1} />
                  </div>
                  <span className="display-font" style={{ fontSize: 32, fontWeight: 500, opacity: .35, letterSpacing: '-.02em' }}>0{i + 1}</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 6 }}>{s.title}</div>
                <div style={{ fontSize: 14, opacity: .8, lineHeight: 1.5 }}>{s.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Details ────────────────────────────────────────────────────────────────
function DetailsScreen({ nav, state, setState }) {
  const { VIBES } = window.AppData;
  const [destination, setDestination] = useState(state.destination || '');
  const [days, setDays] = useState(state.days || 5);
  const [season, setSeason] = useState(state.season || 'spring');
  const [vibes, setVibes] = useState(state.vibes || ['beach', 'food']);
  const [notes, setNotes] = useState(state.notes || '');

  const toggleVibe = (k) => setVibes(v => v.includes(k) ? v.filter(x => x !== k) : [...v, k]);

  const canNext = destination.trim().length > 0 && vibes.length > 0;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="m3-appbar">
        <M3IconBtn icon="arrow_back" onClick={() => nav('welcome')} />
        <div className="title">Plan a trip</div>
        <div style={{ padding: '0 16px' }}><StepBar step={0} /></div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '8px 24px 120px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div>
            <h1 className="display-font" style={{ fontSize: 36, fontWeight: 500, margin: 0, letterSpacing: '-.01em' }}>Where to?</h1>
            <p style={{ color: 'var(--m3-on-surface-variant)', marginTop: 8, fontSize: 15 }}>Tell us a bit about the trip and we'll find shorts to inspire it.</p>
          </div>

          <M3TextField label="Destination" leadingIcon="location_on" value={destination} onChange={e => setDestination(e.target.value)} />

          {/* Days */}
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--m3-on-surface-variant)' }}>Trip length</div>
              <div style={{ fontSize: 28, fontWeight: 500 }} className="display-font">{days} <span style={{ fontSize: 14, color: 'var(--m3-on-surface-variant)', fontWeight: 400 }}>day{days !== 1 ? 's' : ''}</span></div>
            </div>
            <div style={{ position: 'relative', height: 28, display: 'flex', alignItems: 'center' }}>
              <input type="range" min="1" max="14" value={days} onChange={e => setDays(+e.target.value)}
                style={{ width: '100%', accentColor: 'var(--m3-primary)' }} />
            </div>
          </div>

          {/* Season */}
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--m3-on-surface-variant)', marginBottom: 10 }}>Season</div>
            <M3Segmented value={season} onChange={setSeason}
              options={[
                { value: 'spring', label: 'Spring',  icon: 'local_florist' },
                { value: 'summer', label: 'Summer',  icon: 'wb_sunny' },
                { value: 'fall',   label: 'Fall',    icon: 'eco' },
                { value: 'winter', label: 'Winter',  icon: 'ac_unit' },
              ]} />
          </div>

          {/* Vibes */}
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--m3-on-surface-variant)' }}>What's your vibe?</div>
              <div style={{ fontSize: 12, color: 'var(--m3-on-surface-variant)' }}>{vibes.length} selected</div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {VIBES.map(v => (
                <M3Chip key={v.key} icon={v.icon} selected={vibes.includes(v.key)} onClick={() => toggleVibe(v.key)}>
                  {v.label}
                </M3Chip>
              ))}
            </div>
          </div>

          <M3TextField label="Anything special? (allergies, accessibility, must-sees…)" multiline value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
      </div>

      {/* Bottom action bar */}
      <div style={{ position: 'sticky', bottom: 0, padding: 16, background: 'linear-gradient(to top, var(--m3-surface) 60%, transparent)',
        display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid var(--m3-outline-variant)' }}>
        <M3Button variant="text" onClick={() => nav('welcome')}>Cancel</M3Button>
        <M3Button icon="swipe" disabled={!canNext} onClick={() => {
          setState(s => ({ ...s, destination, days, season, vibes, notes }));
          nav('swipe');
        }}>Next: Swipe videos</M3Button>
      </div>
    </div>
  );
}

// ── Short card (synthetic visual) ─────────────────────────────────────────
function ShortVisual({ short, playing }) {
  // synthetic gradient + animated dots
  const bg = `linear-gradient(155deg, oklch(72% .14 ${short.hue}), oklch(45% .15 ${short.hue2}))`;
  return (
    <div style={{ position: 'absolute', inset: 0, background: bg, overflow: 'hidden' }}>
      {/* ambient blobs */}
      <div style={{ position: 'absolute', width: 220, height: 220, top: '-10%', right: '-15%',
        borderRadius: '60% 40% 55% 45%', background: `oklch(85% .15 ${short.hue})`, opacity: .45, filter: 'blur(4px)',
        animation: playing ? 'blob1 9s ease-in-out infinite' : 'none' }} />
      <div style={{ position: 'absolute', width: 180, height: 180, bottom: '5%', left: '-10%',
        borderRadius: '45% 55% 40% 60%', background: `oklch(80% .14 ${short.hue2})`, opacity: .4, filter: 'blur(2px)',
        animation: playing ? 'blob2 11s ease-in-out infinite' : 'none' }} />
      {/* film grain */}
      <div style={{ position: 'absolute', inset: 0, opacity: .12, mixBlendMode: 'overlay',
        backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 1px)',
        backgroundSize: '4px 4px' }} />

      {/* play indicator */}
      {playing && <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 4, alignItems: 'center',
        background: 'rgba(0,0,0,.35)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 500, color: 'white' }}>
        <span style={{ width: 6, height: 6, borderRadius: 3, background: '#ff3b30', animation: 'pulse 1.5s ease-in-out infinite' }} />
        LIVE PREVIEW
      </div>}

      {/* views badge */}
      <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,.35)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 500, color: 'white', display: 'flex', alignItems: 'center', gap: 4 }}>
        <Sym name="visibility" size={12} /> {short.views}
      </div>

      {/* bottom info */}
      <div style={{ position: 'absolute', left: 16, right: 64, bottom: 18, color: 'white' }}>
        <div style={{ fontSize: 13, fontWeight: 500, opacity: .9, marginBottom: 4 }}>{short.creator}</div>
        <div style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.3, textShadow: '0 1px 8px rgba(0,0,0,.3)' }}>{short.caption}</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 12, opacity: .85,
          background: 'rgba(255,255,255,.18)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: 999 }}>
          <Sym name="location_on" size={12} fill={1} /> {short.loc}
        </div>
      </div>

      {/* right action rail */}
      <div style={{ position: 'absolute', right: 12, bottom: 18, display: 'flex', flexDirection: 'column', gap: 14, color: 'white', alignItems: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: 20, background: 'rgba(255,255,255,.2)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sym name="favorite" size={22} fill={1} />
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 20, background: 'rgba(255,255,255,.2)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sym name="bookmark" size={22} />
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 20, background: 'rgba(255,255,255,.2)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sym name="share" size={22} />
        </div>
      </div>
    </div>
  );
}

// ── Swipe ──────────────────────────────────────────────────────────────────
function SwipeScreen({ nav, state, setState }) {
  const { SHORTS } = window.AppData;
  const queue = useMemo(() => SHORTS, []);
  const [index, setIndex] = useState(0);
  const [animDir, setAnimDir] = useState(null);
  const [liked, setLiked] = useState(state.liked || []);
  const [skipped, setSkipped] = useState(state.skipped || []);
  const animRef = useRef(null);

  const current = queue[index];
  const next    = queue[index + 1];
  const finished = index >= queue.length;

  const swipe = (dir) => {
    if (animRef.current || finished) return;
    setAnimDir(dir);
    const c = current;
    animRef.current = setTimeout(() => {
      setAnimDir(null);
      animRef.current = null;
      if (dir === 'right') setLiked(l => [...l, c.id]);
      else setSkipped(s => [...s, c.id]);
      setIndex(i => i + 1);
    }, 360);
  };

  // keyboard
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'ArrowRight') swipe('right');
      else if (e.key === 'ArrowLeft') swipe('left');
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  const finish = () => {
    setState(s => ({ ...s, liked, skipped }));
    nav('review');
  };

  const cardAnim = {
    transition: 'transform .36s var(--m3-easing-emph), opacity .36s var(--m3-easing-emph)',
    transform: animDir === 'right' ? 'translateX(120%) rotate(14deg)' :
               animDir === 'left'  ? 'translateX(-120%) rotate(-14deg)' : 'rotate(-1deg)',
    opacity: animDir ? 0 : 1,
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="m3-appbar">
        <M3IconBtn icon="arrow_back" onClick={() => nav('details')} />
        <div className="title">Swipe to inspire</div>
        <div style={{ padding: '0 16px' }}><StepBar step={1} /></div>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 360px)',
        gap: 32, padding: '12px 32px 24px', alignItems: 'center', maxWidth: 1100, width: '100%', margin: '0 auto' }}>
        {/* deck */}
        <div style={{ position: 'relative', maxWidth: 380, justifySelf: 'center', width: '100%', aspectRatio: '9/16' }}>
          {/* card stack background */}
          {!finished && next && (
            <div className="short-card" style={{ position: 'absolute', inset: 0, transform: 'translate(8px, 12px) rotate(2deg) scale(.96)', opacity: .6 }}>
              <ShortVisual short={next} playing={false} />
            </div>
          )}
          {!finished && current && (
            <div className="short-card" style={{ position: 'absolute', inset: 0, ...cardAnim, boxShadow: '0 24px 60px var(--m3-shadow)' }}>
              <ShortVisual short={current} playing={!animDir} />

              {/* swipe stamps */}
              <div style={{ position: 'absolute', top: 80, left: 24, padding: '8px 16px', borderRadius: 10,
                border: '4px solid #34d399', color: '#34d399', fontWeight: 700, fontSize: 22, transform: 'rotate(-12deg)',
                opacity: animDir === 'right' ? 1 : 0, transition: 'opacity .15s' }}>LIKED</div>
              <div style={{ position: 'absolute', top: 80, right: 24, padding: '8px 16px', borderRadius: 10,
                border: '4px solid #f87171', color: '#f87171', fontWeight: 700, fontSize: 22, transform: 'rotate(12deg)',
                opacity: animDir === 'left' ? 1 : 0, transition: 'opacity .15s' }}>SKIP</div>
            </div>
          )}
          {finished && (
            <div className="m3-card filled" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 32, borderRadius: 'var(--m3-corner-xl)' }}>
              <div style={{ width: 80, height: 80, borderRadius: 20, background: 'var(--m3-primary-container)', color: 'var(--m3-on-primary-container)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Sym name="check" size={48} />
              </div>
              <div className="display-font" style={{ fontSize: 26, fontWeight: 500 }}>You're all caught up!</div>
              <div style={{ color: 'var(--m3-on-surface-variant)', marginTop: 8, marginBottom: 24, fontSize: 14 }}>Liked {liked.length} · Skipped {skipped.length}</div>
              <M3Button icon="event_available" onClick={finish}>Build my itinerary</M3Button>
            </div>
          )}
        </div>

        {/* controls / context */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="m3-card filled" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <Sym name="location_on" size={20} fill={1} style={{ color: 'var(--m3-primary)' }} />
              <div style={{ fontSize: 16, fontWeight: 500 }}>{state.destination || 'Bali, Indonesia'}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ background: 'var(--m3-surface-container-low)', borderRadius: 12, padding: '10px 12px' }}>
                <div style={{ fontSize: 11, color: 'var(--m3-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Liked</div>
                <div className="display-font" style={{ fontSize: 24, fontWeight: 500, color: 'var(--m3-primary)' }}>{liked.length}</div>
              </div>
              <div style={{ background: 'var(--m3-surface-container-low)', borderRadius: 12, padding: '10px 12px' }}>
                <div style={{ fontSize: 11, color: 'var(--m3-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Remaining</div>
                <div className="display-font" style={{ fontSize: 24, fontWeight: 500 }}>{Math.max(0, queue.length - index)}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 14, alignItems: 'center', justifyContent: 'center' }}>
            <M3FAB icon="close"     onClick={() => swipe('left')}  />
            <M3FAB icon="favorite"  variant="primary" size="large" onClick={() => swipe('right')} />
            <M3FAB icon="bookmark"  onClick={() => swipe('right')} />
          </div>
          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--m3-on-surface-variant)' }}>
            Skip · Love it · Save for later
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 4px' }}>
            <div style={{ fontSize: 12, color: 'var(--m3-on-surface-variant)' }}>
              <kbd style={{ padding: '2px 6px', background: 'var(--m3-surface-container-high)', borderRadius: 4, fontFamily: 'Roboto Mono, monospace' }}>←</kbd> skip &nbsp;
              <kbd style={{ padding: '2px 6px', background: 'var(--m3-surface-container-high)', borderRadius: 4, fontFamily: 'Roboto Mono, monospace' }}>→</kbd> love
            </div>
            <M3Button variant="text" onClick={finish} disabled={liked.length === 0}>I'm done →</M3Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Review ─────────────────────────────────────────────────────────────────
function ReviewScreen({ nav, state }) {
  const { SHORTS, VIBES } = window.AppData;
  const likedShorts = SHORTS.filter(s => (state.liked || []).includes(s.id));
  const vibeLabels = VIBES.filter(v => (state.vibes || []).includes(v.key));

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="m3-appbar">
        <M3IconBtn icon="arrow_back" onClick={() => nav('swipe')} />
        <div className="title">Review</div>
        <div style={{ padding: '0 16px' }}><StepBar step={2} /></div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '12px 32px 120px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 800, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <h1 className="display-font" style={{ fontSize: 36, fontWeight: 500, margin: 0, letterSpacing: '-.01em' }}>Looks good?</h1>
            <p style={{ color: 'var(--m3-on-surface-variant)', marginTop: 6 }}>We'll build a {state.days || 5}-day plan for {state.destination || 'Bali, Indonesia'} from {likedShorts.length} videos you liked.</p>
          </div>

          {/* summary card */}
          <div className="m3-card filled" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--m3-outline-variant)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--m3-primary)', letterSpacing: '.06em', textTransform: 'uppercase' }}>Trip summary</div>
              <div className="display-font" style={{ fontSize: 28, fontWeight: 500, marginTop: 4 }}>{state.destination || 'Bali, Indonesia'}</div>
              <div style={{ color: 'var(--m3-on-surface-variant)', marginTop: 2 }}>
                {state.days || 5} days · {state.season || 'spring'}
              </div>
            </div>
            <div style={{ padding: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {vibeLabels.map(v => (
                <span key={v.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                  borderRadius: 8, background: 'var(--m3-surface-container-low)', fontSize: 13, fontWeight: 500 }}>
                  <Sym name={v.icon} size={16} /> {v.label}
                </span>
              ))}
            </div>
          </div>

          {/* liked shorts */}
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 className="display-font" style={{ fontSize: 20, fontWeight: 500, margin: 0 }}>Inspired by {likedShorts.length} videos</h2>
              <M3Button variant="text" icon="refresh" onClick={() => nav('swipe')}>Swipe more</M3Button>
            </div>
            {likedShorts.length === 0 ? (
              <div className="m3-card outlined" style={{ padding: 24, textAlign: 'center', color: 'var(--m3-on-surface-variant)' }}>
                You haven't liked any videos yet. <M3Button variant="text" onClick={() => nav('swipe')}>Go swipe</M3Button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
                {likedShorts.map(s => (
                  <div key={s.id} className="short-card" style={{ aspectRatio: '9/16', position: 'relative', overflow: 'hidden', borderRadius: 16 }}>
                    <ShortVisual short={s} playing={false} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {state.notes && (
            <div className="m3-card outlined" style={{ padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--m3-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Your notes</div>
              <div style={{ fontSize: 14 }}>{state.notes}</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ position: 'sticky', bottom: 0, padding: 16, background: 'linear-gradient(to top, var(--m3-surface) 60%, transparent)',
        display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid var(--m3-outline-variant)' }}>
        <M3Button variant="outlined" icon="arrow_back" onClick={() => nav('swipe')}>Back</M3Button>
        <M3Button icon="auto_awesome" onClick={() => nav('itinerary')}>Generate itinerary</M3Button>
      </div>
    </div>
  );
}

// ── Itinerary ──────────────────────────────────────────────────────────────
function ItineraryScreen({ nav, state }) {
  const { SAMPLE_ITINERARY, SHORTS, VIBES } = window.AppData;
  const it = SAMPLE_ITINERARY;
  const [activeDay, setActiveDay] = useState(1);
  const [generating, setGenerating] = useState(true);
  const [savedSnack, setSavedSnack] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setGenerating(false), 1700);
    return () => clearTimeout(t);
  }, []);

  if (generating) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 24 }}>
        <div style={{ position: 'relative', width: 120, height: 120 }}>
          <div className="m3-blob" style={{ position: 'absolute', inset: 0, animation: 'blob1 4s ease-in-out infinite',
            background: 'linear-gradient(135deg, var(--m3-primary), var(--m3-tertiary))' }} />
          <Sym name="auto_awesome" size={48} fill={1} style={{ position: 'absolute', inset: 0, margin: 'auto', color: 'var(--m3-on-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div className="display-font" style={{ fontSize: 26, fontWeight: 500 }}>Building your trip…</div>
          <div style={{ color: 'var(--m3-on-surface-variant)', marginTop: 6, fontSize: 14 }}>
            Pulling locations from your liked videos
          </div>
        </div>
      </div>
    );
  }

  const day = it.days.find(d => d.day === activeDay) || it.days[0];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="m3-appbar">
        <M3IconBtn icon="arrow_back" onClick={() => nav('welcome')} />
        <div className="title">Your trip</div>
        <M3IconBtn icon="ios_share" onClick={() => { setSavedSnack(true); setTimeout(() => setSavedSnack(false), 2200); }} />
        <M3IconBtn icon="more_vert" />
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 0 96px' }}>
        {/* Hero */}
        <div style={{ position: 'relative', height: 240, margin: '0 16px 24px', borderRadius: 'var(--m3-corner-xl)', overflow: 'hidden',
          background: 'linear-gradient(140deg, var(--m3-primary-container), var(--m3-tertiary-container))' }}>
          <div className="m3-blob" style={{ position: 'absolute', width: 260, height: 260, right: -80, top: -60,
            background: `radial-gradient(circle at 40% 40%, var(--m3-primary) 0%, transparent 70%)`, opacity: .55 }} />
          <div style={{ position: 'absolute', left: 24, bottom: 24, color: 'var(--m3-on-primary-container)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', opacity: .8 }}>{it.dates}</div>
            <h1 className="display-font" style={{ fontSize: 'clamp(32px, 4.4vw, 48px)', fontWeight: 500, margin: '4px 0 0', letterSpacing: '-.01em' }}>{state.destination || it.destination}</h1>
            <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 14 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Sym name="event" size={16} /> {it.days.length} days</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Sym name="check_circle" size={16} fill={1} /> {it.days.reduce((a, d) => a + d.activities.length, 0)} activities</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Sym name="play_circle" size={16} fill={1} /> {(state.liked || []).length || 8} videos used</span>
            </div>
          </div>
        </div>

        {/* Day pills */}
        <div style={{ padding: '0 16px 16px', display: 'flex', gap: 8, overflow: 'auto' }}>
          {it.days.map(d => (
            <button key={d.day} onClick={() => setActiveDay(d.day)}
              style={{ flexShrink: 0, padding: '8px 12px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: activeDay === d.day ? 'var(--m3-primary)' : 'var(--m3-surface-container-high)',
                color: activeDay === d.day ? 'var(--m3-on-primary)' : 'var(--m3-on-surface)',
                minWidth: 76, textAlign: 'center', transition: 'all .2s' }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', opacity: .8 }}>{d.label}</div>
              <div className="display-font" style={{ fontSize: 22, fontWeight: 500, marginTop: 2 }}>{d.date.split(' ')[1]}</div>
            </button>
          ))}
        </div>

        {/* Day content */}
        <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--m3-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>Day {day.day}</div>
              <h2 className="display-font" style={{ fontSize: 22, fontWeight: 500, margin: '2px 0 0' }}>{day.subtitle}</h2>
            </div>
            <M3IconBtn icon="edit" tonal />
          </div>

          {/* timeline */}
          <div style={{ position: 'relative', paddingLeft: 32, marginTop: 8 }}>
            <div style={{ position: 'absolute', left: 15, top: 12, bottom: 12, width: 2, background: 'var(--m3-outline-variant)' }} />
            {day.activities.map((act, i) => {
              const inspired = act.inspiredBy ? SHORTS.find(s => s.id === act.inspiredBy) : null;
              const vibe = VIBES.find(v => v.key === act.vibe);
              return (
                <div key={i} style={{ position: 'relative', marginBottom: 14 }}>
                  <div style={{ position: 'absolute', left: -28, top: 14, width: 18, height: 18, borderRadius: 9,
                    background: 'var(--m3-primary-container)', border: '3px solid var(--m3-surface)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--m3-primary)' }} />
                  </div>
                  <div className="m3-card outlined" style={{ padding: 0, overflow: 'hidden', display: 'grid', gridTemplateColumns: inspired ? '1fr 96px' : '1fr', gap: 0 }}>
                    <div style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--m3-on-surface-variant)', marginBottom: 6 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Sym name="schedule" size={14} /> {act.time}
                        </span>
                        <span>·</span>
                        <span>{act.dur}</span>
                        {vibe && <>
                          <span>·</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--m3-primary)' }}>
                            <Sym name={vibe.icon} size={14} fill={1} /> {vibe.label}
                          </span>
                        </>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--m3-tertiary-container)',
                          color: 'var(--m3-on-tertiary-container)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Sym name={act.icon} size={22} fill={1} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 16, fontWeight: 500 }}>{act.title}</div>
                          <div style={{ fontSize: 13, color: 'var(--m3-on-surface-variant)', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                            <Sym name="location_on" size={14} /> {act.where}
                          </div>
                        </div>
                      </div>
                      {inspired && (
                        <div style={{ marginTop: 10, padding: '6px 10px', background: 'var(--m3-secondary-container)',
                          color: 'var(--m3-on-secondary-container)', borderRadius: 8, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <Sym name="play_circle" size={14} fill={1} /> Inspired by {inspired.creator}
                        </div>
                      )}
                    </div>
                    {inspired && (
                      <div style={{ position: 'relative', overflow: 'hidden', minHeight: 96 }}>
                        <ShortVisual short={inspired} playing={false} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FAB */}
      <div style={{ position: 'absolute', right: 24, bottom: 24 }}>
        <M3FAB icon="add" label="Add activity" />
      </div>

      {/* Snackbar */}
      {savedSnack && (
        <div style={{ position: 'fixed', left: '50%', bottom: 24, transform: 'translateX(-50%)', zIndex: 30 }}>
          <div className="m3-snackbar">
            <Sym name="check_circle" size={18} fill={1} /> Trip saved · share link copied
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { WelcomeScreen, DetailsScreen, SwipeScreen, ReviewScreen, ItineraryScreen, ShortVisual });

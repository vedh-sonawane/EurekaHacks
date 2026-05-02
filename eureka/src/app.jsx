// App root — routing, theme bootstrap, tweaks panel.

const { useEffect: ue, useState: us } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "hue": 245,
  "dark": false,
  "showTweaks": true
}/*EDITMODE-END*/;

// Global animations
const __anim = `
  @keyframes blob1 { 0%,100% { border-radius: 60% 40% 55% 45% / 50% 60% 40% 50%; } 50% { border-radius: 40% 60% 45% 55% / 60% 40% 60% 40%; transform: rotate(8deg) scale(1.04); } }
  @keyframes blob2 { 0%,100% { border-radius: 45% 55% 40% 60% / 55% 45% 60% 40%; } 50% { border-radius: 55% 45% 60% 40% / 45% 60% 40% 55%; transform: rotate(-6deg) scale(1.05); } }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .35; } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  .screen-enter { animation: fadeIn .3s var(--m3-easing-emph); }
  input[type=range] { -webkit-appearance: none; height: 4px; background: var(--m3-surface-container-highest); border-radius: 2px; }
  input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 22px; height: 22px; border-radius: 50%; background: var(--m3-primary); cursor: pointer; border: 6px solid var(--m3-surface); box-shadow: 0 0 0 1px var(--m3-primary); }
  input[type=range]::-moz-range-thumb { width: 22px; height: 22px; border-radius: 50%; background: var(--m3-primary); cursor: pointer; border: 6px solid var(--m3-surface); box-shadow: 0 0 0 1px var(--m3-primary); }
`;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = us('welcome');
  const [state, setState] = us({
    destination: 'Bali, Indonesia',
    days: 5,
    season: 'spring',
    vibes: ['beach', 'food', 'photo', 'adventure'],
    notes: '',
    liked: [],
    skipped: [],
  });

  // Inject styles + animation
  ue(() => {
    injectM3Styles();
    if (!document.getElementById('__app_anim')) {
      const s = document.createElement('style');
      s.id = '__app_anim'; s.textContent = __anim; document.head.appendChild(s);
    }
  }, []);

  // Apply theme on hue / dark change
  ue(() => {
    const scheme = M3.buildScheme(t.hue, t.dark);
    M3.applyScheme(scheme);
    document.body.style.background = scheme.surfaceContainer;
    document.body.style.color = scheme.onSurface;
  }, [t.hue, t.dark]);

  const nav = (r, patch) => {
    if (patch) setState(s => ({ ...s, ...patch }));
    setRoute(r);
  };

  const screens = {
    welcome:   <WelcomeScreen   nav={nav} />,
    details:   <DetailsScreen   nav={nav} state={state} setState={setState} />,
    swipe:     <SwipeScreen     nav={nav} state={state} setState={setState} />,
    review:    <ReviewScreen    nav={nav} state={state} />,
    itinerary: <ItineraryScreen nav={nav} state={state} />,
  };

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', background: 'var(--m3-surface-container)', overflow: 'hidden' }}>
      {/* App canvas */}
      <div style={{ flex: 1, padding: 16, display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
        <div data-screen-label={route} className="screen-enter" key={route} style={{
          width: '100%', maxWidth: 1280, height: '100%', borderRadius: 28, background: 'var(--m3-surface)',
          color: 'var(--m3-on-surface)', boxShadow: '0 1px 4px var(--m3-shadow)', overflow: 'hidden',
          position: 'relative', display: 'flex', flexDirection: 'column',
        }}>
          {screens[route]}
        </div>
      </div>

      <TweaksPanel>
        <TweakSection label="Material You" />
        <TweakSlider label="Source hue" value={t.hue} min={180} max={285} step={1} unit="°"
          onChange={v => setTweak('hue', v)} />
        <TweakToggle label="Dark theme" value={t.dark} onChange={v => setTweak('dark', v)} />
        <TweakSection label="Jump to screen" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {['welcome', 'details', 'swipe', 'review', 'itinerary'].map(r => (
            <button key={r} onClick={() => setRoute(r)}
              style={{ padding: '6px 8px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                background: route === r ? 'rgba(0,80,180,.18)' : 'rgba(0,0,0,.04)',
                color: 'inherit', border: '.5px solid rgba(0,0,0,.08)', textTransform: 'capitalize' }}>{r}</button>
          ))}
        </div>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

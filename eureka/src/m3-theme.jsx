// Material 3 (Material You) theme tokens
// Tonal palettes generated via OKLCH around a seed hue.
// Following M3's role tokens: primary / secondary / tertiary / neutral / neutral-variant
// Each palette has 13 tones (0, 10, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 95, 99, 100)

function tonalPalette(hue, chromaPrimary = 0.13, chromaNeutral = false) {
  // Tones 0..100 → lightness in OKLCH approximate mapping
  const tones = {
    0: 0, 4: 0.05, 6: 0.07, 10: 0.12, 12: 0.14, 17: 0.18, 20: 0.22,
    22: 0.24, 24: 0.26, 25: 0.27, 30: 0.32, 35: 0.37, 40: 0.43, 50: 0.55,
    60: 0.65, 70: 0.74, 80: 0.83, 87: 0.88, 90: 0.91, 92: 0.93, 94: 0.94,
    95: 0.95, 96: 0.96, 98: 0.97, 99: 0.98, 100: 1
  };
  const out = {};
  const chroma = chromaNeutral ? 0.012 : chromaPrimary;
  for (const [tone, L] of Object.entries(tones)) {
    // Reduce chroma at extremes (near black/white) to keep readable
    const c = L < 0.08 || L > 0.96 ? chroma * 0.3 : chroma * (1 - Math.abs(L - 0.5) * 0.4);
    out[tone] = `oklch(${(L * 100).toFixed(1)}% ${c.toFixed(3)} ${hue})`;
  }
  return out;
}

function buildScheme(hue, dark = false) {
  const primary    = tonalPalette(hue, 0.15);
  const secondary  = tonalPalette(hue, 0.06);  // muted
  const tertiary   = tonalPalette(hue + 60, 0.12); // shifted hue (cyan-ish for blue)
  const neutral    = tonalPalette(hue, 0, true);
  const neutralVar = tonalPalette(hue, 0.012, true);
  const error      = tonalPalette(25, 0.16);

  if (!dark) {
    return {
      primary: primary[40],
      onPrimary: primary[100],
      primaryContainer: primary[90],
      onPrimaryContainer: primary[10],
      secondary: secondary[40],
      onSecondary: secondary[100],
      secondaryContainer: secondary[90],
      onSecondaryContainer: secondary[10],
      tertiary: tertiary[40],
      onTertiary: tertiary[100],
      tertiaryContainer: tertiary[90],
      onTertiaryContainer: tertiary[10],
      error: error[40],
      onError: error[100],
      errorContainer: error[90],
      onErrorContainer: error[10],
      // Surfaces (M3 expressive surface containers)
      background: neutral[98],
      onBackground: neutral[10],
      surface: neutral[98],
      onSurface: neutral[10],
      surfaceDim: neutral[87],
      surfaceBright: neutral[98],
      surfaceContainerLowest: neutral[100],
      surfaceContainerLow: neutral[96],
      surfaceContainer: neutral[94],
      surfaceContainerHigh: neutral[92],
      surfaceContainerHighest: neutral[90],
      onSurfaceVariant: neutralVar[30],
      outline: neutralVar[50],
      outlineVariant: neutralVar[80],
      inverseSurface: neutral[20],
      inverseOnSurface: neutral[95],
      inversePrimary: primary[80],
      scrim: 'rgba(0,0,0,.32)',
      shadow: 'rgba(0,0,0,.12)',
      // Custom: hero tints
      heroFrom: primary[80],
      heroTo: tertiary[80],
    };
  }
  return {
    primary: primary[80],
    onPrimary: primary[20],
    primaryContainer: primary[30],
    onPrimaryContainer: primary[90],
    secondary: secondary[80],
    onSecondary: secondary[20],
    secondaryContainer: secondary[30],
    onSecondaryContainer: secondary[90],
    tertiary: tertiary[80],
    onTertiary: tertiary[20],
    tertiaryContainer: tertiary[30],
    onTertiaryContainer: tertiary[90],
    error: error[80],
    onError: error[20],
    errorContainer: error[30],
    onErrorContainer: error[90],
    background: neutral[6],
    onBackground: neutral[90],
    surface: neutral[6],
    onSurface: neutral[90],
    surfaceDim: neutral[6],
    surfaceBright: neutral[24],
    surfaceContainerLowest: neutral[4],
    surfaceContainerLow: neutral[10],
    surfaceContainer: neutral[12],
    surfaceContainerHigh: neutral[17],
    surfaceContainerHighest: neutral[22],
    onSurfaceVariant: neutralVar[80],
    outline: neutralVar[60],
    outlineVariant: neutralVar[30],
    inverseSurface: neutral[90],
    inverseOnSurface: neutral[20],
    inversePrimary: primary[40],
    scrim: 'rgba(0,0,0,.6)',
    shadow: 'rgba(0,0,0,.5)',
    heroFrom: primary[30],
    heroTo: tertiary[30],
  };
}

function applyScheme(scheme) {
  const r = document.documentElement;
  for (const [k, v] of Object.entries(scheme)) {
    // camelCase -> --m3-kebab-case
    const cssKey = '--m3-' + k.replace(/[A-Z]/g, c => '-' + c.toLowerCase());
    r.style.setProperty(cssKey, v);
  }
}

window.M3 = { tonalPalette, buildScheme, applyScheme };

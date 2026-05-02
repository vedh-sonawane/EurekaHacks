// M3 components — buttons, chips, FAB, top app bar, list items, segmented buttons, sheets
// Uses CSS vars set on :root by m3-theme.jsx

const M3_STYLES = `
  :root {
    --m3-corner-xs: 4px;
    --m3-corner-sm: 8px;
    --m3-corner-md: 12px;
    --m3-corner-lg: 16px;
    --m3-corner-xl: 28px;
    --m3-corner-2xl: 36px;
    --m3-corner-full: 9999px;
    --m3-easing: cubic-bezier(.2, 0, 0, 1);
    --m3-easing-emph: cubic-bezier(.3, 0, 0, 1);
  }
  /* Filled button (M3) */
  .m3-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    border: none; cursor: pointer; user-select: none; transition: all .2s var(--m3-easing);
    font-family: inherit; font-weight: 500; letter-spacing: .01em; position: relative; overflow: hidden; }
  .m3-btn:disabled { opacity: .38; cursor: not-allowed; }

  .m3-btn-filled {
    background: var(--m3-primary); color: var(--m3-on-primary);
    height: 56px; padding: 0 28px; border-radius: var(--m3-corner-full); font-size: 16px;
    box-shadow: 0 1px 2px var(--m3-shadow);
  }
  .m3-btn-filled:hover:not(:disabled) { box-shadow: 0 2px 8px var(--m3-shadow); transform: translateY(-1px); }
  .m3-btn-filled:active:not(:disabled) { transform: translateY(0); border-radius: var(--m3-corner-md); }

  .m3-btn-tonal {
    background: var(--m3-secondary-container); color: var(--m3-on-secondary-container);
    height: 56px; padding: 0 28px; border-radius: var(--m3-corner-full); font-size: 16px;
  }
  .m3-btn-tonal:hover:not(:disabled) { filter: brightness(.97); }
  .m3-btn-tonal:active:not(:disabled) { border-radius: var(--m3-corner-md); }

  .m3-btn-text {
    background: transparent; color: var(--m3-primary);
    height: 40px; padding: 0 16px; border-radius: var(--m3-corner-full); font-size: 14px;
  }
  .m3-btn-text:hover:not(:disabled) { background: color-mix(in oklch, var(--m3-primary) 8%, transparent); }

  .m3-btn-outlined {
    background: transparent; color: var(--m3-primary);
    height: 56px; padding: 0 28px; border-radius: var(--m3-corner-full); font-size: 16px;
    border: 1px solid var(--m3-outline);
  }
  .m3-btn-outlined:hover:not(:disabled) { background: color-mix(in oklch, var(--m3-primary) 8%, transparent); }

  .m3-btn-icon {
    background: transparent; color: var(--m3-on-surface-variant);
    width: 40px; height: 40px; border-radius: var(--m3-corner-full);
  }
  .m3-btn-icon:hover:not(:disabled) { background: color-mix(in oklch, var(--m3-on-surface) 8%, transparent); }
  .m3-btn-icon.tonal { background: var(--m3-surface-container-high); color: var(--m3-on-surface); }

  /* FAB */
  .m3-fab {
    background: var(--m3-primary-container); color: var(--m3-on-primary-container);
    width: 56px; height: 56px; border-radius: var(--m3-corner-lg); border: none;
    display: inline-flex; align-items: center; justify-content: center; cursor: pointer;
    box-shadow: 0 3px 8px var(--m3-shadow); transition: all .2s var(--m3-easing);
  }
  .m3-fab:hover { transform: translateY(-2px); box-shadow: 0 6px 16px var(--m3-shadow); }
  .m3-fab.extended { width: auto; padding: 0 20px; gap: 12px; height: 56px; font-size: 14px; font-weight: 500; font-family: inherit; }
  .m3-fab.large { width: 96px; height: 96px; border-radius: var(--m3-corner-xl); }
  .m3-fab.primary { background: var(--m3-primary); color: var(--m3-on-primary); }

  /* Filter chip */
  .m3-chip { display: inline-flex; align-items: center; gap: 8px; height: 36px; padding: 0 16px;
    border-radius: var(--m3-corner-sm); border: 1px solid var(--m3-outline); background: transparent;
    color: var(--m3-on-surface-variant); font: 500 14px/1 inherit; cursor: pointer;
    transition: all .15s var(--m3-easing); }
  .m3-chip:hover { background: color-mix(in oklch, var(--m3-on-surface) 8%, transparent); }
  .m3-chip.selected { background: var(--m3-secondary-container); color: var(--m3-on-secondary-container); border-color: transparent; padding-left: 12px; }
  .m3-chip .symbol { font-size: 18px; }

  /* Card (filled / outlined) */
  .m3-card { background: var(--m3-surface-container-low); border-radius: var(--m3-corner-lg); padding: 16px; }
  .m3-card.elevated { background: var(--m3-surface-container-low); box-shadow: 0 1px 3px var(--m3-shadow); }
  .m3-card.outlined { background: var(--m3-surface); border: 1px solid var(--m3-outline-variant); }
  .m3-card.filled { background: var(--m3-surface-container-high); }

  /* Text field (filled M3) */
  .m3-tf { position: relative; }
  .m3-tf input, .m3-tf textarea {
    width: 100%; height: 56px; padding: 22px 16px 8px; border: none;
    background: var(--m3-surface-container-highest); color: var(--m3-on-surface);
    border-radius: var(--m3-corner-xs) var(--m3-corner-xs) 0 0; font: 500 16px/1.2 inherit;
    border-bottom: 1px solid var(--m3-on-surface-variant); outline: none;
  }
  .m3-tf textarea { height: auto; min-height: 96px; padding-top: 26px; resize: vertical; }
  .m3-tf input:focus, .m3-tf textarea:focus { border-bottom: 2px solid var(--m3-primary); padding-bottom: 7px; }
  .m3-tf label { position: absolute; left: 16px; top: 18px; color: var(--m3-on-surface-variant);
    font-size: 16px; pointer-events: none; transition: all .2s var(--m3-easing); }
  .m3-tf input:focus ~ label, .m3-tf input:not(:placeholder-shown) ~ label,
  .m3-tf textarea:focus ~ label, .m3-tf textarea:not(:placeholder-shown) ~ label {
    top: 8px; font-size: 12px; color: var(--m3-primary);
  }
  .m3-tf .leading-icon { position: absolute; left: 12px; top: 16px; color: var(--m3-on-surface-variant); }
  .m3-tf.with-leading input { padding-left: 48px; }
  .m3-tf.with-leading label { left: 48px; }

  /* Segmented buttons */
  .m3-seg { display: inline-flex; border: 1px solid var(--m3-outline); border-radius: var(--m3-corner-full); overflow: hidden; height: 40px; }
  .m3-seg button { background: transparent; border: none; padding: 0 18px; height: 100%;
    color: var(--m3-on-surface); font: 500 14px/1 inherit; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
    border-right: 1px solid var(--m3-outline); }
  .m3-seg button:last-child { border-right: none; }
  .m3-seg button.selected { background: var(--m3-secondary-container); color: var(--m3-on-secondary-container); }
  .m3-seg button .symbol { font-size: 18px; }

  /* Top app bar */
  .m3-appbar { display: flex; align-items: center; height: 64px; padding: 0 4px 0 4px;
    background: var(--m3-surface); color: var(--m3-on-surface); }
  .m3-appbar .title { flex: 1; font-size: 22px; font-weight: 500; padding: 0 8px; }

  /* Nav rail */
  .m3-rail { width: 88px; background: var(--m3-surface); display: flex; flex-direction: column;
    align-items: center; padding: 16px 0; gap: 4px; }
  .m3-rail .item { display: flex; flex-direction: column; align-items: center; gap: 4px;
    padding: 8px 0; cursor: pointer; width: 100%; color: var(--m3-on-surface-variant); }
  .m3-rail .item .pill { width: 56px; height: 32px; border-radius: 16px; display: flex; align-items: center; justify-content: center; transition: all .2s; }
  .m3-rail .item.active .pill { background: var(--m3-secondary-container); color: var(--m3-on-secondary-container); }
  .m3-rail .item .lbl { font-size: 12px; font-weight: 500; }
  .m3-rail .item.active .lbl { color: var(--m3-on-surface); }

  /* Switch */
  .m3-switch { position: relative; width: 52px; height: 32px; flex-shrink: 0; }
  .m3-switch input { opacity: 0; width: 100%; height: 100%; cursor: pointer; }
  .m3-switch .track { position: absolute; inset: 0; border-radius: 16px;
    background: var(--m3-surface-container-highest); border: 2px solid var(--m3-outline);
    transition: all .2s var(--m3-easing); }
  .m3-switch .thumb { position: absolute; top: 8px; left: 8px; width: 16px; height: 16px;
    border-radius: 8px; background: var(--m3-outline); transition: all .2s var(--m3-easing); }
  .m3-switch input:checked ~ .track { background: var(--m3-primary); border-color: var(--m3-primary); }
  .m3-switch input:checked ~ .thumb { left: 28px; width: 24px; height: 24px; top: 4px; background: var(--m3-on-primary); }

  /* Progress / step indicator */
  .m3-stepdot { width: 8px; height: 8px; border-radius: 50%; background: var(--m3-outline-variant); transition: all .2s; }
  .m3-stepdot.active { background: var(--m3-primary); width: 28px; border-radius: 4px; }
  .m3-stepdot.done { background: var(--m3-primary); }

  /* Snackbar */
  .m3-snackbar { background: var(--m3-inverse-surface); color: var(--m3-inverse-on-surface);
    padding: 14px 16px; border-radius: var(--m3-corner-xs); display: flex; align-items: center; gap: 16px;
    box-shadow: 0 4px 12px var(--m3-shadow); font-size: 14px; }

  /* Hero blob — abstract M3 expressive shape */
  .m3-blob { background: linear-gradient(135deg, var(--m3-hero-from), var(--m3-hero-to));
    border-radius: 60% 40% 55% 45% / 50% 60% 40% 50%; }

  /* Phone-style body container */
  .app-shell { background: var(--m3-surface); color: var(--m3-on-surface); }

  /* Short card aspect */
  .short-card { aspect-ratio: 9/16; border-radius: var(--m3-corner-xl); position: relative; overflow: hidden; }
`;

function injectM3Styles() {
  const id = '__m3_styles';
  if (document.getElementById(id)) return;
  const s = document.createElement('style');
  s.id = id; s.textContent = M3_STYLES; document.head.appendChild(s);
}

const Sym = ({ name, size = 24, fill = 0, weight = 400, style }) => (
  <span className="symbol" style={{
    fontSize: size,
    fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' 0, 'opsz' 24`,
    ...style,
  }}>{name}</span>
);

const M3Button = ({ variant = 'filled', icon, trailingIcon, children, ...rest }) => (
  <button className={`m3-btn m3-btn-${variant}`} {...rest}>
    {icon && <Sym name={icon} size={18} />}
    {children}
    {trailingIcon && <Sym name={trailingIcon} size={18} />}
  </button>
);

const M3IconBtn = ({ icon, tonal = false, size = 24, ...rest }) => (
  <button className={`m3-btn m3-btn-icon ${tonal ? 'tonal' : ''}`} {...rest}>
    <Sym name={icon} size={size} />
  </button>
);

const M3FAB = ({ icon, label, variant, size, ...rest }) => (
  <button className={`m3-fab ${variant || ''} ${size || ''} ${label ? 'extended' : ''}`} {...rest}>
    <Sym name={icon} size={size === 'large' ? 36 : 24} />
    {label}
  </button>
);

const M3Chip = ({ icon, selected, children, ...rest }) => (
  <button className={`m3-chip ${selected ? 'selected' : ''}`} {...rest}>
    {selected && <Sym name="check" size={18} />}
    {!selected && icon && <Sym name={icon} size={18} />}
    {children}
  </button>
);

const M3TextField = ({ label, leadingIcon, value, onChange, multiline, placeholder = ' ', ...rest }) => (
  <div className={`m3-tf ${leadingIcon ? 'with-leading' : ''}`}>
    {leadingIcon && <span className="leading-icon"><Sym name={leadingIcon} size={20} /></span>}
    {multiline
      ? <textarea value={value} onChange={onChange} placeholder={placeholder} {...rest} />
      : <input value={value} onChange={onChange} placeholder={placeholder} {...rest} />}
    <label>{label}</label>
  </div>
);

const M3Segmented = ({ options, value, onChange }) => (
  <div className="m3-seg">
    {options.map(o => (
      <button key={o.value} className={value === o.value ? 'selected' : ''} onClick={() => onChange(o.value)}>
        {o.icon && <Sym name={o.icon} size={18} />}
        {o.label}
      </button>
    ))}
  </div>
);

const M3Switch = ({ checked, onChange }) => (
  <label className="m3-switch">
    <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
    <span className="track" />
    <span className="thumb" />
  </label>
);

Object.assign(window, {
  injectM3Styles, Sym, M3Button, M3IconBtn, M3FAB, M3Chip, M3TextField, M3Segmented, M3Switch,
});

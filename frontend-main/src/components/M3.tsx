import type { CSSProperties, ReactNode } from "react";

// ── Symbol icon ───────────────────────────────────────────────────────────────
interface SymProps {
  name: string;
  size?: number;
  fill?: 0 | 1;
  weight?: number;
  style?: CSSProperties;
}
export function Sym({ name, size = 24, fill = 0, weight = 400, style }: SymProps) {
  return (
    <span
      className="symbol"
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' 0, 'opsz' 24`,
        ...style,
      }}
    >
      {name}
    </span>
  );
}

// ── Buttons ───────────────────────────────────────────────────────────────────
interface M3ButtonProps {
  variant?: "filled" | "tonal" | "text" | "outlined";
  icon?: string;
  trailingIcon?: string;
  children?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  style?: CSSProperties;
}
export function M3Button({ variant = "filled", icon, trailingIcon, children, ...rest }: M3ButtonProps) {
  return (
    <button className={`m3-btn m3-btn-${variant}`} {...rest}>
      {icon && <Sym name={icon} size={18} />}
      {children}
      {trailingIcon && <Sym name={trailingIcon} size={18} />}
    </button>
  );
}

interface M3IconBtnProps {
  icon: string;
  tonal?: boolean;
  size?: number;
  onClick?: () => void;
  disabled?: boolean;
  style?: CSSProperties;
  title?: string;
}
export function M3IconBtn({ icon, tonal = false, size = 24, ...rest }: M3IconBtnProps) {
  return (
    <button className={`m3-btn m3-btn-icon ${tonal ? "tonal" : ""}`} {...rest}>
      <Sym name={icon} size={size} />
    </button>
  );
}

interface M3FABProps {
  icon: string;
  label?: string;
  variant?: "primary" | "";
  size?: "large" | "";
  onClick?: () => void;
  disabled?: boolean;
  style?: CSSProperties;
}
export function M3FAB({ icon, label, variant = "", size = "", ...rest }: M3FABProps) {
  return (
    <button className={`m3-fab ${variant} ${size} ${label ? "extended" : ""}`.trim()} {...rest}>
      <Sym name={icon} size={size === "large" ? 36 : 24} />
      {label}
    </button>
  );
}

// ── Chip ──────────────────────────────────────────────────────────────────────
interface M3ChipProps {
  icon?: string;
  selected?: boolean;
  children?: ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
}
export function M3Chip({ icon, selected, children, ...rest }: M3ChipProps) {
  return (
    <button className={`m3-chip ${selected ? "selected" : ""}`} {...rest}>
      {selected && <Sym name="check" size={18} />}
      {!selected && icon && <Sym name={icon} size={18} />}
      {children}
    </button>
  );
}

// ── Text field ────────────────────────────────────────────────────────────────
interface M3TextFieldProps {
  label: string;
  leadingIcon?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  multiline?: boolean;
  placeholder?: string;
  style?: CSSProperties;
}
export function M3TextField({ label, leadingIcon, multiline, placeholder = " ", style, ...rest }: M3TextFieldProps) {
  return (
    <div className={`m3-tf ${leadingIcon ? "with-leading" : ""}`} style={style}>
      {leadingIcon && (
        <span className="leading-icon">
          <Sym name={leadingIcon} size={20} />
        </span>
      )}
      {multiline ? (
        <textarea placeholder={placeholder} {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} />
      ) : (
        <input placeholder={placeholder} {...(rest as React.InputHTMLAttributes<HTMLInputElement>)} />
      )}
      <label>{label}</label>
    </div>
  );
}

// ── Segmented control ─────────────────────────────────────────────────────────
interface SegOption {
  value: string;
  label: string;
  icon?: string;
}
interface M3SegmentedProps {
  options: SegOption[];
  value: string;
  onChange: (v: string) => void;
  style?: CSSProperties;
}
export function M3Segmented({ options, value, onChange, style }: M3SegmentedProps) {
  return (
    <div className="m3-seg" style={style}>
      {options.map((o) => (
        <button
          key={o.value}
          className={value === o.value ? "selected" : ""}
          onClick={() => onChange(o.value)}
        >
          {o.icon && <Sym name={o.icon} size={18} />}
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ── Step dot bar ──────────────────────────────────────────────────────────────
interface StepBarProps {
  step: number;
  total?: number;
}
export function StepBar({ step, total = 3 }: StepBarProps) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`m3-stepdot ${i < step ? "done" : ""} ${i === step ? "active" : ""}`}
        />
      ))}
    </div>
  );
}

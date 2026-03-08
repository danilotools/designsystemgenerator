"use client";

import { useMemo, useState } from "react";

type Mode = "landing" | "new" | "existing";
type AppTarget =
  | "Mobile App"
  | "Web App"
  | "Marketing Website"
  | "Dashboard / SaaS"
  | "Design System Library"
  | "Tablet"
  | "Other";
type Industry =
  | "SaaS"
  | "Fintech"
  | "E-commerce"
  | "Healthcare"
  | "AI / Tech"
  | "Education"
  | "Agency"
  | "Startup"
  | "Other";
type Personality =
  | "Modern"
  | "Playful"
  | "Premium"
  | "Minimal"
  | "Corporate"
  | "Friendly"
  | "Bold"
  | "Elegant"
  | "Technical"
  | "Creative"
  | "Other";
type Feeling =
  | "Trustworthy"
  | "Innovative"
  | "Calm"
  | "Energetic"
  | "Luxury"
  | "Accessible"
  | "Professional"
  | "Experimental"
  | "Other";

type ColorDirection =
  | "Warm"
  | "Cool"
  | "Neutral"
  | "Vibrant"
  | "Minimal"
  | "Muted"
  | "Other";
type InterfaceMode = "Light" | "Dark" | "Both";
type TypographyStyle =
  | "Modern Sans"
  | "Humanist Sans"
  | "Geometric Sans"
  | "Serif"
  | "Editorial"
  | "Technical"
  | "Other";
type TypeScale = "Compact" | "Balanced" | "Expressive";
type SpacingPref =
  | "Compact UI"
  | "Balanced spacing"
  | "Spacious layout"
  | "Dense dashboard layout"
  | "Mobile-first spacing"
  | "Other";
type AccessibilityPriority =
  | "Standard contrast"
  | "High contrast"
  | "WCAG focused";

type NewBrandData = {
  brandName: string;
  designingFor: AppTarget[];
  designingForOther: string;
  industry: Industry | "";
  industryOther: string;
  personality: Personality[];
  personalityOther: string;
  feeling: Feeling[];
  feelingOther: string;
  colorDirection: ColorDirection | "";
  colorDirectionOther: string;
  hasPrimaryColor: "Yes" | "No" | "";
  primaryColor: string;
  interfaceMode: InterfaceMode | "";
  typographyStyle: TypographyStyle | "";
  typographyStyleOther: string;
  fontPreference: string;
  typeScale: TypeScale | "";
  spacingPreference: SpacingPref | "";
  spacingOther: string;
  accessibilityPriority: AccessibilityPriority | "";
};

type ExistingBrandData = {
  brandName: string;
  brandColors: string[];
  primaryFontFamily: string;
  secondaryFontFamily: string;
  designingFor: Exclude<AppTarget, "Design System Library">[];
  designingForOther: string;
  typeScale: TypeScale | "";
  spacingScale: "Compact" | "Balanced" | "Spacious" | "";
  mode: InterfaceMode | "";
};

type DesignTokens = {
  colors: Record<string, string>;
  fontFamily: {
    primary: string;
    secondary: string;
  };
  fontSizes: Record<string, string>;
  lineHeights: Record<string, number>;
  fontWeights: Record<string, number>;
  spacingScale: Record<string, string>;
};

const NEW_TOTAL_STEPS = 14;
const EXISTING_TOTAL_STEPS = 9;

const initialNewBrand: NewBrandData = {
  brandName: "",
  designingFor: [],
  designingForOther: "",
  industry: "",
  industryOther: "",
  personality: [],
  personalityOther: "",
  feeling: [],
  feelingOther: "",
  colorDirection: "",
  colorDirectionOther: "",
  hasPrimaryColor: "",
  primaryColor: "#3b82f6",
  interfaceMode: "",
  typographyStyle: "",
  typographyStyleOther: "",
  fontPreference: "",
  typeScale: "",
  spacingPreference: "",
  spacingOther: "",
  accessibilityPriority: "",
};

const initialExistingBrand: ExistingBrandData = {
  brandName: "",
  brandColors: ["#3b82f6"],
  primaryFontFamily: "",
  secondaryFontFamily: "",
  designingFor: [],
  designingForOther: "",
  typeScale: "",
  spacingScale: "",
  mode: "",
};

const chipBase =
  "rounded-xl border px-4 py-2 text-sm transition-all duration-200 cursor-pointer";

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const normalized =
    clean.length === 3
      ? clean
          .split("")
          .map((ch) => ch + ch)
          .join("")
      : clean;
  const value = parseInt(normalized, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0"))
    .join("")}`;
}

function normalizeHex(value: string): string | null {
  const cleaned = value.trim().replace(/[^0-9a-fA-F]/g, "");
  if (!cleaned) return null;
  if (cleaned.length === 3 || cleaned.length === 6) return `#${cleaned.toLowerCase()}`;
  return null;
}

function toSixDigitHex(value: string): string {
  const normalized = normalizeHex(value) ?? "#3b82f6";
  const cleaned = normalized.replace("#", "");
  if (cleaned.length === 3) {
    return `#${cleaned
      .split("")
      .map((ch) => `${ch}${ch}`)
      .join("")
      .toLowerCase()}`;
  }
  return `#${cleaned.toLowerCase()}`;
}

function extractHexColors(input: string): string[] {
  const matches = input.match(/#?[0-9a-fA-F]{3,6}\b/g) ?? [];
  const valid = matches
    .map((entry) => normalizeHex(entry))
    .filter((entry): entry is string => entry !== null);
  return [...new Set(valid)];
}

function tint(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(
    r + (255 - r) * amount,
    g + (255 - g) * amount,
    b + (255 - b) * amount,
  );
}

function shade(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
}

function shiftHue(hex: string, shift: number): string {
  const [r, g, b] = hexToRgb(hex);
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;
  let h = 0;
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  if (delta !== 0) {
    if (max === rNorm) h = ((gNorm - bNorm) / delta) % 6;
    else if (max === gNorm) h = (bNorm - rNorm) / delta + 2;
    else h = (rNorm - gNorm) / delta + 4;
    h *= 60;
  }

  let newHue = (h + shift) % 360;
  if (newHue < 0) newHue += 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((newHue / 60) % 2) - 1));
  const m = l - c / 2;

  let r1 = 0;
  let g1 = 0;
  let b1 = 0;
  if (newHue < 60) [r1, g1, b1] = [c, x, 0];
  else if (newHue < 120) [r1, g1, b1] = [x, c, 0];
  else if (newHue < 180) [r1, g1, b1] = [0, c, x];
  else if (newHue < 240) [r1, g1, b1] = [0, x, c];
  else if (newHue < 300) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];

  return rgbToHex((r1 + m) * 255, (g1 + m) * 255, (b1 + m) * 255);
}

function getSecondaryFromPrimary(primary: string): string {
  return shiftHue(primary, 34);
}

function pxToNumber(value: string): number {
  return Number.parseFloat(value.replace("px", ""));
}

function getPrimaryFromDirection(direction: string): string {
  switch (direction) {
    case "Warm":
      return "#f97316";
    case "Cool":
      return "#3b82f6";
    case "Neutral":
      return "#6b7280";
    case "Vibrant":
      return "#d946ef";
    case "Minimal":
      return "#94a3b8";
    case "Muted":
      return "#64748b";
    default:
      return "#3b82f6";
  }
}

function getFontFromStyle(style: string, preferred: string): string {
  if (preferred.trim()) return preferred.trim();
  switch (style) {
    case "Modern Sans":
      return "Inter";
    case "Humanist Sans":
      return "IBM Plex Sans";
    case "Geometric Sans":
      return "Manrope";
    case "Serif":
      return "Merriweather";
    case "Editorial":
      return "Fraunces";
    case "Technical":
      return "Space Grotesk";
    default:
      return "Inter";
  }
}

function getTypeScale(style: string): Record<string, string> {
  if (style === "Compact") {
    return {
      xxs: "11px",
      xs: "12px",
      sm: "13px",
      md: "15px",
      lg: "17px",
      xl: "20px",
      "2xl": "24px",
      "3xl": "30px",
      "4xl": "36px",
      "5xl": "44px",
    };
  }
  if (style === "Expressive") {
    return {
      xxs: "12px",
      xs: "14px",
      sm: "16px",
      md: "18px",
      lg: "22px",
      xl: "28px",
      "2xl": "36px",
      "3xl": "46px",
      "4xl": "58px",
      "5xl": "72px",
    };
  }
  return {
    xxs: "11px",
    xs: "13px",
    sm: "14px",
    md: "16px",
    lg: "19px",
    xl: "24px",
    "2xl": "30px",
    "3xl": "38px",
    "4xl": "48px",
    "5xl": "60px",
  };
}

function getLineHeightsFromSizes(fontSizes: Record<string, string>): Record<string, number> {
  return Object.entries(fontSizes).reduce<Record<string, number>>((acc, [key, value]) => {
    const px = pxToNumber(value);
    const ratio = px >= 48 ? 1.16 : px >= 32 ? 1.2 : px >= 20 ? 1.3 : 1.4;
    const rounded = Math.ceil((px * ratio) / 4) * 4;
    acc[key] = rounded;
    return acc;
  }, {});
}

function getSpacingScale(pref: string): Record<string, string> {
  switch (pref) {
    case "Compact UI":
    case "Compact":
    case "Dense dashboard layout":
      return {
        1: "2px",
        2: "4px",
        3: "6px",
        4: "8px",
        5: "12px",
        6: "16px",
        7: "20px",
        8: "24px",
        9: "32px",
        10: "40px",
      };
    case "Spacious layout":
    case "Spacious":
      return {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        5: "24px",
        6: "32px",
        7: "40px",
        8: "48px",
        9: "64px",
        10: "80px",
      };
    case "Mobile-first spacing":
      return {
        1: "2px",
        2: "4px",
        3: "8px",
        4: "12px",
        5: "16px",
        6: "20px",
        7: "24px",
        8: "32px",
        9: "40px",
        10: "48px",
      };
    default:
      return {
        1: "4px",
        2: "6px",
        3: "10px",
        4: "14px",
        5: "20px",
        6: "28px",
        7: "36px",
        8: "44px",
        9: "56px",
        10: "72px",
      };
  }
}

function buildPalette(
  primary: string,
  secondary: string,
  mode: InterfaceMode | "",
): Record<string, string> {
  const base = primary || "#3b82f6";
  const secondaryBase = secondary || getSecondaryFromPrimary(base);
  return {
    "primary/50": tint(base, 0.9),
    "primary/100": tint(base, 0.75),
    "primary/200": tint(base, 0.55),
    "primary/300": tint(base, 0.35),
    "primary/400": tint(base, 0.18),
    "primary/500": base,
    "primary/600": shade(base, 0.15),
    "primary/700": shade(base, 0.3),
    "primary/800": shade(base, 0.45),
    "primary/900": shade(base, 0.6),
    "secondary/50": tint(secondaryBase, 0.9),
    "secondary/100": tint(secondaryBase, 0.75),
    "secondary/200": tint(secondaryBase, 0.55),
    "secondary/300": tint(secondaryBase, 0.35),
    "secondary/400": tint(secondaryBase, 0.18),
    "secondary/500": secondaryBase,
    "secondary/600": shade(secondaryBase, 0.15),
    "secondary/700": shade(secondaryBase, 0.3),
    "secondary/800": shade(secondaryBase, 0.45),
    "secondary/900": shade(secondaryBase, 0.6),
    "neutral/50": mode === "Light" ? "#f8fafc" : "#e2e8f0",
    "neutral/100": mode === "Light" ? "#f1f5f9" : "#cbd5e1",
    "neutral/200": mode === "Light" ? "#e2e8f0" : "#94a3b8",
    "neutral/300": mode === "Light" ? "#cbd5e1" : "#64748b",
    "neutral/400": mode === "Light" ? "#94a3b8" : "#475569",
    "neutral/500": mode === "Light" ? "#64748b" : "#334155",
    "neutral/600": mode === "Light" ? "#475569" : "#1e293b",
    "neutral/700": mode === "Light" ? "#334155" : "#0f172a",
    "neutral/800": mode === "Light" ? "#1e293b" : "#0b1220",
    "neutral/900": mode === "Light" ? "#0f172a" : "#020617",
  };
}

function generateTokensFromNew(data: NewBrandData): DesignTokens {
  const baseColor =
    data.hasPrimaryColor === "Yes" ? data.primaryColor : getPrimaryFromDirection(data.colorDirection);
  const secondaryColor = getSecondaryFromPrimary(baseColor);
  const fontSizes = getTypeScale(data.typeScale);
  return {
    colors: buildPalette(baseColor, secondaryColor, data.interfaceMode),
    fontFamily: {
      primary: getFontFromStyle(data.typographyStyle, data.fontPreference),
      secondary: data.typographyStyle === "Serif" ? "Inter" : "Merriweather",
    },
    fontSizes,
    lineHeights: getLineHeightsFromSizes(fontSizes),
    fontWeights:
      data.accessibilityPriority === "High contrast" || data.accessibilityPriority === "WCAG focused"
        ? { regular: 500, medium: 600, semibold: 700, bold: 800 }
        : { regular: 400, medium: 500, semibold: 600, bold: 700 },
    spacingScale: getSpacingScale(data.spacingPreference),
  };
}

function generateTokensFromExisting(data: ExistingBrandData): DesignTokens {
  const primary = data.brandColors[0] || "#3b82f6";
  const secondary = data.brandColors[1] || getSecondaryFromPrimary(primary);
  const fontSizes = getTypeScale(data.typeScale);
  return {
    colors: buildPalette(primary, secondary, data.mode),
    fontFamily: {
      primary: data.primaryFontFamily || "Inter",
      secondary: data.secondaryFontFamily || "Merriweather",
    },
    fontSizes,
    lineHeights: getLineHeightsFromSizes(fontSizes),
    fontWeights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
    spacingScale: getSpacingScale(data.spacingScale),
  };
}

function toDtcgFigmaVariables(tokens: DesignTokens) {
  const colorScales = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"];
  const colors = {
    primary: colorScales.reduce<Record<string, { $type: "color"; $value: string }>>((acc, scale) => {
      acc[scale] = { $type: "color", $value: toSixDigitHex(tokens.colors[`primary/${scale}`]) };
      return acc;
    }, {}),
    secondary: colorScales.reduce<Record<string, { $type: "color"; $value: string }>>((acc, scale) => {
      acc[scale] = { $type: "color", $value: toSixDigitHex(tokens.colors[`secondary/${scale}`]) };
      return acc;
    }, {}),
    neutral: colorScales.reduce<Record<string, { $type: "color"; $value: string }>>((acc, scale) => {
      acc[scale] = { $type: "color", $value: toSixDigitHex(tokens.colors[`neutral/${scale}`]) };
      return acc;
    }, {}),
  };

  const fontSizes = Object.entries(tokens.fontSizes).reduce<Record<string, { $type: "number"; $value: number }>>(
    (acc, [size, value]) => {
      acc[size] = { $type: "number", $value: pxToNumber(value) };
      return acc;
    },
    {},
  );

  const lineHeights = Object.entries(tokens.lineHeights).reduce<Record<string, { $type: "number"; $value: number }>>(
    (acc, [size, value]) => {
      acc[size] = { $type: "number", $value: value };
      return acc;
    },
    {},
  );
  const spacingScale = Object.entries(tokens.spacingScale).reduce<Record<string, { $type: "number"; $value: number }>>(
    (acc, [step, value]) => {
      acc[step] = { $type: "number", $value: pxToNumber(value) };
      return acc;
    },
    {},
  );

  return {
    colors,
    typography: {
      fontFamily: {
        primary: { $type: "string", $value: tokens.fontFamily.primary },
        secondary: { $type: "string", $value: tokens.fontFamily.secondary },
      },
      fontSizes,
      lineHeights,
    },
    spacing: {
      scale: spacingScale,
    },
  };
}

function IconNew() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-blue-300">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconImport() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-blue-300">
      <path
        d="M12 4v10m0 0 4-4m-4 4-4-4M5 16v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StepShell({
  title,
  description,
  step,
  total,
  children,
  onBack,
  onNext,
  nextLabel = "Next",
  canBack = true,
  nextDisabled = false,
  nextDisabledReason,
}: {
  title: string;
  description?: string;
  step: number;
  total: number;
  children: React.ReactNode;
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  canBack?: boolean;
  nextDisabled?: boolean;
  nextDisabledReason?: string;
}) {
  const progress = Math.round((step / total) * 100);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-10 sm:px-8">
      <div className="mb-10">
        <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-400">
          <span>
            Step {step} / {total}
          </span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-800/90">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="step-panel rounded-3xl border border-slate-700/60 bg-slate-900/70 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)] sm:p-8">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-50">{title}</h2>
        {description ? <p className="mt-2 text-slate-400">{description}</p> : null}
        <div className="mt-7">{children}</div>
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <button
          type="button"
          disabled={!canBack}
          onClick={onBack}
          className="rounded-xl border border-slate-700 bg-slate-900/70 px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Back
        </button>
        <button
          type="button"
          disabled={nextDisabled}
          onClick={onNext}
          className="rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {nextLabel}
        </button>
      </div>
      {nextDisabledReason ? <p className="mt-2 text-right text-xs text-slate-500">{nextDisabledReason}</p> : null}
    </div>
  );
}

function TokenPreview({ tokens }: { tokens: DesignTokens }) {
  const scales = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"];
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-xs uppercase tracking-[0.15em] text-slate-400">
          Color Palette (Primary, Secondary, Neutral)
        </h3>
        <div className="space-y-3">
          {["primary", "secondary", "neutral"].map((group) => (
            <div key={group} className="rounded-xl border border-slate-700/70 bg-slate-900 p-3">
              <div className="mb-2 text-xs uppercase tracking-[0.12em] text-slate-300">{group}</div>
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
                {scales.map((scale) => {
                  const key = `${group}/${scale}`;
                  const value = tokens.colors[key];
                  return (
                    <div key={key} className="rounded-md border border-slate-700/70 p-1">
                      <div className="h-7 rounded-sm" style={{ background: value }} />
                      <div className="mt-1 text-[10px] text-slate-400">{scale}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-700/70 bg-slate-900 p-4">
          <h3 className="mb-3 text-xs uppercase tracking-[0.15em] text-slate-400">Typography</h3>
          <p className="text-sm text-slate-300">Primary: {tokens.fontFamily.primary}</p>
          <p className="text-sm text-slate-300">Secondary: {tokens.fontFamily.secondary}</p>
          <p className="mt-3 text-2xl font-semibold text-slate-100">Display Preview</p>
          <p className="text-sm text-slate-400">Body text preview for hierarchy.</p>
        </div>

        <div className="rounded-xl border border-slate-700/70 bg-slate-900 p-4">
          <h3 className="mb-3 text-xs uppercase tracking-[0.15em] text-slate-400">Spacing Scale</h3>
          <div className="space-y-2">
            {Object.entries(tokens.spacingScale)
              .slice(0, 10)
              .map(([k, v]) => (
                <div key={k} className="flex items-center justify-between text-sm text-slate-300">
                  <span>space-{k}</span>
                  <span>{v}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function JsonPanel({ tokens }: { tokens: DesignTokens }) {
  const figmaJson = useMemo(() => toDtcgFigmaVariables(tokens), [tokens]);
  const json = useMemo(() => JSON.stringify(figmaJson, null, 2), [figmaJson]);

  function downloadJson() {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "figma-variables.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copyJson() {
    await navigator.clipboard.writeText(json);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={downloadJson}
          className="rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-400"
        >
          Download JSON
        </button>
        <button
          type="button"
          onClick={copyJson}
          className="rounded-xl border border-slate-600 bg-slate-900/80 px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-slate-400"
        >
          Copy JSON
        </button>
      </div>
      <pre className="max-h-[360px] overflow-auto rounded-2xl border border-slate-700/80 bg-[#06090f] p-4 text-xs text-slate-300">
        {json}
      </pre>
    </div>
  );
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("landing");

  const [newStep, setNewStep] = useState(1);
  const [newData, setNewData] = useState<NewBrandData>(initialNewBrand);
  const [newTokens, setNewTokens] = useState<DesignTokens | null>(null);

  const [existingStep, setExistingStep] = useState(1);
  const [existingData, setExistingData] = useState<ExistingBrandData>(initialExistingBrand);
  const [existingTokens, setExistingTokens] = useState<DesignTokens | null>(null);
  const [existingImportText, setExistingImportText] = useState("");
  const [existingImportError, setExistingImportError] = useState("");

  const generatedTokens = newTokens || existingTokens;

  const isFinal =
    (mode === "new" && newTokens !== null) || (mode === "existing" && existingTokens !== null);

  if (isFinal && generatedTokens) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10 sm:px-8">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-50">Design System Generator</h1>
            <p className="mt-2 text-slate-400">Your design system tokens are ready for Figma variables JSON.</p>
          </div>
          <button
            className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm text-slate-200"
            onClick={() => {
              setMode("landing");
              setNewStep(1);
              setExistingStep(1);
              setNewTokens(null);
              setExistingTokens(null);
            }}
          >
            New Project
          </button>
        </header>

        <div className="rounded-3xl border border-slate-700/70 bg-slate-900/70 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)] sm:p-8">
          <TokenPreview tokens={generatedTokens} />
          <div className="mt-8">
            <JsonPanel tokens={generatedTokens} />
          </div>
        </div>
      </main>
    );
  }

  if (mode === "landing") {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-6 py-16 sm:px-8">
        <div className="mb-10 text-center">
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl">
            Design System Generator
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            Generate color, typography, and spacing systems, then export JSON compatible with Figma variables.
          </p>
        </div>

        <div className="grid w-full max-w-3xl gap-5 sm:grid-cols-2">
          <button
            className="group rounded-3xl border border-slate-700/80 bg-slate-900/70 p-8 text-left transition duration-300 hover:-translate-y-0.5 hover:border-blue-400/60 hover:shadow-[0_12px_48px_rgba(59,130,246,0.15)]"
            onClick={() => {
              setMode("new");
              setNewStep(1);
              setNewTokens(null);
            }}
          >
            <div className="mb-4 inline-flex rounded-xl border border-slate-700 bg-slate-950 p-2">
              <IconNew />
            </div>
            <h2 className="text-2xl font-semibold text-slate-100">New Brand</h2>
            <p className="mt-2 text-sm text-slate-400">
              Start a design system from scratch using guided questions.
            </p>
          </button>

          <button
            className="group rounded-3xl border border-slate-700/80 bg-slate-900/70 p-8 text-left transition duration-300 hover:-translate-y-0.5 hover:border-blue-400/60 hover:shadow-[0_12px_48px_rgba(59,130,246,0.15)]"
            onClick={() => {
              setMode("existing");
              setExistingStep(1);
              setExistingTokens(null);
              setExistingImportText("");
              setExistingImportError("");
            }}
          >
            <div className="mb-4 inline-flex rounded-xl border border-slate-700 bg-slate-950 p-2">
              <IconImport />
            </div>
            <h2 className="text-2xl font-semibold text-slate-100">Existing Brand</h2>
            <p className="mt-2 text-sm text-slate-400">
              Import brand colors and fonts to generate a design system.
            </p>
          </button>
        </div>
      </main>
    );
  }

  if (mode === "new") {
    const step = newStep;
    const set = (patch: Partial<NewBrandData>) => setNewData((prev) => ({ ...prev, ...patch }));

    if (step === 1) {
      return (
        <StepShell
          title="Brand Name"
          step={1}
          total={NEW_TOTAL_STEPS}
          onBack={() => setMode("landing")}
          onNext={() => setNewStep(2)}
          canBack
          nextDisabled={!newData.brandName.trim()}
          nextDisabledReason={!newData.brandName.trim() ? "Brand name is required." : undefined}
        >
          <input
            value={newData.brandName}
            onChange={(e) => set({ brandName: e.target.value })}
            placeholder="Acme Studio"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none ring-blue-400 transition focus:ring"
          />
        </StepShell>
      );
    }

    if (step === 2) {
      const options: AppTarget[] = [
        "Mobile App",
        "Web App",
        "Marketing Website",
        "Dashboard / SaaS",
        "Design System Library",
        "Tablet",
        "Other",
      ];
      return (
        <StepShell
          title="What are you designing for?"
          description="Multi-select. This influences typography scale and spacing."
          step={2}
          total={NEW_TOTAL_STEPS}
          onBack={() => setNewStep(1)}
          onNext={() => setNewStep(3)}
          nextDisabled={
            newData.designingFor.length === 0 ||
            (newData.designingFor.includes("Other") && !newData.designingForOther.trim())
          }
          nextDisabledReason={
            newData.designingFor.length === 0
              ? "Select at least one option."
              : newData.designingFor.includes("Other") && !newData.designingForOther.trim()
                ? "Please fill the Other field."
                : undefined
          }
        >
          <div className="flex flex-wrap gap-3">
            {options.map((opt) => {
              const active = newData.designingFor.includes(opt);
              return (
                <button
                  key={opt}
                  className={`${chipBase} ${
                    active
                      ? "border-blue-400 bg-blue-500/20 text-blue-100"
                      : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
                  }`}
                  onClick={() =>
                    set({
                      designingFor: active
                        ? newData.designingFor.filter((v) => v !== opt)
                        : [...newData.designingFor, opt],
                    })
                  }
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {newData.designingFor.includes("Other") ? (
            <input
              className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none ring-blue-400 transition focus:ring"
              placeholder="Tell us more"
              value={newData.designingForOther}
              onChange={(e) => set({ designingForOther: e.target.value })}
            />
          ) : null}
        </StepShell>
      );
    }

    if (step === 3) {
      const options: Industry[] = [
        "SaaS",
        "Fintech",
        "E-commerce",
        "Healthcare",
        "AI / Tech",
        "Education",
        "Agency",
        "Startup",
        "Other",
      ];
      return (
        <StepShell
          title="Industry"
          step={3}
          total={NEW_TOTAL_STEPS}
          onBack={() => setNewStep(2)}
          onNext={() => setNewStep(4)}
          nextDisabled={!newData.industry || (newData.industry === "Other" && !newData.industryOther.trim())}
          nextDisabledReason={
            !newData.industry
              ? "Select an industry."
              : newData.industry === "Other" && !newData.industryOther.trim()
                ? "Please fill the Other field."
                : undefined
          }
        >
          <div className="flex flex-wrap gap-3">
            {options.map((opt) => (
              <button
                key={opt}
                className={`${chipBase} ${
                  newData.industry === opt
                    ? "border-blue-400 bg-blue-500/20 text-blue-100"
                    : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
                }`}
                onClick={() => set({ industry: opt })}
              >
                {opt}
              </button>
            ))}
          </div>
          {newData.industry === "Other" ? (
            <input
              className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none ring-blue-400 transition focus:ring"
              placeholder="Industry"
              value={newData.industryOther}
              onChange={(e) => set({ industryOther: e.target.value })}
            />
          ) : null}
        </StepShell>
      );
    }

    if (step === 4) {
      const options: Personality[] = [
        "Modern",
        "Playful",
        "Premium",
        "Minimal",
        "Corporate",
        "Friendly",
        "Bold",
        "Elegant",
        "Technical",
        "Creative",
        "Other",
      ];
      return (
        <StepShell
          title="Brand Personality"
          description="Multi-select (up to 3)."
          step={4}
          total={NEW_TOTAL_STEPS}
          onBack={() => setNewStep(3)}
          onNext={() => setNewStep(5)}
          nextDisabled={
            newData.personality.length === 0 ||
            (newData.personality.includes("Other") && !newData.personalityOther.trim())
          }
          nextDisabledReason={
            newData.personality.length === 0
              ? "Select at least one personality."
              : newData.personality.includes("Other") && !newData.personalityOther.trim()
                ? "Please fill the Other field."
                : undefined
          }
        >
          <div className="flex flex-wrap gap-3">
            {options.map((opt) => {
              const active = newData.personality.includes(opt);
              const blocked = !active && newData.personality.length >= 3;
              return (
                <button
                  key={opt}
                  disabled={blocked}
                  className={`${chipBase} ${
                    active
                      ? "border-blue-400 bg-blue-500/20 text-blue-100"
                      : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500 disabled:opacity-30"
                  }`}
                  onClick={() =>
                    set({
                      personality: active
                        ? newData.personality.filter((v) => v !== opt)
                        : [...newData.personality, opt],
                    })
                  }
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {newData.personality.includes("Other") ? (
            <input
              className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none ring-blue-400 transition focus:ring"
              placeholder="Describe personality"
              value={newData.personalityOther}
              onChange={(e) => set({ personalityOther: e.target.value })}
            />
          ) : null}
        </StepShell>
      );
    }

    if (step === 5) {
      const options: Feeling[] = [
        "Trustworthy",
        "Innovative",
        "Calm",
        "Energetic",
        "Luxury",
        "Accessible",
        "Professional",
        "Experimental",
        "Other",
      ];
      return (
        <StepShell
          title="Desired Brand Feeling"
          step={5}
          total={NEW_TOTAL_STEPS}
          onBack={() => setNewStep(4)}
          onNext={() => setNewStep(6)}
          nextDisabled={
            newData.feeling.length === 0 ||
            (newData.feeling.includes("Other") && !newData.feelingOther.trim())
          }
          nextDisabledReason={
            newData.feeling.length === 0
              ? "Select at least one feeling."
              : newData.feeling.includes("Other") && !newData.feelingOther.trim()
                ? "Please fill the Other field."
                : undefined
          }
        >
          <div className="flex flex-wrap gap-3">
            {options.map((opt) => {
              const active = newData.feeling.includes(opt);
              return (
                <button
                  key={opt}
                  className={`${chipBase} ${
                    active
                      ? "border-blue-400 bg-blue-500/20 text-blue-100"
                      : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
                  }`}
                  onClick={() =>
                    set({
                      feeling: active
                        ? newData.feeling.filter((v) => v !== opt)
                        : [...newData.feeling, opt],
                    })
                  }
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {newData.feeling.includes("Other") ? (
            <input
              className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none ring-blue-400 transition focus:ring"
              placeholder="Describe desired feeling"
              value={newData.feelingOther}
              onChange={(e) => set({ feelingOther: e.target.value })}
            />
          ) : null}
        </StepShell>
      );
    }

    if (step === 6) {
      const options: ColorDirection[] = ["Warm", "Cool", "Neutral", "Vibrant", "Minimal", "Muted", "Other"];
      return (
        <StepShell
          title="Color Direction"
          step={6}
          total={NEW_TOTAL_STEPS}
          onBack={() => setNewStep(5)}
          onNext={() => setNewStep(7)}
          nextDisabled={
            !newData.colorDirection ||
            (newData.colorDirection === "Other" && !newData.colorDirectionOther.trim())
          }
          nextDisabledReason={
            !newData.colorDirection
              ? "Select a color direction."
              : newData.colorDirection === "Other" && !newData.colorDirectionOther.trim()
                ? "Please fill the Other field."
                : undefined
          }
        >
          <div className="flex flex-wrap gap-3">
            {options.map((opt) => (
              <button
                key={opt}
                className={`${chipBase} ${
                  newData.colorDirection === opt
                    ? "border-blue-400 bg-blue-500/20 text-blue-100"
                    : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
                }`}
                onClick={() => set({ colorDirection: opt })}
              >
                {opt}
              </button>
            ))}
          </div>
          {newData.colorDirection === "Other" ? (
            <input
              className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none ring-blue-400 transition focus:ring"
              placeholder="Color direction"
              value={newData.colorDirectionOther}
              onChange={(e) => set({ colorDirectionOther: e.target.value })}
            />
          ) : null}
        </StepShell>
      );
    }

    if (step === 7) {
      return (
        <StepShell
          title="Do you already have a primary color?"
          step={7}
          total={NEW_TOTAL_STEPS}
          onBack={() => setNewStep(6)}
          onNext={() => setNewStep(8)}
          nextDisabled={
            !newData.hasPrimaryColor ||
            (newData.hasPrimaryColor === "Yes" && !normalizeHex(newData.primaryColor))
          }
          nextDisabledReason={
            !newData.hasPrimaryColor
              ? "Select Yes or No."
              : newData.hasPrimaryColor === "Yes" && !normalizeHex(newData.primaryColor)
                ? "Enter a valid HEX primary color."
                : undefined
          }
        >
          <div className="flex flex-wrap gap-3">
            {(["Yes", "No"] as const).map((opt) => (
              <button
                key={opt}
                className={`${chipBase} ${
                  newData.hasPrimaryColor === opt
                    ? "border-blue-400 bg-blue-500/20 text-blue-100"
                    : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
                }`}
                onClick={() => set({ hasPrimaryColor: opt })}
              >
                {opt}
              </button>
            ))}
          </div>
          {newData.hasPrimaryColor === "Yes" ? (
            <div className="mt-4 flex items-center gap-3">
              <input
                type="color"
                className="h-12 w-20 rounded-lg border border-slate-600 bg-slate-950"
                value={newData.primaryColor}
                onChange={(e) => set({ primaryColor: e.target.value })}
              />
              <input
                value={newData.primaryColor}
                onChange={(e) => set({ primaryColor: e.target.value })}
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none ring-blue-400 transition focus:ring"
              />
            </div>
          ) : null}
        </StepShell>
      );
    }

    if (step === 8) {
      return (
        <StepShell
          title="Interface Mode"
          step={8}
          total={NEW_TOTAL_STEPS}
          onBack={() => setNewStep(7)}
          onNext={() => setNewStep(9)}
          nextDisabled={!newData.interfaceMode}
          nextDisabledReason={!newData.interfaceMode ? "Select an interface mode." : undefined}
        >
          <div className="flex flex-wrap gap-3">
            {(["Light", "Dark", "Both"] as const).map((opt) => (
              <button
                key={opt}
                className={`${chipBase} ${
                  newData.interfaceMode === opt
                    ? "border-blue-400 bg-blue-500/20 text-blue-100"
                    : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
                }`}
                onClick={() => set({ interfaceMode: opt })}
              >
                {opt}
              </button>
            ))}
          </div>
        </StepShell>
      );
    }

    if (step === 9) {
      const options: TypographyStyle[] = [
        "Modern Sans",
        "Humanist Sans",
        "Geometric Sans",
        "Serif",
        "Editorial",
        "Technical",
        "Other",
      ];
      return (
        <StepShell
          title="Typography Style"
          step={9}
          total={NEW_TOTAL_STEPS}
          onBack={() => setNewStep(8)}
          onNext={() => setNewStep(10)}
          nextDisabled={
            !newData.typographyStyle ||
            (newData.typographyStyle === "Other" && !newData.typographyStyleOther.trim())
          }
          nextDisabledReason={
            !newData.typographyStyle
              ? "Select a typography style."
              : newData.typographyStyle === "Other" && !newData.typographyStyleOther.trim()
                ? "Please fill the Other field."
                : undefined
          }
        >
          <div className="flex flex-wrap gap-3">
            {options.map((opt) => (
              <button
                key={opt}
                className={`${chipBase} ${
                  newData.typographyStyle === opt
                    ? "border-blue-400 bg-blue-500/20 text-blue-100"
                    : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
                }`}
                onClick={() => set({ typographyStyle: opt })}
              >
                {opt}
              </button>
            ))}
          </div>
          {newData.typographyStyle === "Other" ? (
            <input
              className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none ring-blue-400 transition focus:ring"
              placeholder="Typography style"
              value={newData.typographyStyleOther}
              onChange={(e) => set({ typographyStyleOther: e.target.value })}
            />
          ) : null}
        </StepShell>
      );
    }

    if (step === 10) {
      return (
        <StepShell
          title="Font Preference (optional)"
          step={10}
          total={NEW_TOTAL_STEPS}
          onBack={() => setNewStep(9)}
          onNext={() => setNewStep(11)}
        >
          <input
            value={newData.fontPreference}
            onChange={(e) => set({ fontPreference: e.target.value })}
            placeholder="Inter, Helvetica, IBM Plex Sans"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none ring-blue-400 transition focus:ring"
          />
        </StepShell>
      );
    }

    if (step === 11) {
      return (
        <StepShell
          title="Typography Scale Style"
          step={11}
          total={NEW_TOTAL_STEPS}
          onBack={() => setNewStep(10)}
          onNext={() => setNewStep(12)}
          nextDisabled={!newData.typeScale}
          nextDisabledReason={!newData.typeScale ? "Select a scale style." : undefined}
        >
          <div className="flex flex-wrap gap-3">
            {(["Compact", "Balanced", "Expressive"] as const).map((opt) => (
              <button
                key={opt}
                className={`${chipBase} ${
                  newData.typeScale === opt
                    ? "border-blue-400 bg-blue-500/20 text-blue-100"
                    : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
                }`}
                onClick={() => set({ typeScale: opt })}
              >
                {opt}
              </button>
            ))}
          </div>
        </StepShell>
      );
    }

    if (step === 12) {
      const options: SpacingPref[] = [
        "Compact UI",
        "Balanced spacing",
        "Spacious layout",
        "Dense dashboard layout",
        "Mobile-first spacing",
        "Other",
      ];
      return (
        <StepShell
          title="Spacing Scale Preference"
          description="This defines layout rhythm and spacing tokens."
          step={12}
          total={NEW_TOTAL_STEPS}
          onBack={() => setNewStep(11)}
          onNext={() => setNewStep(13)}
          nextDisabled={
            !newData.spacingPreference ||
            (newData.spacingPreference === "Other" && !newData.spacingOther.trim())
          }
          nextDisabledReason={
            !newData.spacingPreference
              ? "Select a spacing preference."
              : newData.spacingPreference === "Other" && !newData.spacingOther.trim()
                ? "Please fill the Other field."
                : undefined
          }
        >
          <div className="flex flex-wrap gap-3">
            {options.map((opt) => (
              <button
                key={opt}
                className={`${chipBase} ${
                  newData.spacingPreference === opt
                    ? "border-blue-400 bg-blue-500/20 text-blue-100"
                    : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
                }`}
                onClick={() => set({ spacingPreference: opt })}
              >
                {opt}
              </button>
            ))}
          </div>
          {newData.spacingPreference === "Other" ? (
            <input
              className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none ring-blue-400 transition focus:ring"
              placeholder="Spacing preference"
              value={newData.spacingOther}
              onChange={(e) => set({ spacingOther: e.target.value })}
            />
          ) : null}
        </StepShell>
      );
    }

    if (step === 13) {
      return (
        <StepShell
          title="Accessibility Priority"
          step={13}
          total={NEW_TOTAL_STEPS}
          onBack={() => setNewStep(12)}
          onNext={() => setNewStep(14)}
          nextDisabled={!newData.accessibilityPriority}
          nextDisabledReason={!newData.accessibilityPriority ? "Select accessibility priority." : undefined}
        >
          <div className="flex flex-wrap gap-3">
            {(["Standard contrast", "High contrast", "WCAG focused"] as const).map((opt) => (
              <button
                key={opt}
                className={`${chipBase} ${
                  newData.accessibilityPriority === opt
                    ? "border-blue-400 bg-blue-500/20 text-blue-100"
                    : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
                }`}
                onClick={() => set({ accessibilityPriority: opt })}
              >
                {opt}
              </button>
            ))}
          </div>
        </StepShell>
      );
    }

    const previewTokens = generateTokensFromNew(newData);

    return (
      <StepShell
        title="Review"
        description="Preview your generated design tokens before export."
        step={14}
        total={NEW_TOTAL_STEPS}
        onBack={() => setNewStep(13)}
        onNext={() => setNewTokens(previewTokens)}
        nextLabel="Generate Design System"
      >
        <TokenPreview tokens={previewTokens} />
      </StepShell>
    );
  }

  const step = existingStep;
  const set = (patch: Partial<ExistingBrandData>) =>
    setExistingData((prev) => ({ ...prev, ...patch }));

  if (step === 1) {
    return (
      <StepShell
        title="Brand Name"
        step={1}
        total={EXISTING_TOTAL_STEPS}
        onBack={() => setMode("landing")}
        onNext={() => setExistingStep(2)}
        nextDisabled={!existingData.brandName.trim()}
        nextDisabledReason={!existingData.brandName.trim() ? "Brand name is required." : undefined}
      >
        <input
          value={existingData.brandName}
          onChange={(e) => set({ brandName: e.target.value })}
          placeholder="Acme Studio"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none ring-blue-400 transition focus:ring"
        />
      </StepShell>
    );
  }

  if (step === 2) {
    return (
      <StepShell
        title="Import Brand Colors"
        description="Add one or more hex colors and preview the palette."
        step={2}
        total={EXISTING_TOTAL_STEPS}
        onBack={() => setExistingStep(1)}
        onNext={() => {
          const normalized = existingData.brandColors
            .map((color) => normalizeHex(color))
            .filter((color): color is string => color !== null);
          const unique = [...new Set(normalized)];
          set({ brandColors: unique.length > 0 ? unique : ["#3b82f6"] });
          setExistingStep(3);
        }}
        nextDisabled={
          existingData.brandColors.length === 0 ||
          existingData.brandColors.some((color) => !normalizeHex(color))
        }
        nextDisabledReason={
          existingData.brandColors.length === 0
            ? "Add at least one valid HEX color."
            : existingData.brandColors.some((color) => !normalizeHex(color))
              ? "Fix invalid HEX values before continuing."
              : undefined
        }
      >
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-700/80 bg-slate-950/70 p-3">
            <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-slate-400">
              Paste HEX colors (comma, space, or newline separated)
            </label>
            <textarea
              value={existingImportText}
              onChange={(e) => setExistingImportText(e.target.value)}
              placeholder="#3b82f6, #22c55e, #f97316"
              className="h-20 w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-blue-400 transition focus:ring"
            />
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const imported = extractHexColors(existingImportText);
                  if (imported.length === 0) {
                    setExistingImportError("No valid HEX colors found.");
                    return;
                  }
                  const merged = [...new Set([...existingData.brandColors, ...imported])].slice(0, 12);
                  set({ brandColors: merged });
                  setExistingImportError("");
                  setExistingImportText("");
                }}
                className="rounded-lg border border-blue-400/40 bg-blue-500/20 px-3 py-1.5 text-xs font-semibold text-blue-100"
              >
                Import Colors
              </button>
              {existingImportError ? (
                <span className="text-xs text-rose-300">{existingImportError}</span>
              ) : (
                <span className="text-xs text-slate-500">Up to 12 colors</span>
              )}
            </div>
          </div>

          {existingData.brandColors.map((color, index) => (
            <div key={`${color}-${index}`} className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => {
                  const next = [...existingData.brandColors];
                  next[index] = e.target.value;
                  set({ brandColors: next });
                }}
                className="h-10 w-14 rounded-lg border border-slate-600 bg-slate-950"
              />
              <input
                value={color}
                onChange={(e) => {
                  const next = [...existingData.brandColors];
                  next[index] = e.target.value;
                  set({ brandColors: next });
                }}
                onBlur={(e) => {
                  const normalized = normalizeHex(e.target.value);
                  if (!normalized) {
                    setExistingImportError(`Invalid HEX at row ${index + 1}.`);
                    return;
                  }
                  const next = [...existingData.brandColors];
                  next[index] = normalized;
                  set({ brandColors: next });
                  setExistingImportError("");
                }}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 outline-none ring-blue-400 transition focus:ring"
              />
              {existingData.brandColors.length > 1 ? (
                <button
                  onClick={() =>
                    set({
                      brandColors: existingData.brandColors.filter((_, i) => i !== index),
                    })
                  }
                  className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300"
                >
                  Remove
                </button>
              ) : null}
            </div>
          ))}
          <button
            onClick={() => set({ brandColors: [...existingData.brandColors, "#64748b"] })}
            className="rounded-xl border border-slate-600 px-4 py-2 text-sm text-slate-200"
          >
            Add Color
          </button>
          <div className="flex flex-wrap gap-2 pt-2">
            {existingData.brandColors.map((c, i) => (
              <div key={`${c}-${i}`} className="h-8 w-14 rounded-lg border border-slate-700" style={{ background: c }} />
            ))}
          </div>
        </div>
      </StepShell>
    );
  }

  if (step === 3) {
    return (
      <StepShell
        title="Primary Font Family"
        step={3}
        total={EXISTING_TOTAL_STEPS}
        onBack={() => setExistingStep(2)}
        onNext={() => setExistingStep(4)}
        nextDisabled={!existingData.primaryFontFamily.trim()}
        nextDisabledReason={!existingData.primaryFontFamily.trim() ? "Primary font family is required." : undefined}
      >
        <input
          value={existingData.primaryFontFamily}
          onChange={(e) => set({ primaryFontFamily: e.target.value })}
          placeholder="Inter"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none ring-blue-400 transition focus:ring"
        />
      </StepShell>
    );
  }

  if (step === 4) {
    return (
      <StepShell
        title="Secondary Font Family (optional)"
        step={4}
        total={EXISTING_TOTAL_STEPS}
        onBack={() => setExistingStep(3)}
        onNext={() => setExistingStep(5)}
      >
        <input
          value={existingData.secondaryFontFamily}
          onChange={(e) => set({ secondaryFontFamily: e.target.value })}
          placeholder="Merriweather"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none ring-blue-400 transition focus:ring"
        />
      </StepShell>
    );
  }

  if (step === 5) {
    const options: Exclude<AppTarget, "Design System Library">[] = [
      "Mobile App",
      "Web App",
      "Marketing Website",
      "Dashboard / SaaS",
      "Tablet",
      "Other",
    ];

    return (
      <StepShell
        title="What are you designing for?"
        description="Multi-select"
        step={5}
        total={EXISTING_TOTAL_STEPS}
        onBack={() => setExistingStep(4)}
        onNext={() => setExistingStep(6)}
        nextDisabled={
          existingData.designingFor.length === 0 ||
          (existingData.designingFor.includes("Other") && !existingData.designingForOther.trim())
        }
        nextDisabledReason={
          existingData.designingFor.length === 0
            ? "Select at least one option."
            : existingData.designingFor.includes("Other") && !existingData.designingForOther.trim()
              ? "Please fill the Other field."
              : undefined
        }
      >
        <div className="flex flex-wrap gap-3">
          {options.map((opt) => {
            const active = existingData.designingFor.includes(opt);
            return (
              <button
                key={opt}
                className={`${chipBase} ${
                  active
                    ? "border-blue-400 bg-blue-500/20 text-blue-100"
                    : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
                }`}
                onClick={() =>
                  set({
                    designingFor: active
                      ? existingData.designingFor.filter((v) => v !== opt)
                      : [...existingData.designingFor, opt],
                  })
                }
              >
                {opt}
              </button>
            );
          })}
        </div>
        {existingData.designingFor.includes("Other") ? (
          <input
            className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none ring-blue-400 transition focus:ring"
            placeholder="Tell us more"
            value={existingData.designingForOther}
            onChange={(e) => set({ designingForOther: e.target.value })}
          />
        ) : null}
      </StepShell>
    );
  }

  if (step === 6) {
    return (
      <StepShell
        title="Typography Scale Style"
        step={6}
        total={EXISTING_TOTAL_STEPS}
        onBack={() => setExistingStep(5)}
        onNext={() => setExistingStep(7)}
        nextDisabled={!existingData.typeScale}
        nextDisabledReason={!existingData.typeScale ? "Select a scale style." : undefined}
      >
        <div className="flex flex-wrap gap-3">
          {(["Compact", "Balanced", "Expressive"] as const).map((opt) => (
            <button
              key={opt}
              className={`${chipBase} ${
                existingData.typeScale === opt
                  ? "border-blue-400 bg-blue-500/20 text-blue-100"
                  : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
              }`}
              onClick={() => set({ typeScale: opt })}
            >
              {opt}
            </button>
          ))}
        </div>
      </StepShell>
    );
  }

  if (step === 7) {
    return (
      <StepShell
        title="Spacing Scale"
        step={7}
        total={EXISTING_TOTAL_STEPS}
        onBack={() => setExistingStep(6)}
        onNext={() => setExistingStep(8)}
        nextDisabled={!existingData.spacingScale}
        nextDisabledReason={!existingData.spacingScale ? "Select spacing scale." : undefined}
      >
        <div className="flex flex-wrap gap-3">
          {(["Compact", "Balanced", "Spacious"] as const).map((opt) => (
            <button
              key={opt}
              className={`${chipBase} ${
                existingData.spacingScale === opt
                  ? "border-blue-400 bg-blue-500/20 text-blue-100"
                  : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
              }`}
              onClick={() => set({ spacingScale: opt })}
            >
              {opt}
            </button>
          ))}
        </div>
      </StepShell>
    );
  }

  if (step === 8) {
    return (
      <StepShell
        title="Mode"
        step={8}
        total={EXISTING_TOTAL_STEPS}
        onBack={() => setExistingStep(7)}
        onNext={() => setExistingStep(9)}
        nextDisabled={!existingData.mode}
        nextDisabledReason={!existingData.mode ? "Select interface mode." : undefined}
      >
        <div className="flex flex-wrap gap-3">
          {(["Light", "Dark", "Both"] as const).map((opt) => (
            <button
              key={opt}
              className={`${chipBase} ${
                existingData.mode === opt
                  ? "border-blue-400 bg-blue-500/20 text-blue-100"
                  : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
              }`}
              onClick={() => set({ mode: opt })}
            >
              {opt}
            </button>
          ))}
        </div>
      </StepShell>
    );
  }

  const previewTokens = generateTokensFromExisting(existingData);
  return (
    <StepShell
      title="Preview"
      description="Review generated color, typography, and spacing tokens."
      step={9}
      total={EXISTING_TOTAL_STEPS}
      onBack={() => setExistingStep(8)}
      onNext={() => setExistingTokens(previewTokens)}
      nextLabel="Export JSON"
    >
      <TokenPreview tokens={previewTokens} />
    </StepShell>
  );
}

import type { Config } from "tailwindcss";

// Dark mode without touching every component: bg-white, bg-slate-*, text-slate-500…950 and
// border-slate-* read CSS variables (globals.css) that change when the theme is dark.
// text-slate-100…400 and text-white stay as they are: they sit on dark surfaces in both themes.
const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;
const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const scale = (prefix: string, steps = STEPS) => Object.fromEntries(steps.map((n) => [n, v(`${prefix}-${n}`)]));

// Light status colours (notices, badges) get dark-theme versions too.
const TINTS = ["emerald", "amber", "rose", "sky"];
const tints = (kind: string, steps: number[]) => Object.fromEntries(TINTS.map((c) => [c, scale(`${kind}-${c}`, steps)]));

const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        border: "var(--border)",
        muted: "var(--muted)",
        primary: "var(--primary)",
        "brand-blue": "var(--brand-blue)",
        "brand-navy": "var(--brand-navy)",
        secondary: "var(--secondary)",
        accent: "var(--accent)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)"
      },
      backgroundColor: { white: v("bg-white"), slate: scale("bg-slate"), ...tints("bg", [50, 100, 200]) },
      textColor: { slate: scale("tx-slate", [500, 600, 700, 800, 900, 950]), ...tints("tx", [600, 700, 800, 900]), ink: "#020617" },
      borderColor: { slate: scale("bd-slate"), ...tints("bd", [100, 200, 300]) },
      fontFamily: {
        display: ["var(--font-body)"],
        body: ["var(--font-body)"]
      },
      boxShadow: {
        glow: "0 20px 80px rgba(17, 24, 39, 0.12)"
      },
      backgroundImage: {
        "hero-grid": "radial-gradient(circle at top left, rgba(0, 160, 232, 0.28), transparent 38%), radial-gradient(circle at top right, rgba(61, 176, 112, 0.24), transparent 30%), linear-gradient(135deg, rgba(20, 36, 70, 0.97), rgba(32, 56, 96, 0.92))"
      }
    }
  },
  plugins: []
};

export default config;

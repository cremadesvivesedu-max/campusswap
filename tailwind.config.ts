import type { Config } from "tailwindcss";

const config: Config = {
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
        secondary: "var(--secondary)",
        accent: "var(--accent)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)"
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"]
      },
      boxShadow: {
        glow: "0 20px 80px rgba(17, 24, 39, 0.12)"
      },
      backgroundImage: {
        "hero-grid": "radial-gradient(circle at top left, rgba(111, 255, 214, 0.22), transparent 35%), radial-gradient(circle at top right, rgba(254, 226, 164, 0.28), transparent 28%), linear-gradient(135deg, rgba(12, 29, 56, 0.96), rgba(16, 42, 66, 0.9))"
      }
    }
  },
  plugins: []
};

export default config;

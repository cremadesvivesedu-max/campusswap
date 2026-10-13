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
        "brand-blue": "var(--brand-blue)",
        "brand-navy": "var(--brand-navy)",
        secondary: "var(--secondary)",
        accent: "var(--accent)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)"
      },
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

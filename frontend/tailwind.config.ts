import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        surface2: "var(--surface2)",
        "nexus-border": "var(--nexus-border)",
        "nexus-border2": "var(--nexus-border2)",
        accent: "var(--accent)",
        "accent-dim": "var(--accent-dim)",
        "accent-border": "var(--accent-border)",
        "nexus-blue": "#5b8aff",
        "nexus-red": "#ff6b6b",
        "nexus-yellow": "#ffd166",
        "nexus-muted": "var(--nexus-muted)",
        "nexus-text": "var(--nexus-text)",
      },
      fontFamily: {
        display: ["var(--font-syne)", "Syne", "sans-serif"],
        body: ["var(--font-dm-sans)", "DM Sans", "sans-serif"],
        mono: ["var(--font-dm-mono)", "DM Mono", "monospace"],
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        blink: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease both",
        "fade-in": "fadeIn 0.3s ease both",
        blink: "blink 1s step-end infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

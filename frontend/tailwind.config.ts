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
        bg: "#0a0a0f",
        surface: "#111118",
        surface2: "#16161f",
        "nexus-border": "#1e1e2e",
        "nexus-border2": "#2a2a3e",
        accent: "#7fffb2",
        "accent-dim": "rgba(127,255,178,0.08)",
        "accent-border": "rgba(127,255,178,0.2)",
        "nexus-blue": "#5b8aff",
        "nexus-red": "#ff6b6b",
        "nexus-yellow": "#ffd166",
        "nexus-muted": "#5a5a7a",
        "nexus-text": "#e8e8f0",
      },
      fontFamily: {
        display: ["Syne", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
        mono: ["DM Mono", "monospace"],
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

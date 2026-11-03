import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: "#03060c",
          900: "#070b14",
          850: "#0b101c",
          800: "#101726",
          700: "#182238",
        },
        cyber: {
          cyan: "#00f0ff",
          emerald: "#10b981",
          violet: "#a855f7",
          amber: "#f59e0b",
          rose: "#ff2a5f",
        },
      },
      fontFamily: {
        mono: ["var(--font-geist-mono)", "JetBrains Mono", "ui-monospace", "monospace"],
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "grid-pattern":
          "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)",
        "mesh-radial":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(6,182,212,0.18), transparent 70%)",
        "spotlight-glow":
          "radial-gradient(600px circle at var(--mouse-x, 0) var(--mouse-y, 0), rgba(6, 182, 212, 0.08), transparent 40%)",
      },
      animation: {
        "radar-sweep": "radarSweep 4s linear infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "border-glow": "borderGlow 3s ease infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        radarSweep: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        borderGlow: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;

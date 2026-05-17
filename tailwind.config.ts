import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50:  "#FDFBF7",
          100: "#FAF7F0",
          200: "#F5EFE0",
          300: "#EDE3CC",
          400: "#E0D0B0",
          500: "#C9B890",
        },
        sand: {
          100: "#F2EBD9",
          200: "#E8DCC5",
          300: "#D9C9A8",
          400: "#C4A97A",
          500: "#A88A5A",
        },
        warm: {
          900: "#1C1512",
          800: "#2D2218",
          700: "#3D2F20",
          600: "#5C4530",
          500: "#7A5C3C",
          400: "#9B7A52",
        },
        gold: {
          300: "#E8C98A",
          400: "#D4A853",
          500: "#B8883A",
          600: "#9A6E28",
        },
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        sans:  ["var(--font-jost)", "system-ui", "sans-serif"],
        display: ["var(--font-cormorant)", "Georgia", "serif"],
      },
      fontSize: {
        "display-2xl": ["clamp(3rem,8vw,7rem)", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
        "display-xl":  ["clamp(2.5rem,6vw,5rem)", { lineHeight: "1.08", letterSpacing: "-0.025em" }],
        "display-lg":  ["clamp(2rem,4vw,3.5rem)", { lineHeight: "1.1",  letterSpacing: "-0.02em" }],
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "section": "7rem",
      },
      backgroundImage: {
        "grain": "url('/textures/grain.svg')",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      animation: {
        "fade-up":     "fadeUp 0.7s ease forwards",
        "fade-in":     "fadeIn 0.5s ease forwards",
        "float":       "float 6s ease-in-out infinite",
        "pulse-slow":  "pulse 4s cubic-bezier(0.4,0,0.6,1) infinite",
        "shimmer":     "shimmer 2.5s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%":     { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
      },
      transitionTimingFunction: {
        "out-expo":   "cubic-bezier(0.19,1,0.22,1)",
        "in-out-soft":"cubic-bezier(0.4,0,0.2,1)",
      },
      boxShadow: {
        "luxury": "0 4px 40px -8px rgba(160,130,80,0.15), 0 1px 3px rgba(0,0,0,0.05)",
        "card":   "0 2px 20px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
        "gold":   "0 0 30px rgba(180,140,60,0.2)",
        "soft":   "0 8px 60px rgba(0,0,0,0.08)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
    },
  },
  plugins: [],
};

export default config;

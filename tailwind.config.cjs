/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        surface: "#141414",
        border: "#262626",
        primary: {
          DEFAULT: "#fafafa",
          foreground: "#0a0a0a",
        },
        secondary: {
          DEFAULT: "#a1a1a1",
          foreground: "#fafafa",
        },
        accent: {
          DEFAULT: "#3b82f6",
          foreground: "#fafafa",
        },
        muted: {
          DEFAULT: "#262626",
          foreground: "#a1a1a1",
        },
      },
      fontFamily: {
        serif: ["Charter", "Georgia", "serif"],
        mono: ["JetBrains Mono", "Menlo", "monospace"],
      },
      fontSize: {
        base: ["1.125rem", { lineHeight: "1.7" }],
        lg: ["1.25rem", { lineHeight: "1.6" }],
        xl: ["1.5rem", { lineHeight: "1.5" }],
        "2xl": ["1.875rem", { lineHeight: "1.4" }],
        "3xl": ["2.25rem", { lineHeight: "1.3" }],
        "4xl": ["3rem", { lineHeight: "1.2" }],
        "5xl": ["3.75rem", { lineHeight: "1.1" }],
        "6xl": ["4.5rem", { lineHeight: "1.05" }],
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sapphire: {
          bg: "#09090b", // L0: Rich dark neutral base canvas (zinc-950)
          surface: "#111113", // L1: Primary surface / panels / sidebars
          elevated: "#18181b", // L2: Cards, message bubbles, inputs (zinc-900)
          raised: "#1f1f23", // L3: Floating menus, popovers, toolbars
          input: "#27272a", // L4: Active inputs, selected items, hover (zinc-800)
          subtle: "#27272a", // Elevated subtle (zinc-800)
          dark: "#f4f4f5", // Primary crisp text (zinc-100)
          muted: "#a1a1aa", // Secondary muted text (zinc-400)
          border: "rgba(255, 255, 255, 0.06)", // Ultra-low opacity white border (~5-6%)
          terracotta: "#D97757", // Claude/Sapphire terracotta accent
          "terracotta-hover": "#E2886A",
          blue: "#7BA7D7",
          green: "#87A96B",
        },
      },
      screens: {
        xs: "475px",
        "3xl": "1920px",
      },

      borderWidth: {
        DEFAULT: "0.5px",
        "0.5": "0.5px",
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "10px",
        xl: "12px",
        full: "9999px",
      },
      boxShadow: {
        hairline: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        serif: ["Georgia", "Times New Roman", "serif"],
      },
      fontSize: {
        "heading-3xl": ["36px", { lineHeight: "1" }],
        "heading-2xl": ["28px", { lineHeight: "1.1" }],
        "heading-xl": ["24px", { lineHeight: "1.25" }],
        "heading-lg": ["20px", { lineHeight: "1.25" }],
        "heading-md": ["16px", { lineHeight: "1.4" }],
        "heading-sm": ["14px", { lineHeight: "1.4" }],
        "heading-xs": ["12px", { lineHeight: "1.4" }],
        "text-lg": ["18px", { lineHeight: "1.25" }],
        "text-md": ["16px", { lineHeight: "1.4" }],
        "text-sm": ["14px", { lineHeight: "1.4" }],
        "text-xs": ["12px", { lineHeight: "1.4" }],
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "border-beam": {
          "100%": {
            "offset-distance": "100%",
          },
        },
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "fade-out": { "0%": { opacity: "1" }, "100%": { opacity: "0" } },
        "slide-up": { "0%": { transform: "translateY(100%)" }, "100%": { transform: "translateY(0)" } },
        "slide-down": { "0%": { transform: "translateY(0)" }, "100%": { transform: "translateY(100%)" } },
        "scale-in": { "0%": { transform: "scale(0.95)", opacity: "0" }, "100%": { transform: "scale(1)", opacity: "1" } },
      },
      animation: {
        shimmer: "shimmer 2s infinite",
        "border-beam": "border-beam calc(var(--duration)*1s) infinite linear",
        "fade-in": "fade-in 300ms ease-out",
        "fade-out": "fade-out 200ms ease-in",
        "slide-up": "slide-up 400ms cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-down": "slide-down 300ms ease-in",
        "scale-in": "scale-in 250ms cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [
    require("@tailwindcss/container-queries"),
  ],
};


export default config;

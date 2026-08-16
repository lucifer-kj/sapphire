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
          bg: "#FAF9F5",
          surface: "#FFFFFF",
          subtle: "#E8E6DC",
          dark: "#141413",
          muted: "#B0AEA5",
          border: "rgba(20, 20, 19, 0.12)",
          terracotta: "#D97757",
          blue: "#6A9BCC",
          green: "#788C5D",
        },
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
    },
  },
  plugins: [],
};

export default config;

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        canvas: "var(--canvas)",
        sidebar: "var(--sidebar)",
        card: "var(--card)",
        hairline: "var(--hairline)",
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)"
        },
        accent: {
          DEFAULT: "var(--accent)",
          soft: "var(--accent-soft)",
          contrast: "var(--accent-contrast, #ffffff)"
        },
        positive: "var(--positive)",
        negative: "var(--negative)",
        warning: "var(--warning)"
      },
      fontFamily: {
        display: ["\"Rethink Sans\"", "sans-serif"],
        sans: ["\"Helvetica Neue\"", "Helvetica", "Arial", "sans-serif"]
      },
      borderRadius: {
        card: "var(--radius-card, 20px)",
        tile: "var(--radius-tile, 14px)"
      },
      boxShadow: {
        card: "var(--shadow-card)",
        flyout: "0 10px 30px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)"
      }
    }
  },
  plugins: []
};

import animate from "tailwindcss-animate";
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1.5rem", screens: { "2xl": "1440px" } },
    extend: {
      fontFamily: {
        sans: ["Outfit", "system-ui", "sans-serif"],
        display: ["Outfit", "system-ui", "sans-serif"],
        mono: ['"Space Mono"', "ui-monospace", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        surface: { DEFAULT: "hsl(var(--surface))", 2: "hsl(var(--surface-2))" },
        // Theme-aware brand tokens (see src/index.css). Text/border colours use *-fg values, fills use *-fill.
        neon: { DEFAULT: "rgb(var(--neon-fg) / <alpha-value>)", dim: "rgb(var(--neon-fg) / 0.12)" },
        lime: { DEFAULT: "rgb(var(--lime) / <alpha-value>)", ink: "rgb(var(--lime-ink) / <alpha-value>)" },
        violet: { DEFAULT: "rgb(var(--violet) / <alpha-value>)" },
        coral: { DEFAULT: "rgb(var(--coral) / <alpha-value>)", soft: "rgb(var(--coral-soft) / <alpha-value>)" },
        cyan: { DEFAULT: "rgb(var(--cyan) / <alpha-value>)" },
        label: "rgb(var(--label) / <alpha-value>)",
        warn: { DEFAULT: "rgb(var(--warn) / <alpha-value>)", bg: "rgb(var(--warn-bg) / <alpha-value>)", banner: "rgb(var(--warn-banner) / <alpha-value>)" },
        yes: { DEFAULT: "rgb(var(--yes-fg) / <alpha-value>)", fill: "rgb(var(--yes) / <alpha-value>)", ink: "#04201a", tint: "rgb(var(--yes-fg) / 0.12)" },
        no: { DEFAULT: "rgb(var(--no-fg) / <alpha-value>)", fill: "rgb(var(--no) / <alpha-value>)", ink: "#160b33", tint: "rgb(var(--no-fg) / 0.13)" },
        live: "rgb(var(--live) / <alpha-value>)",
        polygon: "#8247e5",
      },
      borderRadius: { lg: "var(--radius)", md: "calc(var(--radius) - 2px)", sm: "calc(var(--radius) - 4px)" },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "live-pulse": { "0%,100%": { boxShadow: "0 0 0 0 rgba(255,77,109,0.55)" }, "50%": { boxShadow: "0 0 0 5px rgba(255,77,109,0)" } },
      },
      animation: { "live-pulse": "live-pulse 2s ease-in-out infinite" },
    },
  },
  plugins: [animate],
};

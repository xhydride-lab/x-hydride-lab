import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Graphite — institutional dark surface scale.
        // Steps are deliberately small at the top end so we can
        // differentiate page background, surface, and elevated surface
        // without using shadows.
        graphite: {
          50: "#f4f6fa",
          100: "#e5e8ee",
          200: "#c7ccd8",
          300: "#9aa1b3",
          400: "#6f7689",
          500: "#4d5366",
          600: "#363c4e",
          700: "#262b3b",
          800: "#1a1f2c",
          850: "#141823",
          900: "#0e1119",
          925: "#0b0e15",
          950: "#070910",
        },
        // Restrained electric blue used only for active states and
        // scientific highlights.
        accent: {
          50: "#eaf6ff",
          100: "#cfeaff",
          200: "#9bd4ff",
          300: "#5fb9ff",
          400: "#2c9bff",
          500: "#0a7cf2",
          600: "#0561c8",
          700: "#064c9b",
          800: "#0a3d78",
          900: "#0d3160",
        },
        // Severity colors — muted on purpose.
        signal: {
          warn: "#d4a14a",
          alert: "#d96b6b",
          ok: "#5fb9ff",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Inter",
          "Segoe UI",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
        serif: [
          "ui-serif",
          "Georgia",
          "Cambria",
          "Times New Roman",
          "Times",
          "serif",
        ],
      },
      fontSize: {
        // Tighter, scientific scale.
        eyebrow: ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.16em" }],
        caption: ["0.75rem", { lineHeight: "1.1rem" }],
        body: ["0.875rem", { lineHeight: "1.45rem" }],
        subtitle: ["1rem", { lineHeight: "1.6rem", letterSpacing: "-0.008em" }],
        section: ["1.125rem", { lineHeight: "1.6rem", letterSpacing: "-0.012em" }],
        title: ["1.375rem", { lineHeight: "1.85rem", letterSpacing: "-0.018em" }],
        display: ["2.125rem", { lineHeight: "2.4rem", letterSpacing: "-0.022em" }],
        manifesto: ["3rem", { lineHeight: "3.25rem", letterSpacing: "-0.026em" }],
      },
      letterSpacing: {
        tightish: "-0.012em",
        institutional: "0.16em",
      },
      // Reduced shadow vocabulary. Only one shadow level remains, used
      // very sparingly. Prefer hairlines for separation.
      boxShadow: {
        hairline: "0 0 0 1px rgba(255,255,255,0.04)",
      },
      borderRadius: {
        // Reduce decorative rounding. Most surfaces are square.
        sharp: "2px",
        soft: "4px",
      },
      spacing: {
        // Wider page rhythm.
        "page-x": "2rem",
        "page-y": "2.5rem",
      },
    },
  },
  plugins: [],
};

export default config;

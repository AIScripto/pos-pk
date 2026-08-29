import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      /* Spacing steps used throughout the app that Tailwind v3 does not ship.
         Without these, `h-4.5`, `w-5.5` etc. emit no CSS at all. */
      spacing: {
        "4.5": "1.125rem",
        "18": "4.5rem",
        "5.5": "1.375rem",
        "6.5": "1.625rem",
        "7.5": "1.875rem",
      },
      /* `Noto Sans Arabic` trails every stack: the app ships Arabic and Urdu, and
         neither Latin face covers those scripts — without it the RTL locales fall
         back to whatever the terminal's OS happens to have. */
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "'Noto Sans Arabic'", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["'SFMono-Regular'", "Consolas", "'Liberation Mono'", "monospace"],
        display: ["Archivo", "'Plus Jakarta Sans'", "'Noto Sans Arabic'", "ui-sans-serif", "system-ui", "sans-serif"],
        /* Kitchen tickets, order cards and invoice tables fit more characters per
           line in a condensed face — this was already in use via 52 inline
           `style={{fontFamily}}` overrides, which no theme change could reach. */
        condensed: ["'Barlow Condensed'", "'Noto Sans Arabic'", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["'Plus Jakarta Sans'", "'Noto Sans Arabic'", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      /* The floor for anything a cashier reads on a terminal at arm's length.
         Below this the POS was using 8-9px labels borrowed from dashboard
         density, which do not survive a counter at an angle under shop lights. */
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "0.875rem" }],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        /* Semantic status scale. `text` is the on-page reading colour, `subtle` the
           badge/row fill, `border` the hairline — so a status badge is
           `bg-success-subtle text-success-text border-success-border` in both
           themes, with no `dark:` twin to keep in sync by hand. */
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
          text: "hsl(var(--success-text))",
          subtle: "hsl(var(--success-subtle))",
          border: "hsl(var(--success-border))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
          text: "hsl(var(--warning-text))",
          subtle: "hsl(var(--warning-subtle))",
          border: "hsl(var(--warning-border))",
        },
        danger: {
          DEFAULT: "hsl(var(--danger))",
          foreground: "hsl(var(--danger-foreground))",
          text: "hsl(var(--danger-text))",
          subtle: "hsl(var(--danger-subtle))",
          border: "hsl(var(--danger-border))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
          text: "hsl(var(--info-text))",
          subtle: "hsl(var(--info-subtle))",
          border: "hsl(var(--info-border))",
        },
        special: {
          DEFAULT: "hsl(var(--special))",
          foreground: "hsl(var(--special-foreground))",
          text: "hsl(var(--special-text))",
          subtle: "hsl(var(--special-subtle))",
          border: "hsl(var(--special-border))",
        },
        brand: {
          DEFAULT: "hsl(var(--brand))",
          deep: "hsl(var(--brand-deep))",
          admin: "hsl(var(--brand-admin))",
          "admin-deep": "hsl(var(--brand-admin-deep))",
        },
        /* Fixed-dark surfaces: kitchen display, customer-facing screen. */
        screen: {
          DEFAULT: "hsl(var(--screen))",
          raised: "hsl(var(--screen-raised))",
          "raised-2": "hsl(var(--screen-raised-2))",
          border: "hsl(var(--screen-border))",
          dim: "hsl(var(--screen-dim))",
          muted: "hsl(var(--screen-muted))",
          subtle: "hsl(var(--screen-subtle))",
          foreground: "hsl(var(--screen-foreground))",
        },
        pos: {
          success: "hsl(var(--pos-success))",
          warning: "hsl(var(--pos-warning))",
          info: "hsl(var(--pos-info))",
          surface: "hsl(var(--pos-surface))",
          "surface-elevated": "hsl(var(--pos-surface-elevated))",
          "amber-glow": "hsl(var(--pos-amber-glow))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        "3xl": "calc(var(--radius) + 16px)",
      },
      /* `blur-xs` / `backdrop-blur-xs` are Tailwind v4 names. This project is on
         v3.4, where the smallest step is `sm` — the existing usage emitted nothing. */
      /* `/8` tints are used for the faintest status washes; the default opacity
         scale jumps 5 -> 10. */
      opacity: {
        8: "0.08",
        12: "0.12",
      },
      blur: {
        xs: "2px",
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        /* Same story: `shadow-xs` and `shadow-2xs` are v4 names, used 34 times. */
        "2xs": "0 1px 1px 0 hsl(222 47% 11% / 0.04)",
        xs: "0 1px 2px 0 hsl(222 47% 11% / 0.06)",
        "pos-card": "0 4px 20px -4px rgba(0, 0, 0, 0.1)",
        "pos-card-hover": "0 8px 30px -4px rgba(0, 0, 0, 0.15)",
        "pos-glow": "0 0 30px -5px hsl(var(--primary) / 0.4)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        /* shadcn's input-otp expects this; without it the OTP caret never blinks. */
        "caret-blink": {
          "0%, 70%, 100%": { opacity: "1" },
          "20%, 50%": { opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;

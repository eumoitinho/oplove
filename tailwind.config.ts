import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
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
    screens: {
      'xs': '360px',        // Extra small devices
      'mobile': '384px',    // Mobile w-96 h-[800px]
      'sm': '640px',        // Small devices
      'md': '768px',        // Medium devices
      'tablet': '1024px',   // Tablet 1024px x 1366px
      'lg': '1024px',       // Large devices (same as tablet)
      'xl': '1280px',       // Extra large
      'desktop': '1440px',  // Desktop 1440px x 1024px - 8 columns grid
      '2xl': '1536px',      // 2X Extra large
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea", // Primary color
          700: "#7c3aed",
          800: "#6b21a8",
          900: "#581c87",
          950: "#3b0764",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          50: "#fdf2f8",
          100: "#fce7f3",
          200: "#fbcfe8",
          300: "#f9a8d4",
          400: "#f472b6",
          500: "#ec4899", // Secondary color
          600: "#db2777",
          700: "#be185d",
          800: "#9d174d",
          900: "#831843",
          950: "#500724",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2", // Accent color
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
          950: "#083344",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      // Grid system for responsive layout
      gridTemplateColumns: {
        'desktop-8': 'repeat(8, minmax(0, 1fr))', // 8 columns for desktop
        'sidebar-timeline': '317px 1fr 317px', // Desktop: Left sidebar, timeline, right sidebar
        'tablet-timeline': '240px 1fr 240px', // Tablet: Reduced sidebar widths
        'mobile-timeline': '1fr', // Mobile: Full width
      },
      gridColumn: {
        'span-4': 'span 4 / span 4', // Timeline spans 4 columns
      },
      spacing: {
        '16': '1rem',        // 16px gutter
        '64': '4rem',        // 64px margins
        '240': '15rem',      // 240px tablet sidebar width
        '317': '19.8125rem', // 317px desktop sidebar width
      },
      width: {
        'sidebar-desktop': '317px',  // Desktop sidebar width
        'sidebar-tablet': '240px',   // Tablet sidebar width
        'desktop': '1440px',         // Desktop container
        'tablet': '1024px',          // Tablet container
        'mobile': '384px',           // Mobile container (w-96)
      },
      height: {
        'desktop': '1024px',
        'tablet': '1366px',
        'mobile': '800px',
      },
      maxWidth: {
        'desktop-container': '1440px', // Full desktop width
        'tablet-container': '1024px',  // Full tablet width
        'mobile-container': '384px',   // Mobile w-96
        'timeline-desktop': '742px',   // Timeline width on desktop (1440 - 64*2 - 317*2 - 16*2)
        'timeline-tablet': '480px',    // Timeline width on tablet
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography"), require("tailwindcss-animate")],
}

export default config

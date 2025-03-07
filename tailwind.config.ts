import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    "bg-orange-100",
    "bg-purple-100",
    "bg-blue-100",
    "bg-green-100",
    "bg-red-100",
    "bg-yellow-100",
    "bg-pink-100",
    "text-orange-700",
    "text-purple-700",
    "text-blue-700",
    "text-green-700",
    "text-red-700",
    "text-yellow-700",
    "text-pink-700",
    "border-l-orange-100",
    "border-l-purple-100",
    "border-l-blue-100",
    "border-l-green-100",
    "border-l-red-100",
    "border-l-yellow-100",
    "border-l-pink-100",
    "bg-orange-500",
    "bg-purple-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-pink-500",
    "text-orange-100",
    "text-purple-100",
    "text-blue-100",
    "text-green-100",
    "text-red-100",
    "text-yellow-100",
    "text-pink-100",
    "bg-chart-1",
    "bg-chart-2",
    "bg-chart-3",
    "bg-opacity-20",
    "bg-opacity-30",
    "bg-opacity-40",
    "bg-opacity-50",
    "dark:bg-blue-800",
    "dark:text-blue-100",
    "dark:bg-purple-800",
    "dark:text-purple-100",
    "dark:bg-green-800",
    "dark:text-green-100",
    "dark:bg-red-800",
    "dark:text-red-100",
    "dark:bg-yellow-800",
    "dark:text-yellow-100",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
} satisfies Config;

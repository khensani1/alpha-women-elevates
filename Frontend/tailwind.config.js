/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-bg': '#FFFFFF',
        'brand-bg-accent': '#3B1E54',
        'brand-text': '#CC2B5E',
        'brand-luxury': '#1A1A1A',
        'brand-border': '#EAEAEA',
        'brand-indigo': '#4B0082',
        'brand-muted': '#888888',
        'brand-sunset': '#FF4500',
      },
      backgroundImage: {
        'sunset-gradient': 'linear-gradient(to right, #CC2B5E, #3B1E54)',
      }
    },
  },
  plugins: [],
}
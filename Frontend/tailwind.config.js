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
        'brand-bg-accent': '#2A1538',
        'brand-text': '#1A1024',
        'brand-luxury': '#1A0F24',
        'brand-border': '#C9B8D6',
        'brand-indigo': '#2A0A4A',
        'brand-muted': '#3D2A4F',
        'brand-sunset': '#8B153F',
      },
      backgroundImage: {
        'sunset-gradient': 'linear-gradient(to right, #8B153F, #2A0A4A)',
      }
    },
  },
  plugins: [],
}

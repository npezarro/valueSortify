/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1b1b1b',
        sand: '#f3efe6',
        ember: '#e85d2f',
        moss: '#436a5a',
        sky: '#c9d6df',
        card: 'rgba(250,250,248,0.88)',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['IBM Plex Sans', 'sans-serif'],
      },
      boxShadow: {
        card: '0 20px 45px -30px rgba(0,0,0,0.35)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
};

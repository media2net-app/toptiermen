/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        '13': 'repeat(13, minmax(0, 1fr))',
      },
      colors: {
        primary: '#B6C948',
        secondary: '#232D1A',
        dark: '#181F17',
        background: '#1e1a16',
        surface: '#2f241b',
        'accent-gold': '#f0a14f',
        'text-light': '#e1cbb3',
        'bar-brown': '#8a6c48',
        'hover-gold': '#c6873e',
        'element-coffee': '#3d3228',
        'header-black': '#12100e',
        'positive-green': '#00c389',
        // Custom colors used in the app
        '8BAE5A': '#8BAE5A',
        '3A4D23': '#3A4D23',
        'FFD700': '#FFD700',
        '0A0F0A': '#0A0F0A',
      },
      fontFamily: {
        figtree: ["Figtree", "sans-serif"],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
  future: {
    hoverOnlyWhenSupported: true,
  },
} 
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // tells Tailwind to scan all JSX/TSX files
  ],
  theme: {
    colors: {
      primaryGreen: '#2c5d3f',
      champYellow: '#ffd700',
      champSliver: '#C0C0C0',
      champBronze: '#804A00',
      pureWhite: '#ffffff',
      defaultGrey: 'rgb(141, 141, 141)'
    },
    extend: {
      backgroundImage: {
        'gold-gradient': 'linear-gradient(to bottom right,rgb(255, 196, 0), #ffec80, #fff5b3)',
        'silver-gradient': 'linear-gradient(to bottom right,rgb(141, 141, 141), #E8E8E8, #F5F5F5)',
        'bronze-gradient': 'linear-gradient(to bottom right, #804A00, #B87333, #CD7F32)',
        'default-gradient': 'linear-gradient(to bottom right, #E5E7EB, #F3F4F6, #FFFFFF)',
      },
    },
  },
  plugins: [],
}


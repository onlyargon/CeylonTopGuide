/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // tells Tailwind to scan all JSX/TSX files
  ],
  theme: {
    colors: {
      primaryGreen: '#3d9692',
      secondaryGreen: '#4f946a',
      champYellow: '#ffd700',
      champSliver: '#C0C0C0',
      champBronze: '#804A00',
      pureWhite: '#ffffff',
      defaultGrey: 'rgb(141, 141, 141)',
      defaultBlack: '#000000',
      defaultRed: '#a1020a',
    },
    extend: {
      backgroundImage: {
        'gold-gradient': 'linear-gradient(to bottom right,rgb(255, 196, 0), #ffec80, #fff5b3)',
        'silver-gradient': 'linear-gradient(to bottom right,rgb(141, 141, 141), #E8E8E8, #F5F5F5)',
        'bronze-gradient': 'linear-gradient(to bottom right, #804A00, #B87333, #CD7F32)',
        'default-gradient': 'linear-gradient(to bottom right, #E5E7EB, #F3F4F6, #FFFFFF)',
      },
      textShadow: {
        sm: '1px 1px 2px rgba(0,0,0,0.25)',
        DEFAULT: '2px 2px 4px rgba(0,0,0,0.3)',
        lg: '4px 4px 6px rgba(0,0,0,0.4)',
      },
      textShadowWhite: {
        sm: '1px 1px 2px rgba(255, 255, 255, 0.25)',
        DEFAULT: '2px 2px 4px rgba(255, 255, 255, 0.3)',
        lg: '4px 4px 6px rgba(0,0,0,0.4)',
      }
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.text-shadow-sm': {
          textShadow: '1px 1px 2px rgba(0,0,0,0.25)',
        },
        '.text-shadow': {
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
        },
        '.text-shadow-lg': {
          textShadow: '4px 4px 6px rgba(0,0,0,0.4)',
        },
        '.text-shadow-none': {
          textShadow: 'none',
        },
        '.text-shadow-white-sm': {
          textShadowWhite: '1px 1px 2px rgba(255, 255, 255, 0.25)',
        },
        '.text-shadow-white': {
          textShadowWhite: '2px 2px 4px rgba(255, 255, 255, 0.3)',
        },
        '.text-shadow-white-lg': {
          textShadowWhite: '4px 4px 6px rgba(255, 255, 255, 0.4)',
        },
      })
    },
  ],
}


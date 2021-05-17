var _ = require('lodash');
var flattenColorPalette = require('tailwindcss/lib/util/flattenColorPalette')
  .default;

module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        coolDark: {
          400: '#40444B',
          500: '#36393f',
          600: '#32353b',
        },
        primary: {
          50: '#4b88cc',
          100: '#4b88cc',
          200: '#4b88cc',
          300: '#4b88cc',
          400: '#4b88cc',
          500: '#4b88cc',
          600: '#4b88cc',
          700: '#4b88cc',
          800: '#4b88cc',
          900: '#4b88cc',
        },
      },
      boxShadow: {
        button: 'var(--shadow-button)',
        card: 'var(--shadow-card)',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    function ({ addUtilities, e, theme, variants }) {
      const colors = flattenColorPalette(theme('borderColor'));

      const utilities = _.flatMap(
        _.omit(colors, 'default'),
        (value, modifier) => ({
          [`.${e(`border-t-${modifier}`)}`]: { borderTopColor: `${value}` },
          [`.${e(`border-r-${modifier}`)}`]: { borderRightColor: `${value}` },
          [`.${e(`border-b-${modifier}`)}`]: { borderBottomColor: `${value}` },
          [`.${e(`border-l-${modifier}`)}`]: { borderLeftColor: `${value}` },
        })
      );

      addUtilities(utilities, variants('borderColor'));
    },
  ],
};

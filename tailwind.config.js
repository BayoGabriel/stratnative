const { hairlineWidth, platformSelect } = require('nativewind/theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  darkMode: 'class', // Enable manual toggling of dark mode
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        lato: ['Lato-Regular'],
        'lato-bold': ['Lato-Bold'],
        'lato-bold-italic': ['Lato-BoldItalic'],
        'lato-italic': ['Lato-Italic'],
        'lato-light': ['Lato-Light'],
        'lato-thin': ['Lato-Thin'],
        'lato-black': ['Lato-Black'],
        'lato-black-italic': ['Lato-BlackItalic'],
        'geist': ['Geist-Regular'],
        'geist-bold': ['Geist-Bold'],
        'geist-black': ['Geist-Black'],
        'geist-semi-bold': ['Geist-SemiBold'],
      },
      colors: {
       'primary' : "#EC3237"
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
    },
  },
  plugins: [],
};

function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return platformSelect({
        ios: `rgb(var(--${variableName}) / ${opacityValue})`,
        android: `rgb(var(--android-${variableName}) / ${opacityValue})`,
      });
    }
    return platformSelect({
      ios: `rgb(var(--${variableName}))`,
      android: `rgb(var(--android-${variableName}))`,
    });
  };
}

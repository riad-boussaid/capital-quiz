/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        content: 'var(--color-content)',
        muted: 'var(--color-muted)',
        element: 'var(--color-element)',
        selected: 'var(--color-selected)',
        primary: 'var(--color-primary)',
        primaryText: 'var(--color-primary-text)',
        correct: 'var(--color-correct)',
        correctText: 'var(--color-correct-text)',
        wrong: 'var(--color-wrong)',
        wrongText: 'var(--color-wrong-text)',
        edge: 'var(--color-edge)',
        card: 'var(--color-card)',
      },
    },
  },
  plugins: [],
};
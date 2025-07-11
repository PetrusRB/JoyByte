/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./{src,pages,components,app}/**/*.{ts,tsx,js,jsx,html}",
    "!./{src,pages,components,app}/**/*.{stories,spec}.{ts,tsx,js,jsx,html}",
    //     ...createGlobPatternsForDependencies(__dirname)
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./{app,components}/**/*.{ts,tsx,js,jsx,html}",
    "!./{app,components}/**/*.{stories,spec}.{ts,tsx,js,jsx,html}",
    //     ...createGlobPatternsForDependencies(__dirname)
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};

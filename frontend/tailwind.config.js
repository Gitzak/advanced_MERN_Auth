module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Tells Tailwind to look for content in these file types in the src directory.
  ],
  theme: {
    extend: {},
  },
  plugins: [require("tailgrids/plugin")],
}
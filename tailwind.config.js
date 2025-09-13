// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    // Radix UI components වලට අවශ්‍ය තවත් paths එකතු කරන්න.
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
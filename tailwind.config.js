/** @type {import('tailwindcss').Config} */

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,njk}"],
  theme: {
    extend: {
      spacing: {
        11: "2.75rem",
        12: "3.25rem",
        13: "3.75rem",
        14: "4.25rem",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};

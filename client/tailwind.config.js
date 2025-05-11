/** @type {import('tailwindcss').Config} */
export const content = [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
];
export const theme = {
  extend: {
    colors: {
      Blue: "#2563eb",
      Success: "#16a34a",
      Inactive: "#6b7280",
      Warning: "#f59e0b",
      Text: "#1f2937",
      Error: "#ef4444",
      Icons: "#2dd4bf",
      Background: "#f3f4f6",
    },
  },
};
export const plugins = [];

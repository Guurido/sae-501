import tailwindcss from "@vituum/vite-plugin-tailwindcss";

export default {
  base: "./",
  css: {
    // Displays the source of sass files in dev
    devSourcemap: true,
  },
  plugins: [tailwindcss()],
  server: {
    // Expose the server to the network allowing access from ip address
    host: true,
  },
};

import { resolve } from "node:path"
import { defineConfig } from "vite"

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        game: resolve(__dirname, "index.html"),
        movies: resolve(__dirname, "about.html")
      }
    }
  }
})

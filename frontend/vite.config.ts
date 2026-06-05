// Configuration Vite du frontend React.
// Ce fichier active simplement le plugin React pour le build et le dev server.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});

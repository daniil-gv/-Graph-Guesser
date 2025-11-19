import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Fix for using process.env in client-side code if needed, 
    // though it's better to use import.meta.env for Vite
    'process.env': {} 
  }
});
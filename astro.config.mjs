// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://www.andre-schlegel.com',
  integrations: [react()],
  // the Journey fills the whole window: nothing may sit on top of it
  devToolbar: { enabled: false },
  vite: {
    plugins: [tailwindcss()],
  },
});

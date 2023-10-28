import { defineConfig } from 'astro/config';
import mdx from "@astrojs/mdx";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  output: 'hybrid',
  server: {
    port: 3000
  },
  integrations: [mdx()],
  adapter: node({
    mode: "standalone"
  })
});
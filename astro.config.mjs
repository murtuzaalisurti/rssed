import { defineConfig } from 'astro/config';
import mdx from "@astrojs/mdx";
import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  output: 'server',
  server: {
    port: 3000
  },
  integrations: [mdx()],
  adapter: vercel({
    functionPerRoute: true,
    includeFiles: [
      './src/data/connect.ts',
      './src/data/parser.ts',
      './src/data/sql/getListOfFeeds.sql',
      './src/data/sql/getSingleFeed.sql',
      './src/data/sql/insertFeed.sql',
      './src/lib/constants.ts',
      './src/lib/utils.ts',
      './src/lib'
    ]
  })
});
import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    'process.env.OPENAI_API_KEY': JSON.stringify(process.env.OPENAI_API_KEY)
  }
});

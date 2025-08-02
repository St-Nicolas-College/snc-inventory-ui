import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
export default defineNuxtConfig({
  app: {
    head: {
      titleTemplate: "%s - SNC Inventory System", // default fallback title
      htmlAttrs: {
        lang: "en",
      },
    },
  },
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },
  ssr: false,
  css: [
    "vuetify/lib/styles/main.sass",
    "@mdi/font/css/materialdesignicons.css", // Ensure MDI font is loaded
    "@/assets/css/main.css"
  ],
  build: {
    transpile: ["vuetify"],
  },
  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }));
      });
    },
    "@pinia/nuxt",
  ],
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },

  runtimeConfig: {
    public: {
      strapiBaseURL: process.env.STRAPI_BASE_URL,
    },
  },
});

import { createVuetify } from "vuetify";
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import { VDateInput } from 'vuetify/labs/VDateInput'
import "@mdi/font/css/materialdesignicons.css";

const customLightTheme = {
  dark: false,
  colors: {
    primary: "#4CAF50", // Example primary color
    secondary: "#424242", // Example secondary color
    accent: "#82B1FF", // Example accent color
    error: "#FF5252",
    info: "#2196F3",
    success: "#4CAF50",
    warning: "#FB8C00",
    background: "#F5F7F8", // Light background color for the overall page
    surface: "#FFFFFF", // Card/component background color
  },
};
export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    components: {
      VDateInput
    },
    directives,
    icons: {
      defaultSet: 'mdi',
      aliases,
      sets: {
        mdi,
      },
    },
    theme: {
      //defaultTheme: "customLightTheme",
      themes: {
        // customLightTheme,
        light: {
          colors: {
            primary: '#4CAF50', // Example primary color
            secondary: '#424242', // Example secondary color
            accent: '#82B1FF', // Example accent color
            error: '#FF5252',
            info: '#2196F3',
            success: '#4CAF50',
            warning: '#FB8C00',
            background: '#F5F7F8', // Light background color for the overall page
            surface: '#FFFFFF' // Card/component background color
          },
        },
      },
    },
  });
  nuxtApp.vueApp.use(vuetify);
});

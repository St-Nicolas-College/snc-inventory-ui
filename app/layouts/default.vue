<template>
  <v-app>
    <NavigationDrawer />

    <v-main>
      <v-container fluid class="pa-6">
        <slot /> </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
// definePageMeta({
//   middleware: ['staff']
// });
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");
body {
  font-family: "Inter", sans-serif;
}
/* Custom active class for the sidebar item to match the image's style */
/* .v-list-item--active-custom {
  background-color: #4CAF50;
  color: #FFFFFF; 
  border-radius: 8px;
} */

.v-list-item--active-custom {
  color: #4CAF50; 
  border-radius: 8px;
}

/* .v-navigation-drawer {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05) !important; 
} */
</style>
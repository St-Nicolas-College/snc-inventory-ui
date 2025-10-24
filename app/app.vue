<template>
<NuxtLoadingIndicator />
  <NuxtLayout>
    <AppLoader :show="isLoading" />

    <v-snackbar v-model="show" :color="color" location="top right" timeout="3000">
      <v-icon start class="mr-2">{{ icon }}</v-icon>
      {{ message }}
    </v-snackbar>
    <NuxtPage />
   <!-- Global Alerts -->
    <AlertStack />
  </NuxtLayout>
</template>
<script setup>
// import { useLoader } from '~/composables/useLoader';
import AlertStack from './components/AlertStack.vue';
const { show, message, color, icon } = useToast()
const { isLoading } = useLoader()
</script>
<template>
<NuxtLoadingIndicator />
  <NuxtLayout>
    <AppLoader :show="isLoading" />
    <v-snackbar v-model="show" :color="color" location="top right" timeout="3000">
      <v-icon start class="mr-2">{{ icon }}</v-icon>
      {{ message }}
    </v-snackbar>
    <NuxtPage />
  </NuxtLayout>
</template>
<script setup>
// import { useLoader } from '~/composables/useLoader';
const { show, message, color, icon } = useToast()
const { isLoading } = useLoader()
</script>
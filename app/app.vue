<template>
  <NuxtLayout>
    <v-snackbar v-model="show" :color="color" location="top right" timeout="3000">
      <v-icon start class="mr-2">{{ icon }}</v-icon>
      {{ message }}
    </v-snackbar>
    <NuxtPage />
  </NuxtLayout>
</template>
<script setup>
const { show, message, color, icon } = useToast()
</script>
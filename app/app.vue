<template>
  <NuxtLayout>
    <v-snackbar v-model="show" :color="color" location="top right" timeout="3000">
      {{ message }}
    </v-snackbar>
    <NuxtPage />
  </NuxtLayout>
</template>
<script setup>
const { show, message, color } = useToast()
</script>
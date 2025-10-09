<template>
  <transition name="fade">
    <div v-if="show">
      <!-- First load: Splash screen -->
      <div v-if="first" class="fixed inset-0 flex flex-col items-center justify-center bg-white z-[9999]">
        <!-- Example: Your logo -->
        <v-img src="/SNC-logo.png" max-width="140" class="mb-6" contain />
        <v-progress-circular indeterminate color="white" size="64" width="6" />
      </div>

      <!-- Navigation loader: Overlay spinner -->
      <v-overlay v-else :model-value="true" class="d-flex align-center justify-center" scrim z-index="9999">
        <!-- <v-img
          src="/SNC-logo.png"
          max-width="120"
          class="mb-6"
        /> -->
        <v-progress-circular indeterminate color="primary" size="48" width="5" />
      </v-overlay>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  show: Boolean,
  first: Boolean
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

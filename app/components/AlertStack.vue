<template>
  <!-- 🟦 Top-right container -->
  <div class="position-fixed d-flex flex-column ga-3 align-end" style="top: 24px; right: 24px; z-index: 3000;">
    <transition-group name="slide-x-fade" tag="div">
      <v-card v-for="alert in alerts" :key="alert.id"
        class="text-white rounded-lg elevation-12" width="320">
        <!-- Header -->
        <v-card-item class="position-relative py-2 px-3 d-flex flex-column align-center justify-center text-center" :style="getGradient(alert.type)">
          <!-- Centered content -->
          <div class="d-flex flex-column align-center justify-center text-center w-100">
            <v-icon :icon="alert.icon" size="28" class="mb-1" />
            <v-card-title class="text-center text-body-1 font-weight-medium">
              {{ alert.title }}
            </v-card-title>
          </div>

          <!-- Small close button (top-right corner) -->
          <v-btn icon="mdi-close" size="x-small" color="white" variant="text" class="position-absolute"
            style="top: 4px; right: 4px;" @click="removeAlert(alert.id)" />
        </v-card-item>

        <!-- Body -->
        <v-card-text class="text-center bg-white text-grey-darken-3 py-3">
          {{ alert.message }}
        </v-card-text>

        <!-- Auto progress bar -->
        <v-progress-linear :model-value="alert.progress" :color="alert.type" height="3" class="rounded-b-lg" stream />
      </v-card>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { watchEffect } from 'vue'
const { alerts } = useAlerts()

// Remove alert manually
const removeAlert = (id: number) => {
  alerts.value = alerts.value.filter((a) => a.id !== id)
}

// Animate progress bar countdown
watchEffect(() => {
  alerts.value.forEach((alert) => {
    if (!alert.timer) {
      const duration = alert.duration || 3000
      const start = Date.now()

      alert.progress = 100
      alert.timer = setInterval(() => {
        const elapsed = Date.now() - start
        alert.progress = Math.max(0, 100 - (elapsed / duration) * 100)

        if (elapsed >= duration) {
          clearInterval(alert.timer)
          removeAlert(alert.id)
        }
      }, 50)
    }
  })
})

const getGradient = (type: AlertType) => {
  switch (type) {
    case 'success':
      return {
        background: 'linear-gradient(90deg, #16a34a, #22c55e)',
      }
    case 'error':
      return {
        background: 'linear-gradient(90deg, #dc2626, #ef4444)',
      }
    case 'warning':
      return {
        background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
      }
    case 'info':
      return {
        background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
      }
    default:
      return {
        background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
      }
  }
}

</script>

<style scoped>
/* 🔹 Slide-in from right + fade animation */
.slide-x-fade-enter-active,
.slide-x-fade-leave-active {
  transition: all 0.4s ease;
}

.slide-x-fade-enter-from {
  opacity: 0;
  transform: translateX(50px);
}

.slide-x-fade-leave-to {
  opacity: 0;
  transform: translateX(50px);
}

v-card-item {
  transition: background 0.3s ease;
}

</style>

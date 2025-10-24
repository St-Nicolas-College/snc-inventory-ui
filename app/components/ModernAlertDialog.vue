<template>
  <v-dialog
    v-model="dialog"
    max-width="420"
    transition="dialog-top-transition"
  >
    <v-card
      class="rounded-xl elevation-12 overflow-hidden"
      :class="type"
    >
      <!-- ✅ Gradient Header -->
      <div class="dialog-header text-center d-flex align-center pa-2">
        <v-icon :icon="icon" size="20" class="mr-3 text-white" />
        <span class="text-white font-weight-medium">
          {{ title }}
        </span>
      </div>

      <!-- Message -->
      <v-card-text class="py-5 text-center text-grey-darken-3">

        <v-icon :icon="icon" size="40" :color="type" />
        <p class="mt-2 text-body-1">{{ message }}</p>
      </v-card-text>

      <!-- Actions (optional manual close) -->
      <!-- <v-card-actions class="pb-4">
        <v-spacer />
        <v-btn
          :color="type"
          variant="flat"
          rounded="lg"
          size="large"
          class="px-6 text-white"
          @click="closeDialog"
        >
          OK
        </v-btn>
        <v-spacer />
      </v-card-actions> -->
    </v-card>
  </v-dialog>
</template>

<script setup>

const props = defineProps({
  modelValue: Boolean,
  title: { type: String, default: 'Alert' },
  message: { type: String, default: '' },
  type: {
    type: String,
    default: 'info', // success | error | warning | info
  },
  autoClose: { type: Boolean, default: true },
  duration: { type: Number, default: 3000 }, // milliseconds
})

const emit = defineEmits(['update:modelValue'])
const dialog = ref(props.modelValue)
let timeoutId = null

watch(() => props.modelValue, (val) => {
  dialog.value = val
  if (val && props.autoClose) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      closeDialog()
    }, props.duration)
  }
})

watch(dialog, (val) => emit('update:modelValue', val))

const closeDialog = () => {
  dialog.value = false
}

const icon = computed(() => {
  switch (props.type) {
    case 'success':
      return 'mdi-check-circle-outline'
    case 'error':
      return 'mdi-alert-circle-outline'
    case 'warning':
      return 'mdi-alert-outline'
    default:
      return 'mdi-information-outline'
  }
})
</script>

<style scoped>
.dialog-header {
  background: linear-gradient(90deg, #6366f1, #8b5cf6); /* Default info gradient */
}

/* Type-based gradients */
.success .dialog-header {
  background: linear-gradient(90deg, #16a34a, #22c55e);
}

.error .dialog-header {
  background: linear-gradient(90deg, #dc2626, #ef4444);
}

.warning .dialog-header {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.info .dialog-header {
  background: linear-gradient(90deg, #3b82f6, #6366f1);
}
</style>
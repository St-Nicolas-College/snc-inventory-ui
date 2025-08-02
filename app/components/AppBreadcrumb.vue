<template>

    <v-sheet
      class="d-flex align-center pa-4 rounded-lg elevation-0"
      :color="theme === 'dark' ? 'green-darken-2' : 'white'"
      width="100%"
    >
      <template v-for="(item, index) in breadcrumbs" :key="index">
        <!-- Avatar for first item (e.g. Home) -->
        <v-avatar
          v-if="index === 0 && item.icon"
          size="36"
          class="me-2"
          :color="theme === 'dark' ? 'white' : 'green-lighten-5'"
        >
          <v-icon
            :icon="item.icon"
            :color="theme === 'dark' ? 'green-darken-2' : 'green'"
          />
        </v-avatar>

        <!-- Link or static breadcrumb text -->
        <v-btn
          v-if="item.to"
          :to="item.to"
          variant="text"
          class="text-capitalize"
          :class="theme === 'dark' ? 'text-white' : 'text-green-darken-2'"
        >
          {{ item.text }}
        </v-btn>
        <span
          v-else
          class="font-weight-medium text-capitalize"
          :class="theme === 'dark' ? 'text-white' : 'text-green-darken-2'"
        >
          {{ item.text }}
        </span>

        <!-- Chevron Icon Divider -->
        <v-icon
          v-if="index < breadcrumbs.length - 1"
          icon="mdi-chevron-right"
          size="20"
          class="mx-2"
          :class="theme === 'dark' ? 'text-white' : 'text-grey-darken-1'"
        />
      </template>
    </v-sheet>

</template>

<script setup>
defineProps({
  breadcrumbs: {
    type: Array,
    required: true
  },
  theme: {
    type: String,
    default: 'light' // "light" or "dark"
  }
})
</script>

<style>

</style>
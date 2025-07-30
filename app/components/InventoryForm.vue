<template>
  <div>
    <v-form @submit.prevent="onSubmit">
    <v-text-field v-model="form.name" label="Item Name" required />
    <v-text-field v-model="form.quantity" label="Quantity" type="number" required />
    <v-text-field v-model="form.unit" label="Unit" />
    <v-select
      v-model="form.item_status"
      :items="['active', 'maintenance', 'lost', 'disposed']"
      label="Status"
    />
    <v-btn type="submit" color="primary">{{ submitText }}</v-btn>
  </v-form>
  </div>
</template>

<script setup>
defineProps({
  form: Object,
  submitText: String,
  onSubmit: Function,
})
</script>

<style>

</style>
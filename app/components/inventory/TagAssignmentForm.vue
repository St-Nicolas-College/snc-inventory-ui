<template>
  <div>
    <v-dialog v-model="dialog" max-width="600">
    <template #activator="{ props }">
      <v-btn v-bind="props" color="primary" class="mb-2">
        {{ isEditMode ? 'Edit Tag' : 'Assign Tag' }}
      </v-btn>
    </template>

    <v-card>
      <v-card-title class="text-h6">
        {{ isEditMode ? 'Edit Tag Assignment' : 'Assign New Tag' }}
      </v-card-title>

      <v-card-text>
        <v-form ref="form" @submit.prevent="submitForm">
          <v-text-field v-model="form.tag_number" label="Tag Number" required />
          <v-text-field v-model="form.assigned_to" label="Assigned To" />
          <v-text-field v-model="form.location" label="Location" />
          <v-select
            v-model="form.tag_status"
            label="Status"
            :items="['available', 'assigned', 'in-repair', 'disposed']"
            required
          />
          <v-select
            v-model="form.condition"
            label="Condition"
            :items="['new', 'good', 'fair', 'poor', 'damaged']"
            required
          />
          <v-textarea v-model="form.remarks" label="Remarks" rows="2" />
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="dialog = false">Cancel</v-btn>
        <v-btn color="primary" @click="submitForm">
          {{ isEditMode ? 'Update' : 'Create' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  </div>
</template>

<script setup>
const props = defineProps({
  tag: Object, // existing tag (for edit), or undefined
  itemId: Number // item relation
})
const emit = defineEmits(['saved'])

const dialog = ref(false)
// const form = ref()

const isEditMode = computed(() => !!props.tag)

const formData = {
  tag_number: '',
  assigned_to: '',
  location: '',
  tag_status: 'available',
  condition: 'good',
  remarks: ''
}
const form = ref({ ...formData })

// Pre-fill form when editing
watch(
  () => props.tag,
  (tag) => {
    if (tag?.attributes) {
      form.value = {
        tag_number: tag.tag_number,
        assigned_to: tag.assigned_to,
        location: tag.location,
        tag_status: tag.tag_status,
        condition: tag.condition,
        remarks: tag.remarks
      }
    } else {
      form.value = { ...formData }
    }
  },
  { immediate: true }
)

const submitForm = async () => {
  const baseUrl = useRuntimeConfig().public.strapiBaseURL
  const token = useCookie('token')
  const headers = {
    Authorization: `Bearer ${token.value}`
  }

  const payload = {
    data: {
      ...form.value,
      item: props.itemId
    }
  }

  try {
    const url = isEditMode.value
      ? `${baseUrl}/api/item-tags/${props.tag.id}`
      : `${baseUrl}/api/item-tags`

    const method = isEditMode.value ? 'PUT' : 'POST'

    const { error } = await useFetch(url, {
      method,
      headers,
      body: payload
    })

    if (!error.value) {
      dialog.value = false
      emit('saved') // Notify parent to refresh
    } else {
      console.error('Failed to save tag:', error.value)
    }
  } catch (e) {
    console.error('Error saving tag:', e)
  }
}
</script>

<style>

</style>
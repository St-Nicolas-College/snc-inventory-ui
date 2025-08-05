<template>
  <v-dialog v-model="dialog" max-width="500">
    <template #activator="{ props }">
      <v-btn v-bind="props" variant="elevated" flat size="small" color="blue">
        <v-icon start>mdi-pencil</v-icon> Edit
      </v-btn>
    </template>

    <v-card>
      <!-- <v-card-title>Edit Tag</v-card-title> -->
      <v-card-title class="d-flex align-center">
        <v-icon start>mdi-tag-outline</v-icon> Edit Tag
        <v-spacer></v-spacer>
        <v-btn @click="dialog = false" flat icon><v-icon>mdi-close</v-icon></v-btn>
      </v-card-title>
      <v-divider></v-divider>
      <v-form @submit.prevent="updateTag">
        <v-card-text>
          <v-text-field v-model="form.tag_number" label="Tag Number" readonly />
          <v-text-field v-model="form.assigned_to" label="Assigned To" />
          <v-select v-model="form.tag_status" :items="statusOptions" label="Status" required />
          <v-select v-model="form.condition" label="Condition" :items="['new', 'good', 'fair', 'poor', 'damaged']"
              required />
          <v-text-field v-model="form.location" label="Location" />
          <v-textarea v-model="form.remarks" label="Remarks" rows="2" />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn text @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" type="submit">Update</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup>
const { triggerToast } = useToast()
const props = defineProps({
  tag: Object
})

const emit = defineEmits(['saved'])

const token = useCookie('token')
const baseUrl = useRuntimeConfig().public.strapiBaseURL

const dialog = ref(false)

const form = ref({
  tag_number: '',
  tag_status: '',
  assigned_to: '',
  condition: '',
  location: '',
  remarks: ''
})

const statusOptions = ['available', 'assigned', 'in-repair', 'lost', 'disposed']

watch(dialog, (val) => {
  if (val) {
    form.value = {
      tag_number: props.tag.tag_number,
      tag_status: props.tag.tag_status,
      assigned_to: props.tag.assigned_to,
      condition: props.tag.condition,
      location: props.tag.location,
      remarks: props.tag.remarks
    }
  }
})

const updateTag = async () => {
  const { error } = await useFetch(`${baseUrl}/api/item-tags/${props.tag.documentId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token.value}`
    },
    body: {
      data: { ...form.value }
    }
  })

  if (!error.value) {
    dialog.value = false
    emit('saved') // notify parent to refresh
    triggerToast(`Tag # ${form.value.tag_number} updated successfully.`, 'success')
  } else {
    console.error('Update failed:', error.value)
  }
}
</script>

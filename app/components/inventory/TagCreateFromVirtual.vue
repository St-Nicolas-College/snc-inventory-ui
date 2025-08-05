<template>
  <v-dialog max-width="500" persistent>
    <template #activator="{ props: dialog }">
      <v-btn v-bind="dialog" icon="mdi-plus" color="primary" />
    </template>

    <template #default="{ isActive }">
      <v-card>
        <v-card-title>Create Tag</v-card-title>
        <v-card-text>
          <v-text-field v-model="form.tag_number" label="Tag Number"/>
          <v-select
            v-model="form.tag_status"
            :items="['assigned', 'available', 'in-repair', 'disposed']"
            label="Status"
          />
          <v-text-field v-model="form.assigned_to" label="Assigned To" />
          <!-- <v-text-field v-model="form.condition" label="Condition" /> -->
           <v-select v-model="form.condition" label="Condition" :items="['new', 'good', 'fair', 'poor', 'damaged']"
              required />
          <v-text-field v-model="form.location" label="Location" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="isActive.value = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveTag">Save</v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script setup>
const { triggerToast } = useToast();
const props = defineProps({
  virtualTag: Object,
  itemId: [String, Number]
})

const emit = defineEmits(['saved'])

const form = reactive({
  tag_number: props.virtualTag.tag_number,
  tag_status: 'assigned',
  assigned_to: '',
  condition: '',
  location: ''
})

const token = useCookie('token')
const baseUrl = useRuntimeConfig().public.strapiBaseURL

const saveTag = async () => {
  try {
    await $fetch(`${baseUrl}/api/item-tags`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      body: {
        data: {
          tag_number: form.tag_number,
          tag_status: form.tag_status,
          assigned_to: form.assigned_to,
          condition: form.condition,
          location: form.location,
          item: props.itemId
        }
      }
    })

    triggerToast('Tag created successfully.', 'success', 'mdi-check')
    emit('saved')
  } catch (err) {
    console.error(err)
    triggerToast('Failed to create tag.', 'error', 'mdi-alert')
  }
}
</script>

<template>
  <div>
    <v-card>
      <v-card-title>
        Assign Tag Number to Item Unit
      </v-card-title>

      <v-card-text>
        <v-form ref="formRef" v-model="isValid" @submit.prevent="assignTag">
          <v-text-field v-model="form.tag_number" label="Tag Number" :rules="[rules.required]" required></v-text-field>

          <v-btn color="primary" :disabled="loading" type="submit">
            Assign Tag
          </v-btn>

          <v-alert v-if="errorMsg" type="error" class="mt-3">
            {{ errorMsg }}
          </v-alert>

          <v-alert v-if="successMsg" type="success" class="mt-3">
            {{ successMsg }}
          </v-alert>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Table of Assigned Tags -->
    <v-card class="mt-5">
      <v-card-title>Assigned Tags</v-card-title>
      <v-data-table :headers="headers" :items="assignedTags" class="elevation-1"></v-data-table>
    </v-card>
  </div>
</template>

<script setup>
const route = useRoute()
const token = useCookie('token')
const baseUrl = useRuntimeConfig().public.strapiBaseURL

const formRef = ref(null)
const isValid = ref(true)
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const assignedTags = ref([])

const form = ref({
  tag_number: ''
})

const rules = {
  required: v => !!v || 'This field is required'
}

const headers = [
  { title: 'Tag Number', key: 'tag_number' },
  { title: 'Assigned Date', key: 'createdAt' }
]

const fetchAssignedTags = async () => {
  const { data } = await $fetch(
    `${baseUrl}/api/item-tags?filters[item][documentId][$eq]=${route.params.id}&sort=createdAt:desc`,
    { headers: { Authorization: `Bearer ${token.value}` } }
  )
  assignedTags.value = data.map(t => ({
    tag_number: t.tag_number,
    createdAt: new Date(t.createdAt).toLocaleString()
  })) || []
}

const assignTag = async () => {
  errorMsg.value = ''
  successMsg.value = ''

  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  try {
    // Attempt to create tag
    const { error } = await $fetch(`${baseUrl}/api/item-tags`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      body: {
        data: {
          tag_number: form.value.tag_number,
          item: route.params.id
        }
      }
    })
    console.log("error", error)
    if (error) {
      if (error.status === 400 && error.value.data?.error?.message?.includes('unique')) {
        errorMsg.value = 'This tag number already exists!'
      } else {
        errorMsg.value = 'Failed to assign tag.'
      }
    } else {
      successMsg.value = 'Tag assigned successfully!'
      form.value.tag_number = ''
      fetchAssignedTags()
    }
  } catch (e) {
    errorMsg.value = 'Error assigning tag.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchAssignedTags)
</script>

<style></style>
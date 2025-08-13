<template>
  <div>
    <v-row>
      <v-col cols="12">
        <v-card class="pa-4">
          <h2 class="mb-2">{{ item?.name }}</h2>
          <p>Total Quantity: {{ item?.quantity }}</p>

          <v-divider class="my-4" />

          <!-- Assign Tag Form -->
          <v-form @submit.prevent="assignTag" ref="formRef">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="tagNumber" label="Enter Tag Number" :error-messages="errorMessage" clearable />
              </v-col>
              <v-col cols="12" md="6" class="d-flex align-center">
                <v-btn type="submit" color="primary" class="mt-md-0 mt-2">
                  Assign Tag
                </v-btn>
              </v-col>
            </v-row>
          </v-form>

          <v-divider class="my-4" />

          <!-- Assigned Tags Table -->
          <h3>Assigned Tags</h3>
          <v-table density="compact">
            <thead>
              <tr>
                <th>Tag Number</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in tags" :key="t.id">
                <td>{{ t.tag_number }}</td>
                <td>{{ t.tag_status }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
const baseUrl = 'http://localhost:1337'
const token = useCookie("token");
const route = useRoute()

const valid = ref(false)
const formRef = ref(null)
const tagNumber = ref('')
const tags = ref([])
const itemDetails = ref({ quantity: 0 })

const headers = [
  { title: 'Tag Number', key: 'tag_number' },
  { title: 'Status', key: 'status' }
]

const rules = {
  required: v => !!v || 'This field is required'
}

function getStatusColor(status) {
  switch (status) {
    case 'assigned': return 'blue'
    case 'in-repair': return 'orange'
    case 'lost': return 'red'
    default: return 'green'
  }
}

async function fetchItemDetails() {
  const res = await $fetch(`${baseUrl}/api/items/${route.params.id}`, {
    headers: { Authorization: `Bearer ${token.value}` },
    params: { populate: '*' }
  })
  itemDetails.value = {
    quantity: res.data.quantity
  }
}

async function fetchTags() {
  tags.value = await $fetch(`${baseUrl}/api/item-tags`, {
    headers: { Authorization: `Bearer ${token.value}` },
    params: {
      'filters[item][documentId][$eq]': route.params.id,
      'sort[0]': 'createdAt:asc'
    }
  }).then(res => res.data?.map(t => ({
    tag_number: t.tag_number,
    tag_status: t.tag_status 
    
  })))
}

async function assignTag() {
  if (!formRef.value.validate()) return

  // Over-tagging prevention
  if (tags.value.length >= itemDetails.value.quantity) {
    alert(`Cannot assign more tags. This item only has a quantity of ${itemDetails.value.quantity}.`)
    return
  }

  try {
    await $fetch(`${baseUrl}/api/item-tags`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: {
        data: {
          tag_number: tagNumber.value,
          item: route.params.id,
          tag_status: 'available'
        }
      }
    })
    tagNumber.value = ''
    formRef.value.reset()
    await fetchTags()
  } catch (err) {
    console.error('Error assigning tag:', err)
    alert('Tag number already exists or failed to save.')
  }
}

onMounted(async () => {
  await fetchItemDetails()
  await fetchTags()
})
</script>

<style>

</style>
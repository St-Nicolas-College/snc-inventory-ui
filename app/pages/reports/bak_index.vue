<template>
  <v-container fluid class="pa-6 bg-grey-lighten-4">
    <v-row>
      <!-- Header -->
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <div>
          <h2 class="text-h5 font-weight-bold mb-1">📊 Item Reports</h2>
          <p class="text-body-2 text-grey">View your assets grouped by category, location, or department.</p>
        </div>

        <v-select
          v-model="groupBy"
          :items="[
            { title: 'Group by Category', value: 'category' },
            { title: 'Group by Department', value: 'department' },
            { title: 'Group by Location', value: 'location' },
            
          ]"
          variant="outlined"
          density="compact"
          label="Group Items"
          style="max-width: 250px"
        />
      </v-col>

      <!-- Grouped Tables -->
      <v-col
        v-for="(group, key) in groupedItems"
        :key="key"
        cols="12"
      >
        <v-card class="mb-6 elevation-0">
          <v-card-title class="bg-primary text-white d-flex justify-space-between align-center">
            <div class="d-flex align-center">
              <v-icon start>
                {{ getGroupIcon(groupBy) }}
              </v-icon>
              <span>{{ key || 'Unassigned' }}</span>
            </div>
            <span class="text-caption">Total: {{ group.length }}</span>
          </v-card-title>

          <v-data-table
            :headers="headers"
            :items="group"
            density="comfortable"
            class="border-t"
            :loading="loading"
            loading-text="Loading items..."
          >
            <template v-slot:[`item.status`]="{ item }">
              <v-chip
                :color="item.status === 'retired' ? 'red' : 'green'"
                small
                label
              >
                {{ item.status }}
              </v-chip>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRuntimeConfig } from '#app'

const config = useRuntimeConfig()
const baseUrl = config.public.strapiBaseURL
const token = useCookie('token')

const groupBy = ref('category')
const items = ref([])
const loading = ref(false)

const headers = [
  { title: 'Item Name', key: 'name' },
  { title: 'Description', key: 'description' },
  { title: 'Quantity', key: 'quantity' },
  { title: 'Status', key: 'status' },
  { title: 'Category', key: 'category' },
  { title: 'Location', key: 'location' },
  { title: 'Department', key: 'department' },
]

/** Fetch items with relations */
const fetchItems = async () => {
  loading.value = true
  try {
    const res = await $fetch(`${baseUrl}/api/items`, {
      headers: { Authorization: `Bearer ${token.value}` },
      params: {
        //populate: 'category,location,department',
        'populate[0]': 'category',
        'populate[1]': 'department',
        'populate[2]': 'location',
        'sort[0]': 'createdAt:asc',
      },
    })

    items.value = res.data.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      quantity: item.quantity || 0,
      status: item.status || 'active',
      category: item.category?.name || 'Uncategorized',
      location: item.location?.name || 'Unassigned',
      department: item.department?.name || 'No Department',
    }))
  } catch (err) {
    console.error('Error fetching items:', err)
  } finally {
    loading.value = false
  }
}

/** Group items dynamically */
const groupedItems = computed(() => {
  const groups = {}
  items.value.forEach((item) => {
    let key = ''
    if (groupBy.value === 'category') key = item.category
    else if (groupBy.value === 'location') key = item.location
    else if (groupBy.value === 'department') key = item.department

    if (!groups[key]) groups[key] = []
    groups[key].push(item)
  })
  return groups
})

/** Choose icons per grouping type */
const getGroupIcon = (type) => {
  switch (type) {
    case 'category':
      return 'mdi-shape'
    case 'location':
      return 'mdi-map-marker'
    case 'department':
      return 'mdi-office-building'
    default:
      return 'mdi-folder'
  }
}

onMounted(fetchItems)
</script>

<style scoped>
.v-data-table {
  border-radius: 0;
}
.v-card-title {
  font-weight: 600;
  letter-spacing: 0.5px;
}
</style>

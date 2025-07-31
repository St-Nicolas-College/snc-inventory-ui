<template>
  <div>
    <v-row justify="space-between" align="center">
      <h2>Inventory Items</h2>
      <NuxtLink to="/inventory/create">
        <v-btn color="primary">Add Item</v-btn>
      </NuxtLink>
    </v-row>

    <v-data-table :headers="header" :items="items" :search="search">
      <template #top>
        <v-text-field v-model="search" label="Search..." />
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <NuxtLink :to="`/inventory/${item.documentId}`">
          <v-btn icon color="blue"><v-icon>mdi-pencil</v-icon></v-btn>
        </NuxtLink>
        <v-btn icon color="red" @click="deleteItem(item.id)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>
  </div>
</template>

<script setup>
const baseUrl = useRuntimeConfig().public.strapiBaseURL
const token = useCookie('token')
definePageMeta({
  middleware: 'role-check',
  allowedRoles: ['custodian', 'staff']
})

useHead({
  title: 'Inventory',

})

const items = ref([])
const search = ref('')
const header = [
  { title: 'Name', key: 'name' },
  { title: 'Quantity', key: 'quantity' },
  { title: 'Unit', key: 'unit' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false },
]

onMounted(async () => {
  const { data } = await useFetch(`${baseUrl}/api/items`, {
    headers: {
        Authorization: `Bearer ${token.value}`
      }
  })
  items.value = data.value.data
  console.log("Data: ", data.value)
})

async function deleteItem(id) {
  if (!confirm('Are you sure?')) return
  await $fetch(`http://localhost:1337/api/items/${id}`, { method: 'DELETE' })
  items.value = items.value.filter(i => i.id !== id)
}
</script>

<style>

</style>
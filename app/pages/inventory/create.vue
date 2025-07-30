<template>
  <div>
    <h2>Add New Item</h2>
    <!-- <InventoryForm :form="form" :submitText="'Create'" :onSubmit="createItem" /> -->
    <v-form @submit.prevent="submit">
      <v-text-field v-model="form.name" label="Item Name" required />

      <v-text-field v-model="form.quantity" label="Quantity" type="number" min="1" required />

      <v-select v-model="form.category" :items="categories" item-title="name" item-value="id"
        label="Category" required />

      <v-select v-model="form.department" :items="departments" item-title="name" item-value="id"
        label="Department" />

      <v-select v-model="form.supplier" :items="suppliers" item-title="name" item-value="id"
        label="Supplier" />

      <v-btn type="submit" color="primary" class="mt-4">Save Item</v-btn>
    </v-form>
  </div>
</template>

<script setup>
const baseUrl = useRuntimeConfig().public.strapiBaseURL
const token = useCookie('token')
const { triggerToast } = useToast()

const categories = ref([])
const departments = ref([])
const suppliers = ref([])

const form = ref({
  name: '',
  quantity: 1,
  category: null,
  department: null,
  supplier: null
})

const fetchRelations = async () => {
  const [cat, dept, supp] = await Promise.all([
    $fetch(`${baseUrl}/api/categories`, {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    }),
    $fetch(`${baseUrl}/api/departments`, {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    }),
    $fetch(`${baseUrl}/api/suppliers`, {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })
  ])

  categories.value = cat.data
  departments.value = dept.data
  suppliers.value = supp.data
}

onMounted(() => {
  console.log("Token: ", token.value)
  fetchRelations()
})

const submit = async () => {
  try {
    await $fetch(`${baseUrl}/api/items`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      body: {
        data: {
          name: form.value.name,
          quantity: form.value.quantity,
          category: form.value.category,
          department: form.value.department,
          supplier: form.value.supplier
        }
      }
    })
    triggerToast('Item created successfully!', 'success')
    await navigateTo('/inventory')

    // Redirect or show success toast
  } catch (err) {
    console.error('Error creating item:', err)
    triggerToast('Failed to update item.', 'error')
  }
}

// const form = reactive({
//   name: '',
//   quantity: 1,
//   unit: 'pcs',
//   item_status: 'active',
// })
// async function createItem() {
//   await $fetch('http://localhost:1337/api/items', {
//     method: 'POST',
//     body: { data: form },
//   })
//   await navigateTo('/inventory')
// }


</script>

<style></style>
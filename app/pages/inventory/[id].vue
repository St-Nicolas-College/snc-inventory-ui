<template>
  <div>
    <h2>Edit Item</h2>
    <!-- <InventoryForm :form="form" :submitText="'Update'" :onSubmit="updateItem" /> -->
    <v-form @submit.prevent="updateItem">
      <v-text-field v-model="form.name" label="Item Name" required />
      <v-text-field v-model="form.quantity" type="number" label="Quantity" required />
      <v-select v-model="form.category" :items="categories" item-title="name" item-value="id"
        label="Category" required />
      <v-select v-model="form.department" :items="departments" item-title="name" item-value="id"
        label="Department" />
      <v-select v-model="form.supplier" :items="suppliers" item-title="name" item-value="id"
        label="Supplier" />

      <v-btn type="submit" color="primary" class="mt-4">Update Item</v-btn>
    </v-form>
  </div>
</template>

<script setup>
const baseUrl = useRuntimeConfig().public.strapiBaseURL
const token = useCookie('token')
const route = useRoute()
const { triggerToast } = useToast()

const itemId = route.params.id
// const form = reactive({ name: '', quantity: 1, unit: '', item_status: '' })
const form = ref({
  name: '',
  quantity: 1,
  category: null,
  department: null,
  supplier: null
})

const categories = ref([])
const departments = ref([])
const suppliers = ref([])

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

const fetchItem = async () => {
  const res = await $fetch(`${baseUrl}/api/items/${itemId}?populate=*`, {
    headers: {
        Authorization: `Bearer ${token.value}`
      }
  })
  const item = res.data

  form.value = {
    name: item.name,
    quantity: item.quantity,
    category: item.category?.id || null,
    department: item.department?.id || null,
    supplier: item.supplier?.id || null
  }
}

onMounted(async () => {
  await fetchRelations()
  await fetchItem()
})

const updateItem = async () => {
  try {
    await $fetch(`${baseUrl}/api/items/${itemId}`, {
      method: 'PUT',
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
    // Optional: redirect or show toast
    triggerToast('Item updated successfully!', 'success')
    await navigateTo('/inventory')
  } catch (err) {
    console.error('Error updating item:', err)
    triggerToast('Failed to update item.', 'error')
  }
}



// onMounted(async () => {
//   const { data } = await useFetch(`${baseUrl}/api/items/${route.params.id}`, {
//     headers: {
//         Authorization: `Bearer ${token.value}`
//       }
//   })
//   Object.assign(form, data.value)
//   console.log("data: ", data)
// })

// async function updateItem() {
//   await $fetch(`${baseUrl}/api/items/${route.params.id}`, {
//     method: 'PUT',
//     body: { data: form },
//   })
//   await navigateTo('/inventory')
// }
</script>

<style></style>
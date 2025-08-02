<template>
  <div>
    <!-- <v-row justify="space-between" align="center">
      <h2>Inventory Items</h2>
      <NuxtLink to="/inventory/create">
        <v-btn color="primary">Add Item</v-btn>
      </NuxtLink>
    </v-row> -->

    <AppBreadcrumb :breadcrumbs="breadcrumbItems" theme="light" />
    <h2 class="mb-4">Inventory Items</h2>
    <v-card elevation="0">
      <v-card-title class="d-flex align-center">
        <!-- <v-btn class="my-2 text-capitalize" prepend-icon="mdi-plus" color="primary" to="/inventory/create">Add
          Item</v-btn> -->
        <v-btn class="my-2 text-capitalize" prepend-icon="mdi-plus" color="primary" @click="openCreateDialog">Add
          Item</v-btn>
        <v-spacer></v-spacer>
        <v-spacer></v-spacer>
        <v-text-field v-model="search" density="compact" label="Search" prepend-inner-icon="mdi-magnify"
          variant="solo-filled" flat hide-details single-line></v-text-field>

      </v-card-title>
      <v-divider></v-divider>
      <v-data-table density="compact" :headers="header" :items="items" :search="search" :loading="loading">
        <!-- <template #top>
          <v-text-field v-model="search" label="Search..." />
        </template> -->
        <template v-slot:loading>
          <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
        </template>
        <template v-slot:[`item.category`]="{ item }">
          {{ item.category?.name || '-' }}
        </template>
        <template v-slot:[`item.department`]="{ item }">
          {{ item.department?.name || '-' }}
        </template>
        <template v-slot:[`item.supplier`]="{ item }">
          {{ item.supplier?.name || '-' }}
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <!-- <v-btn size="small" class="mr-1" variant="tonal" color="blue" :to="`/inventory/${item.documentId}`"><v-icon>mdi-pencil</v-icon> Edit</v-btn> -->
           <v-btn size="small" class="mr-1" variant="tonal"
            @click="openEditDialog(item)"><v-icon>mdi-open-in-new</v-icon> View</v-btn>
          <v-btn size="small" class="mr-1" variant="tonal" color="blue"
            @click="openEditDialog(item)"><v-icon>mdi-pencil</v-icon> Edit</v-btn>
          <v-btn size="small" variant="tonal" color="red" @click="deleteItem(item.documentId)">
            <v-icon>mdi-delete</v-icon> Delete
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Create Item -->
    <v-dialog v-model="createDialog" max-width="600">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon start>mdi-archive</v-icon> Create Item
          <v-spacer></v-spacer>
          <v-btn @click="createDialog = false" flat icon><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="mt-5">
          <v-form ref="createItemForm" @submit.prevent="createItem">
            <v-text-field v-model="createForm.name" label="Item Name" required />
            <v-text-field v-model.number="createForm.quantity" label="Quantity" type="number" required />
            <v-select v-model="createForm.category" :items="categories" item-title="name" item-value="id"
              label="Category" />

            <v-select v-model="createForm.department" :items="departments" item-title="name" item-value="id"
              label="Department" />

            <v-select v-model="createForm.supplier" :items="suppliers" item-title="name" item-value="id"
              label="Supplier" />
            <!-- Optional: Add v-selects for category, department, etc. -->
            <v-btn type="submit" color="primary" class="mt-4" block>Update</v-btn>
          </v-form>
        </v-card-text>

      </v-card>
    </v-dialog>

    <!-- Edit Dialog -->
    <v-dialog v-model="editDialog" max-width="600">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon start>mdi-archive</v-icon> Edit Item
          <v-spacer></v-spacer>
          <v-btn @click="editDialog = false" flat icon><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="mt-5">
          <v-form @submit.prevent="updateItem">
            <v-text-field v-model="editForm.name" label="Item Name" required />
            <v-text-field v-model.number="editForm.quantity" label="Quantity" type="number" required />
            <v-select v-model="editForm.category" :items="categories" item-title="name" item-value="id"
              label="Category" />

            <v-select v-model="editForm.department" :items="departments" item-title="name" item-value="id"
              label="Department" />

            <v-select v-model="editForm.supplier" :items="suppliers" item-title="name" item-value="id"
              label="Supplier" />
            <!-- Optional: Add v-selects for category, department, etc. -->
            <v-btn type="submit" color="primary" class="mt-4" block>Update</v-btn>
          </v-form>
        </v-card-text>

      </v-card>
    </v-dialog>


  </div>
</template>

<script setup>
const baseUrl = useRuntimeConfig().public.strapiBaseURL
const token = useCookie('token')
const { triggerToast } = useToast()
definePageMeta({
  middleware: 'role-check',
  allowedRoles: ['custodian', 'staff']
})

useHead({
  title: 'Inventory',

})

const items = ref([])
const search = ref('')
const loading = ref(true)
const header = [
  { title: 'Name', key: 'name' },
  { title: 'Quantity', key: 'quantity', sortable: false },
  { title: 'Unit', key: 'unit', sortable: false },
  { title: 'Category', key: 'category', sortable: false },
  { title: 'Department', key: 'department', sortable: false },
  { title: 'Supplier', key: 'category', sortable: false },
  { title: 'Status', key: 'supplier', sortable: false },
  { title: 'Actions', key: 'actions', align: 'end', sortable: false },
]

const breadcrumbItems = [
  { text: 'Home', to: '/', icon: 'mdi-home-outline' },
  { text: 'Inventory' },

]

const editDialog = ref(false)
const createDialog = ref(false)
const selectedItemId = ref(null)
const createItemForm = ref(null)
const createForm = ref({
  name: '',
  quantity: 0,
  category: null,
  department: null,
  supplier: null
})
const editForm = ref({
  name: '',
  quantity: 0,
  category: null,
  department: null,
  supplier: null
})

const categories = ref([])
const departments = ref([])
const suppliers = ref([])

onMounted(async () => {
  // const { data } = await useFetch(`${baseUrl}/api/items`, {
  //   headers: {
  //     Authorization: `Bearer ${token.value}`
  //   }
  // })
  // items.value = data.value.data
  // console.log("Data: ", data.value)

  await getItems()

})

const getItems = async () => {
  try {
    const res = await $fetch(`${baseUrl}/api/items?populate=*`, {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })

    if (res) {
      items.value = res.data.sort((a, b) => a.id - b.id)
      loading.value = false;
    }
  } catch (err) {
    console.error("Failed to fetch data: ", err);
    triggerToast('Failed to fetch data.', 'error');
    throw err;
  }
}

// Fetch Relation
const fetchRelations = async () => {
  const [catRes, deptRes, suppRes] = await Promise.all([
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

  categories.value = catRes.data
  departments.value = deptRes.data
  suppliers.value = suppRes.data
}

// Open create dialog
const openCreateDialog = async (item) => {
  fetchRelations()
  createDialog.value = true
}

// Create item
const createItem = async () => {
  const isValid = await createItemForm.value.validate();
  try {
    if (isValid.valid) {
      await $fetch(`${baseUrl}/api/items`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.value}`
        },
        body: {
          data: {
            name: createForm.value.name,
            quantity: createForm.value.quantity,
            category: createForm.value.category,
            department: createForm.value.department,
            supplier: createForm.value.supplier
          }
        }
      })
      triggerToast('Item created successfully!', 'success')
      //createDialog.value = false
      createItemForm.value?.reset();
      getItems();
    }
  } catch (err) {
    console.error('Error creating item:', err)
    triggerToast('Failed to create item.', 'error')
  }
}

// Open selected item in a dialog box
const openEditDialog = async (item) => {
  selectedItemId.value = item.documentId

  await fetchRelations()

  const res = await $fetch(`${baseUrl}/api/items/${selectedItemId.value}?populate=*`, {
    headers: {
      Authorization: `Bearer ${token.value}`
    }
  })

  const data = res.data;

  editForm.value = {
    name: data.name,
    quantity: data.quantity,
    category: data.category?.id || null,
    department: data.department?.id || null,
    supplier: data.supplier?.id || null
  }

  editDialog.value = true
}

// Update item
const updateItem = async (item) => {
  try {
    await $fetch(`${baseUrl}/api/items/${selectedItemId.value}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      body: {
        data: {
          name: editForm.value.name,
          quantity: editForm.value.quantity,
          category: editForm.value.category,
          department: editForm.value.department,
          supplier: editForm.value.supplier
        }
      }
    })

    triggerToast('Item updated successfully!', 'success')
    editDialog.value = false
    getItems();
  } catch (err) {
    triggerToast('Failed to update item.', 'error')
    console.error(e)
  }
}

// Delete item
async function deleteItem(id) {
  if (!confirm('Are you sure?')) return
  try {
    // Check if the category exist first
    const check = await $fetch(`${baseUrl}/api/items/${id}`, {
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      throw: false
    })
    if (!check?.data) {
      triggerToast('Item not found.', 'error')
      return
    }

    // Delete if it exist
    await $fetch(`${baseUrl}/api/items/${id}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      }
    )
    triggerToast('Item deleted.', 'success')
    getItems();
  } catch (err) {
    triggerToast('Delete failed.', 'error')
    console.error('Delete error.', err)
  }




  // if (!confirm('Are you sure?')) return
  // await $fetch(`${baseUrl}/api/items/${id}`,
  //   {
  //     method: 'DELETE',
  //     headers: {
  //       Authorization: `Bearer ${token.value}`
  //     }
  //   }
  // )
  // items.value = items.value.filter(i => i.id !== id)
}
</script>

<style scoped>
:deep() .v-table .v-table__wrapper>table>thead>tr>th {
  border-right: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-bottom: thick solid rgba(var(--v-border-color), var(--v-border-opacity));
  font-weight: bold;
  /* background-color: #04aa6d;
  color: white; */
}

:deep() .v-table .v-table__wrapper>table>tbody>tr>td:not(:last-child),
.v-table .v-table__wrapper>table>tbody>tr>th:not(:last-child) {
  border-right: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
}

/* :deep() .v-table .v-table__wrapper>table>tbody>tr:nth-child(even) {
  background-color: #f2f2f2;
} */

:deep() .v-table .v-table__wrapper>table>tbody>tr:hover {
  background-color: #f2f2f2;
  color: #000;
}
</style>
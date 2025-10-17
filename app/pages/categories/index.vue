<template>
  <div>
    <AppBreadcrumb :breadcrumbs="breadcrumbItems" theme="light" class="mb-3" />

    <v-card elevation="0">
      <v-toolbar color="transparent">
        <v-toolbar-title><v-icon start>mdi-shape-outline</v-icon> Categories</v-toolbar-title>
      </v-toolbar>
      <v-divider></v-divider>

      <!-- <v-card-title class="d-flex align-center">
        <v-spacer></v-spacer>
        <v-btn class="my-2 text-capitalize" prepend-icon="mdi-plus" color="primary" @click="createDialog = true">Add
          Category</v-btn>
      </v-card-title>
      <v-divider></v-divider> -->
      <v-card-title class="d-flex align-center">
        <!-- <v-btn class="my-2 text-capitalize" prepend-icon="mdi-plus" color="primary" to="/inventory/create">Add
          Item</v-btn> -->
        <v-btn class="my-2 text-capitalize" prepend-icon="mdi-plus" color="primary" @click="createDialog = true">Add
          Category</v-btn>
        <v-spacer></v-spacer>
        <v-spacer></v-spacer>
        <v-text-field v-model="search" density="compact" label="Search" prepend-inner-icon="mdi-magnify"
          variant="solo-filled" flat hide-details single-line></v-text-field>
      </v-card-title>
      <v-divider></v-divider>
      <v-data-table density="compact" :headers="header" :items="categories" :search="search" :loading="loading">
        <template v-slot:loading>
          <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
        </template>
        <template v-slot:[`item.items`]="{ item }">
          {{ item.items.length }}
        </template>
        <template v-slot:[`item.createdAt`]="{ item }">
          {{ formatDate(item.createdAt) }}
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <!-- <v-btn icon color="blue" :to="`/categories/${item.documentId}`"><v-icon>mdi-pencil</v-icon></v-btn> -->
          <v-btn size="small" class="mr-1" variant="tonal" color="blue" @click="openUpdateDialog(item)"><v-icon
              start>mdi-pencil</v-icon> Edit</v-btn>
          <v-btn size="small" variant="tonal" color="red" @click="deleteCategory(item.documentId)">
            <v-icon start>mdi-delete</v-icon> Delete
          </v-btn>
        </template>
        <template v-slot:no-data>
          <v-btn prepend-icon="mdi-backup-restore" rounded="lg" text="Reset data" variant="text" border
            @click="reset"></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- DIALOG BOX -->
    <!-- Create Category Dialog -->
    <v-dialog v-model="createDialog" width="600">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon start>mdi-shape-outline</v-icon> Create Category
          <v-spacer></v-spacer>
          <v-btn @click="createDialog = false" flat icon><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="mt-5">
          <v-form ref="createCategoryForm" @submit.prevent="submit">
            <v-text-field v-model="form.name" :rules="[rules.name]" label="Category Name" required />
            <v-btn :loading="loadingBtn" :disabled="loadingBtn" type="submit" color="primary" class="mt-4"
              block>Save</v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Update Category Dialog -->
    <v-dialog v-model="updateDialog" width="600">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon start>mdi-shape-outline</v-icon> Update Category
          <v-spacer></v-spacer>
          <v-btn @click="updateDialog = false" flat icon><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="mt-5">
          <v-form ref="updateCategoryForm" @submit.prevent="updateCategory">
            <v-text-field v-model="editForm.name" :rules="[rules.name]" label="Category Name" required />
            <v-btn :loading="loadingBtn" :disabled="loadingBtn" type="submit" color="primary" class="mt-4"
              block>Update</v-btn>
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
  allowedRoles: ['custodian']
})

useHead({
  title: 'Categories',

})

const breadcrumbItems = [
  { text: 'Home', to: '/', icon: 'mdi-home-outline' },
  { text: 'Categories' },

]
const search = ref('')
const form = ref({
  name: ''
})
const editForm = ref({ name: '' })

const createDialog = ref(false);
const loading = ref(true)
const loadingBtn = ref(false)
const categories = ref([])
const createCategoryForm = ref(null)

const updateDialog = ref(false)
const updateCategoryForm = ref(null)
const selectedCategoryId = ref(null)

const header = [
  { title: 'Name', key: 'name' },
  { title: 'Items', key: 'items', align: 'center', sortable: false },
  { title: 'Created At', key: 'createdAt', align: 'center', sortable: false },
  { title: 'Actions', key: 'actions', align: 'end', sortable: false },
]

const rules = {
  name: (v) => !!v || "This field is required"
}

const getCategories = async () => {
  try {
    const res = await $fetch(`${baseUrl}/api/categories?populate=*`, {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })

    if (res) {
      categories.value = res.data.sort((a, b) => a.id - b.id)
      loading.value = false
      console.log("Data: ", res.data)
    }


  } catch (err) {
    console.error("Failed to fetch data: ", err);
    triggerToast('Failed to fetch data.', 'error');
    throw err;
  }

}

// Create Category Function
const submit = async () => {
  loadingBtn.value = true
  const isValid = await createCategoryForm.value.validate();

  if (isValid.valid) {
    try {
      await $fetch(`${baseUrl}/api/categories`, {
        method: 'POST',
        body: {
          data: {
            name: form.value.name
          }
        },
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })
      getCategories()
      loadingBtn.value = false
      createCategoryForm.value?.reset();
      triggerToast(`Category ${form.value.name} created successfully`, 'success')

    } catch (err) {
      console.error('Error creating category: ', err)
      triggerToast('Failed to create category.', 'error');
      loadingBtn.value = false
    }
  }
}

// Load selected category on a dialog box
const openUpdateDialog = (category) => {
  selectedCategoryId.value = category.documentId
  editForm.value.name = category.name
  updateDialog.value = true
}

// Update category
const updateCategory = async () => {
  try {
    await $fetch(`${baseUrl}/api/categories/${selectedCategoryId.value}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      body: {
        data: {
          name: editForm.value.name
        }
      }
    })
    triggerToast('Category updated.', 'success')
    updateDialog.value = false;
    getCategories();
  } catch (err) {
    triggerToast('Update failed.', 'error')
  }
}

// Delete Category Function
const deleteCategory = async (id) => {
  try {
    // Check if the category exist first
    const check = await $fetch(`${baseUrl}/api/categories/${id}`, {
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      throw: false
    })

    if (!check?.data) {
      triggerToast('Category not found.', 'error')
      return
    }

    // Delete if it exist
    await $fetch(`${baseUrl}/api/categories/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })

    triggerToast('Category deleted.', 'success')
    getCategories()
  } catch (err) {
    triggerToast('Delete failed.', 'error')
    console.error('Delete error.', err)
  }
}

// Format the date created
const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

onMounted(async () => {
  await getCategories()
})
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
}
</style>
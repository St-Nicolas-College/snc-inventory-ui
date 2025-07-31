<template>
  <div>
    <h2 class="mb-4">Categories Page</h2>
    <v-card elevation="0">
      <v-card-title class="d-flex align-center">
        <v-spacer></v-spacer>
        <v-btn class="my-2 text-capitalize" prepend-icon="mdi-plus" color="primary" @click="createDialog = true">Add
          Category</v-btn>
      </v-card-title>
      <v-divider></v-divider>
      <v-data-table :headers="header" :items="categories" :loading="loading">
        <template v-slot:loading>
          <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn icon color="blue" :to="`/inventory/${item.documentId}`"><v-icon>mdi-pencil</v-icon></v-btn>
          <v-btn icon color="red" @click="deleteItem(item.id)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
        <template v-slot:no-data>
          <v-btn prepend-icon="mdi-backup-restore" rounded="lg" text="Reset data" variant="text" border
            @click="reset"></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- DIALOG BOX -->

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

const form = ref({
  name: ''
})

const createDialog = ref(false);
const loading = ref(true)
const loadingBtn = ref(false)
const categories = ref([])
const createCategoryForm = ref(null)

const header = [
  { title: 'Name', key: 'name' },
  { title: 'Actions', key: 'actions', align: 'end', sortable: false },
]

const rules = {
  name: (v) => !!v || "This field is required"
}

const getCategories = async () => {
  try {
    const { data } = await useFetch(`${baseUrl}/api/categories`, {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })

    if (data) {
      console.log("Loaded")
      categories.value = data.value.data
      loading.value = false
      console.log("Data: ", data.value)
    }


  } catch (err) {
    console.error("Failed to fetch data: ", err);
    throw err;
  }

}



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
      //triggerToast(`Category ${form.value.name} created successfully`, 'success')

    } catch (err) {
      console.error('Error creating category: ', err)
      triggerToast('Failed to create category.', 'error');
      loadingBtn.value = false
    }
  }
}

onMounted(async () => {
  await getCategories()
})
</script>

<style></style>
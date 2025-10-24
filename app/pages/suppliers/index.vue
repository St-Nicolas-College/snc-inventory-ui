<template>
  <div>
    <AppBreadcrumb :breadcrumbs="breadcrumbItems" theme="light" class="mb-3" />

    <v-card elevation="0">
      <v-toolbar color="transparent">
        <v-toolbar-title><v-icon start>mdi-truck</v-icon> Suppliers</v-toolbar-title>
      </v-toolbar>
      <v-divider></v-divider>

      <!-- <v-card-title class="d-flex align-center">
        <v-spacer></v-spacer>
        <v-btn class="my-2 text-capitalize" prepend-icon="mdi-plus" color="primary" @click="createDialog = true">Add
          Supplier</v-btn>
      </v-card-title>
      <v-divider></v-divider> -->
      <v-card-title class="d-flex align-center">
        <!-- <v-btn class="my-2 text-capitalize" prepend-icon="mdi-plus" color="primary" to="/inventory/create">Add
          Item</v-btn> -->
        <v-btn class="my-2 text-capitalize" prepend-icon="mdi-plus" color="primary" @click="createDialog = true">Add
          Supplier</v-btn>
        <v-spacer></v-spacer>
        <v-spacer></v-spacer>
        <v-text-field v-model="search" density="compact" label="Search" prepend-inner-icon="mdi-magnify"
          variant="solo-filled" flat hide-details single-line></v-text-field>
      </v-card-title>
      <v-divider></v-divider>
      <v-data-table density="compact" :headers="header" :items="suppliers" :search="search" :loading="loading">
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
          <!-- <v-btn icon color="blue" :to="`/suppliers/${item.documentId}`"><v-icon>mdi-pencil</v-icon></v-btn> -->
          <v-btn size="small" class="mr-1" variant="tonal" color="blue" @click="openUpdateDialog(item)"><v-icon
              start>mdi-pencil</v-icon> Edit</v-btn>
          <v-btn size="small" variant="tonal" color="red" @click="confirmDelete(item)">
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
    <!-- Create Supplier Dialog -->
    <v-dialog v-model="createDialog" width="600">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon start>mdi-shape-outline</v-icon> Create Supplier
          <v-spacer></v-spacer>
          <v-btn @click="createDialog = false" flat icon><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="mt-5">
          <v-form ref="createSupplierForm" @submit.prevent="submit">
            <v-text-field v-model="form.name" :rules="[rules.name]" label="Supplier Name" required />
            <v-textarea v-model="form.contact_info" hide-details="auto" label="Contact Info" rows="2" />
            <v-btn :loading="loadingBtn" :disabled="loadingBtn" type="submit" color="primary" class="mt-4"
              block>Save</v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Update Supplier Dialog -->
    <v-dialog v-model="updateDialog" width="600">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon start>mdi-shape-outline</v-icon> Update Supplier
          <v-spacer></v-spacer>
          <v-btn @click="updateDialog = false" flat icon><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="mt-5">
          <v-form ref="updateSupplierForm" @submit.prevent="updateSupplier">
            <v-text-field v-model="editForm.name" :rules="[rules.name]" label="Supplier Name" required />
            <v-btn :loading="loadingBtn" :disabled="loadingBtn" type="submit" color="primary" class="mt-4"
              block>Update</v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="420" transition="dialog-bottom-transition" persistent>
      <v-card class="rounded-xl elevation-12 overflow-hidden" :class="type">
        <!-- ✅ Gradient Header -->
        <div class="dialog-header text-center d-flex align-center pa-2">
          <v-icon icon="mdi-alert-outline" size="20" class="mr-3 text-white" />
          <span class="text-white font-weight-medium">
            Confirm
          </span>
        </div>

        <!-- Message -->
        <v-card-text class="py-5 text-center text-grey-darken-3">

          <v-icon icon="mdi-alert-outline" size="60" color="warning" />
          <p class="mt-2 text-body-1">Are you sure you want to delete
            <strong>{{ selectedSupplier.name }}</strong>?
          </p>
        </v-card-text>

        <!-- Actions (optional manual close) -->
        <v-card-actions class="pb-5">
          <v-spacer />
          <v-btn variant="tonal" rounded="lg" class="px-6 " @click="deleteDialog = false">
            Cancel
          </v-btn>
          <v-btn color="warning" variant="flat" rounded="lg" class="px-6 text-white" :loading="deleting"
            @click="deleteSupplier">
            Delete
          </v-btn>

          <v-spacer />
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>

<script setup>
const baseUrl = useRuntimeConfig().public.strapiBaseURL
const token = useCookie('token')
const { triggerToast } = useToast()
const { success, error, warning } = useAlerts()

definePageMeta({
  middleware: 'role-check',
  allowedRoles: ['custodian']
})

useHead({
  title: 'Suppliers',

})

const breadcrumbItems = [
  { text: 'Home', to: '/', icon: 'mdi-home-outline' },
  { text: 'Suppliers' },

]
const search = ref('')
const form = ref({
  name: '',
  contact_info: ''
})
const editForm = ref({ name: '' })

const createDialog = ref(false);
const loading = ref(true)
const loadingBtn = ref(false)
const suppliers = ref([])
const createSupplierForm = ref(null)

const updateDialog = ref(false)
const updateSupplierForm = ref(null)
const selectedSupplierId = ref(null)
const selectedSupplier = ref(null)

const deleteDialog = ref(false)
const deleting = ref(false)
const deleteError = ref(null)

const header = [
  { title: 'Name', key: 'name' },
  { title: 'Contact Info', key: 'contact_info', sortable: false },
  { title: 'Items', key: 'items', align: 'center', sortable: false },
  { title: 'Created At', key: 'createdAt', align: 'center', sortable: false },
  { title: 'Actions', key: 'actions', align: 'end', sortable: false },
]

const rules = {
  name: (v) => !!v || "This field is required"
}

const getSuppliers = async () => {
  try {
    const res = await $fetch(`${baseUrl}/api/suppliers?populate=*`, {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })

    if (res) {
      suppliers.value = res.data.sort((a, b) => a.id - b.id)
      loading.value = false
      //console.log("Data: ", res.data)
    }


  } catch (err) {
    //console.error("Failed to fetch data: ", err);
    error('Failed to fetch data.')
    //triggerToast('Failed to fetch data.', 'error');
    throw err;
  }

}

// Create Supplier Function
const submit = async () => {
  loadingBtn.value = true
  const isValid = await createSupplierForm.value.validate();

  if (isValid.valid) {
    try {
      await $fetch(`${baseUrl}/api/suppliers`, {
        method: 'POST',
        body: {
          data: {
            name: form.value.name,
            contact_info: form.value.contact_info
          }
        },
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })
      getSuppliers()
      // triggerToast(`Supplier ${form.value.name} created successfully`, 'success')
      success(`Supplier ${form.value.name} created successfully`)
      loadingBtn.value = false
      createSupplierForm.value?.reset();


    } catch (err) {
      if (err.data.error.details.errors[0].path[0] === 'name') {
        warning('Supplier name already exist!');
        loadingBtn.value = false
      } else {
        //console.error('Error creating supplier: ', err)
        //triggerToast('Failed to create supplier.', 'error');
        error('Error creating supplier.')
        loadingBtn.value = false
      }

    }
  }
}

// Load selected supplier on a dialog box
const openUpdateDialog = (item) => {
  selectedSupplier.value = item
  editForm.value.name = item.name
  updateDialog.value = true
}

// Update supplier
const updateSupplier = async () => {
  try {
    await $fetch(`${baseUrl}/api/suppliers/${selectedSupplier.value.documentId}`, {
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
    //triggerToast('Supplier updated.', 'success')
    success('Supplier successfully updated.')
    updateDialog.value = false;
    getSuppliers();
  } catch (err) {
    //triggerToast('Update failed.', 'error')
    error('Update failed')
  }
}

// Open Delete Confirmation Dialog
const confirmDelete = (item) => {
  selectedSupplier.value = item;
  deleteDialog.value = true;
  deleteError.value = null;
}

// Delete Supplier Function
const deleteSupplier = async (id) => {
  try {
    // Check if the supplier exist first
    const check = await $fetch(`${baseUrl}/api/suppliers/${selectedSupplier.value.documentId}`, {
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      throw: false
    })

    if (!check?.data) {
      //triggerToast('Supplier not found.', 'error')
      error('Supplier not found.')
      deleting.value = false
      return
    }

    // Delete if it exist
    await $fetch(`${baseUrl}/api/suppliers/${selectedSupplier.value.documentId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })

    deleteDialog.value = false;
    //triggerToast('Supplier deleted.', 'success')
    success('Supplier successfully deleted.')
    getSuppliers()
  } catch (err) {
    //triggerToast('Delete failed.', 'error')
    error('Unable to delete supplier')
    deleting.value = false
    //console.error('Delete error.', err)
  } finally {
    deleting.value = false
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
  await getSuppliers()
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

.dialog-header {
  /* background: linear-gradient(90deg, #6366f1, #8b5cf6); Default info gradient */
  /* background: linear-gradient(90deg, #16a34a, #22c55e); success */
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}


/* .dialog-header {
  background: linear-gradient(90deg, #6366f1, #8b5cf6); 
}

.success .dialog-header {
  background: linear-gradient(90deg, #16a34a, #22c55e);
}

.error .dialog-header {
  background: linear-gradient(90deg, #dc2626, #ef4444);
}

.warning .dialog-header {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.info .dialog-header {
  background: linear-gradient(90deg, #3b82f6, #6366f1);
} */
</style>
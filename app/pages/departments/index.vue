<template>
  <div>
    <AppBreadcrumb :breadcrumbs="breadcrumbItems" theme="light" class="mb-3" />

    <v-card elevation="0">
      <v-toolbar color="transparent">
        <v-toolbar-title><v-icon start>mdi-domain</v-icon> Departments</v-toolbar-title>
      </v-toolbar>
      <v-divider></v-divider>

      <!-- <v-card-title class="d-flex align-center">
        <v-spacer></v-spacer>
        <v-btn class="my-2 text-capitalize" prepend-icon="mdi-plus" color="primary" @click="createDialog = true">Add
          Department</v-btn>
      </v-card-title>
      <v-divider></v-divider> -->
      <v-card-title class="d-flex align-center">
        <!-- <v-btn class="my-2 text-capitalize" prepend-icon="mdi-plus" color="primary" to="/inventory/create">Add
          Item</v-btn> -->
        <v-btn class="my-2 text-capitalize" prepend-icon="mdi-plus" color="primary" @click="createDialog = true">Add
          Department</v-btn>
        <v-spacer></v-spacer>
        <v-spacer></v-spacer>
        <v-text-field v-model="search" density="compact" label="Search" prepend-inner-icon="mdi-magnify"
          variant="solo-filled" flat hide-details single-line></v-text-field>
      </v-card-title>
      <v-divider></v-divider>
      <v-data-table density="compact" :headers="header" :items="departments" :search="search" :loading="loading">
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
          <!-- <v-btn icon color="blue" :to="`/departments/${item.documentId}`"><v-icon>mdi-pencil</v-icon></v-btn> -->
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

    <!-- <v-btn color="primary" class="text-white px-6 py-3 rounded-lg mr-4" @click="showAlert = true">
      Show Success Alert
    </v-btn>

    <v-btn color="error" class="text-white px-6 py-3 rounded-lg" @click="showError = true">
      Show Error Alert
    </v-btn> -->

    <!-- DIALOG BOX -->
    <!-- Create Department Dialog -->
    <v-dialog v-model="createDialog" width="600">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon start>mdi-domain</v-icon> Create Department
          <v-spacer></v-spacer>
          <v-btn @click="createDialog = false" flat icon><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="mt-5">
          <v-form ref="createDepartmentForm" @submit.prevent="submit">
            <v-text-field v-model="form.name" :rules="[rules.name]" label="Department Name" required />
            <v-btn :loading="loadingBtn" :disabled="loadingBtn" type="submit" color="primary" class="mt-4"
              block>Save</v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Update Department Dialog -->
    <v-dialog v-model="updateDialog" width="600">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon start>mdi-shape-outline</v-icon> Update Department
          <v-spacer></v-spacer>
          <v-btn @click="updateDialog = false" flat icon><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="mt-5">
          <v-form ref="updateDepartmentForm" @submit.prevent="updateDepartment">
            <v-text-field v-model="editForm.name" :rules="[rules.name]" label="Department Name" required />
            <v-btn :loading="loadingBtn" :disabled="loadingBtn" type="submit" color="primary" class="mt-4"
              block>Update</v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 🧠 Delete Confirmation Dialog -->
    <!-- <v-dialog v-model="deleteDialog1" max-width="400">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold">
          <v-icon color="red" class="mr-2">mdi-alert</v-icon>
          Confirm Delete
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete
          <strong>{{ selectedDepartment.name }}</strong>?
          <v-alert v-if="deleteError" type="error" class="mt-3" density="compact">
            {{ deleteError }}
          </v-alert>
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="red" variant="flat" @click="deleteDepartment" :loading="deleting">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog> -->

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
            <strong>{{ selectedDepartment.name }}</strong>?
          </p>
        </v-card-text>

        <!-- Actions (optional manual close) -->
        <v-card-actions class="pb-5">
          <v-spacer />
          <v-btn variant="tonal" rounded="lg" class="px-6 " @click="deleteDialog = false">
            Cancel
          </v-btn>
          <v-btn color="warning" variant="flat" rounded="lg" class="px-6 text-white" :loading="deleting"
            @click="deleteDepartment">
            Delete
          </v-btn>

          <v-spacer />
        </v-card-actions>
      </v-card>
    </v-dialog>





    <!-- 
    <ModernAlertDialog v-model="showAlert" type="success" title="Success" message="Your file was uploaded successfully!"
      :auto-close="true" :duration="2000" />

    <ModernAlertDialog v-model="showError" type="error" title="Error" message="Failed to connect to the server!"
      :auto-close="true" :duration="3000" />


    <v-container class="py-16 text-center">
      <v-btn color="primary" class="text-white px-6 py-3 rounded-lg" @click="showStackedAlerts">
        Show Stackable Alerts
      </v-btn>
    </v-container> -->



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
  title: 'Department',

})

const breadcrumbItems = [
  { text: 'Home', to: '/', icon: 'mdi-home-outline' },
  { text: 'Department' },

]
const search = ref('')
const form = ref({
  name: ''
})
const editForm = ref({ name: '' })

const createDialog = ref(false);
const loading = ref(true)
const loadingBtn = ref(false)
const departments = ref([])
const createDepartmentForm = ref(null)

const updateDialog = ref(false)
const updateDepartmentForm = ref(null)
const selectedDepartment = ref(null)

const deleteDialog = ref(false)
const deleting = ref(false)
const deleteError = ref(null)

const showAlert = ref(false)
const showError = ref(false)
const alertRef = ref(null)

const header = [
  { title: 'Name', key: 'name' },
  { title: 'Items', key: 'items', align: 'center', sortable: false },
  { title: 'Created At', key: 'createdAt', align: 'center', sortable: false },
  { title: 'Actions', key: 'actions', align: 'end', sortable: false },
]

const rules = {
  name: (v) => !!v || "This field is required"
}

const showStackedAlerts = () => {
  error('Data saved successfully!')
}

const getDepartments = async () => {
  try {
    const res = await $fetch(`${baseUrl}/api/departments?populate=*`, {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })
    if (res) {
      departments.value = res.data.sort((a, b) => a.id - b.id)
      loading.value = false
      //console.log("Data: ", res.data)
    }
  } catch (err) {
    //console.error("Failed to fetch data: ", err);
    //triggerToast('Failed to fetch data.', 'error');
    error('Failed to fetch data')
    throw err;
  }

}

// Create Department Function
const submit = async () => {
  loadingBtn.value = true
  const isValid = await createDepartmentForm.value.validate();

  if (isValid.valid) {
    try {
      await $fetch(`${baseUrl}/api/departments`, {
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
      console.log('Name: ', form.value.name);
      getDepartments()
      //triggerToast(`Department ${form.value.name} created successfully`, 'success')
      success(`Department ${form.value.name} created successfully`)
      loadingBtn.value = false
      createDepartmentForm.value?.reset();


    } catch (err) {
      if (err.data.error.details.errors[0].path[0] === 'name') {
        //console.log("Duplicate: ", err.data.error.details.errors[0].path[0])
        warning('Department name already exist!');
        loadingBtn.value = false
      } else {
        //triggerToast('Failed to create department.', 'error');
        error('Error creating department.')
        loadingBtn.value = false
      }

    }
  }
}

// Load selected Department on a dialog box
const openUpdateDialog = (item) => {
  selectedDepartment.value = item;
  editForm.value.name = item.name
  updateDialog.value = true
}

// Update Department
const updateDepartment = async () => {
  try {
    await $fetch(`${baseUrl}/api/departments/${selectedDepartment.value.documentId}`, {
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
    //triggerToast('Department updated.', 'success')
    success('Department successfully updated.')
    updateDialog.value = false;
    getDepartments();
  } catch (err) {
    //triggerToast('Update failed.', 'error')
    error('Update failed.')
  }
}

// Open Delete Confirmation Dialog
const confirmDelete = (item) => {
  selectedDepartment.value = item;
  deleteDialog.value = true;
  deleteError.value = null;
}

// Delete Department Function
const deleteDepartment = async () => {
  try {
    // Check if the Department exist first
    const check = await $fetch(`${baseUrl}/api/departments/${selectedDepartment.value.documentId}`, {
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      throw: false
    })

    if (!check?.data) {
      //triggerToast('Department not found.', 'error')
      error('Department not found.')
      deleting.value = false
      return
    }

    // deleting.value = true;
    //deleteError.value = null

    // Delete if it exist
    await $fetch(`${baseUrl}/api/departments/${selectedDepartment.value.documentId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })

    deleteDialog.value = false;

    // triggerToast('Department deleted.', 'success')
    success('Department successfully deleted.')
    getDepartments()
  } catch (err) {
    //deleteError.value = 'Unable to delete department. It may be linked to other items'
    //triggerToast('Delete failed.', 'error')
    error('Unable to delete department.')
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
  await getDepartments()
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
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
</style>
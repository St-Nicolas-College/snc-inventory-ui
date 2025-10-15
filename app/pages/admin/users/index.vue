<template>
  <div>
    <AppBreadcrumb :breadcrumbs="breadcrumbItems" theme="light" class="mb-3" />

    <v-card elevation="0" rounded="lg" class="mt-5">
      <v-toolbar color="transparent">
        <v-toolbar-title><v-icon start>mdi-account-circle</v-icon> User Management</v-toolbar-title>
      </v-toolbar>
      <v-divider></v-divider>
      <v-card-title class="d-flex align-center">
        <!-- <v-btn class="my-2 text-capitalize" prepend-icon="mdi-plus" color="primary" to="/inventory/create">Add
          Item</v-btn> -->
        <v-btn class="my-2 text-capitalize" elevation="0" prepend-icon="mdi-plus" color="primary"
          @click="createUserDialog = true">Add
          new user</v-btn>
        <v-spacer></v-spacer>
        <v-spacer></v-spacer>
        <v-text-field v-model="search" density="compact" label="Search" prepend-inner-icon="mdi-magnify"
          variant="solo-filled" flat hide-details single-line></v-text-field>

      </v-card-title>
      <v-divider></v-divider>
      <v-data-table density="compact" :headers="header" :items="items" :search="search" :loading="loading" show-select>
        <!-- <template #top>
          <v-text-field v-model="search" label="Search..." />
        </template> -->
        <template v-slot:loading>
          <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
        </template>
        <template v-slot:[`item.name`]="{ item }">
          {{ item.first_name }} {{ item.last_name }}
        </template>
        <template v-slot:[`item.account_type`]="{ item }">
          <div v-if="item.account_type === 'admin'">
            <v-chip class="ma-2" color="blue-darken-3" size="small" label>
              <v-icon icon="mdi-badge-account" start></v-icon>
              Administrator
            </v-chip>
          </div>
          <div v-if="item.account_type === 'custodian'">
            <v-chip class="ma-2" color="purple" size="small" label>
              <v-icon icon="mdi-account-edit" start></v-icon>
              Custodian
            </v-chip>
          </div>
          <div v-if="item.account_type === 'staff'">
            <v-chip class="ma-2" color="green" size="small" label>
              <v-icon icon="mdi-badge-account" start></v-icon>
              Staff
            </v-chip>
          </div>
          <div v-if="item.account_type === 'viewer'">
            <v-chip class="ma-2" size="small" label>
              <v-icon icon="mdi-eye" start></v-icon>
              Viewer
            </v-chip>
          </div>
        </template>
        <template v-slot:[`item.lastLogin`]="{ item }">
          <div v-if="item.lastLogin !== null">
            {{ formatDate(item.lastLogin) }}
          </div>
          <div v-else>

          </div>
          
        </template>
        <template v-slot:[`item.status`]="{ item }">
          <div v-if="item.confirmed === true">
            <v-badge location="left center" :offset-x="-15" color="success" dot>
              Active
            </v-badge>
          </div>
          <div v-if="item.confirmed === false">
            <v-badge location="left center" :offset-x="-15" color="error" dot>
              Inactive
            </v-badge>
          </div>
        </template>


        <template v-slot:[`item.actions`]="{ item }">
          <v-btn size="small" class="mr-1" variant="tonal" color="primary" :to="`/inventory/${item.documentId}`"><v-icon
              start>mdi-open-in-new</v-icon> View</v-btn>
          <!-- <v-btn size="small" class="mr-1" variant="tonal"
            :to="`/inventory/items/${item.documentId}`"><v-icon>mdi-open-in-new</v-icon> View</v-btn> -->
          <v-btn size="small" class="mr-1" variant="tonal" color="blue"
            @click="openEditDialog(item)"><v-icon>mdi-pencil</v-icon> Edit</v-btn>
          <v-btn size="small" variant="tonal" color="red" @click="deleteItem(item.documentId)">
            <v-icon>mdi-delete</v-icon> Delete
          </v-btn>
        </template>
      </v-data-table>
    </v-card>


    <!-- Dialog Box -->

    <v-dialog v-model="createUserDialog" width="500" persistent>
      <v-card>
       
        <v-toolbar>
          <v-toolbar-title><v-icon start>mdi-account-circle</v-icon> Create new user</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="createUserDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-toolbar>
        <v-card-text>
          <v-form>
            <v-text-field prepend-inner-icon="mdi-account" label="Lastname" variant="solo-filled" flat></v-text-field>
            <v-text-field prepend-inner-icon="mdi-account" label="Firstname" variant="solo-filled" flat></v-text-field>
            <v-text-field prepend-inner-icon="mdi-account" label="Middlename" variant="solo-filled" flat></v-text-field>
            <v-text-field prepend-inner-icon="mdi-domain" label="Department" variant="solo-filled" flat></v-text-field>
            <v-btn color="primary" block>Create</v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { useMyAuthStore } from "~/stores/auth";
const { user } = storeToRefs(useMyAuthStore());
const baseUrl = useRuntimeConfig().public.strapiBaseURL
const token = useCookie('token')
const { triggerToast } = useToast()
definePageMeta({
  layout: "admin",
  requiredRole: 'admin'
});

const breadcrumbItems = [
  { text: 'Home', to: '/', icon: 'mdi-home-outline' },
  { text: 'User Management' },
]

const header = [
  { title: 'User', key: 'name' },
  { title: 'Department', key: 'department.name', sortable: false },
  { title: 'User Role', key: 'account_type', sortable: false },
  { title: 'Status', key: 'status', sortable: false },
  { title: 'Last Login', key: 'lastLogin', sortable: false },

  { title: 'Actions', key: 'actions', align: 'end', sortable: false },
]
const items = ref([])
const search = ref('')
const loading = ref(true)
const createUserDialog = ref(false)

onMounted(async () => {
  console.log("Token: ", token.value)
  await getUsers()
})
const getUsers = async () => {
  try {
    const res = await $fetch(`${baseUrl}/api/users?populate=*`, {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })

    if (res) {
      console.log(res)
      items.value = res;
      loading.value = false;
    }
  } catch (err) {
    console.error("Failed to fetch data: ", err);
    triggerToast('Failed to fetch data.', 'error');
    throw err;
  }
}

// Format the acquisition date
const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};
</script>

<style></style>
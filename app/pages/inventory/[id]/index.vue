<template>
  <div>
    <AppBreadcrumb :breadcrumbs="breadcrumbItems" theme="light" class="mb-3" />
    <v-card class=" mb-6" elevation="0" rounded="lg">
      <v-card-title>
        <v-icon class="mr-2">mdi-information-outline</v-icon>
        Item Overview
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <v-row dense>
          <!-- Name -->
          <v-col cols="12" md="3">
            <v-card class="bg-grey-lighten-4 pa-3 h-230" elevation="0" rounded="lg">
              <v-row no-gutters align="center">
                <v-col cols="12">
                  <v-row dense="compact">
                    <v-col cols="5" class="font-weight-bold">Name:</v-col>
                    <v-col cols="7">{{ item?.name || '—' }}</v-col>

                  </v-row>
                  <v-row dense="compact">
                    <v-col cols="5" class="font-weight-bold">Category:</v-col>
                    <v-col cols="7">{{ item?.category?.name || '—' }}</v-col>
                  </v-row>
                  <v-row dense="compact">
                    <v-col cols="5" class="font-weight-bold">Department:</v-col>
                    <v-col cols="7">{{ item?.department?.name || '—' }}</v-col>
                  </v-row>
                  <v-row dense="compact">
                    <v-col cols="5" class="font-weight-bold">Supplier:</v-col>
                    <v-col cols="7">{{ item?.supplier?.name || '—' }}</v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-card>
          </v-col>

          <!-- <v-col cols="12" md="4">
            <v-card flat class="bg-grey-lighten-4 pa-3 h-100">
              <v-icon start color="green" class="mr-2">mdi-numeric</v-icon>
              <strong>Quantity:</strong> {{ item?.quantity || 0 }}
            </v-card>
          </v-col> -->

          <v-col cols="12" md="3">

            <v-card class="bg-grey-lighten-4 pa-5 h-100" elevation="0" rounded="lg">
              <v-row no-gutters align="center">
                <v-col>
                  <div class="text-grey-darken-4 font-weight-medium">
                    <strong>Quantity</strong>
                  </div>
                  <div class="text-grey-darken-4 font-weight-medium text-h2">
                    <strong><span :class="item?.quantity < 0 ? 'text-red' : 'text-grey-darken-1'">
                        {{ item?.quantity }}
                      </span></strong>
                  </div>
                </v-col>
                <v-col cols="auto" class="ml-10">
                  <v-avatar size="86" color="green-lighten-4">
                    <v-icon color="green" size="60">mdi-counter</v-icon>
                  </v-avatar>
                </v-col>
              </v-row>
            </v-card>
          </v-col>

          <v-col cols="12" md="3">
            <v-card class="bg-grey-lighten-4 pa-5 h-100" elevation="0" rounded="lg">
              <v-row no-gutters align="center">
                <v-col>
                  <div class="text-grey-darken-4 font-weight-medium">
                    <strong>Total Acquired</strong>
                  </div>
                  <div class="text-grey-darken-1 font-weight-medium text-h4">
                    <strong>{{ totalAcquired }} of {{ item?.quantity }} </strong>
                  </div>
                  <v-progress-linear :model-value="Math.min((totalAcquired / totalItemQuantity) * 100, 100)"
                    color="green" height="6" class="mt-2" rounded :indeterminate="totalItemQuantity === 0" />
                </v-col>
                <v-col cols="auto" class="ml-10">
                  <v-avatar size="86" color="green-lighten-4">
                    <v-icon color="green" size="60">mdi-package-variant-closed</v-icon>
                  </v-avatar>
                </v-col>
              </v-row>
            </v-card>
          </v-col>

          <v-col cols="12" md="3">
            <v-card class="bg-grey-lighten-4 pa-5 h-100" elevation="0" rounded="lg">
              <v-row no-gutters align="center">
                <v-col>
                  <div class="text-grey-darken-4 font-weight-medium">
                    <strong>Remaining</strong>
                  </div>
                  <div class="text-grey-darken-1 font-weight-medium text-h3">
                    <strong><span :class="remainingQuantity < 0 ? 'text-red' : 'text-grey-darken-1'">
                        {{ remainingQuantity }}
                      </span></strong>
                  </div>
                </v-col>
                <v-col cols="auto" class="ml-10">
                  <v-avatar size="86" color="green-lighten-4">
                    <v-icon color="green" size="60">mdi-counter</v-icon>
                  </v-avatar>
                </v-col>
              </v-row>
            </v-card>
          </v-col>

          <!-- <v-col cols="12" md="4">
            <v-card class="bg-grey-lighten-4 pa-3 h-100" elevation="0" rounded="lg">
              <v-row no-gutters align="center">
                <v-col cols="auto" class="mr-3">
                  <v-avatar size="36" color="green-lighten-4">
                    <v-icon color="green" size="20">mdi-package-variant-closed</v-icon>
                  </v-avatar>
                </v-col>
                <v-col>
                  <div class="font-weight-medium">
                    <strong>Total Acquired:</strong> {{ totalAcquired }} of {{ item?.quantity }}
                  </div>
                  <div class="font-weight-medium">
                    <strong>Remaining: </strong>
                    <span :class="remainingQuantity < 0 ? 'text-red' : 'text-green'">
                      {{ remainingQuantity }}
                    </span>
                  </div>
                  <v-progress-linear :model-value="Math.min((totalAcquired / totalItemQuantity) * 100, 100)"
                    color="blue" height="6" class="mt-2" rounded :indeterminate="totalItemQuantity === 0" />
                </v-col>
              </v-row>
            </v-card>
          </v-col> -->
        </v-row>
      </v-card-text>

    </v-card>

    <v-card elevation="0" rounded="lg" class="mb-6">
      <v-tabs v-model="tab" color="primary">
        <v-tab value="one">Acquisition</v-tab>
        <v-tab value="two">Tags</v-tab>
      </v-tabs>

      <v-tabs-window v-model="tab">
        <v-tabs-window-item value="one">
          <v-card>
            <v-toolbar color="transparent">
              <v-toolbar-title><v-icon start>mdi-tag-outline</v-icon> Acquisition History
              </v-toolbar-title>
              <InventoryAcquisitionForm :item-id="itemId" :total-item-quantity="totalItemQuantity"
                :total-acquired="totalAcquired" @saved="fetchAcquisitions" />
            </v-toolbar>

            <v-divider></v-divider>
            <v-data-table :headers="acquisitionHeaders" :items="acquisitions" density="compact">
              <template v-slot:[`item.borrower`]="{ item }">
                {{ item.borrower?.name || "—" }}
              </template>
              <template v-slot:[`item.department`]="{ item }">
                {{ item.borrower?.department || "—" }}
              </template>
              <template v-slot:[`item.quantity`]="{ item }">
                {{ item.quantity }}
              </template>
              <template v-slot:[`item.remarks`]="{ item }">
                {{ item.remarks }}
              </template>

              <template v-slot:[`item.createdAt`]="{ item }">
                {{ formatDate(item.createdAt) }}
              </template>
            </v-data-table>
          </v-card>
        </v-tabs-window-item>

        <v-tabs-window-item value="two">
          <v-card outlined>
            <!-- <v-card-title>Assigned Tags</v-card-title> -->
            <v-toolbar color="transparent">
              <v-toolbar-title><v-icon start>mdi-tag-outline</v-icon> Assigned Tags
              </v-toolbar-title>
              <InventoryAcquisitionForm :item-id="itemId" :total-item-quantity="totalItemQuantity"
                :total-acquired="totalAcquired" @saved="fetchAcquisitions" />
            </v-toolbar>
            <v-divider></v-divider>
            <v-data-table :headers="tagHeaders" :items="tags" density="compact" class="elevation-1">
              <template v-slot:[`item.assigned_to`]="{ item }">
                {{ item.assigned_to?.name }}
              </template>
              <template v-slot:[`item.tag_status`]="{ item }">
                <v-chip :color="getStatusColor(item.tag_status)" dark>
                  {{ item.tag_status }}
                </v-chip>
              </template>
              <template v-slot:[`item.assigned_date`]="{ item }">
                <!-- {{ formatDate(item.assigned_date) }} -->
                <div v-if="item.assigned_date === null">

                </div>
                <div v-else>
                  {{ formatDate(item.assigned_date) }}
                </div>
              </template>
              <template v-slot:[`item.actions`]="{ item }">
                <v-btn icon="mdi-account-plus" size="small" @click="openAcquisitionDialog(item.documentId)"></v-btn>
              </template>
            </v-data-table>
          </v-card>
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card>




    <!-- 🧾 Acquisition Table with Form -->
    <!-- <v-progress-linear color="blue" model-value="100" height="6" striped /> -->


    <v-row>
      <v-col cols="12">
        <v-card class="pa-4">
          <h2 class="mb-2">{{ item?.name }}</h2>
          <p>Total Quantity: {{ item?.quantity }}</p>
          <v-divider class="my-4" />

          <!-- Assign Tag Form -->
          <v-form @submit.prevent="assignTag">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="newTag" label="Enter Tag Number" :error-messages="errorMessage" clearable />
              </v-col>
              <v-col cols="12" md="6" class="d-flex align-center">
                <v-btn type="submit" color="primary" class="mt-md-0 mt-2">
                  Assign Tag
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
          <v-divider class="my-4" />

          <!-- Assigned Tags Table -->
          <h3>Assigned Tags</h3>
          <v-table density="compact">
            <thead>
              <tr>
                <th>Tag Number</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in tags" :key="t.id">
                <td>{{ t.tag_number }}</td>
                <td>{{ t.tag_status }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
    </v-row>


    <!-- Dialog -->
    <v-dialog v-model="showAcquisitionDialog" max-width="500px">
      <v-card>
        <v-card-title>Assign Acquisition</v-card-title>
        <v-card-text>
          <!-- <v-text-field label="Acquired By" v-model="acquisitionForm.acquired_by" required /> -->
          <v-autocomplete v-model="acquisitionForm.acquired_by" :items="borrowers" item-title="name"
            item-value="documentId" label="Assigned To" return-object clearable />
          <!-- <v-date-picker v-model="acquisitionForm.acquired_at_v" label="Acquisition Date" /> -->
          <v-date-input prepend-icon="" prepend-inner-icon="$calendar" v-model="acquisitionForm.acquired_at"
            :display-format="format" label="Date input"></v-date-input>
          <!-- <v-text-field v-model="acquisitionForm.acquired_at" label="Date Acquired" type="date"></v-text-field> -->
        </v-card-text>
        <v-card-actions>
          <v-btn text @click="showAcquisitionDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveBorrowerAcquisition">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { useDate } from 'vuetify'
useHead({
  title: 'Inventory',

})
const baseUrl = useRuntimeConfig().public.strapiBaseURL;
const token = useCookie("token");
const route = useRoute();
const { triggerToast } = useToast();

const breadcrumbItems = [
  { text: "Home", to: "/", icon: "mdi-home-outline" },
  { text: "Inventory", to: "/inventory" },
  { text: 'Item' },
];

const showAcquisitionDialog = ref(false)
const tab = ref(null)
const itemId = route.params.id;
const item = ref(null);
const acquisitions = ref([]);
const loading = ref(false);
const selectedTagId = ref(null)

const borrowers = ref([])
const tags = ref([])
const newTag = ref('')
const errorMessage = ref('')

const acquisitionForm = ref({
  acquired_by: null,
  acquired_at: '',
  acquired_at_v: ''
})

const acquisitionHeaders = [
  { title: "Borrower", value: "borrower" },
  { title: "Department", value: "department" },
  { title: "Quantity", value: "quantity" },
  { title: "Remarks", value: "remarks" },
  { title: "Date Acquired", value: "createdAt" },
];

const tagHeaders = [
  { title: 'Tag Number', key: 'tag_number' },
  { title: 'Assigned to', key: 'assigned_to' },
  { title: 'Status', key: 'tag_status' },
  { title: 'Assigned Date', key: 'assigned_date' },
  { title: 'Action', key: 'actions' },

]


const adapter = useDate()
const model = shallowRef(adapter.parseISO('2025-02-25'))

function format(date) {
  return adapter.toISO(date)
}

const openAcquisitionDialog = (tagId) => {
  selectedTagId.value = tagId // ✅ this works because selectedTagId exists
  showAcquisitionDialog.value = true
  fetchBorrowers()
}

const fetchItem = async () => {
  const res = await $fetch(`${baseUrl}/api/items/${itemId}?populate=*`, {
    headers: {
      Authorization: `Bearer ${token.value}`,
    },
  });
  item.value = res.data;
};


// Fetch borrowers
const fetchBorrowers = async () => {
  try {
    const res = await $fetch(`${baseUrl}/api/borrowers`, {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    borrowers.value = res.data
  } catch (err) {
    console.error('Failed to fetch borrowers', err)
  }
}


const saveBorrowerAcquisition = async () => {
  try {
    const acquiredDate = new Date(acquisitionForm.value.acquired_at)
    const formattedDate = acquiredDate.toISOString().split('T')[0]
    const payload = {
      //assigned_date_v: acquisitionForm.value.acquired_at_v,
      assigned_date: formattedAcquiredDate(acquisitionForm.value.acquired_at),

    }
    console.log("Payload ", payload)
    await $fetch(`${baseUrl}/api/item-tags/${selectedTagId.value}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      body: {
        data: {
          assigned_to: acquisitionForm.value.acquired_by?.id,
          assigned_date: formattedAcquiredDate(acquisitionForm.value.acquired_at),
          tag_status: 'assigned'
        }
      }
    })
    showAcquisitionDialog.value = false
    fetchTags() // Refresh table
  } catch (err) {
    console.error('Failed to save acquisition:', err)
  }
}

// Ferdch assigned tags for this item
const fetchTags = async () => {
  const res = await $fetch(`${baseUrl}/api/item-tags`, {
    headers: { Authorization: `Bearer ${token.value}` },
    params: {
      'filters[item][documentId][$eq]': route.params.id,
      'populate': 'assigned_to',
      'sort[0]': 'createdAt:asc'
    }
  })
  tags.value = res.data || []
}

// Check duplicate tag across ALL items
const checkDuplicateTag = async (tagNumber) => {
  const { data } = await $fetch(`${baseUrl}/api/item-tags`, {
    headers: { Authorization: `Bearer ${token.value}` },
    params: {
      'filters[tag_number][$eq]': tagNumber,
    }
    //query: { filters: { tag_number: { $eq: tagNumber } } }
  })
  return data.length > 0;
}

// Assign tag number to the physical unit
const assignTag = async () => {
  if (!newTag.value.trim()) {
    errorMessage.value = 'Tag number is required.'
    return
  }

  // Preent duplicate tag across DB
  const exists = await checkDuplicateTag(newTag.value)
  if (exists) {
    errorMessage.value = 'This tag number already exists!'
    return
  }

  // Over-tagging prevention
  if (tags.value.length >= item.value.quantity) {
    alert(`Cannot assign more tags. This item only has a quantity of ${item.value.quantity}.`)
    return
  }

  const { error } = await $fetch(`${baseUrl}/api/item-tags`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token.value}` },
    body: {
      data: {
        tag_number: newTag.value,
        tag_status: 'available',
        item: route.params.id
      }
    }
  })

  if (!error) {
    newTag.value = ''
    errorMessage.value = ''
    await fetchTags()
  }
}

// Fetch acquisition logs for this item
const fetchAcquisitions = async () => {
  loading.value = true;
  try {
    const { data } = await $fetch(
      `${baseUrl}/api/acquisitions?filters[item][documentId][$eq]=${itemId}&populate=borrower`,
      {
        headers: { Authorization: `Bearer ${token.value}` },
      }
    );
    acquisitions.value = data || [];
  } catch (err) {
    console.error("Failed to fetch acquisitions:", err);
  } finally {
    loading.value = false;
  }
};

// Format the acquisition date
const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Helper function to format into YYYY-MM-DD
function formattedAcquiredDate(dateInput) {
  if (!dateInput) return null
  const date = new Date(dateInput)
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}


function getStatusColor(tag_status) {
  switch (tag_status) {
    case 'assigned': return 'blue'
    case 'in-repair': return 'orange'
    case 'lost': return 'red'
    default: return 'green'
  }
}

// ----------------------------- Computed Properties -----------------------------------------

const totalItemQuantity = computed(() => item.value?.quantity || 0);

const totalAcquired = computed(() => {
  return acquisitions.value.reduce((sum, acq) => {
    return sum + (acq.quantity || 0);
  }, 0);
});

const remainingQuantity = computed(() => {
  return totalItemQuantity.value - totalAcquired.value;
});

// ----------------------------- Mounted Properties -------------------------------------

onMounted(async () => {
  await fetchItem();
  await fetchTags()
  await fetchAcquisitions();
});
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
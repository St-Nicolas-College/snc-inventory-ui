<template>
  <div>
    <h2 class="mb-4">Item Details</h2>

    <!-- Item Summary -->
    <!-- <v-card class="mb-6" outlined>
      <v-card-title>{{ itemDetails.name }}</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3">
            <strong>Total Quantity:</strong> {{ itemDetails.quantity }}
          </v-col>
          <v-col cols="12" md="3">
            <strong>Remaining Quantity:</strong> {{ remainingQuantity }}
          </v-col>
          <v-col cols="12" md="3">
            <strong>Total Acquired:</strong> {{ totalAcquired }}
          </v-col>
          <v-col cols="12" md="3">
            <strong>Total Tags Assigned:</strong> {{ tags.length }}
          </v-col>
        </v-row>
      </v-card-text>
    </v-card> -->
    <v-card class="mb-6" outlined>
      <v-card-title>{{ itemDetails.name }}</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3">
            <strong>Total Quantity:</strong> {{ itemDetails.quantity }}
          </v-col>
          <v-col cols="12" md="3">
            <strong>is fully Acquired:</strong> {{ isFullyAcquired }}
          </v-col>
          <v-col cols="12" md="3">
            <strong>Total Acquired:</strong> {{ totalAcquired }}
          </v-col>
          <v-col cols="12" md="3">
            <strong>Total Acquisition Acquired:</strong> {{ totalAcquisitionAcquired }}
          </v-col>
          <v-col cols="12" md="3">
            <strong>Total Tags Assigned:</strong> {{ totalTagsAssigned }}
          </v-col>
          <v-col cols="12" md="3">
            <strong>Remaining Quantity:</strong>
            <span :class="remainingQuantity < 0 ? 'text-red' : ''">
              {{ remainingQuantity }}
            </span>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-row>
      <!-- Acquisition History -->
      <v-col cols="12" md="6">
        <v-card outlined>
          <v-card-title>Acquisition History</v-card-title>
          <v-data-table :headers="acquisitionHeaders" :items="acquisitions" class="elevation-1">
             <template v-slot:[`item.tag_number`]="{ item }">
              {{ item.item_tag?.tag_number || "—" }}
            </template>
            <template v-slot:[`item.borrower`]="{ item }">
              {{ item.borrower?.name || "—" }}
            </template>
            <template v-slot:[`item.department`]="{ item }">
              {{ item.borrower?.department || "—" }}
            </template>
            <template v-slot:[`item.quantity`]="{ item }">
              {{ item.quantity }}
            </template>
            <template v-slot:[`item.createdAt`]="{ item }">
              {{ formatDate(item.createdAt) }}
            </template>
          </v-data-table>
        </v-card>
      </v-col>

      <!-- Assigned Tags -->
      <v-col cols="12" md="6">
        <v-card outlined>
          <v-card-title>Assigned Tags</v-card-title>
          <v-data-table :headers="tagHeaders" :items="tags" class="elevation-1">
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
      </v-col>
    </v-row>

    <v-dialog v-model="acquisitionDialog" max-width="500">
      <v-card >
        <v-form @submit.prevent="acquireItem">
          <!-- <v-text-field v-model="acquisitionForm.acquired_by" label="Borrower ID" required /> -->
          <v-autocomplete v-model="acquisitionForm.acquired_by" :items="borrowers" item-title="name"
            item-value="documentId" label="Assigned To" return-object clearable />
          <v-date-input v-model="acquisitionForm.acquired_at" label="Acquired Date" required />
          <v-select v-model="acquisitionForm.tag_id" :items="availableTags" item-title="tag_number" item-value="documentId"
            label="Select Tag Number" return-object required />
          <v-btn type="submit" color="primary">Acquire</v-btn>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- <v-dialog v-model="showAcquisitionDialog" max-width="500px">
      <v-card>
        <v-card-title>Assign Acquisition</v-card-title>
        <v-card-text>

          <v-autocomplete v-model="acquisitionForm.acquired_by" :items="borrowers" item-title="name"
            item-value="documentId" label="Assigned To" return-object clearable />
          <v-date-picker v-model="acquisitionForm.acquired_at" label="Acquisition Date" />
        </v-card-text>
        <v-card-actions>
          <v-btn text @click="showAcquisitionDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveAcquisition">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog> -->
  </div>
</template>

<script setup>
const baseUrl = 'http://localhost:1337'
const token = useCookie("token");
const route = useRoute()

const itemDetails = ref({})
const acquisitions = ref([])
const tags = ref([])

const acquisitionDialog = ref(true)
const showAcquisitionDialog = ref(false)
// const acquisitionForm = ref({
//   acquired_by: null,
//   acquired_at: ''
// })

const acquisitionForm = ref({
  acquired_by: null,  // user or borrower id
  acquired_at: null,  // date
  tag_id: null        // physical tag id
})
const selectedTagId = ref(null)
const availableTags = ref([])

const acquisitionHeaders = [
  { title: 'Tag Number', key: 'tag_number' },
  { title: 'Acquired By', key: 'borrower' },
  { title: "Department", value: "department" },
  { title: 'Quantity', key: 'quantity' },
  { title: 'Date Acquired', key: 'createdAt' },
  { title: "Remarks", value: "remarks" },
]

const tagHeaders = [
  { title: 'Tag Number', key: 'tag_number' },
  { title: 'Assigned to', key: 'assigned_to' },
  { title: 'Status', key: 'tag_status' },
  { title: 'Assigned Date', key: 'assigned_date' },
  { title: 'Action', key: 'actions' },

]

const borrowers = ref([])

// const totalAcquired = computed(() =>
//   acquisitions.value.reduce((sum, a) => sum + a.quantity, 0)
// )

const totalAcquired = computed(() => {
  const acquiredFromAcquisitions = acquisitions.value.reduce((sum, a) => sum + a.quantity, 0)

  const acquiredFromTags = tags.value.filter(tag => tag.tag_status === 'assigned').length

  return acquiredFromAcquisitions + acquiredFromTags
})

const totalAcquisitionAcquired = computed(() => {
  const acquiredFromAcquisitions = acquisitions.value.reduce((sum, a) => sum + a.quantity, 0)

  return acquiredFromAcquisitions
})
const isFullyAcquired = computed(() => {
  const totalQty = itemDetails.value?.quantity || 0
  return totalAcquired.value >= totalQty
})


const totalTagsAssigned = computed(() => {
  //tags.value.length 
  return tags.value.filter(tag => tag.tag_status === 'assigned').length
})

// const remainingQuantity = computed(() =>
//   itemDetails.value.quantity - totalAcquired.value
// )

// ✅ Remaining quantity = Total quantity - max(acquired, tags assigned)
const remainingQuantity = computed(() => {
  // Use whichever is greater: acquired units or tags assigned
  const usedUnits = Math.max(totalAcquired.value, totalTagsAssigned.value)
  console.log("tag assigned", totalTagsAssigned.value)
  console.log("Used unit", usedUnits)
  return itemDetails.value.quantity - usedUnits
})

const openAcquisitionDialog = (tagId) => {
  selectedTagId.value = tagId // ✅ this works because selectedTagId exists

  console.log("tag id: ", tagId)
  showAcquisitionDialog.value = true
}

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

async function acquireItem() {
  if (!acquisitionForm.value.acquired_by || !acquisitionForm.value.tag_id) {
    alert('Please fill all required fields.')
    return
  }

  console.log("Tag ID:", acquisitionForm.value.tag_id)
  // const token = useAuthToken() // your token getter
  // const baseUrl = useRuntimeConfig().public.strapiBaseUrl

  try {
    // Step 1: Create acquisition and link to tag
    const acquisitionRes = await $fetch(`${baseUrl}/api/acquisitions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
      body: {
        data: {
          borrower: acquisitionForm.value.acquired_by?.id,  // borrower id
          acquired_date: formatDate(acquisitionForm.value.acquired_at),
          item: route.params.id,
          item_tag: acquisitionForm.value.tag_id?.id
        }
      }
    })

    // Step 2: Update the tag status to "assigned"
    await $fetch(`${baseUrl}/api/item-tags/${acquisitionForm.value.tag_id?.documentId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
      body: {
        data: {
          assigned_to: acquisitionForm.value.acquired_by?.id,
          assigned_date:formatDate(acquisitionForm.value.acquired_at),
          tag_status: 'assigned'
        }
      }
    })
    console.log("Acquisition saved and tag assigned successfully!")
    //alert('Acquisition saved and tag assigned successfully!')
    acquisitionForm.value = { acquired_by: null, acquired_at: null, tag_id: null }

  } catch (error) {
    console.error('Error acquiring item:', error)
    //alert('Failed to acquire item.')
  }
}

const saveAcquisition = async () => {
  try {
    await $fetch(`${baseUrl}/api/item-tags/${selectedTagId.value}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      body: {
        data: {
          assigned_to: acquisitionForm.value.acquired_by?.id,
          assigned_date: acquisitionForm.value.acquired_at,
          tag_status: 'assigned'
        }
      }
    })
    showAcquisitionDialog.value = false
    fetchTags() // Refresh table
  } catch (error) {
    console.error('Failed to save acquisition:', error)
  }
}



function getStatusColor(tag_status) {
  switch (tag_status) {
    case 'assigned': return 'blue'
    case 'in-repair': return 'orange'
    case 'lost': return 'red'
    default: return 'green'
  }
}

async function fetchItemDetails() {
  const res = await $fetch(`${baseUrl}/api/items/${route.params.id}`, {
    headers: { Authorization: `Bearer ${token.value}` },
    params: { populate: '*' }
  })
  itemDetails.value = {
    name: res.data.name,
    quantity: res.data.quantity
  }
}

async function fetchAcquisitions() {
  const res = await $fetch(`${baseUrl}/api/acquisitions`, {
    headers: { Authorization: `Bearer ${token.value}` },
    params: {
      'filters[item][documentId][$eq]': route.params.id,
      'populate': '*',
      'sort[0]': 'createdAt:desc'
    }
  })
  // acquisitions.value = res.data.map(a => ({
  //   borrowed: a.borrowed,
  //   date: new Date(a.createdAt).toLocaleDateString(),
  //   quantity: a.quantity
  // }))
  acquisitions.value = res.data || []
  console.log("Acquistion: ", res.data)
}

async function fetchTags() {
  const res = await $fetch(`${baseUrl}/api/item-tags`, {
    headers: { Authorization: `Bearer ${token.value}` },
    params: {
      'filters[item][documentId][$eq]': route.params.id,
      'populate': 'assigned_to',
      'sort[0]': 'createdAt:asc'
    }
  })
  tags.value = res.data
}

// Format the acquisition date
// const formatDate = (dateStr) => {
//   return new Date(dateStr).toLocaleDateString("en-US", {
//     year: "numeric",
//     month: "short",
//     day: "numeric",
//   });
// };

function formatDate(date) {
  if (!date) return null
  return new Date(date).toISOString().split('T')[0]
}

// Fetch available tags
const fetchAvailableTags = async () => {
  try {
    const res = await $fetch(`${baseUrl}/api/item-tags`, {
      headers: { Authorization: `Bearer ${token.value}` },
      params: {
        'filters[item][documentId][$eq]': route.params.id,
        'filters[tag_status][$ne]': 'assigned',
        'sort[0]': 'tag_number:asc',
        'populate': '*'
      },
      // query: {
      //   filters: {
      //     item: { documentId: { $eq: route.params.id } },
      //     tag_status: { $ne: 'assigned' } // only show unassigned tags
      //   },
      //   sort: 'tag_number:asc',
      //   populate: '*'
      // }
    })
    availableTags.value = res.data
  } catch (err) {
    console.error('Error fetching available tags:', err)
  }
}



onMounted(async () => {
  await fetchItemDetails()
  await fetchAcquisitions()
  await fetchTags()
  await fetchBorrowers()
  await fetchAvailableTags()
})

</script>

<style></style>
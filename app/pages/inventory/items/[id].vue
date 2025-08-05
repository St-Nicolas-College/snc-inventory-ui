<template>
  <div>

    <AppBreadcrumb :breadcrumbs="breadcrumbItems" theme="light" class="mb-3" />
    <v-card class="mb-6" elevation="0">
      <v-card-title class="text-h5">Item Details</v-card-title>
      <v-card-text>
        <div class="text-subtitle-1 font-weight-medium">
          {{ item?.name }}
        </div>
        <div>Quantity: {{ item?.quantity }}</div>
        <div>Category: {{ item?.category?.name }}</div>
      </v-card-text>
    </v-card>

    <v-alert type="info" class="mb-4">
      Tagged {{ assignedCount }} of {{ totalQuantity }} units
    </v-alert>

    <v-btn color="green" class="mb-4" @click="generateAllTags" :disabled="remainingTags <= 0"
      prepend-icon="mdi-plus-box">
      Generate All Tags
    </v-btn>

    <v-progress-linear :model-value="(assignedCount / totalQuantity) * 100" color="primary" height="6" striped />

    <!-- TABS -->
    <v-card class="mb-6" elevation="0">
      <v-toolbar color="transparent">
        <v-toolbar-title><v-icon start>mdi-tag</v-icon> Tag Assignments
          <!-- <v-btn color="primary" flat variant="elevated" @click="openCreateTagDialog()">
            <v-icon start>mdi-plus</v-icon> Add Tag
          </v-btn> -->
        </v-toolbar-title>
        <InventoryTagCreateForm :item-id="itemId" :assigned-count="assignedCount" :total-quantity="totalQuantity"
          @saved="fetchTags()" class="mr-4" />
      </v-toolbar>
      <v-divider></v-divider>
      <v-tabs v-model="activeTab" color="primary" grow>
        <v-tab v-for="group in statusGroups" :key="group.value" :value="group.value">
          {{ group.title }} ({{ groupedTags[group.value]?.length || 0 }})
        </v-tab>
      </v-tabs>
      <v-divider></v-divider>
      <v-window v-model="activeTab" class="pa-4">
        <v-window-item v-for="group in statusGroups" :key="group.value" :value="group.value">
          <!-- 🔍 Search Input -->
          <v-text-field v-model="search" label="Search tags..." prepend-inner-icon="mdi-magnify" variant="outlined" />

          <v-divider></v-divider>
          <v-data-table :headers="headersTab" :items="filteredGroupedTags[group.value]" item-value="id"
            density="compact">
            <template v-slot:[`item.tag_number`]="{ item }">
              <span v-if="item.is_virtual" class="text-grey">—</span>
              <span v-else>{{ item.tag_number }}</span>
            </template>

            <template v-slot:[`item.assigned_to`]="{ item }">
              {{ item.assigned_to || '—' }}
            </template>
            <template v-slot:[`item.status`]="{ item }">
              <v-chip :color="getStatusColor(item.tag_status)" size="small" class="text-capitalize">
                {{ item.tag_status }}
              </v-chip>
            </template>


            <template v-slot:[`item.actions`]="{ item }">
              <!-- <InventoryTagAssignmentForm :tag="item" @saved="fetchTags" /> -->
              <InventoryTagCreateFromVirtual v-if="item.is_virtual" :virtual-tag="item" :item-id="itemId"
                @saved="fetchTags" />
              <InventoryTagEditForm v-else :tag="item" @saved="fetchTags" />
            </template>
          </v-data-table>
        </v-window-item>
      </v-window>
    </v-card>




    <!-- Tag Management -->
    <!-- <v-card>
      <v-card-title>
        Tag Assignments
        <v-spacer />
        <InventoryTagCreateForm :item-id="itemId" @saved="fetchTags()" />
        <v-btn color="primary" @click="openCreateTagDialog()">
          <v-icon start>mdi-plus</v-icon> Add Tag
        </v-btn>
      </v-card-title>
      <v-data-table :headers="headers" :items="tags" item-value="id" class="px-4">
        <template v-slot:[`item.tag_number`]="{ item }">
          {{ item.tag_number }}
        </template>
        <template v-slot:[`item.assigned_to`]="{ item }">
          {{ item.assigned_to || '—' }}
        </template>
        <template v-slot:[`item.status`]="{ item }">
          <v-chip :color="getStatusColor(item.tag_status)" size="small" class="text-capitalize">
            {{ item.tag_status }}
          </v-chip>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn @click="editTag(item)">Edit</v-btn>
          <InventoryTagAssignmentForm :item-id="itemId" :tag="item" @saved="fetchTags" />
        </template>
      </v-data-table>
    </v-card> -->

    <!-- Add new tag dialog -->
    <v-dialog v-model="createTagDialog" max-width="600px">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon start>mdi-tag-outline</v-icon> Add New Tag
          <v-spacer></v-spacer>
          <v-btn @click="createTagDialog = false" flat icon><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-divider></v-divider>

        <v-card-text>
          <v-form @submit.prevent="submitTag" ref="formRef">
            <v-text-field v-model="tag.tag_number" label="Tag Number" required />
            <v-select v-model="tag.tag_status" label="Status"
              :items="['available', 'assigned', 'in-repair', 'disposed']" required />
            <v-select v-model="tag.condition" label="Condition" :items="['new', 'good', 'fair', 'poor', 'damaged']"
              required />
            <v-text-field v-model="tag.assigned_to" label="Assigned To" />
            <v-text-field v-model="tag.location" label="Location" />
            <v-textarea v-model="tag.remarks" label="Remarks" rows="2" />
            <v-card-actions class="mt-4">
              <v-spacer />
              <v-btn type="submit" color="primary" :loading="loading">
                Save Tag
              </v-btn>
              <v-btn text @click="createTagDialog = false">Cancel</v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>


  </div>
</template>

<script setup>
const { triggerToast } = useToast();
const route = useRoute()
const token = useCookie('token')
const itemId = route.params.id
const baseUrl = useRuntimeConfig().public.strapiBaseURL

const loading = ref(false)
const item = ref(null)
const tags = ref([])
const createTagDialog = ref(false)
const activeTab = ref('available') // Default active tab

const search = ref('')
const tagCount = ref(0)

// const headers = [
//   { title: 'Tag #', value: 'tag_number' },
//   { title: 'Assigned To', value: 'assigned_to' },
//   { title: 'Status', value: 'status' },
//   { title: 'Condition', value: 'condition' },
//   { title: 'Location', value: 'location' },
//   { title: 'Actions', value: 'actions', sortable: false }
// ]

const tag = ref({
  tag_number: '',
  tag_status: 'available',
  condition: 'good',
  assigned_to: '',
  location: '',
  remarks: ''
})

const breadcrumbItems = [
  { text: 'Home', to: '/', icon: 'mdi-home-outline' },
  { text: 'Inventory', to: '/inventory' },
  { text: 'Item', },
]

const headersTab = [
  { title: 'Tag #', key: 'tag_number' },
  { title: 'Assigned To', key: 'assigned_to' },
  { title: 'Condition', key: 'condition' },
  { title: 'Location', key: 'location' },
  { title: 'Assigned Date', key: 'assigned_date' },
  { title: 'Status', key: 'status' },
  { title: 'Remarks', key: 'remarks' },
  { title: 'Actions', key: 'actions', align: 'center', sortable: false }
]

const statusGroups = [
  { value: 'available', title: 'Available' },
  { value: 'assigned', title: 'Assigned' },
  { value: 'in-repair', title: 'In Repair' },
  { value: 'lost', title: 'Lost' },
  { value: 'disposed', title: 'Disposed' }
]


// -----------------------------------------------------Functions section----------------------------------------------
const getStatusColor = (status) => {
  switch (status) {
    case 'assigned': return 'blue'
    case 'available': return 'green'
    case 'in-repair': return 'orange'
    case 'lost': return 'yellow'
    case 'disposed': return 'red'
    default: return 'grey'
  }
}

const resetForm = async () => {
  // generating.value = true
  tag.value = {
    tag_number: '',
    tag_status: 'available',
    condition: 'good',
    assigned_to: '',
    location: '',
    remarks: ''
  }
  //await fetchItemAndTags()
  //await fetchTagCount()
  //generating.value = true
}

const fetchItem = async () => {

  // const { data } = await useFetch(`${baseUrl}/api/items/${itemId}?populate=category`, {
  // const { data } = await useFetch(`${baseUrl}/api/items/${route.params.id}?populate[category][populate]=*&populate[department][populate]`, {
  //   headers: { Authorization: `Bearer ${token.value}` }
  // })
  // item.value = data.value
  const { data } = await $fetch(`${baseUrl}/api/items/${route.params.id}?populate[category][populate]=*&populate[department][populate]`, {
    headers: { Authorization: `Bearer ${token.value}` }
  })
  item.value = data
  console.log("Item data: ", data)
}

// const fetchTags = async () => {
//   console.log('fetchTags for itemId:', itemId)
//   const { data } = await $fetch(`${baseUrl}/api/item-tags?filters[item][documentId][$eq]=${route.params.id}&populate=*`, {
//     headers: { Authorization: `Bearer ${token.value}` }
//   })

//   if (data) {
//     console.log("Data: ", data)
//     tags.value = data || []
//   } else {
//     console.error('fetchTags error')
//   }

// }

const fetchTags = async () => {
  const { data } = await $fetch(`${baseUrl}/api/item-tags?filters[item][documentId][$eq]=${itemId}&populate=*&pagination[limit]=1000`, {
    headers: { Authorization: `Bearer ${token.value}` }
  })

  const existingTags = data || []

  // How many units have no tags yet?
  const quantity = item.value?.quantity || 0
  const untaggedCount = quantity - existingTags.length
  console.log("Untagged Count: ", untaggedCount)

  // Create virtual untagged available placeholders
  const categoryCode = "INV"
  const itemName = item.value?.department?.name || 'ITM'
  const itemCode = itemName.substring(0, 3).toUpperCase()
  const virtualTags = Array.from({ length: untaggedCount }, (_, i) => ({
    id: `virtual-${i}`,
    tag_number: '—',
    tag_status: 'available',
    assigned_to: 'Unassigned',
    is_virtual: true,
    category_code: categoryCode,
    item_code: itemCode
  }))

  console.log("Virtual Tags: ", virtualTags)

  tags.value = [...existingTags, ...virtualTags]
}


const openCreateTagDialog = async () => {
  createTagDialog.value = true;
  fetchItem()
  //fetchTagCount()
}

const fetchTagCount = async () => {
  // const url = `${baseUrl}/api/item-tags?filters[item][documentId][$eq]=${props.itemId}&pagination[limit]=10000`
  const url = `${baseUrl}/api/item-tags`
  // const { data, error } = await useFetch(url, {
  //   headers: {
  //     Authorization: `Bearer ${token.value}`
  //   }
  // })

  // if (!error.value) {
  //   const count = (data.value?.data?.length || 0) + 1
  //   // const categoryCode = item.value?.category?.name?.substring(0, 3).toUpperCase() || 'CAT'
  //   const categoryCode = 'SNC'
  //   console.log("Item: ", item.value)
  //   const itemCode = item.value?.data?.department.name.substring(0, 3).toUpperCase() || 'ITM'
  //   //const itemCode = item?.data?.department?.name
  //   console.log('Item Code: ', item.value?.data?.department.name)
  //   const padded = String(count).padStart(5, '0')
  //   // tag.value.tag_number = `${categoryCode}-${itemCode}-${padded}`
  //   tag.value.tag_number = `${categoryCode}-${itemCode}-${padded}`
  // } else {
  //   console.error('❌ Failed to count tags:', error.value)
  // }

  const { data, error } = await $fetch(url, {
    headers: {
      Authorization: `Bearer ${token.value}`
    }
  })

  if (!error) {
    tagCount.value = data.length
    console.log("Tag Count: ", tagCount.value)

    const count = (data.length || 0) + 1
    // const categoryCode = item.value?.category?.name?.substring(0, 3).toUpperCase() || 'CAT'
    const categoryCode = 'SNC'
    console.log("Item: ", item.value)
    const itemCode = item.value?.data?.department.name.substring(0, 3).toUpperCase() || 'ITM'
    //const itemCode = item?.data?.department?.name
    console.log('Item Code: ', item.value?.data?.department.name)
    const padded = String(count).padStart(5, '0')
    // tag.value.tag_number = `${categoryCode}-${itemCode}-${padded}`
    tag.value.tag_number = `${categoryCode}-${itemCode}-${padded}`
  } else {
    console.error('❌ Failed to count tags:', error)
  }
}


const submitTag = async () => {
  loading.value = true
  const payload = {
    data: {
      ...tag.value,
      item: itemId
    }
  }
  const { error } = await useFetch(`${baseUrl}/api/item-tags`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token.value}`
    },
    body: payload
  })

  loading.value = false

  if (!error.value) {
    tag.value = {
      tag_number: '',
      tag_status: 'available',
      condition: 'good',
      assigned_to: '',
      location: '',
      remarks: ''
    }
    //fetchTagCount()
    await fetchTags()
    await resetForm()
    console.log("Success")
    createTagDialog.value = false

  } else {
    console.error('❌ Tag creation failed:', error.value)
  }
}

const generateAllTags = async () => {
  if (remainingTags.value <= 0) {
    triggerToast('No more units available to tag.', 'info')
    return
  }

  console.log("Generate Tags: ", tags.value)

  try {
    for (let i = 0; i < remainingTags.value; i++) {
      const nextNumber = tagCount.value + i + 1
      const count = (tags.value.length + i || 0) + 1;
      const padded = String(nextNumber).padStart(5, '0')
      const categoryCode = "INV";
      const itemName = item.value?.department.name || "ITM";
      const itemCode = itemName.substring(0, 3).toUpperCase();
      const tagNumber = `${categoryCode}-${itemCode}-${padded}`


      console.log("Tag number: ", tagNumber)

      await $fetch(`${baseUrl}/api/item-tags`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.value}`
        },
        body: {
          data: {
            tag_number: tagNumber,
            tag_status: 'available',
            item: itemId
          }
        }
      })
    }

    triggerToast('Tags generated successfully.', 'success', 'mdi-check')
    await fetchTags()
  } catch (err) {
    console.error('Tag generation failed:', err)
    triggerToast('Something went wrong while generating tags.', 'error')
  }
}


// --------------------------------------- Computed Properties ---------------------------------------
const groupedTags = computed(() => {
  const groups = {}
  for (const status of statusGroups.map(s => s.value)) {
    groups[status] = tags.value.filter(t => t.tag_status === status)
  }
  return groups
})

const filteredGroupedTags = computed(() => {
  const groups = {}
  for (const group of statusGroups) {
    groups[group.value] = tags.value.filter(tag => {
      const inStatus = tag.tag_status === group.value
      const matchesSearch = Object.values(tag).some(val =>
        String(val).toLowerCase().includes(search.value.toLowerCase())
      )
      return inStatus && matchesSearch
    })
  }
  return groups
})

const assignedCount = computed(() => tags.value.length)
const totalQuantity = computed(() => item.value?.quantity || 0)
const untaggedCount = computed(() => totalQuantity.value - assignedCount.value)
// const remainingTags = computed(() => totalQuantity.value - assignedCount.value)
const remainingTags = computed(() => {
  const total = item.value?.quantity || 0
  return total - tags.value.length
})



// -------------------------------------------------- Mounted Properties -------------------------------------------

onMounted(async () => {
  await fetchItem()
  await fetchTags()
  //await fetchTagCount()
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
  color: #000;
}
</style>

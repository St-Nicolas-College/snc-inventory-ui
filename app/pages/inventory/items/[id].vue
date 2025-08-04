<template>
  <div>


    <v-card class="mb-6">
      <v-card-title class="text-h5">Item Details</v-card-title>
      <v-card-text>
        <div class="text-subtitle-1 font-weight-medium">
          {{ item?.data?.name }}
        </div>
        <div>Quantity: {{ item?.data?.quantity }}</div>
        <div>Category: {{ item?.data?.category?.name }}</div>
      </v-card-text>
    </v-card>

    <!-- Tag Management -->
    <v-card>
      <v-card-title>
        Tag Assignments
        <v-spacer />
        <!-- <InventoryTagCreateForm :item-id="itemId" @saved="fetchTags()" /> -->
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
    </v-card>

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
const route = useRoute()
const token = useCookie('token')
const itemId = route.params.id
const baseUrl = useRuntimeConfig().public.strapiBaseURL

const item = ref(null)
const tags = ref([])
const createTagDialog = ref(false)

const headers = [
  { title: 'Tag #', value: 'tag_number' },
  { title: 'Assigned To', value: 'assigned_to' },
  { title: 'Status', value: 'status' },
  { title: 'Condition', value: 'condition' },
  { title: 'Location', value: 'location' },
  { title: 'Actions', value: 'actions', sortable: false }
]

const tag = ref({
  tag_number: '',
  tag_status: 'available',
  condition: 'good',
  assigned_to: '',
  location: '',
  remarks: ''
})

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
  await fetchTagCount()
  //generating.value = true
}


const loading = ref(false)


const getStatusColor = (status) => {
  switch (status) {
    case 'assigned': return 'blue'
    case 'available': return 'green'
    case 'in-repair': return 'orange'
    case 'disposed': return 'red'
    default: return 'grey'
  }
}

const fetchItem = async () => {

  // const { data } = await useFetch(`${baseUrl}/api/items/${itemId}?populate=category`, {
  const { data } = await useFetch(`${baseUrl}/api/items/${route.params.id}?populate[category][populate]=*&populate[department][populate]`, {
    headers: { Authorization: `Bearer ${token.value}` }
  })
  item.value = data.value
}

const fetchTags = async () => {
  console.log('fetchTags for itemId:', itemId)
  const { data } = await $fetch(`${baseUrl}/api/item-tags?filters[item][documentId][$eq]=${route.params.id}&populate=*`, {
    headers: { Authorization: `Bearer ${token.value}` }
  })

  if (data) {
    console.log("Data: ", data)
    tags.value = data || []
  } else {
    console.error('fetchTags error')
  }


  // if (error.value) {
  //   console.error('fetchTags error: ', error.value)
  // }
}

// const fetchTags = async () => {
//   console.log('fetchTags for itemId:', itemId)
//   const data = await $fetch(`${baseUrl}/api/item-tags/by-document/${itemId}`, {
//     headers: { Authorization: `Bearer ${token.value}` }
//   })
//   tags.value = data || []
//   console.log("Data: ", data)

//   // if (error.value) {
//   //   console.error('fetchTags error: ', error.value)
//   // }
// }



const openCreateTagDialog = async () => {
  createTagDialog.value = true;
  fetchItem()
  fetchTagCount()
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

const editTag = async (item) => {
  console.log("Edit tag: ", item)
}


onMounted(async () => {
  await fetchItem()
  await fetchTags()
  // await fetchTagCount()
})

</script>

<style></style>
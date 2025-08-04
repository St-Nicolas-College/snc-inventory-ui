<template>
  <div>
    <v-btn color="primary" @click="dialog = true">
      <v-icon start>mdi-plus</v-icon> Add Tag
    </v-btn>

    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <!-- <v-card-title>
          <span class="text-h6">Add New Tag</span>
          <v-spacer />
          <v-btn icon @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title> -->

        <v-card-title class="d-flex align-center">
          <v-icon start>mdi-tag-outline</v-icon> Add New Tag
          <v-spacer></v-spacer>
          <v-btn @click="dialog = false" flat icon><v-icon>mdi-close</v-icon></v-btn>
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
              <v-btn text @click="() => { resetForm(); dialog = false }">Cancel</v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
const baseUrl = useRuntimeConfig().public.strapiBaseURL
const token = useCookie('token')
const generating = ref(false)

const props = defineProps({
  itemId: {
    type: [Number, String],
    required: true
  }
})

const emit = defineEmits(['saved'])
const dialog = ref(false)
const tag = ref({
  tag_number: '',
  tag_status: 'available',
  condition: 'good',
  assigned_to: '',
  location: '',
  remarks: ''
})

const resetForm = async () => {
  generating.value = true
  tag.value = {
    tag_number: '',
    tag_status: 'available',
    condition: 'good',
    assigned_to: '',
    location: '',
    remarks: ''
  }
await fetchItemAndTags()
 await generateTagNumber()
 generating.value = true
}

const loading = ref(false)
const item = ref(null)
const tags = ref([])

const fetchItemAndTags = async () => {
  const url = `${baseUrl}/api/items/${props.itemId}?populate[category][populate]=*&populate[department][populate]=*&populate[tags][populate]=item`
  const { data, error } = await useFetch(url, {
    headers: {
      Authorization: `Bearer ${token.value}`
    }
  })

  if (!error.value) {
    item.value = data.value.data
    tags.value = item.value.item_tags?.data || []
    // fetchTagCount()
    generateTagNumber()
  }
}

const generateTagNumber = async () => {
  const { data, error } = await useFetch(`${baseUrl}/api/item-tags`, {
    headers: {
      Authorization: `Bearer ${token.value}`
    }
  })

  const count = (data.value?.data?.length || 0) + 1

  // Make sure item.value is available
  if (!item.value) {
    console.warn('⚠️ Cannot generate tag number — item is null')
    return
  }

  const itemName = item.value?.name || 'ITM'
  const categoryName = item.value?.category?.data?.name || 'CAT'

  // Use 3-Letter prefix + padded number
  const itemCode = itemName.substring(0, 3).toUpperCase()
  const categoryCode = categoryName.substring(0, 3).toUpperCase()
  const padded = String(count).padStart(3, '0')

  tag.value.tag_number = `${categoryCode}-${itemCode}-${padded}`
}


// const fetchTagCount = async () => {
//   // const url = `${baseUrl}/api/item-tags?filters[item][documentId][$eq]=${props.itemId}&pagination[limit]=10000`
//   const url = `${baseUrl}/api/item-tags`
//   const { data, error } = await useFetch(url, {
//     headers: {
//       Authorization: `Bearer ${token.value}`
//     }
//   })

//   if (!error.value) {
//     const count = (data.value?.data?.length || 0) + 1
//     // const categoryCode = item.value?.category?.name?.substring(0, 3).toUpperCase() || 'CAT'
//     const categoryCode = 'SNC'
//     console.log("Item: ", item.value)
//     const itemCode = item.value?.department.name.substring(0, 3).toUpperCase() || 'ITM'
//     //const itemCode = item?.data?.department?.name
//     console.log('Item Code: ', item.value?.department.name)
//     const padded = String(count).padStart(5, '0')
//     // tag.value.tag_number = `${categoryCode}-${itemCode}-${padded}`
//     tag.value.tag_number = `${categoryCode}-${itemCode}-${padded}`
//     console.log('Tag number: ', tag.value.tag_number)
//   } else {
//     console.error('❌ Failed to count tags:', error.value)
//   }

//   // if (!error.value) {
//   //   const count = (data.value?.data?.length || 0) + 1
//   //   // const categoryCode = item.value?.category?.name?.substring(0, 3).toUpperCase() || 'CAT'
//   //   const categoryCode = 'SNC'
//   //   console.log("Item: ", item.value)
//   //   // const itemCode = item.value?.name?.substring(0, 3).toUpperCase() || 'ITM'
//   //   const padded = String(count).padStart(5, '0')
//   //   // tag.value.tag_number = `${categoryCode}-${itemCode}-${padded}`
//   //   tag.value.tag_number = `${categoryCode}-${padded}`
//   // } else {
//   //   console.error('❌ Failed to count tags:', error.value)
//   // }
// }

watch(dialog, async (val) => {
  if (val) {
    await fetchItemAndTags()
  }
})


const submitTag = async () => {
  loading.value = true

  const payload = {
    data: {
      ...tag.value,
      item: props.itemId
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
    // tag.value = {
    //   tag_number: '',
    //   tag_status: 'available',
    //   condition: 'good',
    //   assigned_to: '',
    //   location: '',
    //   remarks: ''
    // }
    resetForm()
    dialog.value = false
    emit('saved')
  } else {
    console.error('❌ Tag creation failed:', error.value)
  }
}

onMounted(fetchItemAndTags)
</script>

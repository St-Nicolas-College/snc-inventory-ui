<template>
  <div>
    <v-dialog v-model="dialog" max-width="500">
      <template #activator="{ props }">
        <v-btn color="primary" variant="elevated" class="mr-4" size="small" v-bind="props" @click="openDialog">
          <v-icon start>mdi-plus</v-icon> Add
        </v-btn>
        <!-- <v-btn v-bind="props" variant="elevated" flat size="small" color="blue">
        <v-icon start>mdi-pencil</v-icon> Edit
      </v-btn> -->
      </template>

      <v-card>
        <v-card-title class="d-flex align-center">
          Log Item Acquisition
          <v-spacer></v-spacer>
          <v-btn @click="dialog = false" flat icon><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-form ref="formRef" v-model="formValid" @submit.prevent="handleSubmit">
            <v-select v-model="form.borrower" :rules="[rules.required]" :items="borrowers" item-title="name"
              item-value="id" label="Acquired By" return-object required />
            <v-text-field v-model="form.quantity" :rules="[rules.required, rules.numeric, rules.positive]"
              label="Quantity" type="number" min="1" required />
            <v-textarea v-model="form.remarks" label="Remarks" rows="2" />
            <v-date-input prepend-icon="" prepend-inner-icon="$calendar" v-model="form.acquired_at"
            :display-format="format" label="Date input"></v-date-input>
            <v-autocomplete v-model="form.tag_id" :items="availableTags" item-title="tag_number" item-value="documentId"
              label="Select Tag Number" return-object></v-autocomplete>
            <v-btn type="submit" color="primary" class="mt-4" block :disabled="!formValid"
              :loading="loading">Save</v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
const { triggerToast } = useToast()
const props = defineProps({
  itemId: [String, Number],
  totalItemQuantity: Number,
  totalAcquired: Number
})

const formRef = ref()
const formValid = ref(true)

const rules = {
  required: (v) => !!v || 'Required',
  numeric: (v) => !isNaN(Number(v)) || 'Must be a number',
  positive: (v) => Number(v) > 0 || 'Must be greater than 0',
}
const emit = defineEmits(['saved'])

const token = useCookie('token')
const baseUrl = useRuntimeConfig().public.strapiBaseURL

const today = new Date()
const dialog = ref(false)
const loading = ref(false)
const availableTags = ref([])

const borrowers = ref([])
const form = reactive({
  borrower: null,
  quantity: 1,
  remarks: '',
  acquired_at: '',
  tag_id: null
})

const openDialog = () => {
  dialog.value = true
  fetchBorrowers()
  fetchAvailableTags()
}

const fetchBorrowers = async () => {
  const res = await $fetch(`${baseUrl}/api/borrowers`, {
    headers: { Authorization: `Bearer ${token.value}` }
  })
  borrowers.value = res.data
}


const handleSubmit = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  // Continue with submission
  await submitAcquisition()
}

const submitAcquisition = async () => {
  const remaining = props.totalItemQuantity - props.totalAcquired
  if (form.quantity > remaining) {
    triggerToast(
      `Only ${remaining} unit(s) remaining for this item.`,
      'error',
      'mdi-alert-circle'
    )
    return
  }
  loading.value = true
  try {
    // Step 1: Create acquisition and link to tag

    if (form.tag_id == null) {
      console.log("Item Tag: ", form.tag_id?.id)
    }

    await $fetch(`${baseUrl}/api/acquisitions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: {
        data: {
          item: props.itemId,
          borrower: form.borrower?.id || null,
          quantity: form.quantity,
          remarks: form.remarks,
          item_tag: form.tag_id?.id
        }
      }
    })

    if (form.tag_id !== null) {
      // Step 2: Update the tag status to "assigned"
      await $fetch(`${baseUrl}/api/item-tags/${form.tag_id?.documentId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
        body: {
          data: {
            assigned_to: form.borrower?.id,
            assigned_date:formattedAcquiredDate(form.acquired_at),
            tag_status: 'assigned'
          }
        }
      })
    } else {
      triggerToast(
        `No tag selected!`,
        'error',
        'mdi-alert-circle'
      )
    }

    emit('saved')
    formRef.value.reset()
    form.quantity = 1;
    dialog.value = false
  } catch (err) {
    console.error('Error creating acquisition:', err)
  } finally {
    loading.value = false
  }
}

// Fetch available tags
const fetchAvailableTags = async () => {
  try {
    const res = await $fetch(`${baseUrl}/api/item-tags`, {
      headers: { Authorization: `Bearer ${token.value}` },
      params: {
        'filters[item][documentId][$eq]': props.itemId,
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

// Helper function to format into YYYY-MM-DD
function formattedAcquiredDate(dateInput) {
  if (!dateInput) return null
  const date = new Date(dateInput)
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

// onMounted(fetchBorrowers)
</script>

<style></style>
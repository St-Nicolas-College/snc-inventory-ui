<template>
  <div>
    <h1>Tagged Items</h1>


    <v-card class="pa-4" elevation="2">
      <v-card-title>
        {{ item.name }} - Physical Units
      </v-card-title>
      <v-card-subtitle>
        Quantity: {{ item.tags?.length || 0 }}
      </v-card-subtitle>

      <v-divider class="my-4"></v-divider>

      <v-row>
        <v-col
          v-for="(tag, index) in item.tags"
          :key="tag.id"
          cols="12"
          sm="4"
          md="3"
        >
          <v-card class="pa-3 text-center" elevation="1">
            <div class="text-h6">Unit #{{ index + 1 }}</div>
            <div class="text-subtitle-1 font-weight-bold">
              Tag: {{ tag.tag_number }}
            </div>

            <!-- Optional QR Code -->
            <v-img
              v-if="tag.tag_number"
              :src="`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${tag.tag_number}`"
              height="100"
              contain
              class="mt-2"
            ></v-img>
          </v-card>
        </v-col>
      </v-row>
    </v-card>


    
    <v-card class="pa-4" max-width="600" elevation="2">
      <v-card-title>
        Assign Tag Numbers
      </v-card-title>

      <v-divider class="my-2"></v-divider>

      <v-card-subtitle>
        Item: {{ item.name }}  
        <br>
        Quantity: {{ item.quantity }}
      </v-card-subtitle>

      <v-form @submit.prevent="saveTags" v-model="formValid">
        <v-row>
          <v-col cols="12" sm="6" v-for="(tag, index) in tags" :key="index">
            <v-text-field
              v-model="tags[index]"
              :label="`Tag #${index + 1}`"
              placeholder="Enter tag number"
              :rules="[v => !!v || 'Tag number is required']"
              clearable
            ></v-text-field>
          </v-col>
        </v-row>

        <v-card-actions class="justify-end">
          <v-btn color="grey" variant="text" @click="resetForm">Reset</v-btn>
          <v-btn color="primary" type="submit" :disabled="!formValid">
            Save Tags
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </div>
</template>

<script setup>
const token = useCookie('token')
const baseUrl = useRuntimeConfig().public.strapiBaseURL
const route = useRoute()
const itemId = route.params.id

const item = ref({})
const tags = ref([])
const formValid = ref(false)

onMounted(async () => {
  // // Fetch the item details
  // const { data } = await $fetch(`${baseUrl}/api/items/${itemId}`, {
  //   headers: { Authorization: `Bearer ${token.value}` }
  // })
  // console.log("Result", data)
  // item.value = data

  // // Initialize tags array based on quantity
  // tags.value = Array(item.value.quantity).fill('')

  const { data } = await $fetch(`${baseUrl}/api/items/${itemId}?populate=tags`, {
    headers: { Authorization: `Bearer ${token.value}` }
  })
  item.value = data

   tags.value = Array(item.value.quantity).fill('')
})

const resetForm = () => {
  tags.value = Array(item.value.quantity).fill('')
}

const saveTags = async () => {
  for (let tag of tags.value) {
    if (tag.trim()) {
      await $fetch(`${baseUrl}/api/item-tags`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token.value}` },
        body: {
          data: {
            tag_number: tag,
            item: itemId
          }
        }
      })
    }
  }
  alert('Tags assigned successfully!')
}
</script>

<style>

</style>
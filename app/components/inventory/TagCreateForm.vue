<template>
  <div>
    <v-btn color="primary" variant="elevated" @click="dialog = true">
      <v-icon start>mdi-plus</v-icon> Add Tag
    </v-btn>

    <v-dialog v-model="dialog" max-width="500">
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
          <v-form @submit.prevent="submitTag" ref="formRef" >
            <v-text-field v-model="tag.tag_number" label="Tag Number" required />

            <v-select v-model="tag.tag_status" label="Status" :items="[
              'available',
              'assigned',
              'in-repair',
              'lost',
              'disposed',
            ]" required />

            <v-select v-model="tag.condition" label="Condition" :items="['new', 'good', 'fair', 'poor', 'damaged']"
              required />

            <v-text-field v-model="tag.assigned_to" label="Assigned To" />

            <v-text-field v-model="tag.location" label="Location" />

            <v-textarea v-model="tag.remarks" label="Remarks" rows="2" />

            <v-card-actions class="mt-4">
              <v-spacer />
              <v-btn type="submit" variant="elevated" color="primary" :loading="loading" :disabled="isLimitReached">
                Save Tag
              </v-btn>
              <v-btn text @click="
                () => {
                  resetForm();
                  dialog = false;
                }
              ">Cancel</v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
const { triggerToast } = useToast();
const baseUrl = useRuntimeConfig().public.strapiBaseURL;
const token = useCookie("token");
const generating = ref(false);

const props = defineProps({
  itemId: {
    type: [Number, String],
    required: true,
  },
  assignedCount: Number,
  totalQuantity: Number,
});

const emit = defineEmits(["saved"]);
const dialog = ref(false);
const tag = ref({
  tag_number: "",
  tag_status: "available",
  condition: "good",
  assigned_to: "",
  location: "",
  remarks: "",
});

const resetForm = async () => {
  generating.value = true;
  tag.value = {
    tag_number: "",
    tag_status: "available",
    condition: "good",
    assigned_to: "",
    location: "",
    remarks: "",
  };
  await fetchItemAndTags();
  await generateTagNumber();
  generating.value = true;
};

const loading = ref(false);
const item = ref(null);
const tags = ref([]);

const fetchItemAndTags = async () => {
  const url = `${baseUrl}/api/items/${props.itemId}?populate[category][populate]=*&populate[department][populate]=*&populate[tags][populate]=item`;
  // const { data, error } = await useFetch(url, {
  //   headers: {
  //     Authorization: `Bearer ${token.value}`
  //   }
  // })
  // if (!error.value) {
  //   item.value = data.value.data
  //   tags.value = item.value.item_tags?.data || []
  //   // fetchTagCount()
  //   generateTagNumber()
  // }

  const { data, error } = await $fetch(url, {
    headers: {
      Authorization: `Bearer ${token.value}`,
    },
  });
  if (!error) {
    item.value = data;
    tags.value = item.value.item_tags?.data || [];
    // fetchTagCount()
    generateTagNumber();
  }
};

const generateTagNumber = async () => {
  // const { data, error } = await useFetch(`${baseUrl}/api/item-tags`, {
  //   headers: {
  //     Authorization: `Bearer ${token.value}`
  //   }
  // })
  // const count = (data.value?.data?.length || 0) + 1
  // // Make sure item.value is available
  // if (!item.value) {
  //   console.warn('⚠️ Cannot generate tag number — item is null')
  //   return
  // }
  // Use 3-Letter prefix + padded number
  // const categoryName = 'INV'
  // const categoryName = item.value?.category?.data?.name || 'CAT'
  // const itemCode = itemName.substring(0, 3).toUpperCase()
  // const categoryCode = categoryName.substring(0, 3).toUpperCase()

  const { data, error } = await $fetch(`${baseUrl}/api/item-tags`, {
    headers: {
      Authorization: `Bearer ${token.value}`,
    },
  });

  if (!error) {
    const count = (data.length || 0) + 1;
    const categoryCode = "INV";
    const itemName = item.value?.department.name || "ITM";
    const itemCode = itemName.substring(0, 3).toUpperCase();
    const padded = String(count).padStart(5, "0");
    tag.value.tag_number = `${categoryCode}-${itemCode}-${padded}`;
  } else {
    console.error("❌ Failed to count tags:", error);
  }
};

watch(dialog, async (val) => {
  if (val) {
    await fetchItemAndTags();
  }
});

const submitTag = async () => {
  loading.value = true;
  if (props.assignedCount >= props.totalQuantity) {
    triggerToast("All units have already been tagged.", "error");
    loading.value = false;
    return;
  }

  const payload = {
    data: {
      ...tag.value,
      item: props.itemId,
    },
  };
  const { error } = await useFetch(`${baseUrl}/api/item-tags`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token.value}`,
    },
    body: payload,
  });

  loading.value = false;

  if (!error.value) {
    resetForm();
    emit("saved");
  } else {
    console.error("❌ Tag creation failed:", error.value);
  }
};

const isLimitReached = computed(() => props.assignedCount >= props.totalQuantity)
</script>

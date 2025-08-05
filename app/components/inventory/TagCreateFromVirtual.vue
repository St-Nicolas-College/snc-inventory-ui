<template>
  <v-dialog
    v-model="dialog"
    max-width="500"
    @update:model-value="(val) => val && generateTagNumber()"
    persistent
  >
    <template #activator="{ props: activator }">
      <v-btn
        v-bind="activator"
        variant="elevated"
        flat
        size="small"
        color="primary"
      >
        <v-icon start>mdi-plus</v-icon> Add Tag
      </v-btn>
    </template>
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon start>mdi-tag-outline</v-icon> Create Tag
        <v-spacer></v-spacer>
        <v-btn @click="dialog = false" flat icon
          ><v-icon>mdi-close</v-icon></v-btn
        >
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <v-text-field v-model="generatedTagNumber" label="Tag Number" />
        <v-select
          v-model="form.tag_status"
          :items="['assigned', 'available', 'in-repair', 'disposed']"
          label="Status"
        />
        <v-text-field v-model="form.assigned_to" label="Assigned To" />
        <!-- <v-text-field v-model="form.condition" label="Condition" /> -->
        <v-select
          v-model="form.condition"
          label="Condition"
          :items="['new', 'good', 'fair', 'poor', 'damaged']"
          required
        />
        <v-text-field v-model="form.location" label="Location" />
        <v-textarea v-model="form.remarks" label="Remarks" rows="2" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="dialog = false">Cancel</v-btn>
        <v-btn class="mr-4 mb-3" color="primary" :loading="isSaving" variant="elevated" @click="saveTag">Save Tag</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
const { triggerToast } = useToast();
const props = defineProps({
  virtualTag: Object,
  itemId: [String, Number],
});

const emit = defineEmits(["saved"]);

const form = reactive({
  tag_number: props.virtualTag.tag_number,
  tag_status: "assigned",
  assigned_to: "",
  condition: "",
  location: "",
  remarks: ""
});

const token = useCookie("token");
const baseUrl = useRuntimeConfig().public.strapiBaseURL;
const dialog = ref(false);
const isSaving = ref(false);

// Auto-generated tag_number
const generatedTagNumber = ref("");

const generateTagNumber = async () => {
  const { data } = await $fetch(`${baseUrl}/api/item-tags`, {
    headers: { Authorization: `Bearer ${token.value}` },
    // params: {
    //   'filters[item][documentId][$eq]': props.itemId,
    //   'sort': 'tag_number:asc',
    //   'pagination[limit]': 1000
    // }
  });

  const existingCount = data?.length || 0;
  const nextNumber = existingCount + 1;
  const padded = String(nextNumber).padStart(5, "0");
  const categoryCode = props.virtualTag.category_code || "TAG";
  const itemCode = props.virtualTag.item_code;

  generatedTagNumber.value = `${categoryCode}-${itemCode}-${padded}`;
};

const saveTag = async () => {
  isSaving.value = true;
  try {
    await $fetch(`${baseUrl}/api/item-tags`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
      body: {
        data: {
          tag_number: generatedTagNumber.value,
          tag_status: form.tag_status,
          assigned_to: form.assigned_to,
          condition: form.condition,
          location: form.location,
          item: props.itemId,
          remarks: form.remarks
        },
      },
    });

    triggerToast("Tag created successfully.", "success", "mdi-check");
    emit("saved");
    dialog.value = false;
  } catch (err) {
    console.error(err);
    triggerToast("Failed to create tag.", "error", "mdi-alert");
  } finally {
    isSaving.value = false;
  }
};
</script>

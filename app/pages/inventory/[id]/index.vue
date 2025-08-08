<template>
  <div>
    <AppBreadcrumb :breadcrumbs="breadcrumbItems" theme="light" class="mb-3" />
    <v-card class=" mb-6" elevation="0" rounded="lg" >
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

    

    <!-- 🧾 Acquisition Table with Form -->
     <!-- <v-progress-linear color="blue" model-value="100" height="6" striped /> -->
    <v-card class="mb-6" elevation="0" rounded="lg">
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
  </div>
</template>

<script setup>
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

const itemId = route.params.id;
const item = ref(null);
const acquisitions = ref([]);
const loading = ref(false);

const acquisitionHeaders = [
  { title: "Borrower", value: "borrower" },
  { title: "Department", value: "department" },
  { title: "Quantity", value: "quantity" },
  { title: "Remarks", value: "remarks" },
  { title: "Date Acquired", value: "createdAt" },
];

const fetchItem = async () => {
  const res = await $fetch(`${baseUrl}/api/items/${itemId}?populate=*`, {
    headers: {
      Authorization: `Bearer ${token.value}`,
    },
  });
  item.value = res.data;
};

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
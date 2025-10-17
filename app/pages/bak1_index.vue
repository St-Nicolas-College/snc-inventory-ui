<template>
  <div>
    <v-btn variant="plain" icon @click="drawer = !drawer">
      <v-icon>mdi-menu</v-icon>
    </v-btn>

    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h2 class="text-h4 font-weight-bold">Inventory Dashboard</h2>
        <p class="text-body-2 text-grey">Overview of item, acquisition, and tag activity</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-refresh" @click="fetchDashboard">
        Refresh
      </v-btn>
    </div>

    

    <v-row>
      <!-- 📦 Total Items -->
      <v-col cols="12" sm="6" md="3">
        <!-- <v-card class="pa-4 d-flex align-center" elevation="0">
          <v-icon size="36" color="primary" class="me-3">mdi-package-variant</v-icon>
          <div>
            <div class="text-h6 font-weight-bold">{{ totalItems }}</div>
            <div class="text-caption text-grey">Total Items</div>
          </div>
        </v-card> -->
        
        <v-card class="pa-5 d-flex align-center" elevation="0">
          <v-row no-gutters align="center">
            <v-col>
              <div class="text-caption text-grey">
                <strong>Total Items</strong>
              </div>
              <div class="font-weight-medium text-h4">
                <strong><span >
                    {{ totalItems }}
                  </span></strong>
              </div>
            </v-col>
            <v-col cols="auto" class="ml-10">
                <v-icon color="red" size="66">mdi-package-variant</v-icon>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <!-- 🏷️ Total Tags -->
      <v-col cols="12" sm="6" md="3">
        <!-- <v-card class="pa-4 d-flex align-center" elevation="0">
          <v-icon size="36" color="success" class="me-3">mdi-tag-multiple</v-icon>
          <div>
            <div class="text-h6 font-weight-bold">{{ totalTags }}</div>
            <div class="text-caption text-grey">Total Tags</div>
          </div>
        </v-card> -->

        <v-card class="pa-5 d-flex align-center" elevation="0">
          <v-row no-gutters align="center">
            <v-col>
              <div class="text-caption text-grey">
                <strong>Total Tags</strong>
              </div>
              <div class="font-weight-medium text-h4">
                <strong><span >
                    {{ totalTags }}
                  </span></strong>
              </div>
            </v-col>
            <v-col cols="auto" class="ml-10">
                <v-icon color="success" size="66">mdi-tag-multiple</v-icon>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <!-- 👤 Total Acquired -->
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4 d-flex align-center" elevation="0">
          <v-icon size="36" color="info" class="me-3">mdi-account-check</v-icon>
          <div>
            <div class="text-h6 font-weight-bold">{{ totalAcquired }}</div>
            <div class="text-caption text-grey">Total Acquired</div>
          </div>
        </v-card>
      </v-col>

      <!-- 🧭 Departments -->
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4 d-flex align-center" elevation="0">
          <v-icon size="36" color="deep-purple" class="me-3">mdi-office-building</v-icon>
          <div>
            <div class="text-h6 font-weight-bold">{{ totalDepartments }}</div>
            <div class="text-caption text-grey">Departments</div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 📊 Acquisition Summary Table -->
    <v-card class="mt-8 pa-4" elevation="0">
      <v-card-title class="text-h6 font-weight-bold">
        Acquisition Summary
      </v-card-title>
      <v-data-table :headers="headers" :items="acquisitionSummary" density="compact" class="mt-2">
        <template v-slot:[`item.totalAcquired`]="{ item}">
          <v-chip color="primary" variant="flat" size="small">
            {{ item.totalAcquired }}
          </v-chip>
        </template>
      </v-data-table>
    </v-card>

  </div>
</template>

<script setup>
definePageMeta({
  requiredRole: ['custodian', 'staff'],

});
useHead({
  title: "Dashboard",
});

const baseUrl = useRuntimeConfig().public.strapiBaseURL
const token = useCookie('token')

const drawer = useState('drawer') // shared state from layout

const cards = ref([
  { title: 'Total Items', count: 0, icon: 'mdi-package-variant', color: 'indigo' },
  { title: 'Categories', count: 0, icon: 'mdi-shape', color: 'blue' },
  { title: 'Departments', count: 0, icon: 'mdi-domain', color: 'cyan' },
  { title: 'Suppliers', count: 0, icon: 'mdi-truck', color: 'green' },
  { title: 'Maintenance Requests', count: 0, icon: 'mdi-tools', color: 'orange' },
  { title: 'Low Stock Items', count: 0, icon: 'mdi-alert-circle', color: 'red' }
])

// onMounted(async () => {
//   const [items, categories, departments, suppliers, maintenance] = await Promise.all([
//     $fetch('http://localhost:1337/api/items?pagination[limit]=0'),
//     $fetch('http://localhost:1337/api/categories?pagination[limit]=0'),
//     $fetch('http://localhost:1337/api/departments?pagination[limit]=0'),
//     $fetch('http://localhost:1337/api/suppliers?pagination[limit]=0'),
//     $fetch('http://localhost:1337/api/maintenance-logs?filters[status][$eq]=pending')
//   ])

//   cards.value[0].count = items.meta.pagination.total
//   cards.value[1].count = categories.meta.pagination.total
//   cards.value[2].count = departments.meta.pagination.total
//   cards.value[3].count = suppliers.meta.pagination.total
//   cards.value[4].count = maintenance.data.length

//   // Low stock (e.g., items with quantity < 5)
//   const lowStock = items.data.filter(item => item.attributes.quantity < 5)
//   cards.value[5].count = lowStock.length
// })

// 📦 Dashboard stats
const totalItems = ref(0)
const totalTags = ref(0)
const totalAcquired = ref(0)
const totalDepartments = ref(0)
const acquisitionSummary = ref([])

const headers = [
  { title: 'Item Name', key: 'itemName' },
  { title: 'Department', key: 'department' },
  { title: 'Total Acquired', key: 'totalAcquired' }
]

// ✅ Fetch dashboard data
onMounted(async () => {
  try {
    // Get all items
    const itemsRes = await $fetch(`${baseUrl}/api/items`, {
      headers: { Authorization: `Bearer ${token.value}` },
      params: {
        'populate[0]': 'department',
        'populate[1]': 'tags',
        'populate[2]': 'acquisitions'
      }
    })

    const items = itemsRes.data || []

    totalItems.value = items.length
    totalTags.value = items.reduce((sum, item) => sum + (item.tags?.length || 0), 0)
    totalAcquired.value = items.reduce((sum, item) => sum + (item.acquisitions?.length || 0), 0)

    const departments = new Set(items.map(i => i.department?.name))
    totalDepartments.value = departments.size

    acquisitionSummary.value = items.map(item => ({
      itemName: item.name,
      department: item.department?.name || '—',
      totalAcquired: item.acquisitions?.length || 0
    }))
  } catch (err) {
    console.error('Dashboard fetch error:', err)
  }
})

</script>

<style scoped>
.v-card {
  border-radius: 12px;
  transition: all 0.2s ease;
}

.v-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}
</style>
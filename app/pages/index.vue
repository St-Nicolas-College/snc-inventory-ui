<template>
  <v-container fluid class="min-h-screen">
    <!-- ✅ Dashboard Header -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h2 class="text-h4 font-weight-bold"> 
          <v-btn variant="plain" icon @click="drawer = !drawer">
            <v-icon size="35">mdi-menu</v-icon>
          </v-btn> Dashboard</h2>
        <p class="text-body-2 text-grey">Overview of item, acquisition, and tag activity</p>
      </div>

    </div>

    <!-- 🧭 Metric Cards -->
    <v-row>
      <v-col v-for="metric in metrics" :key="metric.label" cols="12" sm="6" md="3">
        <v-card class="pa-4 dashboard-card" elevation="0">
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-caption text-grey">{{ metric.label }}</div>
              <div class="text-h4 font-weight-bold mt-1">{{ metric.value }}</div>
            </div>
            <v-avatar size="48" :color="metric.color" class="elevation-0">
              <v-icon size="28" color="white">{{ metric.icon }}</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 📊 Charts + Tables -->
    <v-row>
      <!-- 📈 Acquisition Trend Chart -->
      <v-col cols="12" md="8">
        <v-card elevation="0" class="pa-4 dashboard-card">
          <v-card-title class="text-h6 font-weight-bold">
            Acquisition Trends
          </v-card-title>
          <div style="height: 350px; width: 100%;">
            <canvas id="acquisitionChart"></canvas>
          </div>
        </v-card>
      </v-col>

      <!-- 🏢 Department Distribution -->
      <v-col cols="12" md="4">
        <v-card elevation="0" class="pa-4 dashboard-card">
          <v-card-title class="text-h6 font-weight-bold">
            Department Breakdown
          </v-card-title>
          <div style="height: 350px; width: 100%;">
            <canvas id="departmentChart"></canvas>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 📋 Table: Acquisition Summary -->
    <v-card class="mt-8 pa-4 dashboard-card" elevation="0">
      <v-card-title class="text-h6 font-weight-bold">
        Acquisition Summary
      </v-card-title>
      <v-divider></v-divider>
      <v-data-table :headers="headers" :items="acquisitionSummary" density="compact">
        <template v-slot:[`item.totalAcquired`]='{ item }'>
          <v-chip color="primary" variant="flat" size="small">
            {{ item.totalAcquired }}
          </v-chip>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup>
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const baseUrl = useRuntimeConfig().public.strapiBaseURL
const token = useCookie('token')

const drawer = useState('drawer') // shared state from layout

// 📊 Data sources
const metrics = ref([])
const acquisitionSummary = ref([])

const headers = [
  { title: 'Item Name', key: 'itemName', sortable: false },
  { title: 'Department', key: 'department', sortable: false },
  { title: 'Total Acquired', key: 'totalAcquired', align: 'center', sortable: false }
]

// ✅ Fetch and render dashboard
async function fetchDashboard() {
  try {
    const itemsRes = await $fetch(`${baseUrl}/api/items`, {
      headers: { Authorization: `Bearer ${token.value}` },
      params: {
        'populate[0]': 'department',
        'populate[1]': 'tags',
        'populate[2]': 'acquisitions'
      }
    })

    const items = itemsRes.data || []

    const totalItems = items.length
    const totalTags = items.reduce((sum, i) => sum + (i.item_tags?.length || 0), 0)
    const totalAcquired = items.reduce((sum, i) => sum + (i.acquisitions?.length || 0), 0)

    const departments = [...new Set(items.map(i => i.department?.data?.name))].filter(Boolean)
    const totalDepartments = departments.length

    metrics.value = [
      { label: 'Total Items', value: totalItems, icon: 'mdi-package-variant', color: 'blue' },
      { label: 'Total Tags', value: totalTags, icon: 'mdi-tag-multiple', color: 'orange' },
      { label: 'Total Acquired', value: totalAcquired, icon: 'mdi-account-check', color: 'success' },
      { label: 'Departments', value: totalDepartments, icon: 'mdi-office-building', color: 'deep-purple' }
    ]

    acquisitionSummary.value = items.map(item => ({
      itemName: item.name,
      department: item.department?.name || '—',
      totalAcquired: item.acquisitions?.length || 0
    }))

    await nextTick()
    renderCharts(items)
  } catch (err) {
    console.error('Dashboard error:', err)
  }
}

// 📊 Render charts
function renderCharts(items) {
  // Acquisition Trend (by item)
  const ctx1 = document.getElementById('acquisitionChart')
  const itemNames = items.map(i => i.name)
  const acquiredCounts = items.map(i => i.acquisitions?.length || 0)

  new Chart(ctx1, {
    type: 'bar',
    data: {
      labels: itemNames,
      datasets: [
        {
          label: 'Total Acquired',
          data: acquiredCounts,
          backgroundColor: '#3f51b5'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } },
      maintainAspectRatio: false
    }
  })

  // Department Distribution
  const ctx2 = document.getElementById('departmentChart')
  const departmentNames = [...new Set(items.map(i => i.department?.name || '—'))]
  const departmentCounts = departmentNames.map(
    name => items.filter(i => i.department?.name === name).length
  )

  new Chart(ctx2, {
    type: 'doughnut',
    data: {
      labels: departmentNames,
      datasets: [
        {
          data: departmentCounts,
          backgroundColor: ['#3f51b5', '#009688', '#ff9800', '#9c27b0', '#2196f3']
        }
      ]
    },
    options: {
      plugins: { legend: { position: 'bottom' } },
      maintainAspectRatio: false
    }
  })
}

onMounted(fetchDashboard)
</script>

<style scoped>
.dashboard-card {
  border-radius: 16px;
  background: white;
  transition: all 0.2s ease;
}

.dashboard-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
}

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
}
</style>

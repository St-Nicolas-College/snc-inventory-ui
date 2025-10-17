<template>
  <v-container fluid class="pa-6 bg-grey-lighten-4">
    <v-row>
      <!-- Header -->

      <v-col cols="12" class="d-flex justify-space-between align-center">
        <div>
          <h2 class="text-h5 font-weight-bold mb-1">📊 Item Reports</h2>
          <p class="text-body-2 text-grey">View and export reports grouped by category, location, or department.</p>
        </div>

        <div class="d-flex">
          <v-select
            v-model="groupBy"
            :items="[
              { title: 'Group by Category', value: 'category' },
              { title: 'Group by Location', value: 'location' },
              { title: 'Group by Department', value: 'department' }
            ]"
            variant="outlined"
            density="compact"
            label="Group Items"
            style="max-width: 220px"
            class="mr-4"
          />

          <v-btn
            color="primary"
            prepend-icon="mdi-file-multiple"
            variant="elevated"
            @click="downloadAllReports"
          >
            Download All Reports
          </v-btn>
        </div>
      </v-col>

      <!-- Grouped Tables -->
      <v-col v-for="(group, key) in groupedItems" :key="key" cols="12">
        <v-card class="mb-2 elevation-0">
          <v-card-title class="d-flex justify-space-between align-center">
            <div class="d-flex align-center">
              <v-icon start>{{ getGroupIcon(groupBy) }}</v-icon>
              <span>{{ key || 'Unassigned' }}</span>
            </div>
            <div class="d-flex align-center">
              <span class="text-caption mr-4">Total: {{ group.length }}</span>
              <v-btn
                color="primary"
                variant="outlined"
                size="small"
                prepend-icon="mdi-file-download"
                @click="downloadGroupReport(key, group)"
              >
                Download
              </v-btn>
            </div>
          </v-card-title>

          <v-data-table
            :headers="headers"
            :items="group"
            density="comfortable"
            class="border-t"
            :loading="loading"
            loading-text="Loading items..."
          >
            <template  v-slot:[`item.status`]="{ item }">
              <v-chip
                :color="item.status === 'retired' ? 'red' : 'green'"
                small
                label
              >
                {{ item.status }}
              </v-chip>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const config = useRuntimeConfig()
const baseUrl = config.public.strapiBaseURL
const token = useCookie('token')

const groupBy = ref('category')
const items = ref([])
const loading = ref(false)

const headers = [
  { title: 'Item Name', key: 'name' },
  { title: 'Description', key: 'description' },
  { title: 'Quantity', key: 'quantity' },
  { title: 'Status', key: 'status' },
  { title: 'Category', key: 'category' },
  { title: 'Location', key: 'location' },
  { title: 'Department', key: 'department' },
]

/** Fetch items with related data */
const fetchItems = async () => {
  loading.value = true
  try {
    const res = await $fetch(`${baseUrl}/api/items`, {
      headers: { Authorization: `Bearer ${token.value}` },
      params: {
        // populate: 'category,location,department',
        'populate[0]': 'category',
        'populate[1]': 'department',
        'populate[2]': 'location',
        sort: 'createdAt:asc',
      },
    })

    items.value = res.data.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      quantity: item.quantity || 0,
      status: item.status || 'active',
      category: item.category?.name || 'Uncategorized',
      location: item.location?.name || 'Unassigned',
      department: item.department?.name || 'No Department',
    }))
  } catch (err) {
    console.error('Error fetching items:', err)
  } finally {
    loading.value = false
  }
}

/** Group items dynamically */
const groupedItems = computed(() => {
  const groups = {}
  items.value.forEach((item) => {
    let key = ''
    if (groupBy.value === 'category') key = item.category
    else if (groupBy.value === 'location') key = item.location
    else if (groupBy.value === 'department') key = item.department

    if (!groups[key]) groups[key] = []
    groups[key].push(item)
  })
  return groups
})

/** Group icon per type */
const getGroupIcon = (type) => {
  switch (type) {
    case 'category':
      return 'mdi-shape'
    case 'location':
      return 'mdi-map-marker'
    case 'department':
      return 'mdi-office-building'
    default:
      return 'mdi-folder'
  }
}

/** Generate PDF for each group */
// const downloadGroupReport = (groupName, groupData) => {
//   const doc = new jsPDF()
//   const title = `Item Report - ${groupBy.value.toUpperCase()}: ${groupName}`
//   const date = new Date().toLocaleString()

//   doc.setFontSize(14)
//   doc.text(title, 14, 15)
//   doc.setFontSize(10)
//   doc.text(`Generated on: ${date}`, 14, 22)

//   const tableData = groupData.map((item) => [
//     item.name,
//     item.description || '-',
//     item.quantity,
//     item.status,
//     item.category,
//     item.location,
//     item.department,
//   ])

//   autoTable(doc, {
//     startY: 28,
//     head: [['Name', 'Description', 'Quantity', 'Status', 'Category', 'Location', 'Department']],
//     body: tableData,
//     theme: 'striped',
//     styles: { fontSize: 9 },
//     headStyles: { fillColor: [25, 118, 210] }, // blue header
//   })

//   doc.save(`${groupBy.value}_${groupName}_report.pdf`)
// }

/** Download one group's PDF */
const downloadGroupReport = (groupName, groupData, doc = null, startY = 20) => {
  const localDoc = doc || new jsPDF()
  const title = `Item Report - ${groupBy.value.toUpperCase()}: ${groupName}`
  const date = new Date().toLocaleString()

  localDoc.setFontSize(14)
  localDoc.text(title, 14, startY)
  localDoc.setFontSize(10)
  localDoc.text(`Generated on: ${date}`, 14, startY + 7)

  const tableData = groupData.map((item) => [
    item.name,
    item.description || '-',
    item.quantity,
    item.status,
    item.category,
    item.location,
    item.department,
  ])

  autoTable(localDoc, {
    startY: startY + 13,
    head: [['Name', 'Description', 'Qty', 'Status', 'Category', 'Location', 'Department']],
    body: tableData,
    theme: 'striped',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [25, 118, 210] },
  })

  if (!doc) localDoc.save(`${groupBy.value}_${groupName}_report.pdf`)
  return localDoc
}

/** Download all groups merged into one PDF */
const downloadAllReports = () => {
  const doc = new jsPDF()
  let first = true

  Object.entries(groupedItems.value).forEach(([groupName, groupData]) => {
    if (!first) doc.addPage()
    downloadGroupReport(groupName, groupData, doc, 20)
    first = false
  })

  doc.save(`All_Item_Reports_Grouped_by_${groupBy.value}.pdf`)
}

onMounted(fetchItems)
</script>

<style scoped>
.v-card-title {
  font-weight: 600;
  letter-spacing: 0.5px;
}
.v-data-table {
  border-radius: 0;
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

<template>
  <div>
    <v-btn variant="plain" icon @click="drawer = !drawer">
      <v-icon>mdi-menu</v-icon>
    </v-btn>
    <h2 class="mb-4 font-bold text-xl">Dashboard</h2>
    <v-row dense>
      <v-col
        v-for="card in cards"
        :key="card.title"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card :color="card.color" dark class="rounded-xl elevation-3">
          <v-card-title>
            <v-icon size="28" class="mr-2">{{ card.icon }}</v-icon>
            {{ card.title }}
          </v-card-title>
          <v-card-text class="text-3xl font-bold">
            {{ card.count }}
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
definePageMeta({
  requiredRole: ['custodian', 'staff'],

});
useHead({
  title: "Dashboard",
});

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
</script>

<style>

</style>
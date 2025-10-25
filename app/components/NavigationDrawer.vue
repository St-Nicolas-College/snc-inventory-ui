<template>
  <div>
    <v-navigation-drawer app class="py-2" v-model="drawer">
      <div class="d-flex align-center justify-center pb-3">
        <v-img src="/SNC-Logo.png" max-height="60" contain></v-img>
      </div>
      <!-- <v-list-item>
        <v-list-item-title>{{
          userStore.user?.username || "Guest"
        }}</v-list-item-title>
        <v-list-item-subtitle class="text-xs text-gray-300">
          {{ userStore.role }}
        </v-list-item-subtitle>
      </v-list-item> -->
      <v-divider></v-divider>
      <v-list density="compact" nav>
        <v-list-item
          v-for="link in visibleLinks"
          :key="link.title"
          :to="link.to"
          :prepend-icon="link.icon"
          :title="link.title"
          class="mb-2"
          active-class="v-list-item--active-custom"
        >
          <!-- <v-list-item-icon>
            <v-icon>{{ link.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-title>{{ link.title }}</v-list-item-title> -->
        </v-list-item>
        <!-- <v-list-item
          prepend-icon="mdi-view-dashboard"
          title="Dashboard"
          value="dashboard"
          :to="'/'"
          class="mb-2"
          active-class="v-list-item--active-custom"
        >
          <template v-slot:append v-if="drawer">
            <v-chip size="x-small" class="font-weight-bold">New</v-chip>
          </template>
        </v-list-item>

        <v-list-item
          prepend-icon="mdi-archive"
          title="Inventory"
          value="inventory"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-shape-outline"
          title="Categories"
          value="categoryu"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-map-marker"
          title="Locations"
          value="location"
        >
          <template v-slot:append v-if="drawer">
            <v-chip size="x-small" color="success" class="font-weight-bold"
              >3</v-chip
            >
          </template>
        </v-list-item>
        <v-list-item
          prepend-icon="mdi-domain"
          title="Departments"
          value="app-department"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-truck"
          title="Suppliers"
          value="supplier"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-transfer"
          title="Transactions"
          value="transaction"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-tools"
          title="Maintenance"
          value="maintenance"
        ></v-list-item>
         <v-list-item
          prepend-icon="mdi-file-chart"
          title="Reports"
          value="report"
        ></v-list-item> -->

        <!-- <v-divider class="my-4" v-if="drawer"></v-divider>
        <v-list-item v-else><v-icon>mdi-dots-horizontal</v-icon></v-list-item>

        <v-list-subheader class="text-uppercase mt-4 mb-2" v-if="drawer"
          >Apps</v-list-subheader
        >
        <v-list-item v-else>
          <v-icon>mdi-view-grid</v-icon>
        </v-list-item>

        <v-list-item
          prepend-icon="mdi-account-box"
          title="Locations"
          value="location"
        >
          <template v-slot:append v-if="drawer">
            <v-chip size="x-small" color="success" class="font-weight-bold"
              >3</v-chip
            >
          </template>
        </v-list-item> -->
      </v-list>

      <template v-slot:append v-if="drawer">
        <v-divider></v-divider>
        <v-card class="mx-3 pa-2" color="transparent" flat>
          <v-row align="center" dense="compact">
            <v-col cols="auto">
              <v-avatar size="40" color="purple">
                <!-- <v-img src="https://avatars.githubusercontent.com/u/9064066?v=4"></v-img> -->
                <!-- <v-icon>mdi-account</v-icon> -->
                <span>{{ userInitial }}</span>
              </v-avatar>
            </v-col>
            <v-col class="py-0">
              <div class="font-weight-medium text-body-2">
                {{ user.first_name }} {{ user.last_name }}
              </div>
              <!-- <div class="font-weight-medium">{{ user }}</div> -->
              <div class="text-caption text-grey">{{ user.position }}</div>
              <div class="text-caption text-grey">{{ user.department?.name }} Department</div>
            </v-col>
            <v-col cols="12">
              <v-btn
                color="red-darken-3"
                variant="tonal"
                block
                size="small"
                @click="handleLogout()"
              >
                <v-icon>mdi-power</v-icon>
              </v-btn>
            </v-col>
            <!-- <v-col class="d-flex align-center justify-center">
             <small>Version {{ version }}</small>
            </v-col> -->
          </v-row>
        </v-card>
      </template>
      <template v-slot:append v-else>
        <v-btn icon flat size="small" class="mx-auto mb-3">
          <v-icon>mdi-account</v-icon>
        </v-btn>
      </template>
    </v-navigation-drawer>

    <v-app-bar v-if="!hideAppBar" app flat class="border-b">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title class="d-none d-sm-flex align-center">
        <span class="font-weight-bold mr-2">SNC Inventory System</span>
        <!-- <v-chip color="primary" size="small" variant="elevated">New</v-chip> -->
      </v-toolbar-title>
      <v-spacer></v-spacer>

      <v-btn icon class="ml-2" @click="toggleTheme">
        <!-- <v-icon>mdi-theme-light-dark</v-icon> -->
        <v-icon>{{
          theme.global.name.value === "dark"
            ? "mdi-weather-sunny"
            : "mdi-weather-night"
        }}</v-icon>
      </v-btn>
      <v-btn icon class="ml-2">
        <v-icon>mdi-cog</v-icon>
      </v-btn>

      <!-- <v-btn icon class="ml-2">
        <v-icon>mdi-magnify</v-icon>
      </v-btn>
      <v-menu offset-y>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props" class="ml-2">
            <v-icon>mdi-bell-outline</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item>
            <v-list-item-title>No new notifications</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu> -->

      <!-- <v-menu offset-y>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props" class="ml-2">
            <v-icon>mdi-web</v-icon> </v-btn>
        </template>
        <v-list>
          <v-list-item v-for="(item, index) in ['English', 'Spanish', 'French']" :key="index">
            <v-list-item-title>{{ item }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu> -->

      <v-menu offset-y>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props" class="ml-2" color="purple">
            <v-avatar size="38" color="purple">
              <span>{{ userInitial }}</span>
              <!-- <v-img
                src="https://avatars.githubusercontent.com/u/9064066?v=4"
              ></v-img> -->
            </v-avatar>
          </v-btn>
        </template>
        <v-list>
          <v-list-item>
            <v-list-item-title>Profile</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>Settings</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
  </div>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { useMyAuthStore } from "~/stores/auth";
import { useTheme } from "vuetify"; // Import useTheme composable
import { useDisplay } from "vuetify/lib/composables/display.mjs";
const theme = useTheme();
const router = useRouter();
const { logUserOut } = useMyAuthStore();
const { authenticated } = storeToRefs(useMyAuthStore());
const { user } = storeToRefs(useMyAuthStore());
const userStore = useMyAuthStore();

const userInitial = ref(
  user.value.first_name.substring(0, 1) + user.value.last_name.substring(0, 1)
);

//Major: Breaking changes
//Minor: New Features, backward compatible
//Patch: Bug fixes only
const version = ref("1.11.1") //Major.Minor.Patch

//const drawer = ref(true); // Initialize as true so it's open by default
const drawer = useState('drawer', () => true)
const display = useDisplay()
const route = useRoute()

const links = [
  {
    title: "Dashboard",
    to: "/",
    icon: "mdi-view-dashboard",
    roles: ["custodian", "staff"],
  },
  {
    title: "Inventory",
    to: "/inventory",
    icon: "mdi-archive",
    roles: ["custodian", "staff"],
  },
  {
    title: "Categories",
    to: "/categories",
    icon: "mdi-shape-outline",
    roles: ["custodian"],
  },
  {
    title: "Departments",
    to: "/departments",
    icon: "mdi-domain",
    roles: ["custodian"],
  },
  { title: "Suppliers", to: "/suppliers", icon: "mdi-truck", roles: ["custodian"] },
    {
    title: "Locations",
    to: "/locations",
    icon: "mdi-map-marker",
    roles: ["custodian"],
  },
  {
    title: "Transactions",
    to: "/transactions",
    icon: "mdi-transfer",
    roles: ["custodian", "staff"],
  },
  {
    title: "Maintenance",
    to: "/maintenance",
    icon: "mdi-tools",
    roles: ["custodian", "staff"],
  },
  {
    title: "Reports",
    to: "/reports",
    icon: "mdi-file-chart",
    roles: ["custodian"],
  },
  // { title: 'Settings', to: '/settings', icon: 'mdi-cog', roles: ['admin'] },
  // { title: 'Login', to: '/login', icon: 'mdi-login', roles: ['guest'] }
];

const blogLinks = [
  ["Posts", "mdi-newspaper"],
  ["Details", "mdi-text-box-outline"],
];

const handleLogout = () => {
  logUserOut();
  //router.push("/auth/login")
  window.location.href = "/auth/login";
};

// Function to toggle between dark and light themes
function toggleTheme() {
  theme.global.name.value =
    theme.global.name.value === "light" ? "dark" : "light";
}

const visibleLinks = computed(() => {
  return links.filter((link) => link.roles.includes(userStore.role));
});


// Hide AppBar
const hideAppBar = computed(() => route.path === '/')

</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");
body {
  font-family: "Inter", sans-serif;
}
/* Custom active class for the sidebar item to match the image's style */
/* .v-list-item--active-custom {
  background-color: #4CAF50;
  color: #FFFFFF; 
  border-radius: 8px;
} */

.v-list-item--active-custom {
  color: #4caf50;
  border-radius: 8px;
}

/* .v-navigation-drawer {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05) !important; 
} */
</style>

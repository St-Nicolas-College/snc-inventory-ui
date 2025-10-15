<template>
  <v-app>
    <v-navigation-drawer app class="py-2" v-model="drawer">
      <div class="d-flex align-center justify-center pb-5">
        <v-img src="/SNC-Logo.png" max-height="60" contain></v-img>
      </div>
      <v-divider></v-divider>
      <v-list density="compact" nav>
        <v-list-item
          prepend-icon="mdi-view-dashboard"
          title="Dashboard"
          value="dashboard"
          :to="'/'"
          class="mb-2"
          active-class="v-list-item--active-custom"
        >
        </v-list-item>

        <!-- <v-list-item
          prepend-icon="mdi-file-document-outline"
          title="Front Pages"
          value="frotnpages"
        ></v-list-item> -->
        <v-divider class="my-4" v-if="drawer"></v-divider>
        <v-list-item v-else><v-icon>mdi-dots-horizontal</v-icon></v-list-item>

        <!-- <v-list-subheader class="text-uppercase mt-4 mb-2" v-if="drawer"
          >Apps</v-list-subheader
        >
        <v-list-item v-else>
          <v-icon>mdi-view-grid</v-icon>
        </v-list-item> -->

        <v-list-item
          prepend-icon="mdi-account-circle"
          title="Users"
          value="users"
          to="/admin/users"
          active-class="v-list-item--active-custom"
          :active="$route.path.startsWith('/admin/users')"
        ></v-list-item>

        <!-- <v-list-item
          prepend-icon="mdi-account-box"
          title="Contact"
          value="contact"
        >
          <template v-slot:append v-if="drawer">
            <v-chip size="x-small" color="success" class="font-weight-bold"
              >3</v-chip
            >
          </template>
        </v-list-item> -->

        <v-list-group value="settings">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" prepend-icon="mdi-post" title="Settings"></v-list-item>
          </template>
          <v-list-item
            v-for="([title, link, icon], i) in blogLinks"
            :key="i"
            :value="title"
            :title="title"
            :link="link"
            :prepend-icon="icon"
            :to="`/settings/${title.toLowerCase().replace(' ', '-')}`"
          ></v-list-item>
        </v-list-group>

       
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
          </v-row>
        </v-card>
      </template>
      <template v-slot:append v-else>
        <v-btn icon flat size="small" class="mx-auto mb-3">
          <v-icon>mdi-account</v-icon>
        </v-btn>
      </template>
    </v-navigation-drawer>

    <v-app-bar app flat class="border-b">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title class="d-none d-sm-flex align-center">
        <span class="font-weight-bold mr-2">SNC Inventory System (Admin)</span>
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
      </v-menu>

      <v-menu offset-y>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props" class="ml-2">
            <v-avatar size="40" color="purple">
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

    <v-main>
      <v-container fluid class="pa-6"> <slot /> </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { useMyAuthStore } from "~/stores/auth";
import { useTheme } from "vuetify";
useHead({
  title: 'Admin',

})
const theme = useTheme();
theme.global.name.value = "light";
const { logUserOut } = useMyAuthStore();
const { authenticated } = storeToRefs(useMyAuthStore());
const { user } = storeToRefs(useMyAuthStore());
const userInitial = ref(
  user.value.first_name.substring(0, 1) + user.value.last_name.substring(0, 1)
);

const blogLinks = [
  ["Posts", "post", "mdi-newspaper"],
  ["Details Page", "detail", "mdi-text-box-outline"],
];
const drawer = ref(true); // Initialize as true so it's open by default

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
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");
body {
  font-family: "Inter", sans-serif;
}

.v-list-item--active-custom {
  color: #4caf50;
  border-radius: 8px;
}
</style>

<template>
  <v-navigation-drawer
    app
    dark
    :mini-variant.sync="mini"
    permanent
    :disable-route-watcher="true"
    :clipped="true"
  >
    <v-toolbar flat class="ma-0 pa-0">
      <v-app-bar-nav-icon @click.stop="mini = !mini" style="margin-left: -16px">
        <v-icon v-if="!mini">mdi-close</v-icon>
        <v-icon v-else>mdi-menu</v-icon>
      </v-app-bar-nav-icon>
      <v-toolbar-title class="text-body-1">What's up Docker?</v-toolbar-title>
    </v-toolbar>
    <v-list nav class="pt-0 pb-0">
      <v-fade-transition group hide-on-leave mode="in-out">
        <v-list-item to="/" key="home" class="mb-0">
          <v-list-item-icon>
            <v-icon>mdi-home</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Home</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item to="/containers" key="containers" class="mb-0">
          <v-list-item-icon>
            <v-icon>{{ containerIcon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Containers</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item key="divider" class="mb-0" dense>
          <v-divider />
        </v-list-item>

        <v-list-group
          v-if="!mini"
          no-action
          prepend-icon="mdi-cogs"
          key="configuration"
          color="white"
        >
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>Configuration</v-list-item-title>
            </v-list-item-content>
          </template>
          <div></div>
          <v-list-item
            dense
            v-for="configurationItem in configurationItemsSorted"
            :key="configurationItem.to"
            :to="configurationItem.to"
            class="mb-0 pl-8"
          >
            <v-list-item-icon>
              <v-icon>{{ configurationItem.icon }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title class="text-capitalize"
                >{{ configurationItem.name }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-group>
        <v-list-item
          v-else
          v-for="configurationItem in configurationItemsSorted"
          :key="configurationItem.to"
          :to="configurationItem.to"
          class="mb-0"
        >
          <v-list-item-icon>
            <v-icon>{{ configurationItem.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title class="text-capitalize"
              >{{ configurationItem.name }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-fade-transition>
    </v-list>

    <template v-slot:append v-if="!mini">
      <v-list>
        <v-list-item class="ml-2 mb-2">
          <v-switch
            dark
            hide-details
            inset
            label="Dark mode"
            v-model="darkMode"
            @change="toggleDarkMode"
          >
            <template v-slot:label>
              <v-icon>mdi-weather-night</v-icon>
            </template>
          </v-switch>
        </v-list-item>
      </v-list>
      <div></div>
    </template>
  </v-navigation-drawer>
</template>

<script>
import { getContainerIcon } from "@/services/container";
import { getRegistryIcon } from "@/services/registry";
import { getTriggerIcon } from "@/services/trigger";
import { getServerIcon } from "@/services/server";
import { getWatcherIcon } from "@/services/watcher";
import { getAuthenticationIcon } from "@/services/authentication";
import logo from "@/assets/wud_logo_white.png";

export default {
  data: () => ({
    logo,
    mini: true,
    darkMode: localStorage.darkMode === "true",
    containerIcon: getContainerIcon(),
    configurationItems: [
      {
        to: "/configuration/authentications",
        name: "auth",
        icon: getAuthenticationIcon(),
      },
      {
        to: "/configuration/registries",
        name: "registries",
        icon: getRegistryIcon(),
      },
      {
        to: "/configuration/triggers",
        name: "triggers",
        icon: getTriggerIcon(),
      },
      {
        to: "/configuration/watchers",
        name: "watchers",
        icon: getWatcherIcon(),
      },
      {
        to: "/configuration/server",
        name: "server",
        icon: getServerIcon(),
      },
    ],
  }),

  computed: {
    configurationItemsSorted() {
      return [...this.configurationItems].sort((item1, item2) =>
        item1.name.localeCompare(item2.name)
      );
    },
  },

  methods: {
    toggleDarkMode: function () {
      localStorage.darkMode = this.darkMode;
      this.setDarkMode(this.darkMode);
    },
    setDarkMode(darkMode) {
      this.$vuetify.theme.dark = darkMode;
    },
  },

  beforeMount() {
    this.setDarkMode(this.darkMode);
  },
};
</script>

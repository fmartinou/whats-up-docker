<template>
  <v-navigation-drawer
    app
    :mini-variant="mini"
    :mini-variant-width="70"
    permanent
    :disable-route-watcher="true"
    color="primary"
    dark
    :clipped="true"
  >
    <v-toolbar flat color="primary" dark class="ml-1">
      <v-app-bar-nav-icon @click.stop="mini = !mini"></v-app-bar-nav-icon>
      <v-toolbar-title class="font-weight-bold"
        >What's up Docker?</v-toolbar-title
      >
    </v-toolbar>
    <v-list nav>
      <v-fade-transition group hide-on-leave mode="in-out">
        <v-list-item v-if="!mini" key="logo">
          <v-img :src="logo" alt="logo" max-width="200px" />
        </v-list-item>
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

        <v-list-item key="divider" class="mb-0">
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
          <v-list-item
            v-for="configurationItem in configurationItemsSorted"
            :key="configurationItem.to"
            :to="configurationItem.to"
            class="mb-0"
          >
            <v-list-item-icon>
              <v-icon v-text="configurationItem.icon" />
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
            <v-icon v-text="configurationItem.icon" />
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title class="text-capitalize"
              >{{ configurationItem.name }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-fade-transition>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { getContainerIcon } from "@/services/container";
import { getLogIcon } from "@/services/log";
import { getRegistryIcon } from "@/services/registry";
import { getTriggerIcon } from "@/services/trigger";
import { getStoreIcon } from "@/services/store";
import { getWatcherIcon } from "@/services/watcher";
import { getAuthenticationIcon } from "@/services/authentication";
import logo from "@/assets/wud_logo_white.png";

export default {
  data: () => ({
    logo,
    mini: true,
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
        to: "/configuration/logs",
        name: "logs",
        icon: getLogIcon(),
      },
      {
        to: "/configuration/state",
        name: "state",
        icon: getStoreIcon(),
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
};
</script>

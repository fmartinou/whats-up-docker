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
    <v-toolbar flat color="primary" dark class="ml-1 pa-0">
      <v-app-bar-nav-icon @click.stop="mini = !mini">
        <v-icon v-if="!mini">mdi-close</v-icon>
        <v-icon v-else>mdi-menu</v-icon>
      </v-app-bar-nav-icon>
      <v-toolbar-title class="font-weight-bold text-body-1"
        >What's up Docker?</v-toolbar-title
      >
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
          <v-list-item
            dense
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
};
</script>

<template>
  <v-card>
    <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          v-bind="attrs"
          v-on="on"
          fab
          absolute
          top
          right
          small
          color="primary"
          @click.stop="refreshAllContainers"
          :loading="isRefreshing"
        >
          <v-icon> mdi-refresh</v-icon>
        </v-btn>
      </template>
      <span>Refresh all</span>
    </v-tooltip>
    <v-card-subtitle class="text-h6 font-weight-bold">Filters</v-card-subtitle>
    <v-card-text>
      <v-row>
        <v-col xs="12" sm="12" md="4" lg="3" xl="3">
          <v-select
            :hide-details="true"
            v-model="registrySelected"
            :items="registries"
            @change="emitRegistryChanged"
            :clearable="true"
            label="Registry"
            outlined
          ></v-select>
        </v-col>
        <v-col xs="12" sm="12" md="4" lg="3" xl="3">
          <v-select
            :hide-details="true"
            v-model="watcherSelected"
            :items="watchers"
            @change="emitWatcherChanged"
            :clearable="true"
            label="Watcher"
            outlined
          ></v-select>
        </v-col>
        <v-col xs="12" sm="12" md="4" lg="3" xl="3">
          <v-switch
            label="Update available"
            @change="emitUpdateAvailableChanged"
            :value="updateAvailable"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import { refreshAllContainers } from "@/services/container";

export default {
  props: {
    registries: {
      type: Array,
      required: true,
    },
    watchers: {
      type: Array,
      required: true,
    },
    updateAvailable: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      isRefreshing: false,
      registrySelected: undefined,
      watcherSelected: undefined,
    };
  },

  methods: {
    emitRegistryChanged() {
      this.$emit("registry-changed", this.registrySelected);
    },
    emitWatcherChanged() {
      this.$emit("watcher-changed", this.watcherSelected);
    },
    emitUpdateAvailableChanged() {
      this.$emit("update-available-changed");
    },
    async refreshAllContainers() {
      this.isRefreshing = true;
      try {
        const body = await refreshAllContainers();
        this.$root.$emit("notify", `All containers refreshed`);
        this.$emit("refresh-all-containers", body);
      } catch (e) {
        this.$root.$emit(
          "notify",
          `Error when trying to refresh all containers (${e.message})`,
          "error"
        );
      } finally {
        this.isRefreshing = false;
      }
    },
  },
};
</script>

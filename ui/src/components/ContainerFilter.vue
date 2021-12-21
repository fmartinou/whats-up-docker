<template>
  <v-container
    fluid
    class="ma-0 mb-3"
    :class="$vuetify.breakpoint.mdAndUp ? 'pa-0' : ''"
  >
    <v-row dense>
      <v-col>
        <v-select
          :hide-details="true"
          v-model="registrySelected"
          :items="registries"
          @change="emitRegistryChanged"
          :clearable="true"
          label="Registry"
          outlined
          dense
        ></v-select>
      </v-col>
      <v-col>
        <v-select
          :hide-details="true"
          v-model="watcherSelected"
          :items="watchers"
          @change="emitWatcherChanged"
          :clearable="true"
          label="Watcher"
          outlined
          dense
        ></v-select>
      </v-col>
      <v-col>
        <v-switch
          class="switch-top"
          label="Update available"
          @change="emitUpdateAvailableChanged"
          :value="updateAvailable"
          :hide-details="true"
          dense
        />
      </v-col>
      <v-col class="text-right">
        <v-btn
          color="secondary"
          @click.stop="refreshAllContainers"
          :loading="isRefreshing"
        >
          Watch now
          <v-icon> mdi-refresh</v-icon>
        </v-btn>
        <br />
      </v-col>
    </v-row>
  </v-container>
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

<style scoped>
.switch-top {
  margin-top: 4px;
}
</style>

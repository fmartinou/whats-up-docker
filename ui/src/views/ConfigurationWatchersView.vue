<template>
  <v-container fluid>
    <v-row v-for="watcher in watchers" :key="watcher.name">
      <v-col :cols="12" class="pt-2 pb-2">
        <configuration-item :item="watcher" />
      </v-col>
    </v-row>
    <v-row v-if="watchers.length === 0">
      <v-card-subtitle class="text-h6">No watchers configured</v-card-subtitle>
    </v-row>
  </v-container>
</template>

<script>
import ConfigurationItem from "@/components/ConfigurationItem";
import { getAllWatchers } from "@/services/watcher";

export default {
  data() {
    return {
      watchers: [],
    };
  },
  components: {
    ConfigurationItem,
  },

  async beforeRouteEnter(to, from, next) {
    try {
      const watchers = await getAllWatchers();
      next((vm) => (vm.watchers = watchers));
    } catch (e) {
      this.$root.$emit(
        "notify",
        `Error when trying to load the watchers (${e.message})`,
        "error",
      );
    }
    next();
  },
};
</script>

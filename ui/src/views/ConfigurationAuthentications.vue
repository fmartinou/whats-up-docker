<template>
  <v-container fluid>
    <v-row v-for="watcher in authentications" :key="watcher.name">
      <v-col :cols="12">
        <configuration-item :item="watcher" />
      </v-col>
    </v-row>
    <v-row v-if="authentications.length === 0">
      <v-card-subtitle class="text-h6"
        >No authentication configured</v-card-subtitle
      >
    </v-row>
  </v-container>
</template>

<script>
import ConfigurationItem from "@/components/ConfigurationItem";
import { getAllAuthentications } from "@/services/authentication";

export default {
  data() {
    return {
      authentications: [],
    };
  },
  components: {
    ConfigurationItem,
  },

  async beforeRouteEnter(to, from, next) {
    try {
      const authentications = await getAllAuthentications();
      next((vm) => (vm.authentications = authentications));
    } catch (e) {
      this.$root.$emit(
        "notify",
        `Error when trying to load the authentications (${e.message})`,
        "error"
      );
    }
    next();
  },
};
</script>

<template>
  <v-container fluid>
    <v-row v-for="controller in controllers" :key="controller.name">
      <v-col :cols="12" class="pt-2 pb-2">
        <configuration-item :item="controller" />
      </v-col>
    </v-row>
    <v-row v-if="controllers.length === 0">
      <v-card-subtitle class="text-h6"
        >No controllers configured</v-card-subtitle
      >
    </v-row>
  </v-container>
</template>

<script>
import ConfigurationItem from "@/components/ConfigurationItem";
import { getAllControllers } from "@/services/controller";

export default {
  data() {
    return {
      controllers: [],
    };
  },
  components: {
    ConfigurationItem,
  },

  async beforeRouteEnter(to, from, next) {
    try {
      const controllers = await getAllControllers();
      next((vm) => (vm.controllers = controllers));
    } catch (e) {
      this.$root.$emit(
        "notify",
        `Error when trying to load the controllers (${e.message})`,
        "error"
      );
    }
    next();
  },
};
</script>

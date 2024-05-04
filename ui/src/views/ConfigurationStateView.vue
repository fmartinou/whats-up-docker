<template>
  <v-container fluid>
    <v-row>
      <v-col :cols="12" class="pt-2 pb-2">
        <configuration-item :item="configurationItem" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import ConfigurationItem from "@/components/ConfigurationItem";
import { getStore } from "@/services/store";

export default {
  components: {
    ConfigurationItem,
  },
  data() {
    return {
      state: {},
    };
  },
  computed: {
    configurationItem() {
      return {
        name: "state",
        icon: "mdi-content-save",
        configuration: this.state.configuration,
      };
    },
  },

  async beforeRouteEnter(to, from, next) {
    try {
      const state = await getStore();
      next((vm) => (vm.state = state));
    } catch (e) {
      this.$root.$emit(
        "notify",
        `Error when trying to load the state configuration (${e.message})`,
        "error",
      );
    }
    next();
  },
};
</script>

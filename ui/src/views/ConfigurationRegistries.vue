<template>
  <v-container fluid>
    <v-row v-for="registry in registries" :key="registry.name">
      <v-col :cols="12">
        <configuration-item :item="registry" />
      </v-col>
    </v-row>
    <v-row v-if="registries.length === 0">
      <v-card-subtitle class="text-h6"
        >No registries configured</v-card-subtitle
      >
    </v-row>
  </v-container>
</template>

<script>
import ConfigurationItem from "@/components/ConfigurationItem";
import { getAllRegistries } from "@/services/registry";

export default {
  data() {
    return {
      registries: [],
    };
  },
  components: {
    ConfigurationItem,
  },

  async beforeRouteEnter(to, from, next) {
    try {
      const registries = await getAllRegistries();
      const registriesWithIcons = registries
        .map((registry) => {
          let icon = "mdi-help";
          switch (registry.type) {
            case "acr":
              icon = "mdi-microsoft-azure";
              break;
            case "ecr":
              icon = "mdi-aws";
              break;
            case "gcr":
              icon = "mdi-google-cloud";
              break;
            case "hub":
              icon = "mdi-docker";
              break;
          }
          return {
            ...registry,
            icon,
          };
        })
        .sort((r1, r2) => r1.name.localeCompare(r2.name));
      next((vm) => (vm.registries = registriesWithIcons));
    } catch (e) {
      this.$root.$emit(
        "notify",
        `Error when trying to load the registries (${e.message})`,
        "error"
      );
    }
    next();
  },
};
</script>

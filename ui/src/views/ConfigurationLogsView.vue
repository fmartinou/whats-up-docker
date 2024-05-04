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
import { getLog } from "@/services/log";

export default {
  components: {
    ConfigurationItem,
  },
  data() {
    return {
      log: {},
    };
  },

  computed: {
    configurationItem() {
      return {
        name: "logs",
        icon: "mdi-bug",
        configuration: {
          level: this.log.level,
        },
      };
    },
  },

  async beforeRouteEnter(to, from, next) {
    try {
      const log = await getLog();
      next((vm) => (vm.log = log));
    } catch (e) {
      this.$root.$emit(
        "notify",
        `Error when trying to load the log configuration (${e.message})`,
        "error",
      );
    }
    next();
  },
};
</script>

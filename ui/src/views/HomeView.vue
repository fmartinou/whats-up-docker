<template>
  <v-container>
    <v-row
      :class="$vuetify.breakpoint.mdAndUp ? 'pa-15 ma-15' : ''"
      :dense="$vuetify.breakpoint.smAndDown"
    >
      <v-col xs="12" sm="12" md="6" lg="3" xl="3">
        <v-card class="home-card text-center" outlined>
          <v-icon color="secondary" class="home-icon">{{
            containerIcon
          }}</v-icon>
          <br />
          <v-btn plain x-large to="/containers"
            >{{ containersCount }} containers</v-btn
          >
          <br />
          <v-btn
            small
            plain
            :color="containersToUpdateCount > 0 ? 'warning' : 'success'"
            to="/containers?update-available=true"
            :style="{
              pointerEvents: containersToUpdateCount === 0 ? 'none' : 'auto',
            }"
            >({{ containerUpdateMessage }})</v-btn
          >
        </v-card>
      </v-col>
      <v-col xs="12" sm="12" md="6" lg="3" xl="3">
        <v-card class="home-card text-center" outlined>
          <v-icon color="secondary" class="home-icon">{{ triggerIcon }}</v-icon>
          <br />
          <v-btn plain x-large to="/configuration/triggers"
            >{{ triggersCount }} triggers</v-btn
          >
          <br />
        </v-card>
      </v-col>
      <v-col xs="12" sm="12" md="6" lg="3" xl="3">
        <v-card class="home-card text-center" outlined>
          <v-icon color="secondary" class="home-icon">{{ watcherIcon }}</v-icon>
          <br />
          <v-btn plain x-large to="/configuration/watchers"
            >{{ watchersCount }} watchers</v-btn
          >
        </v-card>
      </v-col>
      <v-col xs="12" sm="12" md="6" lg="3" xl="3">
        <v-card class="home-card text-center" outlined>
          <v-icon color="secondary" class="home-icon">{{
            registryIcon
          }}</v-icon>
          <br />
          <v-btn plain x-large to="/configuration/registries"
            >{{ registriesCount }} registries</v-btn
          >
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { getContainerIcon, getAllContainers } from "@/services/container";
import { getRegistryIcon, getAllRegistries } from "@/services/registry";
import { getTriggerIcon, getAllTriggers } from "@/services/trigger";
import { getWatcherIcon, getAllWatchers } from "@/services/watcher";

export default {
  data() {
    return {
      containersCount: 0,
      containersToUpdateCount: 0,
      triggersCount: 0,
      watchersCount: 0,
      registriesCount: 0,
      containerIcon: getContainerIcon(),
      registryIcon: getRegistryIcon(),
      triggerIcon: getTriggerIcon(),
      watcherIcon: getWatcherIcon(),
    };
  },

  computed: {
    containerUpdateMessage() {
      if (this.containersToUpdateCount > 0) {
        return `${this.containersToUpdateCount} updates available`;
      }
      return "all containers are up-to-date";
    },
  },

  async beforeRouteEnter(to, from, next) {
    try {
      const containers = await getAllContainers();
      const watchers = await getAllWatchers();
      const registries = await getAllRegistries();
      const triggers = await getAllTriggers();
      next((vm) => {
        vm.containersCount = containers.length;
        vm.triggersCount = triggers.length;
        vm.watchersCount = watchers.length;
        vm.registriesCount = registries.length;
        vm.containersToUpdateCount = containers.filter(
          (container) => container.updateAvailable,
        ).length;
      });
    } catch (e) {
      // TODO
      console.log(e);
    }
    next();
  },
};
</script>
<style scoped>
.home-card {
  height: 160px;
}

.home-icon {
  font-size: 80px;
}
</style>

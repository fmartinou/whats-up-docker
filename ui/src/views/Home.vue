<template>
  <v-container fluid>
    <v-row>
      <v-col xs="12" sm="12" md="6" lg="3" xl="3">
        <v-card class="home-card text-center">
          <v-card-text class="pb-0">
            <v-icon color="primary" class="home-icon">{{
              containerIcon
            }}</v-icon>
          </v-card-text>
          <v-card-subtitle class="pt-0">
            <v-btn plain color="accent" x-large to="/containers"
              >{{ containersCount }} containers</v-btn
            >
            <br />
            <v-btn
              small
              plain
              color="warning"
              to="/containers?update-available=true"
              >({{ containersToUpdateCount }} updates)</v-btn
            >
          </v-card-subtitle>
        </v-card>
      </v-col>
      <v-col xs="12" sm="12" md="6" lg="3" xl="3">
        <v-card class="home-card text-center">
          <v-card-text class="pb-0">
            <v-icon color="primary" class="home-icon">{{ triggerIcon }}</v-icon>
          </v-card-text>
          <v-card-subtitle class="pt-0">
            <v-btn plain color="accent" x-large to="/configuration/triggers"
              >{{ triggersCount }} triggers</v-btn
            >
          </v-card-subtitle>
        </v-card>
      </v-col>
      <v-col xs="12" sm="12" md="6" lg="3" xl="3">
        <v-card class="home-card text-center">
          <v-card-text class="pb-0">
            <v-icon color="primary" class="home-icon">{{ watcherIcon }}</v-icon>
          </v-card-text>
          <v-card-subtitle class="pt-0">
            <v-btn plain color="accent" x-large to="/configuration/watchers"
              >{{ watchersCount }} watchers</v-btn
            >
          </v-card-subtitle>
        </v-card>
      </v-col>
      <v-col xs="12" sm="12" md="6" lg="3" xl="3">
        <v-card class="home-card text-center">
          <v-card-text class="pb-0">
            <v-icon color="primary" class="home-icon">{{
              registryIcon
            }}</v-icon>
          </v-card-text>
          <v-card-subtitle class="pt-0">
            <v-btn plain color="accent" x-large to="/configuration/registries"
              >{{ registriesCount }} registries</v-btn
            >
          </v-card-subtitle>
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
          (container) => container.updateAvailable
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
  height: 180px;
}

.home-icon {
  font-size: 80px;
}
</style>

<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <container-filter
          :registries="registries"
          :watchers="watchers"
          :updateAvailable="updateAvailableSelected"
          @registry-changed="onRegistryChanged"
          @watcher-changed="onWatcherChanged"
          @update-available-changed="onUpdateAvailableChanged"
          @refresh-all-containers="onRefreshAllContainers"
        />
      </v-col>
    </v-row>

    <v-fade-transition group hide-on-leave mode="in-out">
      <template v-for="container in containersFiltered">
        <v-row :key="container.id">
          <v-col>
            <container
              :container="container"
              @delete-container="deleteContainer(container)"
            />
          </v-col>
        </v-row>
      </template>
    </v-fade-transition>
    <v-row v-if="containersFiltered.length === 0">
      <v-card-subtitle class="text-h6">No containers found</v-card-subtitle>
    </v-row>
  </v-container>
</template>

<script>
import Container from "@/components/Container";
import ContainerFilter from "@/components/ContainerFilter";
import { deleteContainer, getAllContainers } from "@/services/container";

export default {
  components: {
    Container,
    ContainerFilter,
  },

  data() {
    return {
      containers: [],
      registrySelected: undefined,
      watcherSelected: undefined,
      updateAvailableSelected: false,
    };
  },

  computed: {
    registries() {
      return [
        ...new Set(
          this.containers
            .map((container) => container.image.registry.name)
            .sort()
        ),
      ];
    },
    watchers() {
      return [
        ...new Set(
          this.containers.map((container) => container.watcher).sort()
        ),
      ];
    },
    containersFiltered() {
      return this.containers
        .filter((container) =>
          this.registrySelected
            ? this.registrySelected === container.image.registry.name
            : true
        )
        .filter((container) =>
          this.watcherSelected
            ? this.watcherSelected === container.watcher
            : true
        )
        .filter((container) =>
          this.updateAvailableSelected ? container.updateAvailable : true
        );
    },
  },

  methods: {
    onRegistryChanged(registrySelected) {
      this.registrySelected = registrySelected;
    },
    onWatcherChanged(watcherSelected) {
      this.watcherSelected = watcherSelected;
    },
    onUpdateAvailableChanged() {
      this.updateAvailableSelected = !this.updateAvailableSelected;
    },
    onRefreshAllContainers(containersRefreshed) {
      this.containers = containersRefreshed;
    },
    async deleteContainer(container) {
      try {
        await deleteContainer(container.id);
        this.containers = this.containers.filter((c) => c.id !== container.id);
      } catch (e) {
        this.$root.$emit(
          "notify",
          `Error when trying to delete the container (${e.message})`,
          "error"
        );
      }
    },
  },

  async beforeRouteEnter(to, from, next) {
    const updateAvailable = to.query["update-available"];
    try {
      const containers = await getAllContainers();
      next((vm) => {
        if (updateAvailable) {
          vm.updateAvailableSelected = true;
        }
        vm.containers = containers;
      });
    } catch (e) {
      // TODO
      console.log(e);
    }
    next();
  },
};
</script>

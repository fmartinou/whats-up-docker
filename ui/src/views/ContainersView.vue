<template>
  <v-container fluid>
    <v-row dense>
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
          <v-col class="pt-2 pb-2">
            <container-item
              :container="container"
              @delete-container="deleteContainer(container)"
              @container-deleted="removeContainerFromList(container)"
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
import ContainerItem from "@/components/ContainerItem";
import ContainerFilter from "@/components/ContainerFilter";
import { deleteContainer, getAllContainers } from "@/services/container";

export default {
  components: {
    ContainerItem,
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
            .sort(),
        ),
      ];
    },
    watchers() {
      return [
        ...new Set(
          this.containers.map((container) => container.watcher).sort(),
        ),
      ];
    },
    containersFiltered() {
      return this.containers
        .filter((container) =>
          this.registrySelected
            ? this.registrySelected === container.image.registry.name
            : true,
        )
        .filter((container) =>
          this.watcherSelected
            ? this.watcherSelected === container.watcher
            : true,
        )
        .filter((container) =>
          this.updateAvailableSelected ? container.updateAvailable : true,
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
      this.$router.push(
        this.updateAvailableSelected
          ? {
              query: {
                "update-available": this.updateAvailableSelected,
              },
            }
          : { query: {} },
      );
    },
    onRefreshAllContainers(containersRefreshed) {
      this.containers = containersRefreshed;
    },
    removeContainerFromList(container) {
      this.containers = this.containers.filter((c) => c.id !== container.id);
    },
    async deleteContainer(container) {
      try {
        await deleteContainer(container.id);
        this.removeContainerFromList(container);
      } catch (e) {
        this.$root.$emit(
          "notify",
          `Error when trying to delete the container (${e.message})`,
          "error",
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
      this.$root.$emit(
        "notify",
        `Error when trying to get the containerq (${e.message})`,
        "error",
      );
    }
    next();
  },
};
</script>

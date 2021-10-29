<template>
  <v-card>
    <v-app-bar
      color="secondary"
      dark
      flat
      rounded
      dense
      @click="showDetail = !showDetail"
      style="cursor: pointer"
    >
      <v-toolbar-title class="text-body-1">{{
        container.name
      }}</v-toolbar-title>
      <v-badge
        class="ma-4"
        :content="newVersion"
        v-if="updateAvailable"
        tile
        :color="newVersionClass"
      >
        <v-chip label outlined>{{ container.image.tag.value }}</v-chip>
      </v-badge>
      <v-chip class="ma-4" label outlined v-else>{{
        container.image.tag.value
      }}</v-chip>
      <v-spacer />
      <v-icon>{{ showDetail ? "mdi-chevron-up" : "mdi-chevron-down" }}</v-icon>
    </v-app-bar>
    <v-expand-transition>
      <div v-show="showDetail">
        <v-card-subtitle class="text-h6 font-weight-bold"
          >Container
        </v-card-subtitle>
        <v-card-text>
          <v-row>
            <v-col xs="12" sm="6" md="4" lg="2" xl="2">
              <property name="Id" :value="container.id">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-chip
                      label
                      v-bind="attrs"
                      v-on="on"
                      @click="copyToClipboard('container id', container.id)"
                    >
                      {{ container.id | short(8) }}
                    </v-chip>
                  </template>
                  <span>Click to copy the full id</span>
                </v-tooltip>
              </property>
            </v-col>
            <v-col xs="12" sm="6" md="4" lg="2" xl="2">
              <property name="Watcher" :value="container.watcher" />
            </v-col>
            <v-col xs="12" sm="6" md="4" lg="2" xl="2">
              <property name="Name" :value="container.name" />
            </v-col>
            <v-col xs="12" sm="6" md="4" lg="2" xl="2">
              <property name="Status" :value="container.status" />
            </v-col>
            <v-col xs="12" sm="6" md="4" lg="2" xl="2">
              <property name="Include tags" :value="container.includeTags">
                <v-chip label v-if="container.includeTags"
                  >{{ container.includeTags }}
                </v-chip>
                <v-icon v-else large>mdi-cancel</v-icon>
              </property>
            </v-col>
            <v-col xs="12" sm="6" md="4" lg="2" xl="2">
              <property name="Exclude tags" :value="container.excludeTags">
                <v-chip label v-if="container.excludeTags"
                  >{{ container.excludeTags }}
                </v-chip>
                <v-icon v-else large>mdi-cancel</v-icon>
              </property>
            </v-col>
            <v-col xs="12" sm="6" md="4" lg="2" xl="2">
              <property name="Transform tags" :value="container.transformTags">
                <v-chip label v-if="container.transformTags"
                >{{ container.transformTags }}
                </v-chip>
                <v-icon v-else large>mdi-cancel</v-icon>
              </property>
            </v-col>
            <v-col cols="12">
              <property name="Link template" :value="container.linkTemplate">
                <v-chip label v-if="container.linkTemplate"
                  >{{ container.linkTemplate }}
                </v-chip>
                <v-icon v-else large>mdi-cancel</v-icon>
              </property>
            </v-col>
            <v-col cols="12">
              <property name="Link" :value="container.link">
                <v-chip
                  label
                  v-if="container.link"
                  :href="container.link"
                  target="_blank"
                  >{{ container.link }}
                </v-chip>
                <v-icon v-else large>mdi-cancel</v-icon>
              </property>
            </v-col>
          </v-row>
        </v-card-text>

        <!-- Container image -->
        <container-image :image="container.image" />

        <!-- Container result -->
        <container-result
          :result="result"
          :error="error"
          :semver="container.image.tag.semver"
          :updateKind="updateKind"
        />

        <v-card-text>
          <v-row>
            <v-col class="text-center">
              <v-dialog v-model="dialogDelete" width="500">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn color="error" outlined v-bind="attrs" v-on="on">
                    Delete
                    <v-icon right>mdi-delete</v-icon>
                  </v-btn>
                </template>

                <v-card class="text-center">
                  <v-app-bar color="warning" dark flat>
                    <v-toolbar-title class="text-body-1"
                      >Are you sure you want to delete
                      <span class="font-weight-bold">{{ container.name }}</span>
                      from the list?</v-toolbar-title
                    >
                  </v-app-bar>
                  <v-card-title class="text-body-1 font-italic">
                    The real container won't be deleted.
                  </v-card-title>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn outlined @click="dialogDelete = false">
                      Cancel
                    </v-btn>
                    <v-btn
                      color="error"
                      text
                      @click="
                        dialogDelete = false;
                        deleteContainer();
                      "
                    >
                      Delete
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-col>
          </v-row>
        </v-card-text>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script>
import Property from "@/components/Property";
import ContainerImage from "@/components/ContainerImage";
import ContainerResult from "@/components/ContainerResult";
import { getRegistryProviderIcon } from "@/services/registry";

export default {
  components: {
    Property,
    ContainerImage,
    ContainerResult,
  },

  props: {
    container: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      showDetail: false,
      dialogDelete: false,
      result: this.container.result,
      error: this.container.error,
      updateKind: this.container.updateKind,
      updateAvailable: this.container.updateAvailable || false,
    };
  },
  computed: {
    registryIcon() {
      return getRegistryProviderIcon(this.container.image.registry.name);
    },

    osIcon() {
      let icon = "mdi-help";
      switch (this.container.image.os) {
        case "linux":
          icon = "mdi-linux";
          break;
        case "windows":
          icon = "mdi-microsoft-windows";
          break;
      }
      return icon;
    },

    newVersion() {
      let newVersion = "unknown";
      if (
        this.result.created &&
        this.container.image.created !== this.result.created
      ) {
        newVersion = this.$options.filters.date(this.result.created);
      }
      if (this.updateKind) {
        newVersion = this.updateKind.remoteValue;
      }
      if (this.updateKind.kind === "digest") {
        newVersion = this.$options.filters.short(newVersion, 15);
      }
      return newVersion;
    },

    newVersionClass() {
      let color = "warning";
      if (this.updateKind && this.updateKind.kind === "tag") {
        switch (this.updateKind.semverDiff) {
          case "major":
            color = "error";
            break;
          case "minor":
            color = "warning";
            break;
          case "patch":
            color = "success";
            break;
        }
      }
      return color;
    },
  },

  methods: {
    async deleteContainer() {
      this.$emit("delete-container");
    },

    copyToClipboard(kind, value) {
      this.$clipboard(value);
      this.$root.$emit("notify", `${kind} copied to clipboard`);
    },
  },
};
</script>

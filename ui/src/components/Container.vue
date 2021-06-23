<template>
  <v-card>
    <v-overlay :absolute="true" :value="isRefreshing" />

    <v-app-bar
      color="secondary"
      dark
      flat
      rounded
      @click="showDetail = !showDetail"
      style="cursor: pointer"
    >
      <v-toolbar-title>{{ container.name }}</v-toolbar-title>
      <v-badge
        class="ma-4"
        :content="newVersion"
        v-if="updateAvailable"
        overlap
        tile
        color="success"
      >
        <v-chip label color="warning">{{ container.image.tag.value }}</v-chip>
      </v-badge>
      <v-chip class="ma-4" label color="success" v-else>{{
        container.image.tag.value
      }}</v-chip>
      <div>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-bind="attrs"
              v-on="on"
              fab
              absolute
              top
              right
              small
              color="primary"
              @click.stop="refreshContainer"
              :loading="isRefreshing"
            >
              <v-icon> mdi-refresh</v-icon>
            </v-btn>
          </template>
          <span>Refresh</span>
        </v-tooltip>
      </div>
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
          </v-row>
        </v-card-text>
        <v-card-subtitle class="text-h6 font-weight-bold"
          >Image
        </v-card-subtitle>
        <v-card-text>
          <v-row>
            <v-col xs="12" sm="6" md="4" lg="2" xl="2">
              <property name="Id" :value="container.image.id">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-chip
                      label
                      v-bind="attrs"
                      v-on="on"
                      @click="copyToClipboard('image id', container.image.id)"
                    >
                      {{ container.image.id | short(15) }}
                    </v-chip>
                  </template>
                  <span>Click to copy the full id</span>
                </v-tooltip>
              </property>
            </v-col>
            <v-col xs="12" sm="6" md="4" lg="2" xl="2">
              <property name="Registry" :value="container.image.registry.name">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon
                      v-text="registryIcon"
                      large
                      v-bind="attrs"
                      v-on="on"
                    />
                  </template>
                  <span
                    >{{ container.image.registry.name }} ({{
                      container.image.registry.url
                    }})</span
                  >
                </v-tooltip>
              </property>
            </v-col>
            <v-col xs="12" sm="6" md="4" lg="2" xl="2">
              <property name="Name" :value="container.image.name" />
            </v-col>
            <v-col xs="12" sm="6" md="4" lg="2" xl="2">
              <property name="Tag" :value="container.image.tag">
                <v-badge
                  v-if="container.image.tag.semver"
                  content="semver"
                  overlap
                  tile
                  color="success"
                >
                  <v-chip label>{{ container.image.tag.value }}</v-chip>
                </v-badge>
                <v-chip v-else label>{{ container.image.tag.value }}</v-chip>
              </property>
            </v-col>
            <v-col xs="12" sm="6" md="4" lg="2" xl="2">
              <property name="Digest" :value="container.image.digest.value">
                <v-tooltip bottom v-if="container.image.digest.value">
                  <template v-slot:activator="{ on, attrs }">
                    <v-chip
                      label
                      v-bind="attrs"
                      v-on="on"
                      @click="
                        copyToClipboard('digest', container.image.digest.value)
                      "
                      >{{ container.image.digest.value | short(15) }}
                    </v-chip>
                  </template>
                  <span>Click to copy the full digest</span>
                </v-tooltip>
                <v-tooltip v-else bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon large v-bind="attrs" v-on="on">mdi-cancel</v-icon>
                  </template>
                  <span>Digest not tracked</span>
                </v-tooltip>
              </property>
            </v-col>
            <v-col xs="12" sm="6" md="4" lg="2" xl="2">
              <property name="OS / Arch" :value="container.image.os">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon v-text="osIcon" large v-bind="attrs" v-on="on" />
                  </template>
                  <span class="text-capitalize"
                    >{{ container.image.os }} /
                    {{ container.image.architecture }}</span
                  >
                </v-tooltip>
              </property>
            </v-col>
            <v-col xs="12" sm="6" md="4" lg="2" xl="2">
              <property
                name="Created"
                :value="container.image.created | date"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-subtitle class="text-h6 font-weight-bold"
          >Registry result
        </v-card-subtitle>
        <v-card-text>
          <v-row>
            <v-col xs="12" sm="6" md="4" lg="2" xl="2">
              <property name="Tag" :value="result.tag">
                <v-badge
                  v-if="container.image.tag.semver"
                  content="semver"
                  overlap
                  tile
                  color="success"
                >
                  <v-chip label>{{ result.tag }}</v-chip>
                </v-badge>
                <v-chip v-else label>{{ result.tag }}</v-chip>
              </property>
            </v-col>
            <v-col xs="12" sm="6" md="4" lg="2" xl="2">
              <property name="Digest" :value="result.digest">
                <v-tooltip bottom v-if="result.digest">
                  <template v-slot:activator="{ on, attrs }">
                    <v-chip
                      label
                      v-bind="attrs"
                      v-on="on"
                      @click="
                        copyToClipboard('digest', container.result.digest)
                      "
                      >{{ container.result.digest | short(15) }}
                    </v-chip>
                  </template>
                  <span>Click to copy the full digest</span>
                </v-tooltip>
                <v-tooltip v-else bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon large v-bind="attrs" v-on="on">mdi-cancel</v-icon>
                  </template>
                  <span>Digest not tracked</span>
                </v-tooltip>
              </property>
            </v-col>
          </v-row>
        </v-card-text>
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
                      >Are you sure you want to delete the container
                      <span class="font-weight-bold">{{ container.name }}</span
                      >?</v-toolbar-title
                    >
                  </v-app-bar>
                  <v-card-title class="text-body-1">
                    This action is irreversible.
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
import { refreshContainer } from "@/services/container";

export default {
  components: {
    Property,
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
      isRefreshing: false,
      dialogDelete: false,
      result: this.container.result,
      updateAvailable: this.container.updateAvailable || false,
    };
  },
  computed: {
    registryIcon() {
      let icon = "mdi-help";
      switch (this.container.image.registry.name) {
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
      return icon;
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
      return this.container.image.tag.value !== this.result.tag ?
          this.result.tag:
          this.container.image.digest.value !== this.result.digest ?
            this.$options.filters.short(this.result.digest, 15):
            'zob';
    }
  },

  filters: {
    short(fullId, length) {
      if (!fullId) {
        return "";
      }
      return fullId.substring(0, length);
    },

    date(dateStr) {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat().format(date);
    },
  },

  methods: {
    async refreshContainer() {
      this.isRefreshing = true;
      try {
        const body = await refreshContainer(this.container.id);
        if (body.result) {
          this.result = body.result;
          this.updateAvailable = body.updateAvailable;
        }
        this.$root.$emit("notify", `Container refreshed`);
      } catch (e) {
        this.$root.$emit(
          "notify",
          `Error when trying to refresh the container (${e.message})`,
          "error"
        );
      } finally {
        this.isRefreshing = false;
      }
    },

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

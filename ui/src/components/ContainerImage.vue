<template>
  <div>
    <v-card-subtitle class="text-h6 font-weight-bold">Image </v-card-subtitle>
    <v-card-text>
      <v-row>
        <v-col xs="12" sm="6" md="4" lg="2" xl="2">
          <property name="Id" :value="image.id">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-chip
                  label
                  v-bind="attrs"
                  v-on="on"
                  @click="copyToClipboard('image id', image.id)"
                >
                  {{ image.id | short(15) }}
                </v-chip>
              </template>
              <span>Click to copy the full id</span>
            </v-tooltip>
          </property>
        </v-col>
        <v-col xs="12" sm="6" md="4" lg="2" xl="2">
          <property name="Registry" :value="image.registry.name">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon v-text="registryIcon" large v-bind="attrs" v-on="on" />
              </template>
              <span>{{ image.registry.name }} ({{ image.registry.url }})</span>
            </v-tooltip>
          </property>
        </v-col>
        <v-col xs="12" sm="6" md="4" lg="2" xl="2">
          <property name="Name" :value="image.name" />
        </v-col>
        <v-col xs="12" sm="6" md="4" lg="2" xl="2">
          <property name="Tag" :value="image.tag">
            <v-badge
              v-if="image.tag.semver"
              content="semver"
              overlap
              tile
              color="success"
            >
              <v-chip label>{{ image.tag.value }}</v-chip>
            </v-badge>
            <v-chip v-else label>{{ image.tag.value }}</v-chip>
          </property>
        </v-col>
        <v-col xs="12" sm="6" md="4" lg="2" xl="2">
          <property name="Digest" :value="image.digest.value">
            <v-tooltip bottom v-if="image.digest.value">
              <template v-slot:activator="{ on, attrs }">
                <v-chip
                  label
                  v-bind="attrs"
                  v-on="on"
                  @click="copyToClipboard('digest', image.digest.value)"
                  >{{ image.digest.value | short(15) }}
                </v-chip>
              </template>
              <span>Click to copy the full digest</span>
            </v-tooltip>
            <v-tooltip v-else bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon large v-bind="attrs" v-on="on">mdi-cancel</v-icon>
              </template>
              <span>Digest not tracked or not found</span>
            </v-tooltip>
          </property>
        </v-col>
        <v-col xs="12" sm="6" md="4" lg="2" xl="2">
          <property name="OS / Arch" :value="image.os">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon v-text="osIcon" large v-bind="attrs" v-on="on" />
              </template>
              <span class="text-capitalize"
                >{{ image.os }} / {{ image.architecture }}</span
              >
            </v-tooltip>
          </property>
        </v-col>
        <v-col xs="12" sm="6" md="4" lg="2" xl="2">
          <property name="Created" :value="image.created | date" />
        </v-col>
      </v-row>
    </v-card-text>
  </div>
</template>

<script>
import Property from "@/components/Property";
import { getRegistryProviderIcon } from "@/services/registry";

export default {
  components: {
    Property,
  },

  props: {
    image: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {};
  },
  computed: {
    registryIcon() {
      return getRegistryProviderIcon(this.image.registry.name);
    },

    osIcon() {
      let icon = "mdi-help";
      switch (this.image.os) {
        case "linux":
          icon = "mdi-linux";
          break;
        case "windows":
          icon = "mdi-microsoft-windows";
          break;
      }
      return icon;
    },
  },

  methods: {
    copyToClipboard(kind, value) {
      this.$clipboard(value);
      this.$root.$emit("notify", `${kind} copied to clipboard`);
    },
  },
};
</script>

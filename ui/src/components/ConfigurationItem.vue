<template>
  <v-card>
    <v-app-bar color="secondary" flat dark dense>
      <v-toolbar-title class="text-capitalize text-body-1">{{
        displayName
      }}</v-toolbar-title>
      <v-spacer />
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-icon v-text="item.icon" v-bind="attrs" v-on="on"></v-icon>
        </template>
        <span class="text-capitalize">{{ item.type }}</span>
      </v-tooltip>
    </v-app-bar>
    <v-card-text>
      <v-row v-if="configurationItems.length > 0">
        <v-col
          xs="12"
          sm="6"
          md="4"
          lg="2"
          xl="2"
          v-for="configurationItem in configurationItems"
          :key="configurationItem.key"
        >
          <property
            :name="configurationItem.key"
            :value="configurationItem.value"
          />
        </v-col>
      </v-row>
      <v-row v-else>
        <v-col>
          <span>Default configuration</span>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import Property from "@/components/Property";

export default {
  components: {
    Property,
  },
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  computed: {
    configurationItems() {
      return Object.keys(this.item.configuration || [])
        .map((key) => ({
          key,
          value: this.item.configuration[key],
        }))
        .sort((item1, item2) => item1.key.localeCompare(item2.key));
    },

    displayName() {
      if (
        this.item.name &&
        this.item.type &&
        this.item.name !== this.item.type
      ) {
        return `${this.item.name} (${this.item.type})`;
      }
      if (this.item.name) {
        return this.item.name;
      }
      return "Unknown";
    },
  },
};
</script>

<template>
  <v-card>
    <v-app-bar flat dense tile @click="collapse()" style="cursor: pointer">
      <v-toolbar-title class="text-capitalize text-body-1">{{
        displayName
      }}</v-toolbar-title>
      <v-spacer />
      <v-icon>{{ item.icon }}</v-icon>
      <v-icon>{{ showDetail ? "mdi-chevron-up" : "mdi-chevron-down" }}</v-icon>
    </v-app-bar>
    <v-expand-transition>
      <v-card-text v-show="showDetail">
        <v-list dense v-if="configurationItems.length > 0">
          <v-list-item
            v-for="configurationItem in configurationItems"
            :key="configurationItem.key"
          >
            <v-list-item-content>
              <v-list-item-title class="text-capitalize">{{
                configurationItem.key
              }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ configurationItem.value }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <span v-else>Default configuration</span>
      </v-card-text>
    </v-expand-transition>
  </v-card>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      showDetail: true,
    };
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

  methods: {
    collapse() {
      this.showDetail = !this.showDetail;
    },
  },
};
</script>

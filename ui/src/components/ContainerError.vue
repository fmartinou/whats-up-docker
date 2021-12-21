<template>
  <v-list dense>
    <v-list-item>
      <v-list-item-avatar>
        <v-icon color="secondary">mdi-tag</v-icon>
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title>Error</v-list-item-title>
        <v-list-item-subtitle>
          {{ error.message }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script>
export default {
  props: {
    error: {
      type: Object,
    },
  },
};
</script>

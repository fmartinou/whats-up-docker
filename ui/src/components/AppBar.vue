<template>
  <v-app-bar app color="primary" flat dark>
    <v-toolbar-title class="text-capitalize">{{ viewName }}</v-toolbar-title>
  </v-app-bar>
</template>

<script>
export default {
  computed: {
    viewName() {
      return this.$route.name;
    },
  },
};
</script>

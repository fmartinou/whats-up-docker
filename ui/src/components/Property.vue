<template>
  <v-card outlined class="property-container">
    <v-card-subtitle class="text-center pa-1">
      <span class="subtitle-2 text-capitalize">{{ name }}</span>
      <br />
      <slot>
        <v-chip label>{{ value ? value : "None" }}</v-chip>
      </slot>
    </v-card-subtitle>
  </v-card>
</template>

<script>
export default {
  props: {
    name: {
      type: String,
      required: true,
    },
    value: {
      required: true,
    },
  },
};
</script>

<style scoped>
.property-container {
  height: 70px;
}
</style>

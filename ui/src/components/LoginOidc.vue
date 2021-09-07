<template>
  <v-form @keyup.native.enter="login">
    <v-card-text>
      <v-btn block color="primary" @click="redirect">
        <v-icon color="warning">mdi-openid</v-icon>
        &nbsp;Connect
      </v-btn>
    </v-card-text>
  </v-form>
</template>

<script>
import { getOidcRedirection } from "@/services/auth";

export default {
  props: {
    name: {
      type: String,
      required: true,
    },
  },
  data() {
    return {};
  },

  methods: {
    /**
     * Perform login.
     * @returns {Promise<void>}
     */
    async redirect() {
      const redirection = await getOidcRedirection(this.name);
      window.location.href = redirection.url;
    },
  },
};
</script>

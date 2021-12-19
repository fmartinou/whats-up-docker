<template>
  <v-app-bar app color="primary" flat dark tile clipped-left>
    <v-toolbar-title class="text-capitalize">{{ viewName }}</v-toolbar-title>
    <v-spacer />
    <v-menu left bottom v-if="user && user.username !== 'anonymous'">
      <template v-slot:activator="{ on, attrs }">
        <v-btn v-bind="attrs" v-on="on" text>
          {{ user.username }}
          <v-icon>mdi-account</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item @click="logout">
          <v-list-item-title>Log out</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>
<script>
import { logout } from "@/services/auth";

export default {
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
  computed: {
    viewName() {
      return this.$route.name;
    },
  },

  methods: {
    /**
     * Perform logout.
     * @returns {Promise<void>}
     */
    async logout() {
      try {
        const logoutResult = await logout();
        if (logoutResult.logoutUrl) {
          window.location = logoutResult.logoutUrl;
        } else {
          await this.$router.push({
            name: "login",
          });
        }
      } catch (e) {
        this.$root.$emit(
          "notify",
          `Error when trying to logout (${e.message})`,
          "error"
        );
      }
    },
  },
};
</script>

<template>
  <v-app-bar app color="primary" flat dark tile clipped-left dense>
    <v-app-bar-nav-icon>
      <v-img :src="logo" alt="logo" max-width="48px" />
    </v-app-bar-nav-icon>

    <v-toolbar-title
      v-if="viewName && 'home'.toLowerCase() !== viewName.toLowerCase()"
      class="text-body-1 text-capitalize ml-2"
      >{{ viewName }}</v-toolbar-title
    >

    <v-spacer />
    <v-menu left bottom v-if="user && user.username !== 'anonymous'">
      <template v-slot:activator="{ on, attrs }">
        <v-btn v-bind="attrs" v-on="on" text small class="text-lowercase">
          {{ user.username }}
          &nbsp;
          <v-icon dense>mdi-account</v-icon>
        </v-btn>
      </template>
      <v-list dense>
        <v-list-item @click="logout">
          <v-list-item-content class="text-body-2">Log out</v-list-item-content>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>
<script>
import { logout } from "@/services/auth";
import logo from "@/assets/wud_logo_white.png";

export default {
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      logo,
    };
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

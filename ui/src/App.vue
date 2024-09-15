<template>
  <v-app class="main-background">
    <snack-bar
      :message="snackbarMessage"
      :show="snackbarShow"
      :level="snackbarLevel"
    />

    <navigation-drawer v-if="authenticated" />

    <app-bar v-if="authenticated" :user="user" />

    <!-- Sizes your content based upon application components -->
    <v-main>
      <v-row>
        <v-col>
          <router-view></router-view>
        </v-col>
      </v-row>
    </v-main>

    <app-footer v-if="authenticated" />
  </v-app>
</template>

<script>
import Vue from "vue";
import NavigationDrawer from "@/components/NavigationDrawer";
import AppBar from "@/components/AppBar";
import SnackBar from "@/components/SnackBar";
import AppFooter from "@/components/AppFooter";
import { getServer } from "@/services/server";

export default {
  components: {
    NavigationDrawer,
    AppBar,
    SnackBar,
    AppFooter,
  },
  data() {
    return {
      snackbarMessage: "",
      snackbarShow: false,
      snackbarLevel: "info",
      user: undefined,
    };
  },
  computed: {
    items() {
      return this.$route.fullPath
        .replace("/", "")
        .split("/")
        .map((item) => ({
          text: item ? item : "Home",
          disabled: false,
          href: "",
        }));
    },

    /**
     * Is user authenticated?
     * @returns {boolean}
     */
    authenticated() {
      return this.user !== undefined;
    },
  },
  methods: {
    /**
     * Save current user when authenticated.
     * @param user
     */
    onAuthenticated(user) {
      this.user = user;
    },

    /**
     * Display a notification.
     * @param message
     * @param level
     */
    notify(message, level = "info") {
      this.snackbarMessage = message;
      this.snackbarShow = true;
      this.snackbarLevel = level;
    },

    /**
     * Close a notification.
     */
    notifyClose() {
      this.snackbarMessage = "";
      this.snackbarShow = false;
    },
  },

  /**
   * Listen to root events.
   * @returns {Promise<void>}
   */
  async beforeMount() {
    this.$root.$on("authenticated", this.onAuthenticated);
    this.$root.$on("notify", this.notify);
    this.$root.$on("notify:close", this.notifyClose);
  },

  async beforeUpdate() {
    if (this.authenticated && !this.$serverConfig) {
      const server = await getServer();
      Vue.prototype.$serverConfig = server.configuration;
    }
  },
};
</script>

<style scoped>
.main-background {
  /* background-color: #f5f5f5; */
}
</style>

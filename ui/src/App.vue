<template>
  <v-app>
    <snackbar
      :message="snackbarMessage"
      :show="snackbarShow"
      :level="snackbarLevel"
    />
    <navigation-drawer />

    <app-bar />

    <!-- Sizes your content based upon application components -->
    <v-main class="main-background">
      <v-row>
        <v-col>
          <router-view></router-view>
        </v-col>
      </v-row>
    </v-main>

    <app-footer />
  </v-app>
</template>

<script>
import NavigationDrawer from "@/components/NavigationDrawer";
import AppBar from "@/components/AppBar";
import Snackbar from "@/components/Snackbar";
import AppFooter from "@/components/AppFooter";

export default {
  components: {
    NavigationDrawer,
    AppBar,
    Snackbar,
    AppFooter,
  },
  data() {
    return {
      snackbarMessage: "",
      snackbarShow: false,
      snackbarLevel: "info",
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
  },
  methods: {
    notify(message, level = "info") {
      this.snackbarMessage = message;
      this.snackbarShow = true;
      this.snackbarLevel = level;
    },
    notifyClose() {
      this.snackbarMessage = "";
      this.snackbarShow = false;
    },
  },

  beforeMount() {
    this.$root.$on("notify", this.notify);
    this.$root.$on("notify:close", this.notifyClose);
  },
};
</script>

<style scoped>
.main-background {
  background-color: #f5f5f5;
}
</style>

import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import clipboard from "./plugins/clipboard";
import router from "./router";
import { registerFilters } from "./filters";
import "./registerServiceWorker";

Vue.config.productionTip = false;
registerFilters();

new Vue({
  vuetify,
  clipboard,
  router,
  render: (h) => h(App),
}).$mount("#app");

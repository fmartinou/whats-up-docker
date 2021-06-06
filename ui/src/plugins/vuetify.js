import Vue from "vue";
import Vuetify from "vuetify/lib/framework";

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: "#00355E",
        secondary: "#0096C7",
        accent: "#06D6A0",
        error: "#E53935",
      },
    },
  },
});

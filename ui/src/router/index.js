import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "home",
    component: Home,
  },
  {
    path: "/containers",
    name: "containers",
    component: () => import("../views/Containers.vue"),
  },
  {
    path: "/configuration/logs",
    name: "logs",
    component: () => import("../views/ConfigurationLogs.vue"),
  },
  {
    path: "/configuration/registries",
    name: "registries",
    component: () => import("../views/ConfigurationRegistries.vue"),
  },
  {
    path: "/configuration/state",
    name: "state",
    component: () => import("../views/ConfigurationState.vue"),
  },
  {
    path: "/configuration/triggers",
    name: "triggers",
    component: () => import("../views/ConfigurationTriggers.vue"),
  },
  {
    path: "/configuration/watchers",
    name: "watchers",
    component: () => import("../views/ConfigurationWatchers.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;

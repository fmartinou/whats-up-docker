import Vue from "vue";
import VueRouter from "vue-router";
import { getUser } from "@/services/auth";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("../views/Home.vue"),
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../views/Login.vue"),
  },
  {
    path: "/containers",
    name: "containers",
    component: () => import("../views/Containers.vue"),
  },
  {
    path: "/configuration/authentications",
    name: "authentications",
    component: () => import("../views/ConfigurationAuthentications.vue"),
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

/**
 * Apply authentication navigation guard.
 * @param to
 * @param from
 * @param next
 * @returns {Promise<void>}
 */
async function applyAuthNavigationGuard(to, from, next) {
  if (to.name === "login") {
    next();
  } else {
    // Get current user
    const user = await getUser();

    // User is authenticated => go to route
    if (user !== undefined) {
      // Notify authenticated
      router.app.$root.$emit("authenticated", user);

      // Next route in param? redirect
      if (to.query.next) {
        next(to.query.next);
      } else {
        next();
      }
    } else {
      // User is not authenticated => save destination as next & go to login
      next({
        name: "login",
        query: {
          next: to.path,
        },
      });
    }
  }
}

/**
 * Apply navigation guards.
 */
router.beforeEach(async (to, from, next) => {
  await applyAuthNavigationGuard(to, from, next);
});

export default router;

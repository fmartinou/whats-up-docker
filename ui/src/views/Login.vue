<template>
  <v-container class="login-background">
    <v-dialog
      :value="true"
      width="400px"
      :persistent="true"
      :no-click-animation="true"
      overlay-color="primary"
      overlay-opacity="1"
    >
      <v-card>
        <v-container>
          <v-row justify="center" class="ma-1">
            <v-avatar color="primary" size="80">
              <v-icon dark x-large>mdi-account</v-icon>
            </v-avatar>
          </v-row>
          <v-row>
            <v-container>
              <v-tabs v-model="strategySelected">
                <v-tab
                  v-for="strategy in strategies"
                  :key="strategy.name"
                  class="text-body-2"
                >
                  {{ strategy.name }}
                </v-tab>
              </v-tabs>
              <v-tabs-items v-model="strategySelected">
                <v-tab-item
                  v-for="strategy in strategies"
                  :key="strategy.type + strategy.name"
                >
                  <login-basic
                    v-if="strategy.type === 'basic'"
                    @authentication-success="onAuthenticationSuccess"
                  />
                  <login-oidc
                    v-if="strategy.type === 'oidc'"
                    :name="strategy.name"
                    @authentication-success="onAuthenticationSuccess"
                  />
                </v-tab-item>
              </v-tabs-items>
            </v-container>
          </v-row>
        </v-container>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { getStrategies } from "@/services/auth";
import LoginBasic from "@/components/LoginBasic";
import LoginOidc from "@/components/LoginOidc";
import logo from "@/assets/wud_logo_white.png";

export default {
  components: {
    LoginBasic,
    LoginOidc,
  },
  data() {
    return {
      logo,
      strategies: [],
      strategySelected: undefined,
    };
  },

  methods: {
    /**
     * Is strategy supported for Web UI usage?
     * @param strategy
     * @returns {boolean}
     */
    isSupportedStrategy(strategy) {
      switch (strategy.type) {
        case "basic":
          return true;
        case "oidc":
          return true;
        default:
          false;
      }
    },

    /**
     * Handle authentication success.
     */
    onAuthenticationSuccess() {
      this.$router.push(this.$route.query.next || "/");
    },
  },

  /**
   * Collect available auth strategies.
   * @param to
   * @param from
   * @param next
   * @returns {Promise<void>}
   */
  async beforeRouteEnter(to, from, next) {
    try {
      // await logout();
      const strategies = await getStrategies();

      // If anonymous auth is enabled then no need to login => go home
      if (strategies.find((strategy) => strategy.type === "anonymous")) {
        next("/");
      }

      // Filter on supported auth for UI
      next(async (vm) => {
        vm.strategies = strategies.filter(vm.isSupportedStrategy);
      });
    } catch (e) {
      this.$root.$emit(
        "notify",
        `Error when trying to get the authentication strategies (${e.message})`,
        "error"
      );
    }
  },
};
</script>

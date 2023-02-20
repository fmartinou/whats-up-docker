<template>
  <v-form @keyup.native.enter="login">
    <v-card-text>
      <v-text-field
        label="Username"
        v-model="username"
        append-icon="mdi-account"
        :rules="[rules.required]"
        outlined
        autofocus
      />
      <v-text-field
        label="Password"
        type="password"
        v-model="password"
        append-icon="mdi-lock"
        :rules="[rules.required]"
        outlined
      />
      <v-btn block color="primary" :disabled="!valid" @click="login">
        Login
      </v-btn>
    </v-card-text>
  </v-form>
</template>

<script>
import { loginBasic } from "@/services/auth";

export default {
  data() {
    return {
      username: "",
      password: "",
      rules: {
        required: (value) => !!value || "Required",
      },
    };
  },

  computed: {
    /**
     * Is form valid?
     * @returns {boolean}
     */
    valid() {
      return this.username !== "" && this.password !== "";
    },
  },

  methods: {
    /**
     * Perform login.
     * @returns {Promise<void>}
     */
    async login() {
      if (this.valid) {
        try {
          await loginBasic(this.username, this.password);
          this.$emit("authentication-success");
        } catch (e) {
          this.$root.$emit("notify", "Username or password error", "error");
        }
      }
    },
  },
};
</script>

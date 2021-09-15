<template>
  <div>
    <v-card-subtitle class="text-h6 font-weight-bold"
      >Registry result
      <v-icon color="error" v-if="error">mdi-alert-circle-outline</v-icon>
    </v-card-subtitle>
    <v-card-text v-if="error">
      <v-col xs="12" sm="12" md="12" lg="12" xl="12">
        <property name="Error" :value="error.message">
          {{ error.message }}
        </property>
      </v-col>
    </v-card-text>
    <v-card-text v-else>
      <v-row>
        <v-col xs="12" sm="6" md="4" lg="2" xl="2">
          <property name="Tag" :value="result.tag">
            <v-badge
              v-if="semver"
              content="semver"
              overlap
              tile
              color="success"
            >
              <v-chip label>{{ result.tag }}</v-chip>
            </v-badge>
            <v-chip v-else label>{{ result.tag }}</v-chip>
          </property>
        </v-col>
        <v-col xs="12" sm="6" md="4" lg="2" xl="2">
          <property name="Digest" :value="result.digest">
            <v-tooltip bottom v-if="result.digest">
              <template v-slot:activator="{ on, attrs }">
                <v-chip
                  label
                  v-bind="attrs"
                  v-on="on"
                  @click="copyToClipboard('digest', result.digest)"
                  >{{ result.digest | short(15) }}
                </v-chip>
              </template>
              <span>Click to copy the full digest</span>
            </v-tooltip>
            <v-tooltip v-else bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon large v-bind="attrs" v-on="on">mdi-cancel</v-icon>
              </template>
              <span>Digest not tracked or not found</span>
            </v-tooltip>
          </property>
        </v-col>
        <v-col xs="12" sm="6" md="4" lg="2" xl="2" v-if="result.created">
          <property name="Created" :value="result.created | date" />
        </v-col>
        <v-col xs="12" sm="6" md="4" lg="2" xl="2" v-if="updateKind">
          <property name="Kind" :value="updateKindFormatted" />
        </v-col>
        <v-col cols="12">
          <property name="Link" :value="result.link">
            <v-chip label v-if="result.link" :href="result.link" target="_blank"
              >{{ result.link }}
            </v-chip>
            <v-icon v-else large>mdi-cancel</v-icon>
          </property>
        </v-col>
      </v-row>
    </v-card-text>
  </div>
</template>

<script>
import Property from "@/components/Property";

export default {
  components: {
    Property,
  },

  props: {
    semver: {
      type: Boolean,
    },
    result: {
      type: Object,
    },
    error: {
      type: Object,
    },
    updateKind: {
      type: Object,
    },
  },
  computed: {
    updateKindFormatted() {
      let kind = "Unknown";
      if (this.updateKind) {
        kind = this.updateKind.kind;
      }
      if (this.updateKind.semverDiff) {
        kind = this.updateKind.semverDiff;
      }
      return kind;
    },
  },
  methods: {
    copyToClipboard(kind, value) {
      this.$clipboard(value);
      this.$root.$emit("notify", `${kind} copied to clipboard`);
    },
  },
};
</script>

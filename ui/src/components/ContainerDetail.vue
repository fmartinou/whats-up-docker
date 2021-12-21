<template>
  <v-list dense>
    <v-list-item>
      <v-list-item-avatar>
        <v-icon color="secondary">mdi-identifier</v-icon>
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title>Id</v-list-item-title>
        <v-list-item-subtitle>
          {{ container.id }}
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                icon
                x-small
                v-bind="attrs"
                v-on="on"
                @click="copyToClipboard('container id', container.id)"
              >
                <v-icon small>mdi-clipboard</v-icon>
              </v-btn>
            </template>
            <span class="text-caption">Copy to clipboard</span>
          </v-tooltip>
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item>
      <v-list-item-avatar>
        <v-icon color="secondary">mdi-pencil</v-icon>
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title>Name</v-list-item-title>
        <v-list-item-subtitle>{{ container.name }}</v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item>
      <v-list-item-avatar>
        <v-icon color="secondary">mdi-restart</v-icon>
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title>Status</v-list-item-title>
        <v-list-item-subtitle>{{ container.status }}</v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item>
      <v-list-item-avatar>
        <v-icon color="secondary">mdi-update</v-icon>
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title>Watcher</v-list-item-title>
        <v-list-item-subtitle>
          <router-link to="/configuration/watchers">{{
            container.watcher
          }}</router-link>
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item v-if="container.includeTags">
      <v-list-item-avatar>
        <v-icon color="secondary">mdi-tag</v-icon>
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title>
          Include tags
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                x-small
                icon
                v-bind="attrs"
                v-on="on"
                href="https://regex101.com"
                target="_blank"
              >
                <v-icon>mdi-regex</v-icon>
              </v-btn>
            </template>
            <span>Test on regex101.com</span>
          </v-tooltip>
        </v-list-item-title>
        <v-list-item-subtitle>{{ container.includeTags }}</v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item v-if="container.excludeTags">
      <v-list-item-avatar>
        <v-icon color="secondary">mdi-tag-off</v-icon>
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title>
          Exclude tags
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                x-small
                icon
                out
                v-bind="attrs"
                v-on="on"
                href="https://regex101.com"
                target="_blank"
              >
                <v-icon>mdi-regex</v-icon>
              </v-btn>
            </template>
            <span>Test on regex101.com</span>
          </v-tooltip>
        </v-list-item-title>
        <v-list-item-subtitle>{{ container.excludeTags }}</v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item v-if="container.transformTags">
      <v-list-item-avatar>
        <v-icon color="secondary">mdi-tag-arrow-right</v-icon>
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title>Transform tags</v-list-item-title>
        <v-list-item-subtitle>{{
          container.transformTags
        }}</v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item v-if="container.linkTemplate">
      <v-list-item-avatar>
        <v-icon color="secondary">mdi-file-replace</v-icon>
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title>Link template</v-list-item-title>
        <v-list-item-subtitle>{{
          container.linkTemplate
        }}</v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item v-if="container.link">
      <v-list-item-avatar>
        <v-icon color="secondary">mdi-link</v-icon>
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title>Link</v-list-item-title>
        <v-list-item-subtitle
          ><a :href="container.link" target="_blank">{{ container.link }}</a>
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>
<script>
export default {
  props: {
    container: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {};
  },

  methods: {
    copyToClipboard(kind, value) {
      this.$clipboard(value);
      this.$root.$emit("notify", `${kind} copied to clipboard`);
    },
  },
};
</script>

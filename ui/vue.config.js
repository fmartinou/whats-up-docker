module.exports = {
  transpileDependencies: ["vuetify"],

  devServer: {
    proxy: "http://localhost:3000",
  },

  pwa: {
    name: "What's up Docker?",

    themeColor: "#00355E",
    msTileColor: "#00355E",
    appleMobileWebAppCapable: "yes",
    manifestOptions: {
      short_name: 'WUD',
      background_color: "#00355E"
    }
  },
};

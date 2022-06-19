module.exports = {
  transpileDependencies: ["vuetify"],
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.proto$/,
          loader: "pbf-loader"
        }
      ]
    },
    externals: ['tiktok-live-connector']
  },
  pluginOptions: {
    electronBuilder: {
      
      mainProcessWatch: [
        "src/controllers/*",
        "src/database/models/*",
        "src/background.js",
      ],
      nodeIntegration: true,
      externals: [
        "typeorm",
        "sequelize",
        "sequelize-typescript",
        "sqlite3",
        "pg-hstore",
        "electron-pos-printer",
        "tiktok-live-connector"
      ],
    },
  },
};

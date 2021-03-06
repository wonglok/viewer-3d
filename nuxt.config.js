import path from 'path'
import fs from 'fs'

export default {
  server: {
    port: 3000,
    host: '0.0.0.0',
    timing: false,
    // https: {
    //   key: fs.readFileSync(path.join(__dirname, '/cert/server.key')),
    //   cert: fs.readFileSync(path.join(__dirname, '/cert/server.crt'))
    // }
  },
  mode: 'spa',
  /*
   ** Headers of the page
   */
  head: {
    title: 'My 3D FameWork',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: 'Make WebGL Simple, Easier and More organised',
      },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#fff' },
  /*
   ** Global CSS
   */
  css: [],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [],
  /*
   ** Nuxt.js modules
   */
  modules: [],
  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {
      // config.devServer = {
      //   hot: true,
      //   inline: false,
      // }
    },
  },
  buildModules: [
    '@nuxtjs/tailwindcss'
  ]
};

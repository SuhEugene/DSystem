require("dotenv").config();

// console.log(process.dev)
const prodVersion = true;

export default {
  telemetry: false,
  loading: {
    color: "#346db3",
    height: "4px"
  },
  // loading: "~/components/LoadingBar.vue",
  env: {
    axiosBase: prodVersion ? process.env.API_URL : 'http://localhost:8080/api',
    // oauthBase: prodVersion ? process.env.OAUTH_URL : 'http://localhost:8082',
    thisUrl: prodVersion ? process.env.SELF_URL : 'http://localhost:8080'
  },


  // AXIOS URLS
  axios: { baseURL: prodVersion ? process.env.API_URL : 'http://localhost:8080/api'/*, proxy: true */},
  publicRuntimeConfig: {
    axios: { browserBaseURL: prodVersion ? process.env.API_URL : 'http://localhost:8080/api' }
  },
  privateRuntimeConfig: {
    axios: { baseURL: prodVersion ? process.env.API_URL : 'http://localhost:8080/api' }
  },
  /*
   ** Rendering mode
   ** Doc: https://nuxtjs.org/api/configuration-mode
   */
  mode: "universal",
  // mode: "spa",

  loadingIndicator: {
    name: 'three-bounce',
    color: '#346db3',
    background: '#222222'
  },

  /*
   ** Headers of the page
   ** Doc: https://vue-meta.nuxtjs.org/api/#metainfo-properties
   */
  head: {
    title: "Dromon",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        property: "theme-color",
        content: "#346db3"
      }
    ],
    link: [
      // {
      //   rel: "canonical",
      //   href: "https://dromon.ru/"
      // },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com"
      },
      {
        rel: "preconnect",
        href: prodVersion ? process.env.API_URL : 'http://localhost:8080/api'
      },
      {
        rel: "icon",
        href: "/favicon.ico"
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;700&display=swap"
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&display=swap"
      }
    ]
  },
  // serverMiddleware: { "/api": "~/api" },

  /*
   ** Global CSS
   ** Doc: https://nuxtjs.org/api/configuration-css
   */
  css: ["~/assets/style.scss"],


  render: {
    bundleRenderer: {
      shouldPreload: (file, type) => {
        return ["script", "style", "font"].includes(type);
      }
    }
  },
  /*
   ** Nuxt.js modules
   ** Doc: https://nuxtjs.org/guide/modules
   */
  modules: [
    // Doc: https://http.nuxtjs.org
    "@nuxtjs/axios",
    // "@nuxtjs/auth",
    // "@nuxtjs/proxy",
    "nuxt-socket-io"
  ],

  // proxy: {
  //   '/api/': { target: prodVersion ? process.env.REALAPI_URL : 'http://localhost:8081', pathRewrite: {'^/api/': ''} }
  // },

  router: {
    // middleware: [/*"auth",*/ "authTest"]
  },
  io: {
    sockets: [{
      url: prodVersion ? process.env.SELF_URL : 'http://localhost:8080/api'
    }]
  },

  plugins: [
    '~/plugins/api.js',
    '~/plugins/auth.js'
  ],


  /*
   ** Build configuration
   ** Doc: https://nuxtjs.org/api/configuration-build
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {
      config.module.rules.push({test: /\.(mp3|wav)$/i, use: [{loader: 'file-loader'}]});
    },
  }
};

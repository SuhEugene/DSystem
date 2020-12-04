require("dotenv").config();

export default {
  loading: {
    color: "#346db3",
    height: "4px"
  },
  // loading: "~/components/LoadingBar.vue",
  env: {
    axiosBase: process.env.API_URL || 'http://localhost:8081',
    oauthBase: process.env.OAUTH_URL || 'http://localhost:8082',
    thisUrl: process.env.SELF_URL || 'http://localhost:8080'
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
        href: process.env.API_URL || 'http://localhost:8081'
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

  /*
   ** Plugins to load before mounting the App
   ** Doc: https://nuxtjs.org/guide/plugins
   */
  plugins: [],

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
    "nuxt-socket-io"
  ],
  router: {
    // middleware: [/*"auth",*/ "authTest"]
  },
  io: {
    sockets: [{
      url: process.env.API_URL
    }]
  },
  // auth: {
  //   localStorage: false,
  //   cookie: {
  //     domain: process.env.SELF_URL || "http://localhost:8080",
  //     secure: true
  //   },
  //   strategies: {
  //     // cookie: {
  //     //   cookie: {
  //     //     // (optional) If set we check this cookie exsistence for loggedIn check
  //     //     name: 'XSRF-TOKEN',
  //     //   }
  //     // },
  //     local: {
  //       endpoints: {
  //         login: {
  //           url: `${process.env.API_URL}/auth/login`,
  //           method: "post",
  //           propertyName: "token"
  //         },
  //         logout: {
  //           url: `${process.env.API_URL}/auth/logout`,
  //           method: "post"
  //         },
  //         user: {
  //           url: `${process.env.API_URL}/users/@me`,
  //           method: "get",
  //           propertyName: "user"
  //         }
  //       }
  //       // tokenRequired: true,
  //       // tokenType: 'bearer',
  //       // globalToken: true,
  //       // autoFetchUser: true
  //     },
  //     discord: {
  //       _scheme: "oauth2",
  //       authorization_endpoint: "https://discord.com/oauth2/authorize",
  //       userinfo_endpoint: `${process.env.API_URL}/users/@me`,
  //       scope: ["identify"],
  //       access_token_endpoint: `${process.env.API_URL}/test`,
  //       response_type: "code",
  //       token_type: "Bearer",
  //       redirect_uri: `${process.env.SELF_URL}/profile`,
  //       client_id: "701439769133187092",
  //       token_key: null,
  //       prompt: "none"
  //     },
  //     // "discord-reg": {
  //     //   _scheme: "oauth2",
  //     //   authorization_endpoint: "https://discord.com/oauth2/authorize",
  //     //   userinfo_endpoint: `${process.env.API_URL}/users/@me`,
  //     //   scope: ["identify"/*, "guilds"*/],
  //     //   access_token_endpoint: `${process.env.API_URL}/auth/discord-reg`,
  //     //   response_type: "code",
  //     //   token_type: "Bearer",
  //     //   redirect_uri: `${process.env.SELF_URL}/registration`,
  //     //   client_id: "701439769133187092",
  //     //   token_key: "token",
  //     //   prompt: "none"
  //     // }
  //   },
  //   redirect: {
  //     login: "/login",
  //     logout: "/",
  //     callback: "/login",
  //     home: "/profile"
  //   },
  //   // endpoints: {
  //   //   // (optional) If set, we send a get request to this endpoint before login
  //   //   xsrf: {
  //   //     url: ''
  //   //   }
  //   // }
  //   // plugins: [ /*{ src: '~/plugins/axios', ssr: true }*/ { src:'~/plugins/auth.js', ssr:true} ]
  // },

  plugins: [ '~/plugins/auth.js' ],


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

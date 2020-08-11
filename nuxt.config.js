require("dotenv").config();

export default {
  loading: {
    color: "#346db3",
    height: "4px"
  },
  env: {
    axiosBase: process.env.API_URL || 'http://localhost:8081'
  },
  /*
   ** Rendering mode
   ** Doc: https://nuxtjs.org/api/configuration-mode
   */
  mode: "universal",

  /*
   ** Headers of the page
   ** Doc: https://vue-meta.nuxtjs.org/api/#metainfo-properties
   */
  head: {
    title: "Diamond",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content: "Оплати всё и везде"
      },
      {
        property: "og:title",
        content: "Diamond"
      },
      {
        name: "title",
        content: "Diamond"
      },
      {
        property: "og:url",
        content: "http://diamond.sp.net.ru/"
      },
      {
        property: "theme-color",
        content: "#357aff"
      },
      // {
      //   property: "og:image",
      //   content: "http://diamond.sp.net.ru/favicon.png"
      // },
      {
        property: "og:description",
        content: "Город, в котором ты будешь жить, а не выживать"
      }
    ],
    link: [
      // {
      //   rel: "stylesheet",
      //   href: "https://fonts.googleapis.com/css2?family=Scada:wght@400;700&display=swap"
      // }
      {
        rel: "icon",
        href: "/favicon.ico"
      },
      {
        rel: "stylesheet",
        href:
          "https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;700&display=swap"
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
    "@nuxtjs/auth",
    "nuxt-socket-io"
  ],
  router: {
    middleware: ["auth"]
  },
  io: {
    sockets: [{
      url: process.env.API_URL
    }]
  },
  auth: {
    strategies: {
      local: {
        endpoints: {
          login: {
            url: `${process.env.API_URL}/auth/login`,
            method: "post",
            propertyName: "token"
          },
          logout: {
            url: `${process.env.API_URL}/auth/logout`,
            method: "post"
          },
          user: {
            url: `${process.env.API_URL}/users/@me`,
            method: "get",
            propertyName: "user"
          }
        }
        // tokenRequired: true,
        // tokenType: 'bearer',
        // globalToken: true,
        // autoFetchUser: true
      },
      discord: {
        _scheme: "oauth2",
        authorization_endpoint: "https://discord.com/oauth2/authorize",
        userinfo_endpoint: `${process.env.API_URL}/users/@me`,
        scope: ["identify"],
        access_token_endpoint: `${process.env.API_URL}/auth/discord`,
        response_type: "code",
        token_type: "Bearer",
        redirect_uri: `${process.env.SELF_URL}/profile`,
        client_id: "701439769133187092",
        token_key: "token",
        prompt: "none"
      },
      "discord-reg": {
        _scheme: "oauth2",
        authorization_endpoint: "https://discord.com/oauth2/authorize",
        userinfo_endpoint: `${process.env.API_URL}/users/@me`,
        scope: ["identify", "guilds"],
        access_token_endpoint: `${process.env.API_URL}/auth/discord-reg`,
        response_type: "code",
        token_type: "Bearer",
        redirect_uri: `${process.env.SELF_URL}/registration`,
        client_id: "701439769133187092",
        token_key: "token",
        prompt: "none"
      }
    },
    redirect: {
      login: "/login",
      logout: "/",
      callback: "/login",
      home: "/profile"
    }
  },

  /*
   ** Build configuration
   ** Doc: https://nuxtjs.org/api/configuration-build
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {}
  }
};

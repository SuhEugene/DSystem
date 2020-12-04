


class Auth {
  constructor ({store, $axios, query, app}, auth) {
      this.$store = store;
      this.$auth = auth;
      this.$axios = $axios;
      this.query = query;
      this.app = app;
  }

  get user() { return this.$store.state.$auth.user; }
  get loggedIn() { return this.$store.state.$auth.loggedIn; }
  get error () { return this.$store.state.$auth.error; }
  get bigError () { return this.$store.state.$auth.bigError; }

  set loggedIn(bool) { this.$store.commit("setLoggedIn", bool)}
  set user (user) { this.$store.commit("setUser", user);/* console.log("user set", user)*/ }
  set error (err) { this.$store.commit("setAuthError", err); }
  set bigError (err) { this.$store.commit("setAuthBigError", err); }

  async fetchUser(retry=false) {
    try {
      let r = await this.$axios.get(this.$auth.discord.userinfo_endpoint, { withCredentials: true });
      this.user = r.data;
      this.loggedIn = true;
      this.error = false;
      return true;
    } catch (e) {
      console.warn(e.response ? e.response.data : e);
      this.user = false;
      this.loggedIn = false;
      this.error = e.response ? e.response.data : e;
      if (!retry && e.response && e.response.data.error == "retry")
        await this.fetchUser(true);
      return false;
    }
  }

  async logIn (code) {
    try {
      let { redirect_uri, client_id } = this.$auth.discord;
      let r = await this.$axios.post(this.$auth.discord.access_token_endpoint, {
        code,
        redirect_uri,
        client_id
      }, { withCredentials: true });
      if (r.data.token) {
        localStorage.setItem("access_token", r.data.token);
      }
      return true;
    } catch (e) {
      console.warn(e.response ? e.response.data : e);
      this.bigError = e.response ? e.response.data : e;
      return false;
    }
  }

  loginWith (type) {
    if (type == "discord") {
      const state = randString();
      if (process.browser){
        localStorage.setItem("state", state);
        const {
          response_type,
          redirect_uri,
          client_id,
          token_type,
          scope,
          prompt,
          authorization_endpoint
        } = this.$auth.discord;
        const data = [
          `response_type=${response_type}`,
          `redirect_uri=${redirect_uri}`,
          `client_id=${client_id}`,
          `token_type=${token_type}`,
          `scope=${scope.join(" ")}`,
          `state=${state}`,
          `prompt=${prompt}`
        ];
        window.location = `${authorization_endpoint}?`+data.join("&");
      }
    }
  }
}

const alphabet = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890_+@!-"
function randString() {
  let text = "";
  for (let i = 0; i < 15; i++) {
    text += alphabet[Math.floor(Math.random()*alphabet.length)];
  }
  return text;
}



export default async function (ctx, inject) {

  // if (ctx.route.path == "/logout") {
  //   ctx.res.clearCookie("auth");
  //   ctx.res.clearCookie("refresh");
  // }

  if (ctx.route.path == "/") return ctx.redirect("/login");

  const authData = {
    discord: {
      _scheme: "oauth2",
      authorization_endpoint: "https://discord.com/oauth2/authorize",
      userinfo_endpoint: `${ctx.env.axiosBase}/users/@me`,
      scope: ["identify"],
      access_token_endpoint: `${ctx.env.axiosBase}/auth/discord`,
      response_type: "code",
      token_type: "Bearer",
      redirect_uri: `${ctx.env.thisUrl}/login`,
      client_id: "701439769133187092",
      token_key: null,
      prompt: "none"
    },
    redirect: {
      login: "/login",
      logout: "/",
      callback: "/login",
      home: "/profile"
    }
  };
  // for (let i in ctx) {
  //   console.log(i)
  // }
  let $auth = new Auth(ctx, authData);
  inject("auth", $auth);

  if (process.browser) {
    console.log(ctx.query.code, ctx.query.state, localStorage.getItem("state"))
    if (ctx.query.code && ctx.query.state && ctx.query.state == localStorage.getItem("state")) {
      await $auth.logIn(ctx.query.code);
      console.log("LOGGING IN")
    }
  }
  process.browser && localStorage.removeItem("state");
  await $auth.fetchUser();

  if (!$auth.loggedIn && !["/login", "/register"].includes(ctx.route.path)) {
    ctx.redirect("/login");
  }
  if ($auth.loggedIn && ["/login", "/register"].includes(ctx.route.path)) {
    ctx.redirect("/profile");
  }
  // inject("test", () => console.log("hello"))


  // process.browser && inject("authm", $auth);
  // console.log("uesr", await $auth.fetchUser());


  // if ( {
  //   console.log("HELLO")
  // } else {
  //   console.log("goodbye");
  // }

  // $axios.withCredentials = true;
  // $axios.defaults.withCredentials = true;
  // $axios.defaults.headers.common.withCredentials = true;
  // next();
  // console.log($axios.defaults);
}

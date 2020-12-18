import axios from 'axios'

class Auth {
  constructor ({store, query, app, redirect}, auth, $api) {
      this.$store = store;
      this.$auth = auth;
      this.$api = $api;
      this.query = query;
      this.app = app;
      this.redirect = redirect;
  }

  get user() { return this.$store.state.$auth.user; }
  get loggedIn() { return this.$store.state.$auth.loggedIn; }
  get error () { return this.$store.state.$auth.error; }
  get bigError () { return this.$store.state.$auth.bigError; }

  set loggedIn(bool) { this.$store.commit("setLoggedIn", bool)}
  set user (user) { this.$store.commit("setUser", user);/* console.log("user set", user)*/ }
  set error (err) { this.$store.commit("setAuthError", err); }
  set bigError (err) { this.$store.commit("setAuthBigError", err); }

  async logout() {
    try {
      await this.$api.get("/auth/logout", { withCredentials: true });
      this.loggedIn = false;
      this.user = false;
      if (process.server) this.redirect("/login")
      if (process.browser) this.app.router.push("/login");
    } catch (e) {}
  }

  async fetchUser(retry=false) {
    try {
      debug("\n/*/ NEW FETCH USER");
      let r = await this.$api.get(this.$auth.discord.userinfo_endpoint, { withCredentials: true });
      debug("/*/ req was");
      this.user = r.data;
      debug("/*/ user set");
      this.loggedIn = true;
      debug("/*/ logged in");
      this.error = false;
      debug("/*/ no error\nEND\n");
      return true;
    } catch (e) {
      console.warn(e.response ? e.response.data : e);
      debug("/*/ fuck error");
      this.user = false;
      debug("/*/ user false");
      this.loggedIn = false;
      debug("/*/ not logged in");
      this.error = e.response ? e.response.data : e;
      // На случай отключения сервера
      if (e.response && e.response.status == 502) this.error = { message: "Network Error" };
      debug("/*/ error");
      if (!retry && e.response && e.response.data.error == "retry"){
        debug("/*/ refetch");
        await this.fetchUser(true);
      }
      debug("/*/ false\nEND\n");
      return false;
    }
  }

  async logIn (code) {
    try {
      let { redirect_uri, client_id } = this.$auth.discord;
      let r = await this.$api.post(this.$auth.discord.access_token_endpoint, {
        code,
        redirect_uri,
        client_id
      }, { withCredentials: true });
      if (r.data.token) {
        localStorage.setItem("access_token", r.data.token);
      }
      return true;
    } catch (e) {
      this.bigError = e.response ? e.response.data : e;
      if (e.response && e.response.status == 502) this.bigError = { message: "Network Error" };
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

const debug = (...args) => console.log(...args);

const free = ["/user", "/app"];

export default async function (ctx, inject) {

  let cookie;
  console.log("I'm on server?", `${process.server ? 'Yes' : 'No'}`);

  const api = axios.create({ baseURL: process.env.axiosBase });
  if (process.server && ctx.req.headers.cookie) { api.defaults.headers.common['cookie'] = ctx.req.headers.cookie; }
  debug("/ test");
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

  debug("Auth injection");
  let $auth = new Auth(ctx, authData, api);
  inject("auth", $auth);

  debug("Log in");
  if (process.browser) {
    console.log(ctx.query.code, ctx.query.state, localStorage.getItem("state"))
    if (ctx.query.code && ctx.query.state && ctx.query.state == localStorage.getItem("state")) {
      await $auth.logIn(ctx.query.code);
      console.log("LOGGING IN")
    }
    if (ctx.query.state) {
      debug("State removing")
      localStorage.removeItem("state");
    }
  }
  debug("User Fetch")
  await $auth.fetchUser();

  for (let path of free) {
    if (ctx.route.path.startsWith(path))
      return;
  }
  debug("Not logged in check")
  if (!$auth.loggedIn && !["/login", "/register"].includes(ctx.route.path)) {
    debug("Not logged in !!!!")
    ctx.redirect("/login");
  }
  debug("Logged in check")
  if ($auth.loggedIn && ["/login", "/register"].includes(ctx.route.path)) {
    debug("Logged in !!!!")
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

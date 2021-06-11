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
  get error () { return this.$store.state.$auth.error; }
  get loggedIn() { return this.$store.state.$auth.loggedIn; }
  get bigError () { return this.$store.state.$auth.bigError; }

  set user (user) { this.$store.commit("setUser", user); }
  set error (err) { this.$store.commit("setAuthError", err); }
  set loggedIn(bool) { this.$store.commit("setLoggedIn", bool); }
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
      let r = await this.$api.get(this.$auth.discord.userinfo_endpoint, { withCredentials: true });
      this.user = r.data;
      if (this.user.logs) {
        let logs = [...this.user.logs];
        let date = -1;
        for (let i in logs) {
          const d = new Date(logs[i].timestamp);
          if (d.getDate() == date) continue;
          date = d.getDate();
          logs[i].firstOfDay = true;
        }
        this.$store.commit("setLogs", logs);
      }
      this.loggedIn = true;
      this.error = false;
      if (!retry && r.data.error == "retry"){
        console.log("[Auth] Retrying to fetch user data...")
        await this.fetchUser(true);
      }
      console.log("[Auth] Successfully fetched user data")
      return true;
    } catch (e) {
      console.warn("[Auth] Error: can't fetch user data");
      this.user = (e.response && e.response.data && e.response.data.uuid) ? e.response.data : false;
      this.loggedIn = false;
      this.error = e.response ? e.response.data : e;
      // На случай отключения сервера
      if (e.response && e.response.status == 502) this.error = { message: "Network Error" };
      if (!retry && e.response && e.response.data.error == "retry"){
        console.log("[Auth] Retrying to fetch user data...")
        return await this.fetchUser(true);
      }
      if (e.response && (e.response.data.error == "Frozen" || e.response.data.e == "F")) {
        if (process.server) { this.redirect("/frozen"); }
        if (process.browser) { this.app.router.push("/frozen"); }
      }
      console.error("[Auth] Unable to fetch user data");
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
      console.log("[Auth] Successfully logged in")
      return true;
    } catch (e) {
      console.warn("[Auth] Error: can't log in using Discord");
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

const alphabet = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890_-"
function randString() {
  let text = "";
  for (let i = 0; i < 15; i++) {
    text += alphabet[Math.floor(Math.random()*alphabet.length)];
  }
  return text;
}


const free = ["/user", "/app", '/frozen', '/oauth2'];

export default async function (ctx, inject) {

  let cookie;
  console.log(`[Auth] Trying to log in on ${process.server ? 'server' : 'client'}`);

  const api = axios.create({ baseURL: process.env.axiosBase });
  if (process.server && ctx.req.headers.cookie) { api.defaults.headers.common['cookie'] = ctx.req.headers.cookie; }
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

  let $auth = new Auth(ctx, authData, api);
  inject("auth", $auth);

  if (process.browser) {
    console.log(ctx.query.code, ctx.query.state, localStorage.getItem("state"))
    if (ctx.query.code && ctx.query.state && ctx.query.state == localStorage.getItem("state")) {
      console.log("[Auth] Logging in with Discord...")
      await $auth.logIn(ctx.query.code);
    }
    if (ctx.query.state) {
      localStorage.removeItem("state");
    }
  }
  console.log("[Auth] Fetching user data...")
  await $auth.fetchUser();

  for (let path of free) {
    if (ctx.route.path.startsWith(path))
      return;
  }
  if (!$auth.loggedIn && !["/login", "/register"].includes(ctx.route.path)) {
    ctx.redirect("/login");
  }
  if ($auth.loggedIn && ["/login", "/register"].includes(ctx.route.path)) {
    ctx.redirect("/profile");
  }
}

<template>
  <section>
    <div class="profile-header">
      <div class="profile-header__overlay"></div>
      <div class="profile-header__holder">
        <div class="profile-header__holder__spacer profile-header__holder__spacer--0"></div>
        <UserAvatar />
        <div class="profile-header__holder--nick-bal">
          <div class="profile-header__nickname">
            <div class="profile-header__nickname--name">{{$auth.user.username}}</div>
            <input class="profile-header__nickname--status"
                   @blur="sendStatus"
                   v-model="status"
                   placeholder="Укажите статус"
                   type="text">
          </div>
          <div class="profile-header__balance">
            <div class="profile-header__balance--title">Баланс</div>
            <div class="profile-header__balance--value">{{$auth.user.balance}} АР</div>
          </div>
        </div>
        <div class="profile-header__holder__spacer profile-header__holder__spacer--1"></div>
        <HeaderButtons :posts="posts" :users="users" :moder="moder" :banker="banker" class="profile-header__buttons"/>
      </div>
    </div>
    <div class="history">
      <h1>История операций</h1>
      <div class="history__inner">
        <p v-if="!$auth.user.logs.length">Операций не найдено</p>
        <HistoryEl v-for="log in $store.state.logs" :key="log._id" :log="log"/>
      </div>
      <!-- <button @click="$auth.fetchUser('discord')">Перезагрузка</button> -->
    </div>
    <Call v-for="call in calls" :key="call.id" :user="call.user" :bank="call.bank"/>
  </section>
</template>

<script>
/* global process */
import HeaderButtons from "~/components/HeaderButtons.vue";
import Call from "~/components/Call.vue";
import HistoryEl from "~/components/HistoryEl.vue";
import UserAvatar from "~/components/UserAvatar.vue";

export default {
  // auth: "guest",
  components: {
    HeaderButtons,
    Call,
    HistoryEl,
    UserAvatar
  },
  data: () => ({
    moder: false,
    banker: false,
    calls: [],
    status: "",
    socket: 123
  }),
  async asyncData({app}) {
    const posts = await app.$axios.get('/posts');
    const users = await app.$axios.get('/users');
    return { posts: posts.data, users: users.data };
  },
  methods: {
    themeChange() {
      if (process.browser) {
        localStorage.getItem("dark")
          ? localStorage.removeItem("dark")
          : localStorage.setItem("dark", "true");
        this.$parent.$parent.dark = localStorage.getItem("dark") === "true";
      }
    },
    sendStatus () {
      if (this.$auth.user.status == this.status) return;
      this.$axios.patch("/users/@me/status", {status: this.status})
      .then(r => {this.status = r.data.status; this.$auth.setUser(r.data)})
      .catch(() => {this.status = this.$auth.user.status});
    },
  },
  mounted () {
    if (this.$auth.user.role == 0) return this.$router.push("/registration");
    this.status = this.$auth.user.status;
    this.banker = this.$auth.user.role > 1;
    this.$store.commit("setLogs", this.$auth.user.logs);
    this.socket = this.$nuxtSocket({persist: true});
    this.socket.on("connect", () => {
      console.log("[WS] connected");
      this.socket.emit("hello",
        localStorage.getItem("auth._token.discord") ||
        localStorage.getItem("auth._token.discord-reg") ||
        localStorage.getItem("auth._token.local"))
        this.$nuxt.$loading.start();
    })
    this.socket.on("hello", err => {
      this.$nuxt.$loading.finish();
      console.log("[WS] logged in");
    });
    this.socket.on("logs", logs => {
      console.log("[WS] recieved logs");
      this.$store.commit("setLogs", logs);
    });
    this.socket.on("balance", bal => {
      console.log("[WS] recieved balance");
      this.$store.commit("setBal", bal);
    });
  }
};
</script>
<template>
  <section>
    <div class="profile-header">
      <div class="profile-header__overlay"></div>
      <div class="profile-header__holder">
        <div class="profile-header__holder__spacer profile-header__holder__spacer--0"></div>
        <UserAvatar :user="this.$auth.user" />
        <div class="profile-header__holder--nick-bal">
          <div class="profile-header__nickname">
            <div class="profile-header__nickname--name">{{$auth.user.username}}</div>
            <label>
              <input class="profile-header__nickname--status"
                     @blur="sendStatus"
                     v-model="status"
                     placeholder="Укажите статус"
                     type="text" id="sendStatus"
                     name="sendStatus">
           </label>
          </div>
          <div class="profile-header__balance">
            <div class="profile-header__balance--title">Баланс</div>
            <div class="profile-header__balance--value">{{$auth.user.balance}} АР</div>
          </div>
        </div>
        <div class="profile-header__holder__spacer profile-header__holder__spacer--1"></div>
        <HeaderButtons
          class="profile-header__buttons"
          :posts="posts"
          :users="users"
          :moder="moder"
          :banker="banker" />
      </div>
    </div>
    <div class="history">
      <div class="history__inner">
        <audio ref="newOperationSound" src="~/assets/ping.mp3"></audio>
        <h1>История операций</h1>
        <div class="history__inner__data">
          <p v-if="!$store.state.logs">Операций не найдено</p>
          <HistoryEl v-for="log in $store.state.logs" :key="log._id" :log="log"/>
        </div>
      </div>
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
    socket: null
  }),
  async asyncData({ app }) {
    // let posts = [];
    // let users = []
    // try {
    const posts = await app.$api.get('/posts', { withCredentials: true })/* || []*/;
    // } catch (e) {
    //   posts = [];
    // }
    // try {
    const users = await app.$api.get('/users', { withCredentials: true })/* || []*/;
    // } catch (e) {
    //   users = [];
    // }
    return { posts: posts.data, users: users.data };

  },
  methods: {
    themeChange() {
      if (process.browser) { this.$store.commit("changeTheme"); }
    },
    sendStatus () {
      if (this.$auth.user.status == this.status) return;
      this.$axios.patch("/users/@me/status", {status: this.status}, { withCredentials: true })
      .then(r => {this.status = r.data.status; this.$auth.setUser(r.data)})
      .catch(() => {this.status = this.$auth.user.status});
    }
  },
  mounted () {
    setTimeout(()=>{this.$auth.fetchUser()}, 500);
    this.status = this.$auth.user.status;
    this.banker = this.$auth.user.role > 1;
    this.$store.commit("setLogs", this.$auth.user.logs);
    this.socket = this.$nuxtSocket({persist: true});
    this.socket.on("connect", client => {
      console.log("[WS] connected");
      this.socket.on("hello", err => {
        this.$nuxt.$loading.finish();
        console.log("[WS] logged in");
      });
      this.socket.on("logs", logs => {
        console.log("[WS] recieved logs");
        if (logs != this.$store.state.logs) {
          this.$refs.newOperationSound.play();
        }
        this.$store.commit("setLogs", logs);
      });
      this.socket.on("balance", bal => {
        console.log("[WS] recieved balance");
        this.$store.commit("setBal", bal);
      });
      this.socket.on("you are", name => {
        this.$axios.post("/ws", { cid: name }, { withCredentials: true });
      })
      this.$nuxt.$loading.start();
    });
  }
};
</script>

<!-- <div style="display: none;" class="mrFear">
      <br />***<br />
      Привет<br />
      Меня звать - Мистер Страх<br />
      Хотел бы поскорее завершить<br />
      Я здесь, чтоб управлять тобой<br />
      Поверь, все твои желанья, весь ты мой<br />
      Знай...<br />
      Не исчезну никогда...<br />
      Впусти же ты в себя...<br />
      Поверь мне дорогой...<br />
      Лекарства не будет, знай...<br />
      ***<br />
      Знай...<br />
      Не исчезну никогда...<br />
      Нечто внутри тебя...<br />
      Не борись же ты со мной...<br />
      И Что же будет с тобой...<br />
      ***<br />
    </div> -->
    <!-- <div class="mrFear2">
      Cause you make me feel... Line I'm so... Alone...
      I know it's not real... But in my... Sooooul...
    </div> -->

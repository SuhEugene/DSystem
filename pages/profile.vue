<template>
  <section>
    <div class="profile-header">
      <div class="profile-header__overlay"></div>
      <div class="profile-header__holder">
        <div class="profile-header__holder__spacer profile-header__holder__spacer--0"></div>
        <client-only>
          <UserAvatar :user="$auth.user" />
        </client-only>
        <div class="profile-header__holder--nick-bal">
          <div class="profile-header__nickname">

            <!-- IDEA: nickname click copying send link -->
            <div class="profile-header__nickname--name">{{$auth.user && $auth.user.username}}</div>
            <label>
              <input class="profile-header__nickname--status"
                     @blur="sendStatus"
                     v-model="status"
                     placeholder="Укажите статус"
                     type="text" id="sendStatus"
                     name="sendStatus" autocomplete="off">
           </label>
          </div>
          <p style="display: none;">Когда-то здесь был один единственный баланс и не было карт...</p>
          <!-- <div class="profile-header__balance">
            <div class="profile-header__balance--title">Баланс</div>
            <div class="profile-header__balance--value">{{$auth.user && $auth.user.balance}} АР</div>
          </div> -->
        </div>
        <div class="profile-header__holder__spacer profile-header__holder__spacer--1"></div>
        <HeaderButtons
          class="profile-header__buttons"
          :posts="posts" :users="users"
          :moder="moder" :banker="banker"
          :cards="$auth.loggedIn ? $auth.user.cards : []" />
      </div>
    </div>
    <div class="profile-section">
      <div class="profile-section__in">
        <div class="profile-section__left">
          <div class="cards">
            <h1>Карты</h1>
            <div v-if="$auth.loggedIn" class="cards-holder">
              <PrivateCard v-for="card in $auth.user.cards.filter(c => c.owner == $auth.user._id)"
                           :key="card._id" :data="card" :settings="true" />
              <PrivateCard v-if="$auth.user.cards.filter(c => c.owner == $auth.user._id).length < 4" type="create" />
            </div>
            <h3 v-if="$auth.loggedIn && $auth.user.cards.filter(c => c.owner != $auth.user._id).length != 0"
                style="margin-top: 10px;">
              <a @click="cardsShown = !cardsShown" href="javascript:void(0)">
                Общие карты
                <ChevronDownIcon v-if="!cardsShown" size="20" />
                <ChevronUpIcon v-else size="20" />
              </a>
            </h3>
            <div v-if="cardsShown && $auth.loggedIn" class="cards-holder">
              <PrivateCard v-for="card in $auth.user.cards.filter(c => $auth.user && c.owner._id != $auth.user._id)" :key="card._id" :data="card" />
            </div>
          </div>
          <h1 style="margin-top: 40px;">Приложения</h1>
          <div id="apps-page" class="apps-container" style="flex-direction: row; flex-wrap: wrap; justify-content: flex-start;">
            <template v-if="$fetchState.pending">
              <div class="app app--many loading" style="max-width: 250px;"  v-for="t in 3" :key="t">
                <AppImg :app="false" />
                <div class="app__data">
                  <div class="app__title"></div>
                  <div class="app__info"></div>
                  <div class="app__info"></div>
                </div>
              </div>
            </template>
            <a v-for="app in apps" :id="app._id" :key="app._id"
               target="_blank" rel="noreferrer"
               class="app app--many"
               :href="app.url" style="max-width: 250px;">
              <AppImg :app="app" />
              <div class="app__data">
                <div class="app__title" style="margin-bottom: 2px;">{{ app.name }}</div>
                <div style="font-size: 13px; -moz-line-clamp: 3; -webkit-line-clamp: 3; line-clamp: 3; line-height:14px;"
                     class="app__info">{{ app.description }}</div>
              </div>
            </a>
          </div>
        </div>
        <div class="profile-section__right">
          <div class="history">
            <audio ref="newOperationSound" src="~/assets/ping.mp3"></audio>
            <h1>История операций</h1>
            <div class="history__inner__data">
              <p v-if="!$store.state.logs || !$store.state.logs.length">Операций не найдено</p>
              <HistoryEl v-for="log in $store.state.logs" :key="log._id" :log="log"/>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Call v-for="call in calls" :key="call.id" :user="call.user" :bank="call.bank"/>
  </section>
</template>

<script>

const types = {
  "send-to": { t: "Перевод", d: "{0} отправил{--} вам {1} АР{2}"},
  "banker-void": { t: "Пополнение/Снятие" , d: "{0} изменил{--} ваш баланс на {1} АР" },
  "app-from": { t: "Перевод приложения", d: "Приложение {0} отправило вам {1} АР{2}"}
}
const sexes = ['','а','о','и'];

/* global process */
import HeaderButtons from "~/components/HeaderButtons.vue";
import Call from "~/components/Call.vue";
import AppImg from "~/components/AppImg.vue";
import PrivateCard from "~/components/PrivateCard.vue";
import Modal from "~/components/Modal.vue";
import HistoryEl from "~/components/HistoryEl.vue";
import UserAvatar from "~/components/UserAvatar.vue";

import ChevronDownIcon from "mdi-vue/ChevronDown.vue";
import ChevronUpIcon from "mdi-vue/ChevronUp.vue";

export default {
  components: {
    HeaderButtons,
    Call, PrivateCard,
    HistoryEl, AppImg,
    UserAvatar, Modal,
    ChevronDownIcon,
    ChevronUpIcon
  },
  data: () => ({
    moder: false,
    banker: false,
    calls: [],
    apps: [],
    users: [],
    posts: [],
    cardsShown: false,
    cards: [],
    status: "",
    socket: null,
    rpc: null
  }),
  async fetch() {
    console.log("fetch")
    let allApps = [];
    let posts = [];
    let users = [];

    try {
      allApps = (await this.$api.get('/apps/all/public', { withCredentials: true })).data || [];
    } catch (e) {}
    try {
      posts = (await this.$api.get('/posts', { withCredentials: true })).data || [];
    } catch (e) {}
    try {
      users = (await this.$api.get('/users', { withCredentials: true })).data || [];
      console.log("FETCHED USERS", users);
    } catch (e) {}

    this.apps = allApps;
    this.posts = posts;
    this.users = users;
  },
  fetchOnServer: false,
  methods: {
    themeChange() {
      if (process.browser) { this.$store.commit("changeTheme"); }
    },
    sendStatus () {
      if (this.$auth.user.status == this.status) return;
      this.$axios.patch("/users/@me/status", {status: this.status}, { withCredentials: true })
      .then(r => {this.status = r.data.status; this.$auth.user = r.data})
      .catch(() => {this.status = this.$auth.user.status});
    }
  },
  mounted () {
    if (!this.$auth.loggedIn) this.$router.push('/login');
    setTimeout(()=>{this.$auth.fetchUser()}, 500);
    this.status = this.$auth.user.status;
    this.banker = this.$auth.user.role >= 2;
    this.moder  = this.$auth.user.role >= 3;

    this.$store.commit("setLogs", this.$auth.user.logs);

    this.rpc = this.$nuxtSocket({persist: true, name: "rpc", reconnection: false});
    this.rpc.on("connect_error", () => {
      console.log("[RPC] connection refused");
    });
    
    this.rpc.on("connect", () => {
      console.log("[RPC] connected");
      this.rpc.emit("user", this.$auth.user);
    });

    this.socket = this.$nuxtSocket({persist: true});
    this.socket.on("connect", client => {
      console.log("[WS] connected");
      this.$nuxt.$loading.start();
    });
    this.socket.on("hello", err => {
      this.$nuxt.$loading.finish();
      console.log("[WS] logged in");
    });
    this.socket.on("logs", logs => {
      console.log("[WS] recieved logs");
      if (logs != this.$store.state.logs) {
        try {
          this.$refs.newOperationSound.play();
        } catch (e) {}

        (function(self) {
          const log = logs[0];
          console.log("[logs]", !log.toUser, log.toUser ? log.toUser._id != self.$auth.user._id : '');
          console.log("[logs]", log);
          if (!log.toUser || log.toUser._id != self.$auth.user._id) return;

          let descr = types[log.action].d.replace(
            "{0}", ((log.fromUser ? log.fromUser.username : '') || (log.fromApp ? log.fromApp.name : ''))
          ).replace("{1}", log.sum)
          .replace("{2}", logs.description ? `с комментарием ${logs.description}` : '');

          if (log.fromUser) {
            descr = descr.replace("{--}", sexes[log.fromUser.sex]);
          }

          self.$store.dispatch('addNotification', {
            img: (
              (log.fromUser ? `https://visage.surgeplay.com/face/128/${log.fromUser.uuid}` : '') ||
              (log.fromApp ? log.fromApp.avatar : '')
              ),
            title: types[log.action].t, descr
          })
        })(this);

      }
      let date = -1;
      for (let i in logs) {
        const d = new Date(logs[i].timestamp);
        if (d.getDate() == date) continue;
        date = d.getDate();
        logs[i].firstOfDay = true;
      }
      console.log("DDD", logs);
      this.$store.commit("setLogs", logs);
    });
    this.socket.on("balance", bal => {
      console.log("[WS] recieved balance");
      this.$store.commit("setBal", bal);
    });
    this.socket.on("cards", v => {
      console.log("[WS] recieved cards");
      this.$store.commit("setCards", v);
      this.rpc ? this.rpc.emit("cards", v) : '';
    });
    this.socket.on("you are", name => {
      this.$axios.post("/ws", { cid: name }, { withCredentials: true });
    })
  }
};
</script>

<style lang="scss">
  .cards-holder {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
  }
</style>

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

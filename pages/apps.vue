<template>
  <section id="apps-page">
    <header>
      <NLink to="/profile" class="btn primary icon"><HomeOutlineIcon size="24" /></NLink>
      <h1>Приложения</h1>
    </header>
    <main>
      <h1>Ваши приложения</h1>
      <div class="wrap">
        <div class="apps">
          <div @click="setApp(app)" :class="{'active': currentApp.id == app.id & appOpened}" class="app" v-for="app in myApps" :key="app.id">
            <img src="https://www.penpublishing.com/squaresMobileTest.jpg" class="app__image">
            <div class="app__data">
              <div class="app__title">{{app.name}}</div>
              <div class="app__info">Баланс: {{app.balance}}АР</div>
            </div>
          </div>
        </div>
        <div id="one-app">
          <template v-if="appOpened">
            <h1 ref="appName" @blur="checkName" contenteditable class="app-name" v-text="currentApp.name"></h1>
            <div ref="appDesc" @blur="checkDesc" contenteditable v-text="currentApp.description"></div>
            <div class="input">
              Короткий url
              <input placeholder="testapp" type="text" @blur="checkShortName" v-model="shortname">
            </div>
            <div class="input">
              Ссылка на аватар
              <input placeholder="https://example.com/image.png" @blur="checkAvatar" type="url" v-model="avatar">
            </div>
            <div class="input">
              Ссылка на сайт
              <input placeholder="https://example.com/" @blur="checkUrl" type="url" v-model="url">
            </div>
          </template>
          <h2 style="opacity: 0.5" v-else>Выберите приложение</h2>
        </div>
      </div>
      <h1 style="margin-top: 30px;">Все приложения</h1>
      <div class="app">
        <div class="app__image">
          <div class="verify"><CheckIcon size="12"/></div>
          <img src="https://www.penpublishing.com/squaresMobileTest.jpg">
        </div>
        <div class="app__data">
          <div class="app__title">Hello world</div>
          <div class="app__info">Короткое описание приложения</div>
        </div>
      </div>
    </main>
  </section>
</template>
<script>

import HomeOutlineIcon from "mdi-vue/HomeOutline.vue";
import CheckIcon from "mdi-vue/Check.vue";

export default {
  data: () => ({
    appOpened: false,
    shortname: '',
    avatar: '',
    url: '',
    myApps: [
      {
        id: 0,
        secret: 0,
        balance: 0,
        name: "The shop",
        avatar: "https://www.penpublishing.com/squaresMobileTest.jpg",
        shortname: "tsh",
        description: "The beautiful shop",
        owner: {},
        coowners: [],
        public: false,
        verified: false,
        super: false,
        nonChecked: true
      },
      {
        id: 1,
        secret: 0,
        balance: 0,
        name: "The shop",
        avatar: "https://www.penpublishing.com/squaresMobileTest.jpg",
        shortname: "tsh1",
        description: "The beautiful shop",
        owner: {},
        coowners: [],
        public: false,
        verified: false,
        super: false,
        nonChecked: true
      },
      {
        id: 2,
        secret: 0,
        balance: 0,
        name: "The shop",
        avatar: "https://www.penpublishing.com/squaresMobileTest.jpg",
        shortname: "tsh2",
        description: "The beautiful shop",
        owner: {},
        coowners: [],
        public: false,
        verified: false,
        super: false,
        nonChecked: true
      }
    ],
    currentApp: {}
  }),
  methods: {
    setApp (app) {
      this.appOpened = this.currentApp != app || !this.appOpened;
      this.currentApp = app;
    },
    checkName () {
      this.$refs.appName.innerText = this.$refs.appName.innerText.replace("\n", "")
      if (!this.$refs.appName.innerText.length) {
        this.$refs.appName.innerText = this.currentApp.name;
        return;
      }
      this.currentApp.name = this.$refs.appName.innerText.substr(0, 32);
    },
    checkDesc () {
      this.$refs.appDesc.innerText = this.$refs.appDesc.innerText.replace("\n", "")
      if (!this.$refs.appDesc.innerText.length) {
        this.$refs.appDesc.innerText = this.currentApp.description;
        return;
      }
      this.currentApp.description = this.$refs.appDesc.innerText.substr(0, 300);
    },
    checkShortName () {
      if (!this.shortname.length) {
        this.shortname = this.currentApp.shortname;
        return;
      }
      this.currentApp.shortname = this.shortname.substr(0, 12);
    },
    checkAvatar () {
      if (!this.avatar.length) {
        this.avatar = this.currentApp.avatar;
        return;
      }
      this.currentApp.avatar = this.avatar.substr(0, 64);
    },
    checkUrl () {
      if (!this.url.length) {
        this.url = this.currentApp.url;
        return;
      }
      this.currentApp.url = this.url.substr(0, 64);
    }
  },
  async asyncData ({ app }) {
    // return { apps: (await app.$axios.get("/apps")).data };
  },
  components: { HomeOutlineIcon, CheckIcon }
};
</script>
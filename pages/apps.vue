<template>

  <section id="apps-page">
    <header>
      <div class="all">
        <NLink to="/profile" class="btn primary icon"><HomeOutlineIcon size="24" /></NLink>
        <h1>Приложения</h1>
      </div>
    </header>
    <main>
      <h1 style="margin-top: 30px;">Все приложения</h1>
      <div class="apps-container">
        <template v-if="$fetchState.pending">
          <div class="app app--many loading" v-for="t in 3" :key="t">
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
           :href="app.url">
          <AppImg :app="app" />
          <div class="app__data">
            <div class="app__title">{{ app.name }}</div>
            <div class="app__info">{{ app.description }}</div>
          </div>
        </a>
      </div>
      <div id="my-apps">
        <h1>Ваши приложения</h1>
        <!-- <div v-if="createAppMenu" id="hidden-form-container">
          <form class="hidden-form">

          </form>
        </div> -->
        <div class="wrap">
          <div class="apps">
            <template v-if="$fetchState.pending">
              <div class="app loading" v-for="t in 3" :key="t">
                <AppImg :app="false" />
                <div class="app__data">
                  <div class="app__title"></div>
                  <div class="app__info"></div>
                </div>
              </div>
            </template>
            <div @click="setApp(app)" :class="{'active': currentApp._id == app._id & appOpened}" class="app" v-for="app in myApps" :key="app.id">
              <AppImg :app="app" />
              <div class="app__data">
                <div class="app__title">{{app.name}}</div>
                <div class="app__info">Баланс: {{app.balance}}АР</div>
              </div>
            </div>

            <div @click="createAppMenu = !createAppMenu; appOpened = false" class="app"
                 v-if="!$fetchState.pending && (myApps.length < 3 || ($auth.user.mayHave && myApps.length < $auth.user.mayHave))">
              <img src="https://docs.updatefactory.io/images/plus-icon.png" alt="add icon" class="app__image">
              <div class="app__data">
                <div class="app__title">Создать</div>
                <div class="app__info">приложение</div>
              </div>
            </div>
          </div>


          <div id="one-app">
            <template v-if="createAppMenu">
              <h1 contenteditable="false" class="app-name">Создание приложения</h1>
              <div contenteditable="false" class="input">
                Название приложения
                <input placeholder="TheBeautifulShop" type="text" v-model="appName">
              </div>
              <div class="input"><button @click="createApp" class="primary" type="button">Создать</button></div>
            </template>

            <div class="error" style="margin-bottom: 3px" v-if="appError"><b>
              <span>Ошибка отправки данных.</span>
              <span>Причина: "{{appError}}"</span>
            </b></div>

            <template v-if="appOpened">



              <h1 ref="appName" @blur="checkName" contenteditable class="app-name" v-text="currentApp.name"></h1>
              <div style="margin-bottom:15px;" ref="appDesc" class="app-description" @blur="checkDesc" contenteditable v-text="currentApp.description"></div>
              <div style="margin-top:7px">
                <b>Ссылка:</b>
                <span>{{`https://drom.one/${currentApp.shortname || currentApp._id}`}}</span>
                <a target="_blank" :href="`http://${loc}/app/${currentApp.shortname || currentApp._id}`">Открыть</a>
              </div>
              <div class="input">
                Короткий url
                <input placeholder="appname" type="text" @blur="checkShortName" v-model="shortname">
                <small v-if="appError == 'url'">Такой url уже существует</small>
              </div>
              <div class="input">
                Аватар
                <label class="btn min" :class="!this.avatar ? 'primary' : 'secondary'" style="display: flex; margin-top: 5px;">
                  {{ !this.avatar ? "Загрузить" : "Файл прикреплён" }}
                  <input style="display: none" type="file" accept="image/jpeg,image/x-png,image/png" @change="newFile" />
                </label>
              </div>

              <div class="input">
                <a href="javascript:void(0)" @click="secretPage=!secretPage">Раздел хакера [{{secretPage ? 'Вкл' : 'Выкл'}}]</a>
              </div>

              <div v-if="secretPage" style="margin-top:14px"><b>ID:</b> {{currentApp._id}}</div>
              <div v-if="secretPage" style="margin-top:7px">
                <b>Secret:</b>
                <span v-if="secretShow">{{currentApp.secret}}</span>
                <a @click="secretShow = !secretShow" href="javascript:void(0)">{{secretShow ? "Скрыть" : "Показать"}}</a>
              </div>
              <div v-if="secretPage" class="input">
                Ссылка на сайт
                <input placeholder="https://example.com/" @blur="checkUrl" type="url" v-model="url">
              </div>
              <div v-if="secretPage" class="input">
                Redirect URI
                <input placeholder="https://example.com/success" @blur="checkRedirectURI" type="url" v-model="redirectURI">
              </div>
              <div v-if="secretPage" class="input">
                URL события
                <input placeholder="https://example.com/handler.php" @blur="checkEventUrl" type="url" v-model="eventUrl">
              </div>
              <div v-if="secretPage" class="input">
                Подпись товара
                <label class="checkbox" :class="{'checked': sign }">
                  <n>{{sign ? 'П' : 'Не п'}}роверяется</n>
                  <input type="checkbox" v-model="sign">
                </label>
              </div>


              <div class="input">
                <!-- Стандарт -->
                <template v-if="bottomMenuStep==0">
                  <button type="button" @click="sendAllOfUs"      class="min primary">Сохранить</button>
                  <button type="button" @click="bottomMenuStep=3" class="min primary">Вывод средств</button>
                  <button type="button" @click="bottomMenuStep=1" class="min secondary">Удалить приложение</button>
                </template>

                <!-- Удаление подтверждение -->
                <template v-if="bottomMenuStep==1">
                  <button type="button" @click="bottomMenuStep=0"   class="min primary">Отмена</button>
                  <button type="button" @click="bottomMenuStep=0"   class="min primary">Назад</button>
                  <button type="button" @click="bottomMenuStep=0"   class="min primary">Не удалять</button>
                  <button type="button" @click="bottomMenuStep=2"   class="min primary">Удалить</button>
                  <button type="button" @click="bottomMenuStep=0"   class="min primary">Не хочу</button>
                </template>

                <!-- Удаление финиш -->
                <template v-if="bottomMenuStep==2">
                  <button type="button" @click="bottomMenuStep=0"   class="min primary">ОТМЕНА</button>
                  <button type="button" @click="bottomMenuStep=0; deleteApp()"   class="min error">УДАЛИТЬ</button>
                </template>

                <!-- Вывод средств 1 -->
                <template v-if="bottomMenuStep==3">
                  <span>Сумма вывода</span>
                  <input style="margin-bottom: 15px" type="number" placeholder="64" v-model="outSum" min="0">
                  <button type="button" @click="outputMoney"class="min primary">Вывод</button>
                </template>

                <!-- Вывод средств успешно -->
                <p v-if="bottomMenuStep==4">Успешно выведено {{outSum || currentApp.balance}} АР</p>

                <!-- Вывод среедств ошибка -->
                <p v-if="bottomMenuStep==5">Ошибка вывода: {{outError}}</p>
                <button v-if="bottomMenuStep==5" type="button" @click="bottomMenuStep=3" class="min primary">Назад</button>
              </div>
            </template>


            <h2 style="opacity: 0.5" v-if="!createAppMenu && !appOpened">Выберите приложение</h2>
          </div>
        </div>
      </div>
      <div class="apps" style="margin-top:50px;" v-if="$auth.user && $auth.user.role >= 3">
        <input placeholder="app id" type="text" v-model="appToPublish">
        <div class="input" style="margin-top: 10px;">
          <button @click="publishApp(true)" class="min primary">Опубликовать</button>
          <button @click="publishApp(false)" class="min primary">Удалить</button>
        </div>
      </div>
    </main>
  </section>
</template>
<script>

import HomeOutlineIcon from "mdi-vue/HomeOutline.vue";
import CheckIcon from "mdi-vue/Check.vue";
import AppImg from "~/components/AppImg.vue";

const accept = ["image/png", "image/jpeg", "image/jpg"]

export default {
  name: "Apps",
  async fetch() {//{ $api, $axios, app }
    console.log("fetch")
    // console.log("helo")
    // console.log(app.$api.post)
    // console.log($api, $axios)
    let allApps = [];
    let myApps = [];
    try {
      allApps = (await this.$api.get('/apps/all/public', { withCredentials: true })).data || [];
    } catch (e) {}
    try {
      myApps = (await this.$api.get('/apps', { withCredentials: true })).data || [];
    } catch (e) {}
    // return { myApps: myApps, apps: allApps };
    this.myApps = myApps;
    this.apps = allApps;

  },
  fetchOnServer: false,
  data: () => ({
    myApps: [],
    apps: [],
    currentApp: {},
    appOpened: false,
    createAppMenu: false,
    secretPage: false,
    bottomMenuStep: 0,
    outSum: null,
    appName: '',
    shortname: '',
    avatar: '',
    sign: null,
    url: '',
    eventUrl: '',
    redirectURI: '',
    appToPublish: '',
    secretShow: false,
    loc: null,
    appError: false,
    outError: false,
  }),
  mounted () {
    if (!this.$auth.loggedIn) this.$router.push('/login');
    if (process.browser) this.loc = window.location.host;
    try {
      // console.log("Mount fetch");
      this.$fetch();
    } catch (e) {console.warn(e)}
  },
  methods: {
    setApp (app) {
      this.bottomMenuStep = 0;
      this.createAppMenu = false;
      this.appOpened = this.currentApp != app || !this.appOpened;
      this.currentApp = app;
      this.shortname = this.currentApp.shortname;
      this.sign = this.currentApp.sign;
      // this.avatar = this.currentApp.avatar;
      this.url = this.currentApp.url;
      this.redirectURI = this.currentApp.redirectURI;
      this.eventUrl = this.currentApp.eventUrl;
      this.appError = false;
    },
    checkName () {
      this.$refs.appName.innerText = this.$refs.appName.innerText.trim().replace("\n", "")
      if (!this.$refs.appName.innerText.length) {
        this.$refs.appName.innerText = this.currentApp.name;
        return;
      }
      this.$refs.appName.innerText = this.$refs.appName.innerText.trim().substr(0, 32);
    },
    checkDesc () {
      this.$refs.appDesc.innerText = this.$refs.appDesc.innerText.trim().replace("\n", "")
      if (!this.$refs.appDesc.innerText.length) {
        this.$refs.appDesc.innerText = this.currentApp.description;
        return;
      }
      this.$refs.appDesc.innerText = this.$refs.appDesc.innerText.trim().substr(0, 300);
    },
    checkShortName () {
      if (!this.shortname || !this.shortname.length) {
        this.shortname = this.currentApp.shortname;
        return;
      }
      this.shortname = this.shortname.trim().substr(0, 24).split(/ +/).join('');
    },
    checkAvatar () {
      if (!this.avatar) {
        this.avatar = "";
        return;
      }
      this.avatar = this.avatar.trim().substr(0, 64);
    },
    checkUrl () {
      if (!this.url) {
        this.url = "";
        return;
      }
      this.url = this.url.trim().substr(0, 64);
    },
    checkRedirectURI () {
      if (!this.redirectURI) {
        this.redirectURI = "";
        return;
      }
      this.redirectURI = this.redirectURI.trim().substr(0, 64);
    },
    checkEventUrl () {
      if (!this.eventUrl) {
        this.eventUrl = "";
        return;
      }
      this.eventUrl = this.eventUrl.trim().substr(0, 64);
    },
    createApp () {
      this.$axios.post("/apps", {
        name: this.appName
      }, { withCredentials: true }).then(this.refreshApps).catch(this.errorRefresh);
      this.appName = "";
    },
    async publishApp (bool) {
      if (!this.appToPublish) return;
      if (bool) await this.$axios.post(`/apps/${this.appToPublish}/publish`)
      else await this.$axios.delete(`/apps/${this.appToPublish}/publish`);

      this.refreshApps(true);
    },
    sendAllOfUs () {
      this.$refs.appName.innerText = this.$refs.appName.innerText.replace("\n", "");
      this.$refs.appDesc.innerText = this.$refs.appDesc.innerText.replace("\n", "");
      let data = {
        name: this.$refs.appName.innerText.trim().substr(0, 32),
        description: this.$refs.appDesc.innerText.trim().substr(0, 300),
        shortname: (this.shortname) ? this.shortname.trim().split(/ +/).join('').substr(0, 24) : '',
        avatar: (this.avatar) ? this.avatar : '',
        url: (this.url) ? this.url.trim().substr(0, 64) : '',
        redirectURI: (this.redirectURI) ? this.redirectURI.trim().substr(0, 64) : '',
        eventUrl: (this.eventUrl) ? this.eventUrl.trim().substr(0, 64) : '',
        sign: (this.sign !== null) ? !!this.sign : null
      }
      this.$axios.$put(`/apps/${this.currentApp._id}`, data, { withCredentials: true })
      .then(_r => {this.refreshApps(true); this.avatar = "";}).catch(this.errorRefresh);
    },
    deleteApp () {
      this.$axios.delete(`/apps/${this.currentApp._id}`, { withCredentials: true })
      .then(() => {this.refreshApps(false);this.currentApp={};}).catch(this.errorRefresh);
    },
    async refreshApps (save=false) {
      this.appError = false;
      let apps = await this.$api.get('/apps', { withCredentials: true });
      this.myApps = apps.data;
      console.log("SAVE", save);

      try {
        let allApps = (await this.$api.get('/apps/all/public', { withCredentials: true })).data || [];
        this.apps = allApps;
      } catch (e) {}

      if (save) return;
      this.bottomMenuStep = 0;
      this.appOpened = false;
      this.createAppMenu = false;
      this.currentApp = {};
    },
    async errorRefresh(e) {
      this.appError = e.response.data.error;
      if (this.appError == "img")      { this.appError = 'Ошибка загрузки картинки'; }
      if (this.appError == "imgCD")    { this.appError = 'Кулдаун смены картинки'; }
      if (this.appError == "appCD")    { this.appError = 'Кулдаун создания приложения'; }
      if (this.appError == "url")      { this.appError = 'Короткий URL существует'; }
      if (this.appError == "Cooldown") { this.appError = 'Кулдаун сохранения'; }
      if (this.appError == "Limit")    { this.appError = 'Лимит приложений'; }
      this.currentApp = this.myApps.find(a => a._id == this.currentApp._id) || {};
    },
    async outputMoney () {
      if (parseInt(this.outSum) < 0) return;
      this.outError = false;
      try {
        let r = await this.$axios.post(`/apps/${this.currentApp._id}/take`, { sum: this.outSum || 0 }, { withCredentials: true });
        if (!r) { this.outError = "Неизвестная ошибка"; this.bottomMenuStep = 5; return;}
        this.bottomMenuStep = 4;
        setTimeout(async () => {await this.refreshApps(false); this.outSum = null;}, 1000);
      } catch (e) {
        this.outError = "Неизвестная ошибка";
        if (e && e.response && e.response.data.e == "NEM") {
          this.outError = "Недостаточно денег на балансе";
        }
        if (e && e.response && e.response.data.e == "IB") {
          this.outError = "Что-то не так с твоим числом...";
        }
        this.bottomMenuStep = 5;
      }
    },
    newFile (e) {
      if (!e.target.files.length) return;
      let file = e.target.files[0];
      this.appError = "";

      if (!accept.includes(file.type)) {
        this.appError = "Картинка не является png или jpeg";
        // e.target.files = [];
        return;
      }
      if (file.size > 1024*1024*5) {
        this.appError = "Твой файл больше 5Мб... ";
        // e.target.files = [];
        return;
      }
      let files = e.target.files || e.dataTransfer.files;
      if (!files.length) return;
      let image = new Image();
      let reader = new FileReader();
      let img = this.avatar;
      reader.onload = (e) => { img = e.target.result; this.avatar = e.target.result; console.log(this, img); document.secretImg = e.target.result;};
      reader.readAsDataURL(files[0]);
    }
  },
  components: { HomeOutlineIcon, CheckIcon, AppImg }
};
</script>

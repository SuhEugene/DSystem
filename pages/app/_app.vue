<template>
  <form id="app-send" onsubmit="() => false">
    <div v-if="app === false">
      <h2>Ошибка</h2>
      <p>{{loadErr == "sign" ? 'Неверная подпись запроса приложения' : 'Приложение не найдено'}}</p>
      <a href="javascript:void(0)" class="primary btn" @click="back">Назад</a>
    </div>
    <SuccessOverlay v-if="page === 2" />
    <ErrorOverlay   v-if="page === 3" />
    <template v-if="app !== false">
      <div class="title">
        Перевод приложению {{app.name}}
      </div>
      <div class="icons" v-if="$auth.loggedIn">
        <div class="app-img"> <!--app-img&#45;&#45;big-->
          <img alt="User avatar" :src="`https://visage.surgeplay.com/face/128/${$auth.user.uuid}`">
        </div>
        <div class="arrow"></div>
        <AppImg :app="app" />
      </div>
      <div v-if="$auth.loggedIn || $route.params.sum" class="sum">
        <div class="sum__title">Сумма</div>
        <div class="sum__num" v-if="$route.params.sum || page > 0">{{$route.params.sum || sum}} АР</div>
        <label>
          <input type="number" v-if="!$route.params.sum && page === 0" v-model="sum">
        </label>
      </div>
      <!-- <transition-group name="swipe" style="position: relative"> -->
        <div class="attrs" v-if="page === 0" :key="0">
          <div class="attrs__one">
            <div class="attrs__one__title">Приложение</div>
            <div class="attrs__one__text">{{app.name}}</div>
          </div>
          <div class="attrs__one">
            <div class="attrs__one__title">Товар</div>
            <div class="attrs__one__text">{{$route.query.text || "Пожертвование"}}</div>
          </div>
        </div>
        <div class="attrs" v-if="page === 1" :key="1">
          <div class="attrs__one">
            <div class="attrs__one__title">Ваш баланс</div>
            <div class="attrs__one__text">{{$auth.user.balance}} АР</div>
          </div>
          <div class="attrs__one">
            <div class="attrs__one__title">Комиссия</div>
            <div class="attrs__one__text">1 АР</div>
          </div>
          <div class="attrs__one">
            <div class="attrs__one__title">Итого к оплате</div>
            <div class="attrs__one__text">{{(parseInt($route.params.sum, 10) || parseInt(sum, 10)) + 1}} АР</div>
          </div>
          <div class="attrs__one">
            <div class="attrs__one__title">Пароль</div>
            <input type="password" @keypress.enter="nextPage" v-model="password">
          </div>
        </div>
        <div class="attrs" v-if="page === 2" :key="2">
          <div class="attrs__one">
            <div class="attrs__one__title">Статус</div>
            <div class="attrs__one__text">Успешно оплачено</div>
          </div>
        </div>
        <div class="attrs" v-if="page === 3" :key="3">
          <div class="attrs__one attrs__one--red">
            <div class="attrs__one__title">Ошибка оплаты</div>
            <div class="attrs__one__text">{{error}}</div>
          </div>
        </div>
      <!-- </transition-group> -->
      <div class="buttons">
        <NLink v-if="!$auth.loggedIn" class="btn primary" to="/login">Вход</NLink>
        <button type="button" @click="home" v-if="page >= 2 && $auth.loggedIn" class="primary">
          {{ ($route.query.redirect_uri) ? $route.query.ok || "Вернуться на сайт" : "В профиль" }}
        </button>
        <button type="button" @click="clearPage" v-if="page >= 2 && $auth.loggedIn && ($route.query.again == '1' || page == 3)" class="secondary">
          Ещё раз!
        </button>
        <button type="button" @click="nextPage" v-if="page < 2 && $auth.loggedIn" class="primary"
          :class="{'disabled': sumCheck || passwordCheck}">{{(page == 0) ? "Продолжить" : "Оплатить"}}
        </button>
        <button type="button" @click="backPage" v-if="page < 2 && $auth.loggedIn" class="secondary">{{(page == 0) ? "Отмена" : "Назад"}}</button>
      </div>
    </template>
  </form>
</template>
<script>
import AppImg from "~/components/AppImg";
import SuccessOverlay from "~/components/SuccessOverlay";
import ErrorOverlay from "~/components/ErrorOverlay";
  export default {
    auth: false,
    layout: "loginLayout",
    data: () => ({
      password: "",
      page: 0,
      loading: false,
      sum: 0,
      app: {},
      error: null,
      redirectValid: false
    }),
    async asyncData({ app, params, route, ...args }) {
      try {
        let sendData = [
          `uid=${route.query.uid || '0'}`,
          `sum=${params.sum || '0'}`,
          `text=${route.query.text || '0'}`,
          `sign=${route.query.sign || '0'}`
        ]
        console.log(`/apps/${params.app.split("?")[0].split("#")[0]}`);
        // console.log((await app.$api.get(`/apps/${params.app.split("?")[0].split("#")[0]}`)).data);
        return { app: (
          await app.$api.get(`/apps/${params.app.split("?")[0].split("#")[0]}${encodeURI(route.query.sign ? '?' + sendData.join("&") : '')}`)
        ).data, loadErr: null };
      } catch (e) {
        console.warn("SUKA ERR", e);
        console.warn(e.response);
        if (e.response && e.response.data && e.response.data.error == "Signature")
          return { app: false, loadErr: "sign"}
        return {app: false, loadErr: true};
      }
    },
    methods: {
      back () {
        console.log(window.history.length === 1, window.history.length)
        window.history.length === 1 ? this.$router.push("/") : window.history.back()
      },
      nextPage () {
        if (this.sumCheck || this.passwordCheck) return;
        if (this.page === 0) {this.page = 1; return;}
        this.sendData();
      },
      backPage () {
        if (this.page === 0) return window.history.back();
        this.page = 0;
      },
      clearPage () {
        this.page = 0;
        this.password = "";
        this.sum = 0;
        this.$auth.fetchUser();
      },
      home () {
        if (!this.$route.query.redirect_uri) return this.$router.push('/profile');
        if (process.browser) { window.location = this.$route.query.redirect_uri; }
      },
      async sendData () {
        if (this.sumCheck || this.passwordCheck) return;
        this.loading = true;

        let data = {
          sum: this.$route.params.sum || this.sum,
          password: this.password
        };

        (this.$route.query.text) ? data.text = this.$route.query.text : '';
        (this.$route.query.uid)  ? data.uid  = this.$route.query.uid  : '';
        (this.$route.query.sign)  ? data.sign  = this.$route.query.sign  : '';
        (this.$route.query.redirect_uri)  ? data.redirectURI  = this.$route.query.redirect_uri  : '';
        try {
          let r = await this.$axios.post( `/apps/${this.$route.params.app}/send`, data, { withCredentials: true });

          this.loading = false;

          this.page = 2;
        } catch (e) {
          this.error = "Неизвестная ошибка";
          if (e.response && (e.response.data.e === "NEM" || e.response.data.error === "Not enough money")){ this.error = "Недостаточно АР на балансе" }
          if (e.response && (e.response.data.e === "IP" || e.response.data.error === "Invalid password")) { this.error = "Неверный пароль" }
          if (e.response && (e.response.data.e === "IRU" || e.response.data.error === "Invalid redirect uri")) { this.error = "Неверный redirect uri" }
          this.page = 3;
          return;
        }
      }
    },
    computed: {
      sumCheck () {
        return ((!this.sum || this.sum <= 0) &&
                (!this.$route.params.sum || !parseInt(this.$route.params.sum) || parseInt(this.$route.params.sum) <= 0));
      },
      passwordCheck () {
        return (this.page === 1 && this.password.length < 6);
      }
    },
    components: { SuccessOverlay, ErrorOverlay, AppImg },
    fetchOnServer: true,
    head () {
      const title = this.loadErr ?(this.loadErr == 'sign' ?
      'Ошибка - неверная подпись запроса приложения' :'Ошибка - приложение не найдено'):
      ((this.$route.params.sum) ?
        `${this.app.name} - запрос ${this.$route.params.sum} АР` :
        `${this.app.name} - перевод приложению`);
      const description = !this.app.name ? 'Приложение не существует или идентификатор указан неправильно' : this.app.description;
      return ({
        title,
        meta: [
          { name: "title", content: title },
          { property: "og:title", content: title },
          { hid: "description", name: "description", content: description || "Описание отсутствует" },
          { property: "og:description", content: description || "Описание отсутствует" },
          { property: "og:url", content: `${process.env.thisUrl}${this.$route.path}` },
          { property: "og:site_name", content: "Dromon System" },
          { property: "og:image", content: this.app.avatar || '' },
        ],
        link: [{ rel: "canonical", href: `${process.env.thisUrl}${this.$route.path}` }]
      });
    },
  };
</script>

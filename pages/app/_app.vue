<template>
  <form id="app-send" onsubmit="() => false">
    <div v-if="app === false">
      <h2>Ошибка</h2>
      <p>Приложение не найдено</p>
      <a href="javascript:void(0)" class="primary btn" @click="back">Назад</a>
    </div>
    <SuccessOverlay v-if="page == 2" />
    <ErrorOverlay   v-if="page == 3" />
    <template v-if="app !== false">
      <div class="title">
        Перевод приложению {{app.name}}
      </div>
      <div class="icons" v-if="$auth.loggedIn">
        <div class="app-img app-img--big">
          <img alt="User avatar" :src="`https://minotar.net/armor/bust/${$auth.user.username}/300.png`">
        </div>
        <div class="arrow"></div>
        <AppImg :app="app" />
      </div>
      <div v-if="$auth.loggedIn || $route.params.sum" class="sum">
        <div class="sum__title">Сумма</div>
        <div class="sum__num" v-if="$route.params.sum || page > 0">{{$route.params.sum || sum}} АР</div>
        <label>
          <input type="number" v-if="!$route.params.sum && page == 0" v-model="sum">
        </label>
      </div>
      <!-- <transition-group name="swipe" style="position: relative"> -->
        <div class="attrs" v-if="page == 0" key="0">
          <div class="attrs__one">
            <div class="attrs__one__title">Приложение</div>
            <div class="attrs__one__text">{{app.name}}</div>
          </div>
          <div class="attrs__one">
            <div class="attrs__one__title">Товар</div>
            <div class="attrs__one__text">{{$route.query.text || "Пожертвование"}}</div>
          </div>
        </div>
        <div class="attrs" v-if="page == 1" key="1">
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
        <div class="attrs" v-if="page == 2" key="2">
          <div class="attrs__one">
            <div class="attrs__one__title">Статус</div>
            <div class="attrs__one__text">Успешно оплачено</div>
          </div>
        </div>
        <div class="attrs" v-if="page == 3" key="3">
          <div class="attrs__one">
            <div class="attrs__one__title">Ошибка оплаты</div>
            <div class="attrs__one__text">{{error}}</div>
          </div>
        </div>
      <!-- </transition-group> -->
      <div class="buttons">
        <NLink v-if="!$auth.loggedIn" class="btn primary" to="/login">Вход</NLink>
        <button type="button" @click="$router.push('/profile')" v-if="page >= 2 && $auth.loggedIn" class="primary">
          {{ $route.query.ok || "В профиль" }}
        </button>
        <button type="button" @click="clearPage" v-if="page >= 2 && $auth.loggedIn" class="secondary">
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
      error: null
    }),
    async asyncData({ app, params }) {
      try {
        console.log(`/apps/${params.app.split("?")[0].split("#")[0]}`);
        console.log((await app.$api.get(`/apps/${params.app.split("?")[0].split("#")[0]}`)).data);
        return {app: (await app.$api.get(`/apps/${params.app.split("?")[0].split("#")[0]}`)).data};
      } catch (err) {
        console.warn("SUKA ERR", err);
        console.warn(err.response.data);
        return {app: false};
      }
    },
    methods: {
      back () {
        console.log(window.history.length == 1, window.history.length)
        window.history.length == 1 ? this.$router.push("/") : window.history.back()
      },
      nextPage () {
        if (this.sumCheck || this.passwordCheck) return;
        if (this.page == 0) {this.page = 1; return;}
        this.sendData();
      },
      backPage () {
        if (this.page == 0) return window.history.back();
        this.page = 0;
      },
      clearPage () {
        this.page = 0;
        this.password = "";
        this.sum = 0;
        this.$auth.fetchUser();
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
        try {
          let r = await this.$axios.post( `/apps/${this.$route.params.app}/send`, data, { withCredentials: true });

          this.loading = false;

          if (r.data.error == "Invalid password") {
            this.error = "Неверный пароль";
            this.page = 3;
            return;
          }
          if (r.data.error) {
            this.error = "Произошла ошибка";
            this.page = 3;
            return;
          }
          this.page = 2;
        } catch (e) {
          this.error = "Неизвестная ошибка";
          if (e.response && e.response.data.e == "NEM" || e.response.data.error == "Not enough money") { this.error = "Недостаточно АР на балансе" }
          if (e.response && (e.response.data.e == "IP" || e.response.data.error == "Invalid password")) { this.error = "Неверный пароль" }
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
        return (this.page == 1 && this.password.length < 6);
      }
    },
    components: { SuccessOverlay, ErrorOverlay, AppImg },
    fetchOnServer: true,
    head () {
      const title = !this.app.name ? 'Ошибка - приложение не найдено' : ((this.$route.params.sum) ?
        `${this.app.name} - запрос ${this.$route.params.sum} АР` :
        `${this.app.name} - перевод приложению`);
      const description = !this.app.name ? 'Приложение не существует или идентификатор указан неправильно' : ((this.$route.params.sum) ?
        `Страница отправки суммы ${this.$route.params.sum} АР приложению ${this.app.name}` :
        this.app.status);
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

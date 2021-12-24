<template>
  <form id="app-send">
    <div v-if="app === false">
      <h2>Ошибка</h2>
      <p>Приложение не найдено</p>
      <a href="javascript:void(0)" class="primary btn" @click="back">Назад</a>
    </div>
    <SuccessOverlay v-if="page === 1" />
    <ErrorOverlay   v-if="page === 2" />
    <template v-if="app !== false">
      <div class="title">
        Авторизация в приложении {{app.name}}
      </div>
      <div class="icons">
        <div class="app-img app-img--big">
          <img alt="User avatar" v-if="$auth.loggedIn" :src="`https://minotar.net/armor/bust/${$auth.user.uuid || $auth.user.username}/300.png`">
        </div>
        <div class="arrow"></div>
        <!-- TODO: чекнуть работоспособность -->
        <AppImg :app="app" />
      </div>
      <template v-if="page === 0">
        <div class="attrs">
          <div class="attrs__one">
            <div style="margin-bottom: 10px;" class="attrs__one__title bold">Это позволит приложению</div>
            <div class="scope" v-for="scope in scopes" :key="scope">
              <div class="scope_icon"><CheckIcon size="22"></CheckIcon></div>
              <div>{{scopeNames[scope]}}</div>
            </div>
            <div class="scope">
              <div class="scope_icon red_scope"><CloseIcon size="22"></CloseIcon></div>
              <div>{{ text }}</div>
            </div>
          </div>
        </div>
        <button type="button" @click="authorize" class="primary">Авторизовать</button>
        <button type="button" class="secondary">Отмена</button>
      </template>
      <template v-if="page === 1">
        <h2>Успех!</h2>
        <p style="text-align: center">Сейчас вы будете перенаправлены...</p>
      </template>
      <template v-if="page === 2">
        <div class="attrs">
          <div class="attrs__one attrs__one--red">
            <div class="attrs__one__title">Ошибка авторизации</div>
            <div class="attrs__one__text">{{error}}</div>
          </div>
        </div>
        <button class="secondary" @click="page = 0">Ещё раз!</button>
      </template>
    </template>
  </form>
</template>
<script>

// TODO: норм дизайн как и везде

import CheckIcon from "mdi-vue/Check.vue";
import AppImg from "~/components/global/AppImg.vue";
import SuccessOverlay from "~/components/overlays/SuccessOverlay.vue";
import ErrorOverlay from "~/components/overlays/ErrorOverlay.vue";
import CloseIcon from "mdi-vue/Close.vue";

const req = ["scope", "redirect_uri", "response_type"];
// const scopes_list = ["data", "status", "set-status", "balance", "role"];
const texts = [
  "Уплыть на вашей лодке",
  "Торговать с вашими жителями",
  "Использовать вашу ферму опыта",
  "Напомнить, что торт - это ложь",
  "Посмотреть эндермену в глаза",
  "Заагрить на вас крипера",
  "Захватить этот мир",
  "Даровать бессмертие",
  "Зачаровать деревянный меч на остроту 5 при помощи стола зачарований",
  "Продать вам Авенита",
  "Обнулить СПк2",
  "Восхищаться дизайном сайта Джексона",
  "Смотреть хентай онлайн без регистрации и смс",
  "Дать всем понять, что Twitch катится не в ту сторону",
  "Убить Эндер Дракона без вашего участия",
  "Стать вашим ♂️dungeon master♂️",
  "Стать вашим ♂️slave♂️",
  "Удалить эту бесполезную строчку",
  "Узнать, что ваше настощее имя - Валя",
  "Уничтожить вселенную",
  "Включить фантомов",
  "[Чикен, придумай что-то умное для этой строчки]",
  "Lorem ipsum dolor sit amet, consectetur",
  "Тест тест тест тест тест тест",
  "Купить прон в HD качестве за ваш счёт",
  "Съесть ваш ужин, пока вы отошли",
  "Удалить папку .minecraft",
  "Покакать",
  "Боготворить Юджина",
  "Поиграть в Киберпанк вместо вас",
  "Написать песню лучше, чем Аристокрафт"
];
export default {
  name: "OAuth2",
  layout: "loginLayout",
  async asyncData({ app, params }) {
    try {
      return { app: (await app.$api.get(`/apps/${params.app}`)).data, loadErr: false };
    } catch (err) {
      return { app: false, loadErr: true };
    }
  },
  data: () => ({
    page: 0,
    scopeNames: {
      "data": "Идентифицировать вас",
      "status": "Узнать ваш статус",
      "set-status": "Поменять ваш статус",
      "cards": "Узнать все данные ваших карт",
      "role": "Определить вашу банковскую роль"
    },
    text: "Ммм...",
    error: ""
  }),
  mounted () {
    // let opt = ["prompt", "state"];
    this.text = texts[Math.floor(Math.random()*texts.length)];
  },
  computed: {
    scopes () {
      let data = [];
      if (!this.$route.query.scope) return [];
      let scope = this.$route.query.scope.split(/ +/);
      for (let s in this.scopeNames) (scope.includes(s)) ? data.push(s) : '';
      return data;
    }
  },
  methods: {
    back () {
      console.log(window.history.length === 1, window.history.length)
      window.history.length === 1 ? this.$router.push("/") : window.history.back()
    },
    async authorize () {
      try {
        let {data: {code}} = await this.$api.post("/oauth2/code", {
          client_id: this.$route.query.client_id || this.app._id,
          response_type: this.$route.query.response_type || "code",
          redirect_uri: this.$route.query.redirect_uri,
          scope: this.$route.query.scope.split(/ +/)
        }, {withCredentials: true});
        this.page = 1;
        if (process.browser) {
          window.location = `${this.$route.query.redirect_uri}?code=${code}`+
                            `&response_type=${this.$route.query.response_type || "code"}`+
                            `&scope=${this.$route.query.scope.split(/ +/).join(' ')}`;
        }
      } catch (e) {
        this.error = "Неизвестная ошибка";
        if (e.response && (e.response.data.e === "IRU" || e.response.data.error === "Invalid redirect uri")) { this.error = "Неверный redirect uri" }
        if (e.response && e.response.data.details && e.response.data.details[0]) {
          this.error = `ERR: ${e.response.data.details[0].message}`;
        }
        this.page = 2;
        return;
      }
    }
  },
  components: { CheckIcon, SuccessOverlay, ErrorOverlay, CloseIcon, AppImg },
  head () {
    const title = this.loadErr ? 'Ошибка - приложение не найдено' : `${this.app.name} - авторизация в приложении`;
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
  }
};
</script>
<style>
  .attrs__one__title.bold {font-weight: bold !important;}
  .attrs {margin-bottom: 0 !important;}
  button {margin-top: 12px!important;}
</style>
<style scoped>
.scope {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  margin-bottom: 10px!important;
}
.scope_icon {
  height: 32px;
  width: 32px;
  min-width: 32px;
  min-height: 32px;
  margin-right: 15px;
  color: #346db3;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid #346db3;
  border-radius: 50%;
  margin-bottom: 0!important;
}
.red_scope {
  color: #ff2222;
  border-color: #ff2222;
}
</style>

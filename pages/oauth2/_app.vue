<template>
  <form id="app-send">
    <div v-if="app === false">
      <h2>Ошибка</h2>
      <p>Приложение не найдено</p>
      <a href="javascript:void(0)" class="primary btn" @click="back">Назад</a>
    </div>
    <SuccessOverlay v-if="page == 2" />
    <ErrorOverlay   v-if="page == 3" />
    <template v-if="app !== false">
      <div class="title">
        Авторизация в приложении {{app.name}}
      </div>
      <div class="icons">
        <div class="app-img app-img--big">
          <img alt="User avatar" v-if="$auth.loggedIn" :src="`https://minotar.net/armor/bust/${$auth.user.username}/300.png`">
        </div>
        <div class="arrow"></div>
        <!-- TODO: чекнуть работоспособность -->
        <AppImg :app="app" />
      </div>
      <div class="attrs">
        <div class="attrs__one">
          <div style="margin-bottom: 10px;" class="attrs__one__title bold">Это позволит приложению</div>
          <div :class="$style.scope" v-for="scope in scopes" :key="scope">
            <div :class="$style.scope_icon"><CheckIcon size="22"></CheckIcon></div>
            <div>{{scopeNames[scope]}}</div>
          </div>
          <div :class="$style.scope">
            <div :class="[$style.scope_icon, $style.red_scope]"><CloseIcon size="22"></CloseIcon></div>
            <div>{{ text }}</div>
          </div>
        </div>
      </div>
      <button type="button" class="primary">Авторизовать</button>
      <button type="button" class="secondary">Отмена</button>
    </template>
  </form>
</template>
<script>

// TODO подключить API

import CheckIcon from "mdi-vue/Check.vue";
import AppImg from "~/components/AppImg";
import SuccessOverlay from "~/components/SuccessOverlay";
import ErrorOverlay from "~/components/ErrorOverlay";
import CloseIcon from "mdi-vue/Close.vue";

const req = ["scope", "redirect_uri", "response_type"];
const scopes_list = ["data", "status", "set-status", "balance", "role"];
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
      return { app: (await app.$api.get(`/apps/${params.app}`)).data };
    } catch (err) {
      return { app: false };
    }
  },
  data: () => ({
    page: 0,
    scopeNames: {
      "data": "Идентифицировать вас",
      "status": "Узнать ваш статус",
      "set-status": "Поменять ваш статус",
      "balance": "Узнать ваш баланс",
      "role": "Определить вашу банковскую роль"
    },
    text: "Ммм..."
  }),
  mounted () {
    let opt = ["prompt", "state"];
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
  components: { CheckIcon, SuccessOverlay, ErrorOverlay, CloseIcon, AppImg }
};
</script>
<style>
  .attrs__one__title.bold {font-weight: bold !important;}
  .attrs {margin-bottom: 0 !important;}
  button {margin-top: 12px!important;}
</style>
<style module>
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

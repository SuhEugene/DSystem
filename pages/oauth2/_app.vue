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
        <div class="app-img">
          <div class="verify"><CheckIcon size="12"/></div>
          <img alt="App avatar" src="https://www.penpublishing.com/squaresMobileTest.jpg">
        </div>
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
            <div>Испечь вам торт</div>
          </div>
        </div>
      </div>
      <button type="button" class="primary">Вход</button>
      <button type="button" class="secondary">Отмена</button>
    </template>
  </form>
</template>
<script>

import CheckIcon from "mdi-vue/Check.vue";
import SuccessOverlay from "~/components/SuccessOverlay";
import ErrorOverlay from "~/components/ErrorOverlay";
import CloseIcon from "mdi-vue/Close.vue";

const req = ["scope", "redirect_uri", "response_type"];
const scopes_list = ["data", "status", "set-status", "balance", "role"];
export default {
  name: "OAuth2",
  layout: "loginLayout",
  async asyncData({ app, params }) {
    try {
      return { app: (await app.$axios.get(`/apps/${params.app}`)).data };
    } catch (err) {
      return { app: false };
    }
  },
  data: () => ({
    page: 0,
    scopeNames: {
      "data": "Идентифицировать вас",
      "status": "Узнать статус",
      "set-status": "Поменять статус",
      "balance": "Узнать баланс",
      "role": "Определить банковскую роль"
    }
  }),
  mounted () {
    let opt = ["prompt", "state"];

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
  components: { CheckIcon, SuccessOverlay, ErrorOverlay, CloseIcon }
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
  border: 3px solid #346db3;
  border-radius: 50%;
  margin-bottom: 0!important;
}
.red_scope {
  color: #ff2222;
  border-color: #ff2222;
}
</style>
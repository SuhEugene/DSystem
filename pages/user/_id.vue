<template>
  <form>
    <main class="send-money">
      <Loading v-if="user === null" />
      <div class="error" v-if="user === false">
        <div class="heading">Ошибка</div>
        <div>Пользователь не существует или идентификатор указан неправильно</div>
        <NLink
            style="font-size: 16px; text-align: left; width: 100%;display:inline-block"
            :to="$auth.loggedIn ? '/profile' : '/login'"
            class="send-money__link"
          >{{$auth.loggedIn ? "В профиль" : "Вход"}}</NLink>
      </div>
      <template v-if="user !== null && user !== false">
        <div class="heading">Перевод</div>
        <!-- <transition-group style="position: relative;" name="swipe"> -->
          <div v-if="step == 0" key=0 class="send-money__all">
            <div class="send-money__avatar">
              <UserAvatar :user="user" />
              <div class="heading heading--2">{{user.username}}</div>
              <div style="text-align: center;">{{user.status}}</div>
            </div>
            <div class="send-money__data">
              <div v-if="$route.params.sum"><b>{{user.username}}</b> запрашивает <b>{{sum}} АР</b></div>

              <div class="last" v-if="$auth.loggedIn && $auth.user.balance > 0">Ваш баланс: {{$auth.user.balance}} АР</div>
              <div class="last" v-if="!$auth.loggedIn">Войдите, чтобы получить возможность перевести {{sum || "какую-либо сумму"}} АР</div>
              <div class="last" v-if="$auth.loggedIn && $auth.user.balance <= 0">
              На вашем счету <b>нет необходимого количества денег</b>, чтобы перевести {{sum || "какую-либо сумму"}} АР
            </div>

              <div v-if="!$route.params.sum && $auth.loggedIn && $auth.user.balance > 0">
                <input type="number" min="1" v-model="sum" placeholder="Сумма">
              </div>
              <div v-if="$auth.loggedIn && $auth.user.balance > 0">
                <button class="primary"
                        @click="step = 1"
                        type="button"
                        :class="{'disabled': $auth.user.balance < sum || sum <= 0 || sum > 62208}"
                  >Отправить сумму</button>
                <NLink
                  style="font-size: 16px; text-align: left; width: 100%;display:inline-block"
                  :to="$auth.loggedIn ? '/profile' : '/login'"
                  class="send-money__link"
                >Нет, не хочу отправлять</NLink>
              </div>
              <NLink
                  v-else
                  style="font-size: 16px; text-align: left; width: 100%;display:inline-block"
                  :to="$auth.loggedIn ? '/profile' : '/login'"
                  class="send-money__link"
                >{{$auth.loggedIn ? "В профиль" : "Вход"}}</NLink>
            </div>
          </div>
          <div v-if="step == 1" key=1 style="display: flex;flex-direction: column;align-items: center;justify-content: center;">
            <!-- <div class="heading heading--2">Введите пароль для подтвержения</div> -->
            <div>Вы уверены, что хотите перевести <b>{{sum}} АР</b> игроку <b>{{user.username}}</b>?</div>
            <div><input type="password" v-model="password" placeholder="Пароль"></div>
            <button type='button' class="primary" :class="{'disabled':password.length<6}" @click="sendSum">Перевести</button>
            <button type='button' class="secondary" @click="step = 0">Назад</button>
          </div>
          <div v-if="step == 2" key=2 style="display: flex;flex-direction: column;align-items: center;justify-content: center;">
            <div>При переводе произошла ошибка</div>
            <div>{{error}}</div>
            <button type='button' class="primary" @click="step = 0">Назад</button>
          </div>
          <div v-if="step == 3" key=3 style="display: flex;flex-direction: column;align-items: center;justify-content: center;">
            <div>Успешно переведено <b>{{sum}} АР</b> игроку <b>{{user.username}}</b></div>
            <NLink class="btn primary" to="/profile">В профиль</NLink>
          </div>
        <!-- </transition-group> -->
      </template>
    </main>
  </form>
</template>

<script>
/* global process */
import UserAvatar from "~/components/UserAvatar.vue";

export default {
  auth: false,
  layout: "loginLayout",
  components: {
    UserAvatar
  },
  data: () => ({
    user: null,
    sum: 0,
    step: 0,
    password: "",
    error: ""
  }),
  async asyncData({ app, params }) {
    try {
      return {user: (await app.$axios.get(`/user/${params.id}`)).data};
    } catch (err) {
      return {user: false};
    }
  },
  fetchOnServer: true,
  head () {
    const title = !this.user.username ? 'Ошибка - пользователь не найден' : ((this.$route.params.sum) ?
      `${this.user.username} - запрос ${this.$route.params.sum} АР` :
      `${this.user.username}`);
    const description = !this.user.username ? 'Пользователь не существует или идентификатор указан неправильно' : ((this.$route.params.sum) ?
      `Страница оплаты запроса игрока ${this.user.username} на сумму ${this.$route.params.sum} АР` :
      this.user.status);
    return ({
      title,
      meta: [
        {
          name: "title",
          content: title
        },
        {
          property: "og:title",
          content: title
        },
        {
          hid: "description",
          name: "description",
          content: description
        },
        {
          property: "og:description",
          content: description
        },
        {
          property: "og:url",
          content: `${process.env.thisUrl}${this.$route.path}`
        },
        {
          property: "og:site_name",
          content: "Dromon System"
        },
        {
          property: "og:image",
          content: this.user.username ? `https://minotar.net/armor/bust/${this.user.username}/300.png` : ''
        },
      ],
      link: [
        { rel: "canonical", href: `${process.env.thisUrl}${this.$route.path}` }
      ]
    });    
  },
  validate({ params }) {
    return /^[a-zA-Z0-9_]{3,40}$/.test(params.id) && (params.sum == null || parseInt(params.sum, 10))
  },
  mounted () {
    this.sum = this.$route.params.sum || null;
  },
  methods: {
    sendSum () {
      if (!this.$auth.loggedIn) return;
      if (this.password.length < 6)  return;
      if (isNaN(this.sum) || parseInt(this.sum, 10) < 0 || parseInt(this.sum, 10) > 62208) return;
      this.$axios.post(`/money/pass/send/${this.user.id}`, {
        password: this.password,
        sum: this.sum
      }).then(() => {this.step=3;}, (e) => {this.step=2;this.error=e.response.data.error})
    }
  }
};
</script>
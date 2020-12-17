<template>
  <form id="app-send" :class="step == 0 ? 'big' : ''">
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
        <div class="title">Перевод пользователю {{user.username}}</div>
        <!-- <transition-group style="position: relative;" name="swipe"> -->
          <div v-if="step == 0" key=0 class="send-money__all">
            <div class="send-money__avatar">
              <UserAvatar :user="user" />
              <div class="heading heading--2">{{user.username}}</div>
              <div style="text-align: center;">{{user.status}}</div>
            </div>
            <div class="send-money__data">
              <div class="attrs">
                <div class="attrs__one" style="margin-bottom: 10px;" v-if="$auth.loggedIn && $auth.user.balance > 0">
                  <div class="attrs__one__title">Ваш баланс</div>
                  <div class="attrs__one__text">{{$auth.user.balance}} АР</div>
                </div>
                <div class="attrs__one" style="margin-bottom: 10px;" v-if="$route.params.sum">
                  <div class="attrs__one__title">Сумма</div>
                  <div class="attrs__one__text">{{parseInt($route.params.sum, 10)}} АР</div>
                </div>
              </div>
              <div class="last" v-if="!$auth.loggedIn">Войдите, чтобы получить возможность перевести {{sum || "какую-либо сумму"}} АР</div>
              <div class="last" v-if="$auth.loggedIn && ($auth.user.balance <= 0 || (parseInt($route.params.sum, 10) && $auth.user.balance < $route.params.sum))">
              На вашем счету недостаточно АР, чтобы перевести {{sum || "какую-либо сумму"}} АР
            </div>

              <div v-if="!$route.params.sum && $auth.loggedIn && $auth.user.balance > 0">
                <div class="attrs__one__title">Сумма</div>
                <input type="number" min="1" v-model="sum">
              </div>
              <div style="margin-top:10px;" v-if="$auth.loggedIn && $auth.user.balance > 0">
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
            <!-- <div>Вы уверены, что хотите перевести <b>{{sum}} АР</b> игроку <b>{{user.username}}</b>?</div> -->
            <div class="attrs">
              <div class="attrs__one">
                <div class="attrs__one__title">Сумма</div>
                <div class="attrs__one__text">{{sum}} АР</div>
              </div>
              <div class="attrs__one">
                <div class="attrs__one__title">Пользователь</div>
                <div class="attrs__one__text">{{user.username}}</div>
              </div>
              <div class="attrs__one">
                <div class="attrs__one__title">Пароль</div>
                <input type="password" @keypress.enter="sendSum" v-model="password">
              </div>
            </div>
            <button type='button' class="primary" :class="{'disabled':password.length<6}" @click="sendSum">Перевести</button>
            <button type='button' class="secondary" @click="step = 0">Назад</button>
          </div>
          <div v-if="step == 2" key=2 style="display: flex;flex-direction: column;align-items: center;justify-content: center;">
            <ErrorOverlay />
            <div class="attrs">
              <div class="attrs__one">
                <div class="attrs__one__title">Сумма</div>
                <div class="attrs__one__text">{{sum}} АР</div>
              </div>
              <div class="attrs__one">
                <div class="attrs__one__title">Пользователь</div>
                <div class="attrs__one__text">{{user.username}}</div>
              </div>
              <div class="attrs__one attrs__one--red">
                <div class="attrs__one__title">Ошибка оплаты</div>
                <div class="attrs__one__text">{{errors[error] || `Необработанная ошибка (${error})`}}</div>
              </div>
            </div>
            <button type='button' class="primary" @click="clear">Назад</button>
          </div>
          <div v-if="step == 3" key=3 style="display: flex;flex-direction: column;align-items: center;justify-content: center;">
            <SuccessOverlay />
            <div class="attrs">
              <div class="attrs__one">
                <div class="attrs__one__title">Сумма</div>
                <div class="attrs__one__text">{{sum}} АР</div>
              </div>
              <div class="attrs__one">
                <div class="attrs__one__title">Пользователь</div>
                <div class="attrs__one__text">{{user.username}}</div>
              </div>
              <div class="attrs__one">
                <div class="attrs__one__title">Статус</div>
                <div class="attrs__one__text">Успешно оплачено</div>
              </div>
            </div>
            <NLink class="btn primary" to="/profile">В профиль</NLink>
          </div>
        <!-- </transition-group> -->
      </template>
    </main>
  </form>
</template>
<!-- TODO адаптация под мобилки -->
<script>
/* global process */
import UserAvatar from "~/components/UserAvatar.vue";
import SuccessOverlay from "~/components/SuccessOverlay.vue";
import ErrorOverlay from "~/components/ErrorOverlay.vue";

export default {
  auth: false,
  layout: "loginLayout",
  components: {
    UserAvatar,
    SuccessOverlay,
    ErrorOverlay
  },
  data: () => ({
    user: null,
    sum: 0,
    step: 0,
    password: "",
    error: "",
    errors: {
      "User not found": "Пользователь не найден",
      "Invalid id": "Возможно вы попытались перевести сами себе",
      "Invalid body": "Что-то не было отправлено",
      "Invalid password": "Неверный пароль",
      "Not enough money": "Недостаточно АР на счету"
    }
  }),
  async asyncData({ app, params }) {
    try {
      return {user: (await app.$api.get(`/user/${params.id}`)).data};
    } catch (err) {
      return {user: false};
    }
  },
  fetchOnServer: true,
  head () {
    const title = !this.user.username ? 'Ошибка - пользователь не найден' : ((this.$route.params.sum) ?
      `${this.user.username} - запрос ${this.$route.params.sum} АР` :
      `${this.user.username} - перевод пользователю`);
    const description = !this.user.username ? 'Пользователь не существует или идентификатор указан неправильно' : ((this.$route.params.sum) ?
      `${this.user.status ? this.user.status+'\n' : ''}Страница оплаты запроса игрока ${this.user.username} на сумму ${this.$route.params.sum} АР` :
      this.user.status || `Страница, на которой вы можете перевести игроку ${this.user.username} немного АР`);
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
      this.$axios.post(`/money/pass/send/${this.user._id}`, {
        password: this.password,
        sum: this.sum
      }, { withCredentials: true }).then(() => {this.step=3;}, (e) => {this.step=2;this.error=e.response.data.error})
    },
    clear () {
      this.step = 0;
      this.password = null;
      this.sum = this.$route.params.sum || null;
    }
  }
};
</script>

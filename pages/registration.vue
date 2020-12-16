<template>
  <section>
    <transition-group class="steps" name="swipe">
      <div :key="0" v-if="step == 0" class="step text">
        <div class="heading">Привет</div>
      </div>
      <div :key="1" v-if="step == 1" class="step text">
        <div class="heading">Мы поможем тебе с регистрацией</div>
      </div>

      <div :key="2" v-if="step == 2" class="step">
        <div class="minimizer">
          <div class="heading" style="margin-bottom: 30px;">Выбор темы</div>
          <p style="margin-bottom: 10px;">Выбери самую комфортную на твой взгляд тему</p>
          <div class="if">
            <button
              class="min" @click="setTheme(false)"
              :class="{'primary':  !$store.state.dark, 'secondary': !!$store.state.dark}">
              Светлая
            </button>
            <button
              class="min" @click="setTheme(true)"
              :class="{'primary': !!$store.state.dark, 'secondary':  !$store.state.dark}">
              Тёмная
            </button>
          </div>
          <!-- <button @click="changeTheme" class="secondary">Сменить</button> -->
          <button @click="step++" style="margin-top: 50px;" class="primary">Далее</button>
        </div>
      </div>

      <div :key="3" v-if="step == 3" class="step">
        <div class="minimizer">
          <div class="heading">А звать вас как?</div>
          <p style="margin-bottom: 15px;">Ввведи свой никнейм с СПк</p>
          <div class="input">
            <input
              v-model="username"
              autocomplete="username"
              :class="{'disabled': loading}"
              type="text"
              placeholder="Minecraft никнейм"
            >
          </div>
          <small class="red">{{error}}</small>
          <button
            class="primary"
            :class="{'disabled': (username.length < 3 && lastUsername != username) || loading}"
            @click="checkUsername"
          >{{(loading) ? 'Загрузка...' : 'Далее'}}</button>
        </div>
      </div>
      <div :key="4" v-if="step == 4" class="step">
        <div class="minimizer">
          <div class="heading">Твой пол?</div>
          <p style="margin-bottom: 10px;">Пол указать надо, а ламината в списке нет...</p>
          <label class="radio" :class="{'checked': sex == 0}">Мужской
            <input type="radio" name="sex" value="0" v-model="sex">
          </label>
          <label class="radio" :class="{'checked': sex == 1}">Женский
            <input type="radio" name="sex" value="1" v-model="sex">
          </label>
          <label class="radio" :class="{'checked': sex == 2}">Другое
            <input type="radio" name="sex" value="2" v-model="sex">
          </label>
          <label class="radio" :class="{'checked': sex == 3}">Мультиразум
            <input type="radio" name="sex" value="3" v-model="sex">
          </label>
          <p style="margin-top: 15px">Пример обращения:<br>{{username}} <b>купил{{w[sex]}}</b> товар</p>
          <button @click="step++" style="margin-top: 15px" :class="{'disabled': isNaN(sex)}" class="primary">Далее</button>
          <button @click="step--" style="margin-top: 8px" class="secondary">Назад</button>
        </div>
      </div>
      <div :key="5" v-if="step == 5" class="step">
        <div class="minimizer">
          <div class="heading">Защитимся от хацкеров</div>
          <p style="margin-bottom: 15px;">Мы твой аккаунт защищаем как можем, но пароль всё-равно жизненно необходим. Постарайся придумать что-нибудь посложнее<br><br><span class="grey">P.S. Нет, ну реально! <span :class="{'red': password == '123123'}">123123 не подходит!</span> Будь креативнее!</span></p>
          <div class="input" style="text-align: center">
            <input style="text-align: left;" type="password" v-model="password" placeholder="Сложный пароль">
          </div>
          <button @click="theEnd" class="primary" :class="{'disabled': password.length < 6 || password == '123123'}">Завершить регистрацию</button>
          <button @click="step--" style="margin-top: 8px" class="secondary">Назад</button>
        </div>
      </div>

      <div :key="6" v-if="step == 6" class="step">
        <div class="heading">Подготавливаем твой аккаунт...</div>
      </div>
      <div :key="7" v-if="step == 7" class="step">
        <div class="heading">Что-то пошло не так...</div>
        <button @click="theEnd" class="primary">Ещё раз</button>
      </div>
    </transition-group>
  </section>
</template>
<script>
export default {
  data: () => ({
    step: 0,
    lastUsername: null,
    username: "",
    password: "",
    error: "",
    sex: null,
    loading: false,
    w: ['', 'а', 'о', 'и']
  }),
  methods: {
    checkUsername() {
      this.loading = true;
      this.error = "";
      this.$axios.get(`/mine/${this.username}`, { withCredentials: true }).then(r => {
        this.loading = false;
        if (r.data.code === "player.was") {
          this.error = "Пользователь с данным никнеймом уже зарегистрирован";
          this.lastUsername = this.username;
          return;
        }
        if (r.data.code !== "player.found") {
          this.error = "Никнейм не существует";
          this.lastUsername = this.username;
          return;
        }
        this.step = 4;
      });
    },
    changeTheme() {
      if (process.browser) {
        this.$store.commit("changeTheme");
      }
    },
    setTheme (bool) {
      this.$store.commit("setTheme", bool);
    },
    theEnd() {
      this.step = 6;
      this.$axios.post("/reg", {
        username: this.username,
        password: this.password,
        sex: this.sex
      }, { withCredentials: true }).then(async r => {
        await this.$auth.fetchUser();
        this.$router.push("/profile");
      }, e => {this.step = 7})
    }
  },
  mounted() {
    setTimeout(() => {
      this.step = 1;
      setTimeout(() => {
        this.step = 2;
      }, 5000);
    }, 3000);
  },
  layout: "reg"
};
</script>
<style lang="scss" scoped>
@import "~/assets/style.scss";
section {
  padding: 10px;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
.steps {
  height: 100%;
  width: 100%;
  max-width: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  .step {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    > * {
      width: 100%;
    }
    .minimizer {
      width: fit-content;
      max-width: 350px;
    }
    &.text {
      .heading {
        font-size: 32px;
        text-align: center;
        margin-bottom: 0;
      }
    }
  }
  .if {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 15px;
    .ul {
      text-decoration: underline;
      color: $always-primary;
    }
    & > * {
      margin: 0 10px;
    }
  }
  .grey {
    color: grey;
  }
  .red {
    color: red;
    font-weight: bold;
  }
  .heading {
    font-weight: bold;
    font-size: 24px;
    margin-bottom: 15px;
    color: $text-heading;
    .dark & {
      color: $dark-text-heading;
    }
  }
  input {
    // max-width: 300px;
    margin-bottom: 15px;
  }
}
</style>

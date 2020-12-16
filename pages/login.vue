<template>
  <form class="non_relative">
    <main>
      <div class="heading">Вход</div>
      <p style="font-size:16px; margin-bottom: 10px;">Эм... А... Кхм... Вход через дискорд, ты ведь помнишь, да?</p>
      <!-- <div>
        <p>Ник</p>
        <input @focus="ck = false" type="text" v-model="login.username">
      </div>
      <div>
        <p>Пароль</p>
        <input @focus="ck = false" type="password" v-model="login.password">
      </div> -->
      <div>
        <button class="primary" @click="discordLogin" type="button">Открыть Discord</button>
        <!-- <button class="secondary" @click="discordLogin" type="button">Дискорд</button> -->
        <NLink style="font-size: 16px; text-align: center; width: 100%;display:inline-block;margin-bottom:0;"
          to="/register"
        >Я не зарегистрирован...</NLink>
      </div>
      <client-only>
        <div v-if="(!!$auth.bigError || !!$auth.error) && ($auth.bigError || $auth.error).error != 'Unauthorized'"
             class="bottom_error" v-html='error'></div>
      </client-only>

           <!-- <div v-if="($auth.bigError || $auth.error).message == 'Network Error'" class="bottom_error">
             Сервер не отвечает - возможно он упал или перезагружается.<br>
             Попробуйте перезагрузить страницу через несколько секунд.<br>
             Проверить состояние сервера вы можете
             <a class=\"white\" href=\"https://discord.gg/xFfNay3\" target=\"_blank\">в нашем дискорде</a>
           </div>
           <client-only>
             <div v-if="($auth.bigError || $auth.error).error == 'Non SPk gamer'"
                  class="bottom_error">Вы не являетесь игроком СПк или не авторизованы в дискорде СПк</div>
           </client-only> -->
    </main>
  </form>
</template>
<script>
export default {
  auth: "guest",
  layout: "loginLayout",
  data: () => ({
    login: {
      username: "",
      password: "",
    },
    // ck: false
  }),
  mounted () {
    if (this.$auth.loggedIn) { this.$router.push("/profile") }
  },
  methods: {
    // async userLogin() {
    //   try {
    //     let r = await this.$auth
    //       .loginWith("local", {
    //         data: this.login
    //       })
    //       .then(() => console.log("Logged In!"));
    //     // await this.$auth.setToken("discord", 'Bearer ' + r.data.token);
    //     // this.$router.push("/profile");
    //   } catch (err) {
    //     console.log(err);
    //   }
    // },
    async userLogin() {
      try {
        await this.$auth
          .loginWith("local", {
            data: this.login
          })
          .then(() => {
            console.log(this.$auth.loggedIn);
            console.log(this.$auth.user);
          });
      } catch (err) {
        console.log(err);
      }
    },
    discordLogin() {
      this.$auth.loginWith("discord");
    }
  },
  computed: {
    error () {
      let e = this.$auth ? this.$auth.bigError || this.$auth.error || "NONE" : 'NONE';
      if (!e) return false;
      console.error("!!!!", e);
      let text = "Неизвестная ошибка";
      if (e.error == "Invalid token") {
        text = "Ваш токен устарел<br>Необходимо авторизоваться через дискорд ещё раз";
      }
      if (e.e == "IC" || e.error == "Invalid code") {
        text = "Данный код авторизации уже был использован<br>Необходимо авторизоваться через дискорд ещё раз";
      }
      if (e.e == "NSG" || e.error == "Non SPk gamer") {
        text = "Вы не являетесь игроком СПк или не авторизованы в дискорде СПк";
      }
      if (e.error == "Unauthorized") {
        return false;
      }
      if (e.message == "Network Error"){
        text = "Сервер не отвечает - возможно он упал или перезагружается.<br>Попробуйте перезагрузить страницу через несколько секунд.<br>"+
          "Проверить состояние сервера вы можете "+
          "<a class=\"white\" href=\"https://discord.gg/xFfNay3\" target=\"_blank\">в нашем дискорде</a>";
      }
      return `<span><b>ОШИБКА!</b><br>${text}</span>`;
    }
  }
};
</script>
<style lang="scss">
  .non_relative {
    position: static!important;
  }
  a.white {
    color: white;
    transition: 0.13s opacity;
    opacity: 1;
    &:hover { opacity: 0.7; color: white;}
  }
  .bottom_error  {
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 20px 15px;
    display: flex;
    background: #f11;
    color: white;
    justify-content: center;
    align-items: center;
    font-size: 16px;
    position: absolute;
    box-shadow: 0 2px 2px 0 rgba(0,0,0,.18);
  }
</style>

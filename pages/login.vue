<template>
    <form>
      <main>
        <div class="heading">Вход</div>
        <div>
          <p>Ник</p>
          <input type="text" v-model="login.username">
        </div>
        <div>
          <p>Пароль</p>
          <input type="password" v-model="login.password">
        </div>
        <div>
          <button class="primary" @click="userLogin" type="button">Войти</button>
          <button class="secondary" @click="discordLogin" type="button">Дискорд</button>
          <NLink
            style="font-size: 16px; text-align: center; width: 100%;display:inline-block"
            to="/register"
          >Регистрация</NLink>
        </div>
      </main>
    </form>
</template>
<script>
export default {
  layout: "loginLayout",
  data: () => ({
    login: {
      username: "SuhEugene",
      password: "123123"
    }
  }),
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
  }
};
</script>
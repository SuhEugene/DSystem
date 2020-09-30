<template>
    <form>
      <div v-if="ck" :class="$style.fly">Этот вход не робит. Юзай дискорд</div>
      <main>
        <div class="heading">Вход</div>
        <div>
          <p>Ник</p>
          <input @focus="ck = false" type="text" v-model="login.username">
        </div>
        <div>
          <p>Пароль</p>
          <input @focus="ck = false" type="password" v-model="login.password">
        </div>
        <div>
          <button class="primary" @click="ck = true" type="button">Войти</button>
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
      username: "",
      password: "",
    },
    ck: false
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
<style module>
  .fly  {
    top: 0;
    left: 0;
    width: 100%;
    height: 30px;
    display: flex;
    background: #fff;
    color: black;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    position: absolute;
  }
</style>
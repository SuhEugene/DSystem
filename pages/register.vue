<template>
  <form>
    <main>
      <div class="heading">Регистрация</div>
      <div>
        <p style="font-size:16px; margin-bottom: 10px;">Кстати, авторизация во всей системе через дискорд...</p>
        <button class="secondary" @click="discordLogin" type="button">Открыть Discord</button>
        <NLink
          style="font-size: 16px; text-align: center; width: 100%;display:inline-block"
          to="/login"
        >У меня уже есть аккаунт!</NLink>
      </div>
    </main>
  </form>
</template>
<script>
export default {
  auth: "guest",
  layout: "loginLayout",
  methods: {
    discordLogin() {
      this.$auth.loginWith("discord-reg");
    }
  }
};
</script>
<style scoped>
.heading {
  margin-bottom: 15px;
}
</style>

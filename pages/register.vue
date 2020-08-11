<template>
  <form>
    <main>
      <div class="heading">Регистрация</div>
      <div>
        <button class="secondary" @click="discordLogin" type="button">Дискорд</button>
        <NLink
          style="font-size: 16px; text-align: center; width: 100%;display:inline-block"
          to="/login"
        >Вход</NLink>
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

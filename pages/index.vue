<template>
  <section>
    <h1>Здесь будет главная страница</h1>
    <NLink to="/profile">В профиль</NLink>
  </section>
</template>
<script>
export default {
  auth: "guest",
  layout: "light",
  mounted() {
    // console.log(this.$auth);
  }
};
</script>
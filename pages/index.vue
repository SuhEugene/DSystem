<template>
  <section>
    <h1>Здесь будет главная страница</h1>
    <NLink to="/profile">В профиль</NLink>
  </section>
</template>
<!-- QUESTION А нужна ли эта страница вообще? -->
<script>
export default {
  auth: "guest",
  layout: "light",
  mounted() {
    // console.log(this.$auth);
  }
};
</script>

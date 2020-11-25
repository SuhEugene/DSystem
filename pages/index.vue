<template>
  <section>
    <h1>Здесь будет главная страница</h1>
    <NLink to="/profile">В профиль</NLink>
  </section>
</template>
<!-- _QUESTION А нужна ли эта страница вообще? -->
<script>
export default {
  auth: "guest",
  layout: "light",
  mounted() { this.$router.push("/login"); }
};
</script>

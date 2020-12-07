<template>
  <form class="non_relative">
    <main>
      <div class="heading">Вам бан</div>
      <p style="font-size:16px; margin-bottom: 10px;">Вы были забанены на данном проекте</p>
    </main>
  </form>
</template>
<script>
export default {
  layout: "loginLayout",
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
</style>

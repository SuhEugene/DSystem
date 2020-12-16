<template>
  <div class="box">
    <img :src="this.$auth.user ? `https://minotar.net/armor/bust/${this.$auth.user.uuid || this.$auth.user.username}/300.png` : ''" alt="">
    <div class="big">Чел ты... заморожен</div>
    <div class="small">Нет блять забанен</div>
  </div>
</template>
<!-- TODO 1 appelation button -->
<script>
export default {
  layout: "light",
  head: () => ({
    link: [{
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Merriweather&display=swap"
    }]
  })
};
</script>
<style lang="scss" scoped>
  *::selection {
    background-color: #346db3;
  }
  .box {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: black;
    img {
      max-width: 300px;
      width: calc(100% - 120px);
      background: #222;
      box-sizing: content-box;
      padding: 25px;
      border: 3px solid white;
      box-shadow: 0 0 0 4px black, 0 0 0 5px white;
    }
    .big, .small {
      font-family: "Merriweather", "Times New Roman", serif;
      color: white;
    }
    .big {
      font-size: 35px;
      margin-top: 15px;
    }
    .small {
      font-size: 18px;
      margin-top: 7px;
    }
  }
</style>

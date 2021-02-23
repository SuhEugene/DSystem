<template>
  <div class="box">
    <img :src="this.$auth.user ? `https://visage.surgeplay.com/bust/300/${this.$auth.user.uuid}` : '/favicon.png'" alt="">
    <div class="big">Чел ты... заморожен</div>
    <div class="small">Нет блять забанен. Причина: {{this.$auth.user.frozen ? `"${this.$auth.user.frozen}"` : '¯\\_(ツ)_/¯'}}</div>
  </div>
</template>
<!-- TODO 1 appeal button -->
<script>
export default {
  layout: "light",
  head: () => ({
    link: [{
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Merriweather&display=swap"
    }]
  }),
  mounted () {
    if (this.$auth.user.frozen === false || this.$auth.user.frozen === null || this.$auth.user.frozen === undefined)
      return this.$router.push("/profile");
  }
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
      box-sizing: content-box;
      padding: 25px;
      border: 3px solid white;
      box-shadow: 0 0 0 4px black, 0 0 0 5px white;
      background: #151515;
      background-image: linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%);
      background-size: 20px 20px;
      background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
    }
    .big, .small {
      font-family: "Merriweather", "Times New Roman", serif;
      color: white;
      text-align: center;
    }
    .big {
      font-size: 35px;
      margin-top: 15px;
    }
    .small {
      font-size: 18px;
      margin-top: 7px;
      max-width: 500px;
    }
  }
</style>

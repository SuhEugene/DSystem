<template>
  <section id="apps-page">
    <header>
      <NLink to="/profile" class="btn primary icon"><HomeOutlineIcon size="24" /></NLink>
      <h1>Приложения</h1>
    </header>
    <main>
      <h1>Ваши приложения</h1>
      <div class="apps">
        <div class="app" v-for="i in 'asdf'" :key="i">
          <img src="https://www.penpublishing.com/squaresMobileTest.jpg" class="app__image">
          <div class="app__data">
            <div class="app__title">
              The shop
            </div>
            <div class="app__info">Баланс: 20АР</div>
          </div>
        </div>
      </div>
    </main>
  </section>
</template>
<script>
import HomeOutlineIcon from "mdi-vue/HomeOutline.vue";
export default {
  data () {
    apps: []
  },
  async asyncData ({ app }) {
    // return { apps: (await app.$axios.get("/apps")).data };
  },
  components: {HomeOutlineIcon}
}
</script>
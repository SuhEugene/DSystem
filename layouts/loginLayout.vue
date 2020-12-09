<template>
  <div class="container login" :class="{dark: $store.state.dark}">
    <transition name="page">
      <div v-if="readyState" class="main-loading-page" :class="rand">
        <DromonLogo />
      </div>
    </transition>
    <Nuxt />
  </div>
</template>
<script>
/* global process */
import DromonLogo from "~/components/DromonLogo";
export default {
  data: () => ({
    readyState: true,
    rand: `a${(new Date().getHours() % 6) + 1}`
  }),
  mounted() {
    if (process.browser) {
      this.$store.commit("setTheme", localStorage.getItem("dark") === "true");
      // this.dark = localStorage.getItem("dark") === "true";
      this.readyState = false;
    }
  },
  head () {
    if (this.$route.path.startsWith("/user")) return;
    return ({
      htmlAttrs: {
        lang: 'ru'
      }
    })
  },
  components: { DromonLogo }
};
</script>

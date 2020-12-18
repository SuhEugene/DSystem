<template>
  <div class="container login" :class="{dark: $store.state.dark}">
    <client-only>
      <div id="nonetwork" v-if="$nuxt.isOffline"><b>Интернет соединение потеряно</b></div>
    </client-only>
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
    if (this.$route.path.startsWith("/app")) return;
    return ({
      htmlAttrs: {
        lang: 'ru'
      },
      meta: [
        {
          hid: "description",
          name: "description",
          content: "Новая платёжная система СПк, в которой можно оплатить всё что угодно, где угодно, когда угодно, кому угодно"
        },
        {
          property: "og:title",
          content: "Dromon"
        },
        {
          name: "title",
          content: "Dromon"
        },
        {
          property: "og:url",
          content: process.env.thisUrl+"/"
        },
        {
          property: "og:description",
          content: "Новая платёжная система СПк, в которой можно оплатить всё что угодно, где угодно, когда угодно, кому угодно"
        }
      ]
    });
  },
  components: { DromonLogo }
};
</script>

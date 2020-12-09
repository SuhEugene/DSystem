<template>
  <div class="container" :class="{dark: $store.state.dark}">
    <div id="nonetwork" v-if="$nuxt.isOffline">Интернет соединение потеряно</div>
    <transition name="page">
      <div v-if="readyState" class="main-loading-page" :class="rand">
        <DromonLogo />
      </div>
    </transition>
    <Nuxt/>
  </div>
</template>
<script>
/* global process */

import DromonLogo from "~/components/DromonLogo";

// console.log(Date.now().getHour())


export default {
  data: () => ({
    // dark: false,
    readyState: true,
    rand: `a${(new Date().getHours() % 6) + 1}`
  }),

  head () {
    return ({
      htmlAttrs: {
        lang: 'ru'
      },
      meta: [
        {
          hid: "description",
          name: "description",
          content: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Omnis cupiditate tempora labore molestias, dolorum, illo modi suscipit! Ipsam asperiores veniam officia consequatur eum tempora, iure, necessitatibus laboriosam commodi ducimus nobis."
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
          content: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Omnis cupiditate tempora labore molestias, dolorum, illo modi suscipit! Ipsam asperiores veniam officia consequatur eum tempora, iure, necessitatibus laboriosam commodi ducimus nobis."
          // content: "Оплати всё и везде"
        }
      ]
    })
  },
  mounted() {
    // this.$axios.defaults.baseURL = process.env.axiosBase;
    if (this.$auth && this.$auth.user && this.$auth.user.role == 0) return this.$router.push("/registration");
    if (process.browser) {
      this.$store.commit("setTheme", localStorage.getItem("dark") === "true");
      this.readyState = false;
    }
  },
  components: { DromonLogo }
};
</script>

<template>
  <div class="container" :class="{dark}">
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
    dark: false,
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
          content: "Оплати всё и везде"
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
          content: "Оплати всё и везде"
        }
      ]
    })
  },
  mounted() {
    // this.$axios.defaults.baseURL = process.env.axiosBase;
    if (process.browser) {
      this.dark = localStorage.getItem("dark") === "true";
      this.readyState = false;
    }
  },
  components: { DromonLogo }
};
</script>
<template>
  <div class="container" :class="{dark: $store.state.dark}">
    <client-only>
      <div id="nonetwork" v-if="$nuxt.isOffline">
        <div style="margin-bottom:2px"><b>Интернет соединение потеряно</b></div>
        <div style="opacity:0.75">Данные могут быть неактуальны</div>
      </div>
      <div id="notifications">
        <transition-group name="notification">
          <Notification v-for="n in $store.state.notifications" :data="n" :key="n.id" />
        </transition-group>
      </div>
    </client-only>
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
import Notification from "~/components/Notification";

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
        { property: "og:title", content: "Dromon - быстро, чётко, заебись!" },
        { name: "title", content: "Dromon - быстро, чётко, заебись!" },
        {
          property: "og:url",
          content: process.env.thisUrl+"/"
        },
        {
          hid: "description", name: "description",
          content: "Новая платёжная система СПк, в которой можно оплатить всё что угодно, где угодно, когда угодно, кому угодно"
        },
        {
          property: "og:description",
          content: "Новая платёжная система СПк, в которой можно оплатить всё что угодно, где угодно, когда угодно, кому угодно"
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
  components: { DromonLogo, Notification }
};
</script>

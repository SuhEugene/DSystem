<template>
  <div class="container login" :class="{dark}">
    <Nuxt/>
  </div>
</template>
<script>
/* global process */
export default {
  data: () => ({
    dark: false
  }),
  mounted() {
    if (process.browser) {
      this.dark = localStorage.getItem("dark") === "true";
    }
  },
  head () {
    if (this.$route.path.startsWith("/user")) return;
    return ({
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
  }
};
</script>
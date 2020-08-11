<template>
  <div class="container" :class="{dark}">
    <Nuxt/>
  </div>
</template>
<script>
/* global process */
export default {
  data: () => ({
    dark: false
  }),
  head () {
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
  },
  mounted() {
    // this.$axios.defaults.baseURL = process.env.axiosBase;
    if (process.browser) {
      this.dark = localStorage.getItem("dark") === "true";
    }
  }
};
</script>
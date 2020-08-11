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
  mounted() {
    // this.$axios.defaults.baseURL = process.env.axiosBase;
    if (process.browser) {
      this.dark = localStorage.getItem("dark") === "true";
    }
  }
};
</script>
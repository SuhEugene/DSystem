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
  }
};
</script>
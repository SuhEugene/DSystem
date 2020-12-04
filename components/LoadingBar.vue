<template>
  <transition name="page">
    <div v-if="loading" class="loading-page">
      <!-- <img src="~/assets/image.jpg" alt=""> -->
    </div>
  </transition>
</template>

<script>
  export default {
    data: () => ({
      loading: false
    }),
    methods: {
      start() {
        this.loading = true
      },
      finish() {
        this.loading = false
      }
    }
  };
</script>
<template>
  <div class="notification" :class="data.type ? `notification--${data.type}` : ''">
    <img v-if="data.img" :src="data.img" alt="" class="notification__image">
    <div class="notification__data">
      <div v-if="data.title" class="notification__title">{{data.title}}</div>
      <div v-if="data.descr" class="notification__text">{{data.descr}}</div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["data"]
}
</script>

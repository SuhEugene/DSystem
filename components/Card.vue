<template lang="html">
  <div class="card">
    <div class="top">
      <div class="id">#{{data.id}}</div>
      <div class="descr">{{data.text}}</div>
    </div>
    <div class="bottom">
      <div class="settings"></div>
      <div class="sum">{{data.balance}} АР</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Card",
  props: ["data"]
}
</script>

<style lang="scss" scoped>
</style>

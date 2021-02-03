<template lang="html">
  <div class="modal">
    <div @click="$emit('close')" class="modal__dimm"></div>
    <div class="modal__body">
      <div class="modal__title">
        {{ header }}
      </div>
      <div class="modal__content">
        <slot></slot>
      </div>
      <div class="modal__buttons">
        <a class="btn" @click="$emit('btn', btn.name)" :class="btn.type || 'primary'" v-for="btn in buttons">{{btn.name}}</a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    "header": String,
    "buttons": Array
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/vars.scss';

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 190;
  &__dimm {
    position: absolute;
    height: 100%;
    width: 100%;
    left: 0;
    top: 0;
    background: rgba(0,0,0,.7);
    z-index: 1;
  }
  &__body {
    z-index: 2;
    background: $background;
    box-shadow: $card-shadow;
    border-radius: 5px;
    min-width: 300px;
    max-width: 500px;
  }
  &__content {
    padding: 8px 20px;
  }
  &__buttons {
    padding: 10px 15px;
    display: flex;
    flex-direction: row;
  }
  &__title {
    padding: 10px 15px;
    font-size: 26px;
    font-weight: bold;
  }
}

</style>

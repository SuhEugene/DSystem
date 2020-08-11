<template>
  <div class="called">
    <div class="called__title">Новый вызов</div>
    <div class="called__descr">
      <span>
        Вызвавший:
        <span class="called__descr--val">{{user}}</span>
      </span>
      <br>
      <span>
        Отделение:
        <span class="called__descr--val">{{bank}}</span>
      </span>
    </div>
    <div class="called__button">Принять</div>
  </div>
</template>
<script>
export default {
  props: ["bank", "user"]
};
</script>
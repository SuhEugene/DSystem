<template>
  <!-- TODO НАСТРОЙКИ
        Запрос логов
        Смена пароля
        Обновление ника
       -->
    <div class="profile-nav">
      <div class="profile-nav__row">
        SETTINGS
      </div>
      <div class="profile-nav__row">
        <div tooltip="Назад" @click="$emit('back')" class="profile-nav__button">
          <BackIcon size="26"/>
        </div>
        <!-- <div @click="next('b1')" class="profile-nav__button profile-nav__button--w3"
             :class="{'profile-nav__button--disabled': !posts.find(p => p.name == post)}">
          Далее
        </div> -->
      </div>
    </div>
</template>

<script>
export default {
}
</script>

<style lang="scss" module>
</style>

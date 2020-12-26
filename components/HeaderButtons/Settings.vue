<template>
  <!-- TODO НАСТРОЙКИ
        Запрос логов
        Смена пароля
        Обновление ника
       -->
    <div class="profile-nav">
      <div class="profile-nav__row">
        <div tooltip="Смена пароля" @click="$emit('back')" class="profile-nav__button">
          <FormTextboxPasswordIcon size="26"/>
        </div>
        <div tooltip="Обновить никнейм" @click="$emit('back')" class="profile-nav__button">
          <AccountConvertOutlineIcon size="26"/>
        </div>
        <div tooltip="Скачать логи" @click="$emit('back')" class="profile-nav__button">
          <DatabaseArrowDownOutline size="26"/>
        </div>
      </div>
      <div class="profile-nav__row">

        <div tooltip="Назад" @click="$emit('back')" class="profile-nav__button">
          <BackIcon size="26"/>
        </div>
        <div tooltip="Очистить все сессии" @click="clearAllSessions" class="profile-nav__button">
          <DatabaseArrowDownOutline size="26"/>
        </div>
        <!-- <div @click="next('b1')" class="profile-nav__button profile-nav__button--w3"
             :class="{'profile-nav__button--disabled': !posts.find(p => p.name == post)}">
          Далее
        </div> -->
      </div>
    </div>
</template>

<script>
import FormTextboxPasswordIcon from "mdi-vue/FormTextboxPassword.vue";
import AccountConvertOutlineIcon from "mdi-vue/AccountConvertOutline.vue";
import DatabaseArrowDownOutlineIcon from "mdi-vue/DatabaseArrowDownOutline.vue";
import BackIcon from "mdi-vue/ArrowLeft.vue";

export default {
  components: {
    FormTextboxPasswordIcon,
    AccountConvertOutline,
    DatabaseArrowDownOutline,
    BackIcon
  }
}
</script>

<style lang="scss" module>
</style>

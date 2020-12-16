<template>
  <div>
    <transition :name="animBack ? 'swipe-menu-back' : 'swipe-menu'">

      <!-- MAIN MENU -->
      <div v-if="!menu" :key="false" class="profile-nav">
        <div class="profile-nav__row">
          <!-- TODO фриз/анфриз модерами по нику -->
          <div tooltip="Модераторка" v-if="moder" class="profile-nav__button">
            <AccountGroupOutlineIcon size="26"/>
          </div>
          <!-- TODO ВЫЗОВ БАНКИРА -->
          <div tooltip="Вызвать банкира" class="profile-nav__button">
            <AccountTieVoiceOutlineIcon size="26"/>
          </div>
          <div @click="$router.push('/apps')" tooltip="Приложения" class="profile-nav__button">
            <CubeScanIcon size="26"/>
          </div>
          <div tooltip="Настройки" class="profile-nav__button">
            <AccountCogOutlineIcon size="26"/>
          </div>
        </div>
        <div class="profile-nav__row">
          <div tooltip="Банкир панель" @click="next('b0')" v-if="banker" class="profile-nav__button">
            <AccountCashOutlineIcon size="26"/>
          </div>
          <div tooltip="Перевод" @click="next('t0')" class="profile-nav__button">
            <ArrowRightBoldOutlineIcon size="26"/>
          </div>
          <div tooltip="Смена темы" @click="$parent.themeChange" class="profile-nav__button">
            <WeatherNightIcon size="26"/>
          </div>
          <div tooltip="Выход" @click="logout" class="profile-nav__button">
            <LogoutVariantIcon size="26"/>
          </div>
        </div>
      </div>

      <!-- TODO: почекать работоспособность ENTER -->

      <!-- MONEY SENDING -->
      <template>
        <!-- Username -->
        <div v-if="menu == 't0'" key="t0" class="profile-nav">
          <div class="profile-nav__row">
            <HelpInput type="text" placeholder="Никнейм"
                       v-model="username"
                       :items="users.map(u => u.username).filter(u => u.toLowerCase().includes(username.toLowerCase()) && u != $auth.user.username)"
                       @enterpress="!!users.find(u => u.username == username) ? next('t1') : ''"
                       />
          </div>
          <div class="profile-nav__row">
            <div tooltip="Назад" @click="back(false, true)" class="profile-nav__button">
              <BackIcon size="26"/>
            </div>
            <div @click="next('t1')" class="profile-nav__button profile-nav__button--w3"
                 :class="{'profile-nav__button--disabled': !users.find(u => u.username == username)}">
              Далее
            </div>
          </div>
        </div>
        <!-- Sum -->
        <div v-if="menu == 't1'" key="t1" class="profile-nav">
          <div class="profile-nav__row">
            <input type="number"
                   v-model="sum"
                   placeholder="Сумма"
                   @keyup.enter="(!(sumCheck || sum <= 0 || sum > $auth.user.balance)) ? next('t2') : ''"
                   />
          </div>
          <div class="profile-nav__row">
            <div tooltip="Назад" @click="back('t0')" class="profile-nav__button">
              <BackIcon size="26"/>
            </div>
            <div @click="next('t2')" class="profile-nav__button profile-nav__button--w3"
            :class="{'profile-nav__button--disabled': sumCheck || sum <= 0 || sum > $auth.user.balance}">
              Далее
            </div>
          </div>
        </div>
        <!-- Comment -->
        <div v-if="menu == 't2'" key="t2" class="profile-nav">
          <div class="profile-nav__row">
            <input type="text"
                   placeholder="Комментарий"
                   v-model="comment"
                   @keyup.enter="(comment.length <= 100) ? next('t3') : ''"
                   />
          </div>
          <div class="profile-nav__row">
            <div tooltip="Назад" @click="back('t1')" class="profile-nav__button">
              <BackIcon size="26"/>
            </div>
            <div @click="next('t3')" class="profile-nav__button profile-nav__button--w3"
                 :class="{'profile-nav__button--disabled': comment.length > 100}">
              Далее
            </div>
          </div>
        </div>
        <!-- Confirm -->
        <div v-if="menu == 't3'" key="t3" class="profile-nav">
          <div class="profile-nav__row">
            <div>
              Получатель: <b>{{username}}</b>;<br>
              Сумма: <b>{{sum}} АР</b>;<br>
              Комментарий:<br>
              <span style="max-width: 225px; display: inline-block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{comment}}</span>
            </div>
          </div>
          <div class="profile-nav__row">
            <div tooltip="Назад" @click="back('t2')" class="profile-nav__button">
              <BackIcon size="26"/>
            </div>
            <div @click="sendMoney" class="profile-nav__button profile-nav__button--w3">
              Отправить
            </div>
          </div>
        </div>
      </template>

      <!-- BANKER PANEL -->
      <template>
        <!-- Post -->
        <div v-if="menu == 'b0'" key="b0" class="profile-nav">
          <div class="profile-nav__row">
            <HelpInput type="text" placeholder="Отделение"
                       v-model="post"
                       :items="posts.map(p => p.name).filter(p => p.toLowerCase().includes(post.toLowerCase()))"
                       @enterpress="!!posts.find(p => p.name == post) ? next('b1') : ''"/>
          </div>
          <div class="profile-nav__row">
            <div tooltip="Назад" @click="back(false, true)" class="profile-nav__button">
              <BackIcon size="26"/>
            </div>
            <div @click="next('b1')" class="profile-nav__button profile-nav__button--w3"
                 :class="{'profile-nav__button--disabled': !posts.find(p => p.name == post)}">
              Далее
            </div>
          </div>
        </div>
        <!-- Username -->
        <div v-if="menu == 'b1'" key="b1" class="profile-nav">
          <div class="profile-nav__row">
            <HelpInput type="text" placeholder="Никнейм"
              v-model="username"
              :items="users.map(u => u.username).filter(u => u.toLowerCase().includes(username.toLowerCase() && u != $auth.user.username))"
              @enterpress="!!users.find(u => u.username == username && u.username != $auth.user.username) ? next('b2') : ''"
              />
          </div>
          <div class="profile-nav__row">
            <div tooltip="Назад" @click="back('b0')" class="profile-nav__button">
              <BackIcon size="26"/>
            </div>
            <div @click="next('b2')" class="profile-nav__button profile-nav__button--w3"
                 :class="{'profile-nav__button--disabled': !users.find(u => u.username == username && u.username != $auth.user.username)}">
              Далее
            </div>
          </div>
        </div>
        <!-- Sum -->
        <div v-if="menu == 'b2'" key="b2" class="profile-nav">
          <div class="profile-nav__row">
            <input type="number"
                   v-model="sum"
                   placeholder="Сумма"
                   @keyup.enter="!sumCheck ? next('b3') : ''"
                   />
          </div>
          <div class="profile-nav__row">
            <div tooltip="Назад" @click="back('b1')" class="profile-nav__button">
              <BackIcon size="26"/>
            </div>
            <div @click="next('b3')" class="profile-nav__button profile-nav__button--w3"
            :class="{'profile-nav__button--disabled': sumCheck}">
              Далее
            </div>
          </div>
        </div>
        <!-- Confirm -->
        <div v-if="menu == 'b3'" key="b3" class="profile-nav">
          <div class="profile-nav__row">
            <div>
              Никнейм: <b>{{username}}</b>;
              Отделение: <b>{{post}}</b>;
              Операция: <b>{{sum > 0 ? 'добавить' : 'списать'}} {{sum > 0 ? sum : -sum}} АР</b>
            </div>
          </div>
          <div class="profile-nav__row">
            <div tooltip="Назад" @click="back('b2')" class="profile-nav__button">
              <BackIcon size="26"/>
            </div>
            <div @click="bankerAddMoney" class="profile-nav__button profile-nav__button--w3"
            :class="{'profile-nav__button--disabled': sumCheck}">
              {{sum > 0 ? 'Пополнить счёт' : 'Списать со счёта'}}
            </div>
          </div>
        </div>
      </template>

      <!-- SETTINGS -->
      <template>
        <Settings v-if="menu == 's0'" @back="back(false, true)" />
      </template>

    </transition>
  </div>
</template>
<script>
import AccountTieVoiceOutlineIcon from "mdi-vue/AccountTieVoiceOutline.vue";
import CubeScanIcon from "mdi-vue/CubeScan.vue";
import AccountCogOutlineIcon from "mdi-vue/AccountCogOutline.vue";
import ArrowRightBoldOutlineIcon from "mdi-vue/ArrowRightBoldOutline.vue";
import WeatherNightIcon from "mdi-vue/WeatherNight.vue";
import LogoutVariantIcon from "mdi-vue/LogoutVariant.vue";
import AccountCashOutlineIcon from "mdi-vue/AccountCashOutline.vue";
import AccountGroupOutlineIcon from "mdi-vue/AccountGroupOutline.vue";
import BackIcon from "mdi-vue/ArrowLeft.vue";
import HelpInput from "~/components/HelpInput.vue";

import Settings from "~/components/HeaderButtons/Settings.vue";

export default {
  props: ["moder", "banker", "posts", "users"],
  data: () => ({
    menu: false,
    animBack: false,
    username: "",
    sum: null,
    post: "",
    comment: ""
  }),
  components: {
    AccountTieVoiceOutlineIcon,
    CubeScanIcon,
    AccountCogOutlineIcon,
    ArrowRightBoldOutlineIcon,
    WeatherNightIcon,
    LogoutVariantIcon,
    AccountCashOutlineIcon,
    AccountGroupOutlineIcon,
    BackIcon,
    HelpInput,
    Settings
  },
  computed: {
    sumCheck () {
      return isNaN(this.sum) || this.sum == 0 || this.sum < -62208 || this.sum > 62208;
    }
  },
  methods: {
    logout () {
      this.$auth.logout();
    },
    next(to) {
      this.animBack = false;
      this.menu = to;
    },
    back(to, clear=false) {
      if (clear) this.clear();
      this.animBack = true;
      this.menu = to;
    },
    clear() {
      this.username = "";
      this.sum = "";
      this.post = "";
      this.comment = "";
    },
    bankerAddMoney() {
      this.$api.post(`/money/${this.users.find(u => u.username == this.username).id}/add`, {
        sum: this.sum,
        post: this.posts.find(p => p.name == this.post).id
      }, { withCredentials: true }).then(r => { this.next(false); this.clear() });
    },
    sendMoney() {
      this.$api.post(`/money/send/${this.users.find(u => u.username == this.username).id}`, {
        sum: this.sum,
        comment: this.comment
      }, { withCredentials: true }).then(r => { this.next(false); this.clear() });
    }
  }
};
</script>

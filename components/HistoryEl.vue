<template>
  <div class="history-el">
    <!-- <div class="history-el__space history-el__space--0"></div> -->
    <div class="history-el__icon">
      <div class="history-el__icon--i" :tooltip="tooltip">
      <component v-bind:is="icon+'Icon'" size="40"></component></div>
      <div class="history-el__icon--datetime">{{time}}
        <br>{{date}}
      </div>
    </div>
    <!-- <div class="history-el__space history-el__space--1"></div> -->
    <!-- <div class="history-el__space history-el__space--2"></div> -->
    <div class="history-el__user history-el__user--1">
      <div class="history-el__user--title">От</div>
      <div class="history-el__user--value">{{from}}</div>
    </div>
    <div class="history-el__user history-el__user--2">
      <div class="history-el__user--title">Кому</div>
      <div class="history-el__user--value">{{to}}</div>
    </div>
    <!-- <div class="history-el__space history-el__space--3"></div> -->
    <div class="history-el__comm">
      <div class="history-el__user--title">Комментарий</div>
      <div class="history-el__user--value" :class="{'italic': !log.more}">{{log.more || "Отсутствует"}}</div>
    </div>
    <div
      class="history-el__sum"
      :class="(Number(sum) < 0) ? 'history-el__sum--minus' : ''"
    >{{ Number(sum) < 0 ? -Number(sum) : sum }}</div>
  </div>
</template>
<style>
  .italic { font-style: italic }
</style>
<script>
const icons = {
  "banker-void" : "AccountArrowLeftOutline",
  "send-to": "CashPlus",
  "send-from": "CashMinus",
  "app-to": "CubeSend",
  "app-from": "CubeSend"
}
const tooltips = {
  "banker-void" : "Пополнение/снятие",
  "send-to": "Перевод",
  "app-to": "Приложение",
  "app-from": "Приложение"
}
import AccountArrowLeftOutlineIcon from "mdi-vue/AccountArrowLeftOutline.vue";
import CashPlusIcon from "mdi-vue/CashPlus.vue";
import CashMinusIcon from "mdi-vue/CashMinus.vue";
import CubeSendIcon from "mdi-vue/CubeSend.vue";
export default {
  props: ["log"],
  mounted () {
    console.log(this.log);
  },
  computed: {
    sum () {
      if (this.log.action == "banker-void" || this.log.action == "app-from") return this.log.sum;
      if (this.log.action == "send-to" || this.log.action == "app-to") {
        if (this.log.fromUser && this.log.fromUser._id == this.$auth.user._id) return -this.log.sum;
        return this.log.sum
      }
      // return this.log.sum;
    },
    date () {
      let now = new Date(this.log.timestamp);
      return `${now.getDate() >= 10 ? now.getDate() : "0"+now.getDate()}.`+
             `${now.getMonth()+1  >= 10 ? now.getMonth()+1 : "0"+(now.getMonth()+1)}.`+
             `${String(now.getFullYear()).substr(2)}`;
    },
    time () {
      let now = new Date(this.log.timestamp);
      return `${now.getHours() >= 10 ? now.getHours() : "0"+now.getHours()}:`+
             `${now.getMinutes() >= 10 ? now.getMinutes() : "0"+now.getMinutes()}`;
    },
    icon () {
      if (this.log.action == "send-to") {
        if (this.log.fromUser == this.$auth.user._id) return icons["send-from"];
        return icons["send-to"];
      }
      return icons[this.log.action];
    },
    tooltip () {
      return tooltips[this.log.action];
    },
    from () {
      return (this.log.fromApp ? this.log.fromApp.name : '') || (this.log.fromUser ? this.log.fromUser.username : '');
    },
    to () {
      return (this.log.toApp ? this.log.toApp.name : '') || (this.log.toUser ? this.log.toUser.username : '');
    }
  },
  components: {
    AccountArrowLeftOutlineIcon,
    CashPlusIcon,
    CashMinusIcon,
    CubeSendIcon
  }
};
</script>

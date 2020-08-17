<template>
  <div class="history-el">
    <div class="history-el__space history-el__space--0"></div>
    <div class="history-el__icon">
      <div class="history-el__icon--i" :tooltip="tooltip">
      <component v-bind:is="icon+'Icon'" size="40"></component></div>
      <div class="history-el__icon--datetime">{{time}}
        <br>{{date}}
      </div>
    </div>
    <div class="history-el__space history-el__space--1"></div>
    <div class="history-el__space history-el__space--2"></div>
    <div class="history-el__user">
      <div class="history-el__user--title">От</div>
      <div class="history-el__user--value">{{log.from.username}}</div>
    </div>
    <div class="history-el__user">
      <div class="history-el__user--title">Кому</div>
      <div class="history-el__user--value">{{log.to.username}}</div>
    </div>
    <div class="history-el__space history-el__space--3"></div>
    <div class="history-el__comm">
      <div class="history-el__user--title">Комментарий</div>
      <div
        class="history-el__user--value"
      >{{log.more || "Отсутствует"}}</div>
    </div>
    <div
      class="history-el__sum"
      :class="(Number(sum) < 0) ? 'history-el__sum--minus' : ''"
    >{{((Number(sum) < 0) ? -Number(sum) : sum)}}</div>
  </div>
</template>
<script>
const icons = {
  "banker-void" : "AccountArrowLeftOutline",
  "send-to": "CashPlus",
  "send-from": "CashMinus",
  "app-to": "CubeSend"
}
const tooltips = {
  "banker-void" : "Пополнение/снятие",
  "send-to": "Перевод",
  "app-to": "Приложение"
}
import AccountArrowLeftOutlineIcon from "mdi-vue/AccountArrowLeftOutline.vue";
import CashPlusIcon from "mdi-vue/CashPlus.vue";
import CashMinusIcon from "mdi-vue/CashMinus.vue";
import CubeSendIcon from "mdi-vue/CubeSend.vue";
export default {
  props: ["log"],
  computed: {
    sum () {
      if (this.log.action == "banker-void") return this.log.sum;
      if (this.log.action == "send-to") {
        if (this.log.from.id == this.$auth.user.id) return -this.log.sum;
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
        if (this.log.from.id == this.$auth.user.id) return icons["send-from"];
        return icons["send-to"];
      }
      return icons[this.log.action];
    },
    tooltip () {
      return tooltips[this.log.action];
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

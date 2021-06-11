<template>
  <div class="main-element">
    <div class="date" v-if="log.firstOfDay">{{date}}</div>
    <div class="history-el">
      <div class="history-el__time">{{time}}</div>
      <div class="history-el__users">
        <!-- FROM -->
        <div :tooltip="from" class="history-el__user history-el--may-have-tooltip" v-if="fromType == 'user'">
          <client-only>
            <img :src="`https://visage.surgeplay.com/face/128/${log.fromUser.uuid}`"
                 :alt="log.fromUser.username" />
          </client-only>
        </div>
        <AppImg :tooltip="from" type="52" v-if="fromType == 'app'" :app="log.fromApp" class="history-el--may-have-tooltip" />

        <!-- ARROW -->
        <ArrowRightIcon size="24" class="history-el__arrow" />

        <!-- TO -->
        <div :tooltip="to" class="history-el__user history-el--may-have-tooltip" v-if="toType == 'user'">
          <client-only>
            <img :src="`https://visage.surgeplay.com/face/128/${log.toUser.uuid}`"
                 :alt="log.toUser.username" />
          </client-only>
<!--          <img :src="`https://crafatar.com/avatars/${log.toUser.uuid}?overlay`"-->
<!--               :alt="log.toUser.username">-->
<!--          <img :src="`https://minotar.net/armor/bust/${log.toUser.uuid || log.toUser.username}/100.png`"-->
<!--               :alt="log.toUser.username">-->
        </div>
        <AppImg :tooltip="to" type="52" v-if="toType == 'app'" :app="log.toApp" class="history-el--may-have-tooltip" />
        <div v-if="toType == false"></div>
      </div>
      <div class="history-el__comm">
        <div class="history-el__comm--title"> {{this.log.action != 'banker-void' ? 'Комментарий' : 'Операция'}}</div>
        <div v-if="this.log.action != 'banker-void'" class="history-el__comm--value" :class="{'italic': !log.more}">{{log.more || "Отсутствует"}}</div>
        <div v-else class="history-el__comm--value">Пополнение/снятие</div>
      </div>
      <div
        class="history-el__sum"
        :class="(Number(sum) < 0) ? 'history-el__sum--minus' : ''"
      >{{ Number(sum) < 0 ? -Number(sum) : sum }}</div>
    </div>
  </div>
</template>

<script>
import AppImg from "~/components/AppImg.vue";
import ArrowRightIcon from "mdi-vue/ArrowRight.vue";
// import AccountArrowLeftOutlineIcon from "mdi-vue/AccountArrowLeftOutline.vue";
// import CashPlusIcon from "mdi-vue/CashPlus.vue";
// import CashMinusIcon from "mdi-vue/CashMinus.vue";
// import CubeSendIcon from "mdi-vue/CubeSend.vue";
// //
// const icons = {
//   "banker-void" : "AccountArrowLeftOutline",
//   "send-to": "CashPlus",
//   "send-from": "CashMinus",
//   "app-to": "CubeSend",
//   "app-from": "CubeSend"
// }
const tooltips = {
  "banker-void" : "Пополнение/снятие",
  "send-to": "Перевод",
  "app-to": "Приложение",
  "app-from": "Приложение",
  "dpay": "DPay ваучер"
}

export default {
  props: ["log"],
  mounted () {
    // console.log(this.log);
  },
  computed: {
    sum () {
      if (this.log.action == "banker-void" || this.log.action == "app-from") return this.log.sum;
      if (this.log.action == "send-to" || this.log.action == "app-to") {
        if (this.log.fromUser && this.log.fromUser._id == this.$auth.user._id) return -this.log.sum;
        return this.log.sum
      }
      return this.log.sum;
    },
    date () {
      const now = new Date();
      const tsmp = new Date(this.log.timestamp);

      const day = `${tsmp.getDate() >= 10 ? tsmp.getDate() : "0"+tsmp.getDate()}.`+
                  `${tsmp.getMonth()+1  >= 10 ? tsmp.getMonth()+1 : "0"+(tsmp.getMonth()+1)}.`+
                  `${String(tsmp.getFullYear()).substr(2)}`

      if (tsmp.getDate() == now.getDate()) return `Сегодня`;
      if (tsmp.getDate() == now.getDate() - 1) return `Вчера`;
      if (tsmp.getDate() == now.getDate() - 2) return `Позавчера`;

      return day;
    },
    time () {
      let tsmp = new Date(this.log.timestamp);
      return `${tsmp.getHours() >= 10 ? tsmp.getHours() : "0"+tsmp.getHours()}:`+
             `${tsmp.getMinutes() >= 10 ? tsmp.getMinutes() : "0"+tsmp.getMinutes()}`;
    },
    // icon () {
    //   if (this.log.action == "send-to") {
    //     if (this.log.fromUser == this.$auth.user._id) return icons["send-from"];
    //     return icons["send-to"];
    //   }
    //   return icons[this.log.action];
    // },
    // tooltip () {
    //   return tooltips[this.log.action];
    // },
    from () {
      return (this.log.fromApp ? this.log.fromApp.name : '') || (this.log.fromUser ? this.log.fromUser.username : '');
    },
    to () {
      return (this.log.toApp ? this.log.toApp.name : '') || (this.log.toUser ? this.log.toUser.username : '');
    },
    fromType () {
      return this.log.fromUser ? 'user' : (this.log.fromApp ? 'app' : false);
    },
    toType () {
      return this.log.toUser ? 'user' : (this.log.toApp ? 'app' : false);
    }
  },
  components: {
    ArrowRightIcon,
    // CashPlusIcon,
    // CashMinusIcon,
    // CubeSendIcon,
    AppImg
  }
};
</script>

<style lang="scss" scoped>
@import "~/assets/vars.scss";

.italic { font-style: italic }

@keyframes blueBg {
  from {background: $always-primary;}
}
.main-element {
  margin-bottom: 8px;
  &:first-child .date {
    margin-top: 0;
  }
}
.date {
  margin-top: 16px;
  margin-bottom: 5px;
  padding-left: 5px;
  color: $text-subtext;
  .dark & {
    color: $dark-text-subtext;
  }
}

@media (max-width: 680px) {
  .history-el {
    grid-template-columns: 14px 146px 1fr!important;
    &__comm {
      grid-row: 2;
      grid-column-start: 2;
      grid-column-end: 4;
      padding-left: 0!important;
    }
    &__time {
      grid-row-start: 1;
      grid-row-end: 3;
    }
  }
}
@media (max-width: 360px) {
  .history-el {
    grid-template-columns: 1fr 1fr!important;
    &__users {
      grid-row: 1;
      justify-self: center!important;
      grid-column-start: 1;
      grid-column-end: 3;
    }
    &__sum {
      grid-row: 2;
      grid-column: 2;
      justify-self: center!important;
    }
    &__time {
      grid-row: 2;
      grid-column: 1;
      transform: none!important;
      height: auto!important;
      font-size: 16px!important;
      writing-mode: initial!important;
      text-align: left!important;
    }
    &__comm {
      grid-column: 2;
      grid-row: 3;
      grid-column-start: 1;
      grid-column-end: 3;
    }
  }
}

.history-el {
  display: grid;
  grid-template-columns: 14px 146px 1fr auto;
  grid-gap: 10px;
  align-items: center;
  justify-content: flex-start;
  padding: 15px 20px;
  padding-left: 12px;
  border-radius: $card-border-radius;
  transition: 0.13s all;
  background: $card-background;
  box-shadow: $card-shadow;
  animation: blueBg 2s;
  &:last-child {
    margin-bottom: 0;
  }
  &:hover {
    box-shadow: $card-hshadow;
  }
  &__comm, &__sum {
    padding-left: 10px;
  }
  &__time {
    transform: rotate(180deg);
    height: 100%;
    writing-mode: vertical-lr;
    font-size: 12px;
    color: $text-subtext;
    text-align: center;
    width: min-content;
    .dark & {
     color: $dark-text-subtext;
    }
  }
  &__arrow {
    color: $text-light;
    .dark & { color: $dark-text-light; }
  }
  &__space {display:none; flex-grow: 1;}
  &__users {
    display: flex;
    width: 146px!important;
    max-width: 146px!important;
    min-width: 146px!important;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  &__user, &__user > img {
    width: 52px;
    height: 52px;
    border-radius: 12px;
  }
  &--may-have-tooltip  {
    position: relative;
    &[tooltip] {
      &::before {
        font-weight: normal;
        content: attr(tooltip);
        color: $always-white;
        background: $always-black;
        padding: 6px 8px;
        border-radius: 6px;
        font-size: 14px;
        line-height: 16px;
        display: block;
        position: absolute;
        top: -35px;
        white-space: nowrap;
        opacity: 0;
        transition: opacity 0.2s;
        pointer-events: none;
        z-index: 999;
      }
      &::after {
        font-weight: normal;
        content: "";
        width: 0;
        height: 0;
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-top: 5px solid $always-black;
        position: absolute;
        top: -7px;
        left: 24px;
        opacity: 0;
        transition: opacity 0.2s;
        pointer-events: none;
      }
      &:hover {
        &[tooltip]::before, &[tooltip]::after {
          opacity: 1;
        }
      }
    }
  }
  &__comm {
    max-width: 100%;
    overflow: hidden;
    &--title {
      font-size: 12px;
      color: $text-light;
    }
    &--value {
      max-width: 100%;
      font-size:16px;
      color: $text-simple;
      overflow: hidden;
      line-height: 19px;
      max-height: 40px;
      word-wrap: none;
      display: -webkit-box;
      -moz-line-clamp: 2;
      -moz-box-orient: vertical;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      line-clamp: 2;
      box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  &__sum {
    justify-self: end;
    font-size: 24px;
    color: $text-simple;
    &::before {
      content: "+";
      color: $text-light;
      font-size: 24px;
      margin-left: 2px;
    }
    &::after {
      content: "АР";
      color: $text-light;
      font-size: 16px;
      margin-left: 2px;
    }
    &--minus::before {
      content: "-";
    }
  }
  .dark & {
    background: $dark-card-background;
    box-shadow: $dark-card-shadow;
    &:hover {
      background: $dark-card-hover;
    }
    &__comm {
      &--title {
        color: $dark-text-subtext;
      }
      &--value {
        color: $dark-text-simple;
      }
    }
    &__sum {
      color: $dark-text-simple;
      &::before {
        color: $dark-text-light;
      }
      &::after {
        color: $dark-text-subtext;
      }
    }
  }
}
</style>

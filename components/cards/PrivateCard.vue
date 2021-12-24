<template lang="html">
  <div v-if="!type" @dragstart="drag" @drop="drop" @dragover.prevent="() => true" draggable="false" class="card">
    <div class="card__pro" v-if="isPro">PRO</div>
    <div class="card__top">
      <div class="card__text">{{data.text}}</div>
      <div class="card__id">#{{id}}</div>
    </div>
    <div class="card__bottom">
      <div class="card__settings">
        <div class="button" @click="openModal" tooltip="В разработке">
          <CogOutlineIcon v-if="settings" size="24" />
          <AccountSettingsIcon v-else size="24" />
        </div>
      </div>
      <!-- TODO: sum change animation -->
      <div class="card__sum">{{data.balance}} АР</div>
    </div>

    <portal v-if="cardModal" to="modal">
      <transition name="page">
        <Modal @close="closeModal" @btn="closeModal" header="Перевод между картами"
               :buttons="[{name: 'Закрыть', type:'secondary'}]">
          <p>Oh, shit</p>
        </Modal>
      </transition>
    </portal>
  </div>
  <div v-else-if="type == 'create'" @click="page == 0 ? createCardPage() : false" class="card card--create" :class="{'card--create-hover': page == 0}">
    <div v-if="page == 0" class="card__center">
      <PlusIcon size="60" />
      <div id="cr-text">Создать карточку</div>
    </div>
    <div v-if="page == 1" class="card__center">
      <div id="cr-text" class="non-muted" style="margin-bottom: 12px;">Создание карточки - <b>32 АР</b><br>Вы уверены?</div>
      <div style="display: flex;justify-content: center;align-items: center;">
        <div class="btn secondary" style="margin-right:12px" @click="page = 0">Отмена</div>
        <div class="btn primary" @click="createCard(); page = 0">Создать</div>
      </div>
    </div>
  </div>
</template>

<script>
import CogOutlineIcon from 'mdi-vue/CogOutline.vue';
import AccountSettingsIcon from 'mdi-vue/AccountSettings.vue';
import PlusIcon from 'mdi-vue/Plus.vue';
import TransferIcon from 'mdi-vue/SwapHorizontalBold.vue';
import Modal from '~/components/cards/CardModal.vue';

export default {
  name: "PrivateCard",
  props: ["data", "type", "settings"],
  data: () => ({
    now: Date.now(),
    page: 0,
    cardModal: false
  }),
  computed: {
    id () {
      return String(this.data.id).substr(0,4) + " " + String(this.data.id).substr(4,4);
    },
    isPro () {
      return new Date(this.data.pro).getTime() > this.now;
    }
  },
  methods: {
    openModal() {
      console.log("Modal is", this.cardModal?"open":"closed", "now")
      console.log("Opening modal...");
      this.cardModal = true;
    },
    closeModal() {
      console.log("Closing modal...");
      this.cardModal = false;
    },
    drop (e) {
      let card = e.dataTransfer.getData("card");
      if (card && card._id) console.log("CARD!", card);
    },
    drag (e) {
      e.dataTransfer.setData("text", this.data.id);
      e.dataTransfer.setData("card", {_id: this.data._id, id: this.data.id});
    },
    async createCard () {
      try {
        let r = await this.$api.post("/cards/new", {}, { withCredentials: true });
        this.$auth.fetchUser();
      } catch (e) {
        let err = "Неизвестная ошибка";
        const d = e.response ? e.response.data : {};
        if (d.e == "NEM" || d.error == "Not enough money") {
          err = "Недостаточно средств на балансе";
        }
        if (d.e == "CM" || d.error == "Cards maximum") {
          err = "У вас максимум карт";
        }
        if (d.e == "CD" || d.error == "Cooldown") {
          err = "Кулдаун запросов";
        }
        this.$store.dispatch('addNotification', {
          title: "Ошибка", descr: `Не удалось создать карту: ${err}`, type: "error"
        })
      }
    },
    createCardPage () {
      this.page = 1;
    }
  },
  components: { CogOutlineIcon, PlusIcon, AccountSettingsIcon, TransferIcon, Modal }
}
</script>

<style lang="scss" scoped>
@import "~/assets/vars.scss";

.card {
  padding: 15px 20px;
  // height: 170px!important;
  // width: 320px!important;
  position: relative;
  height: 175px !important;
  width: 280px !important;
  border-radius: 10.5px; // 320/280 = 12/10.5    280/320=0.875
  color: $always-white;
  background: linear-gradient(135deg, #ffffff33, transparent);
  background-color: darken($always-primary, 5);
  display: -webkit-flex;
  display: -ms-flex;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 3px 8px rgba(0,0,0,.3);
  margin-bottom: 13px;
  &__center {
    display: -webkit-flex;
    display: -ms-flex;
    display: flex;
    justify-content: center;
    -ms-align-items: center;
    align-items: center;
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    flex-direction: column;
    height: 100%;
  }
  &--create {
    background-color: transparent;
    color: $text-light;
    box-shadow: none!important;
    border: 2px dashed $text-light;
    transition: color .13s, box-shadow .13s;
    #cr-text {
      font-size: 16px;
      max-width: 230px;
      text-align: center;
      &.non-muted {
        color: $text-simple;
        .dark & {
          color: $dark-text-simple;
        }
      }
    }
    &-hover {
      cursor: pointer;
      &:hover {
        color: $text-subtext;
        border-color: $text-subtext;
      }
    }

    .dark & {
      color: $dark-text-light;
      border-color: $dark-text-light;
      &-hover:hover {
        color: $dark-text-subtext;
        border-color: $dark-text-subtext;
      }
    }
  }
  &__pro {
    position: absolute;
    right: 20px;
    top: 15px;
    padding: 3px 4px;
    font-weight: bold;
    font-size: 12px;
    background: #F4999F;
    background: linear-gradient(145deg, #F4999F, #08F59C);;
    border-radius: 3px;
  }
  &__top {
    display: -webkit-flex;
    display: -ms-flex;
    display: flex;
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    flex-direction: column;
    justify-content: flex-start;
    -ms-align-items: flex-start;
    align-items: flex-start;
  }
  &__id {
    font-size: 12px;
  }
  &__text {
    font-size: 18px;
    font-weight: bold;
  }
  &__bottom {
    display: -webkit-flex;
    display: -ms-flex;
    display: flex;
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    flex-direction: row;
    justify-content: space-between;
    -ms-align-items: flex-end;
    align-items: flex-end;
  }
  /*&__settings {*/
  /*  & > .button {*/
  /*    transition: opacity .13s;*/
  /*    !*cursor: pointer;*!*/
  /*    opacity: 0.7;*/
  /*    position: relative;*/
  /*    &::after { left: 8px; }*/
  /*    !*&:hover{*!*/
  /*    !*  opacity: 0.85;*!*/
  /*    !*}*!*/
  /*    !*&:active {*!*/
  /*    !*  opacity: 0.7;*!*/
  /*    !*}*!*/
  /*  }*/
  /*}*/
  &__sum {
    font-size: 32px;
    font-weight: bold;
    line-height: 30px;
  }
  .dark & {
    box-shadow: 0 4px 12px rgba(0,0,0,.5);
  }
}
</style>

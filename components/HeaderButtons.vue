<template>
  <div>
    <transition :name="animBack ? 'swipe-menu-back' : 'swipe-menu'">

      <!-- MAIN MENU -->
      <div v-if="!menu" :key="false" class="profile-nav">
        <div class="profile-nav__row">
          <!-- TODO ВЫЗОВ БАНКИРА -->
          <div tooltip="Вызвать банкира" class="profile-nav__button">
            <AccountTieVoiceOutlineIcon size="26"/>
          </div><div tooltip="Перевод" @click="next('t-1')" class="profile-nav__button">
            <ArrowRightBoldOutlineIcon size="26"/>
          </div>
          <div tooltip="DPay" @click="/*next('d0')*/dpayOpened=true" class="profile-nav__button">
            <AccountCashOutlineIcon size="26"/>
          </div>
          <div tooltip="Банкир панель" @click="next('b0')" v-if="banker" class="profile-nav__button">
            <AccountCashOutlineIcon size="26"/>
          </div>
        </div>
        <div class="profile-nav__row">

          <!-- TODO фриз/анфриз модерами по нику -->
          <div tooltip="Модераторка" @click="next('mod0')" v-if="moder" class="profile-nav__button">
            <AccountGroupOutlineIcon size="26"/>
          </div>

          <div tooltip="Смена темы" @click="$parent.themeChange" class="profile-nav__button">
            <WeatherNightIcon size="26"/>
          </div>
          <div tooltip="Приложения" @click="$router.push('/apps')" class="profile-nav__button">
            <CubeScanIcon size="26"/>
          </div>
          <div tooltip="Настройки" @click="next('s0')" class="profile-nav__button">
            <CogOutlineIcon size="26"/>
          </div>
        </div>
      </div>

      <!-- MODERATOR PANEL -->
      <template>
        <div v-if="menu === 'mod0'" key="mod0" class="profile-nav">
          <div class="profile-nav__row">
            <HelpInput type="text" placeholder="Никнейм"
                       v-model="username"
                       :items="users.map(u => `${u.username}${(u.frozen) ? ' [F]' : ''}`)
                                    .filter(u => u && u.toLowerCase().includes(username.toLowerCase()) && u !== $auth.user.username)"
                       @enterpress="!!users.find(u => u.username === username) ? next('mod1') : ''"
                       />
          </div>
          <div class="profile-nav__row">
            <div tooltip="Назад" @click="back(false, true)" class="profile-nav__button">
              <BackIcon size="26"/>
            </div>
            <div @click="next('mod1')" class="profile-nav__button profile-nav__button--w3"
                 :class="{'profile-nav__button--disabled': !users.find(u => u.username + (u.frozen) ? ' [F]' : '' == username)}">
              Далее
            </div>
          </div>
        </div>
        <div v-if="menu === 'mod1'" key="mod1" class="profile-nav">
          <div class="profile-nav__row">
            <input type="text" placeholder="Комментарий" v-model="comment"
                   @keyup.enter="(comment.length <= 100) ? next('mod2') : ''" />
          </div>
          <div class="profile-nav__row">
            <div tooltip="Назад" @click="back('mod0')" class="profile-nav__button">
              <BackIcon size="26"/>
            </div>
            <div @click="next('mod2')" class="profile-nav__button profile-nav__button--w3">
              Далее
            </div>
          </div>
        </div>
        <div v-if="menu === 'mod2'" key="mod2" class="profile-nav">
          <div class="profile-nav__row">
            <div>
              Пользователь: <b>{{username}}</b><br/>
              Причина: {{comment}}
            </div>
          </div>
          <div class="profile-nav__row">
            <div tooltip="Назад" @click="back('mod1')" class="profile-nav__button">
              <BackIcon size="26"/>
            </div>
            <div v-if="!usr.frozen" @click="freezeUser(true)" class="profile-nav__button profile-nav__button--w3">
              Заморозить
            </div>
            <div v-else @click="freezeUser(false)" class="profile-nav__button profile-nav__button--w3">
              Разморозить
            </div>
          </div>
        </div>
      </template>


      <!-- MONEY SENDING -->
      <template>
        <!-- Intro -->
        <template>
          <!-- Card -->
          <div v-if="menu === 't-1'" key="t-1" class="profile-nav">
            <div class="profile-nav__row">
              <HelpInput type="text" placeholder="Карта" v-model="card"
                         :items="$auth.user.cards.map(c => `${c.text} [${c.id}]`).filter(c => c.toLowerCase().includes(card.toLowerCase()))"
                         @enterpress="(!!currentCard && !!currentCard.id) ? next('t-2') : ''"/>
            </div>
            <div class="profile-nav__row">
              <div tooltip="Назад" @click="back(false, true)" class="profile-nav__button">
                <BackIcon size="26"/>
              </div>
              <div @click="next('t-2')" class="profile-nav__button profile-nav__button--w3"
                   :class="{'profile-nav__button--disabled': !currentCard || !currentCard.id}">
                Далее
              </div>
            </div>
          </div>
          <!-- User or your own? -->
          <div v-if="menu === 't-2'" key="t-2" class="profile-nav">
            <div class="profile-nav__row">
              <div class="profile-nav__button profile-nav__button--disabled"></div>
              <div @click="next('tu0')" class="profile-nav__button profile-nav__button--w3">
                Сам себе
              </div>
            </div>
            <div class="profile-nav__row">
              <div tooltip="Назад" @click="back('t-1')" class="profile-nav__button">
                <BackIcon size="26"/>
              </div>
              <div @click="next('t0')" class="profile-nav__button profile-nav__button--w3">
                Клиенту Dromon
              </div>
            </div>
          </div>
        </template>

        <!-- Self -->
        <template>
          <!-- Card -->
          <div v-if="menu === 'tu0'" key="tu0" class="profile-nav">
            <div class="profile-nav__row">
              <HelpInput type="text" placeholder="Карта получения" v-model="card2"
                         :items="$auth.user.cards.filter(c => c.id != currentCard.id).map(c => `${c.text} [${c.id}]`).filter(c => c.toLowerCase().includes(card2.toLowerCase()))"
                         @enterpress="!!currentCard2 ? next('tu1') : ''"/>
            </div>
            <div class="profile-nav__row">
              <div tooltip="Назад" @click="back('t-2')" class="profile-nav__button">
                <BackIcon size="26"/>
              </div>
              <div @click="next('tu1')" class="profile-nav__button profile-nav__button--w3"
                   :class="{'profile-nav__button--disabled': !currentCard2}">
                Далее
              </div>
            </div>
          </div>
          <!-- Sum -->
          <div v-if="menu === 'tu1'" key="tu1" class="profile-nav">
            <div class="profile-nav__row">
              <input type="number" v-model="sum" placeholder="Сумма"
                     @keyup.enter="(!(sumCheck || sum <= 0 || sum > currentCard.balance)) ? next('tu2') : ''"
              />
            </div>
            <div class="profile-nav__row">
              <div tooltip="Назад" @click="back('tu0')" class="profile-nav__button">
                <BackIcon size="26"/>
              </div>
              <div @click="next('tu2')" class="profile-nav__button profile-nav__button--w3"
                   :class="{'profile-nav__button--disabled': sumCheck || sum <= 0 || sum > currentCard.balance}">
                Далее
              </div>
            </div>
          </div>
          <!-- Confirm -->
          <div v-if="menu === 'tu2'" key="tu2" class="profile-nav">
            <div class="profile-nav__row">
              <div>
                С карты: <b>{{currentCard.id}}</b>;<br>
                На карту: <b>{{currentCard2.id}}</b>;<br>
                Сумма: <b>{{sum}} АР</b>;<br>
              </div>
            </div>
            <div class="profile-nav__row">
              <div tooltip="Назад" @click="back('t2')" class="profile-nav__button">
                <BackIcon size="26"/>
              </div>
              <div @click="sendSelfMoney" class="profile-nav__button profile-nav__button--w3">
                Отправить
              </div>
            </div>
          </div>
        </template>

        <!-- AnOther -->
        <template>
          <!-- Username -->
          <div v-if="menu === 't0'" key="t0" class="profile-nav">
          <div class="profile-nav__row">
            <HelpInput type="text" placeholder="Никнейм" v-model="username"
                       :items="users.map(u => u.username).filter(u => u && u.toLowerCase().includes(username.toLowerCase()) && u != $auth.user.username)"
                       @enterpress="!!users.find(u => u.username === username) ? next('t1') : ''" />
          </div>
          <div class="profile-nav__row">
            <div tooltip="Назад" @click="back('t-2')" class="profile-nav__button">
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
            <input type="number" v-model="sum" placeholder="Сумма"
                   @keyup.enter="(!(sumCheck || sum <= 0 || sum > currentCard.balance)) ? next('t2') : ''"
                   />
          </div>
          <div class="profile-nav__row">
            <div tooltip="Назад" @click="back('t0')" class="profile-nav__button">
              <BackIcon size="26"/>
            </div>
            <div @click="next('t2')" class="profile-nav__button profile-nav__button--w3"
                 :class="{'profile-nav__button--disabled': sumCheck || sum <= 0 || sum > currentCard.balance}">
              Далее
            </div>
          </div>
        </div>
          <!-- Comment -->
          <div v-if="menu == 't2'" key="t2" class="profile-nav">
          <div class="profile-nav__row">
            <input type="text" placeholder="Комментарий" v-model="comment"
                   @keyup.enter="(comment.length <= 100) ? next('t3') : ''" />
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
      </template>

      <!-- BANKER PANEL -->
      <template>
        <!-- Post -->
        <div v-if="menu === 'b0'" key="b0" class="profile-nav">
          <div class="profile-nav__row">
            <HelpInput type="text" placeholder="Отделение"
                       v-model="post"
                       :items="posts.map(p => p.name).filter(p => p && p.toLowerCase().includes(post.toLowerCase()))"
                       @enterpress="!!posts.find(p => p.name === post) ? next('b1') : ''"/>
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
        <div v-if="menu === 'b1'" key="b1" class="profile-nav">
          <div class="profile-nav__row">
            <HelpInput type="text" placeholder="Никнейм"
              v-model="username"
              :items="users.map(u => u.username).filter(u => u && u.toLowerCase().includes(username.toLowerCase() /*&& u != $auth.user.username*/))"
              @enterpress="!!users.find(u => u.username === username/* && u.username != $auth.user.username*/) ? next('b2') : ''"
              />
          </div>
          <div class="profile-nav__row">
            <div tooltip="Назад" @click="back('b0')" class="profile-nav__button">
              <BackIcon size="26"/>
            </div>
            <div @click="next('b2')" class="profile-nav__button profile-nav__button--w3"
                 :class="{'profile-nav__button--disabled': !users.find(u => u.username == username /*&& u.username != $auth.user.username*/)}">
              Далее
            </div>
          </div>
        </div>
        <!-- Sum -->
        <div v-if="menu === 'b2'" key="b2" class="profile-nav">
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
        <div v-if="menu === 'b3'" key="b3" class="profile-nav">
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

      <!-- DPay -->
      <template>
        <!-- Post -->
        <div v-if="menu === 'd0'" key="d0" class="profile-nav">
          <div class="profile-nav__row">
            <div @click="next('d0')" class="profile-nav__button profile-nav__button--w2">
              Создание
            </div>
            <div @click="next('d0')" class="profile-nav__button profile-nav__button--w2">
              Проверка
            </div>
          </div>
          <div class="profile-nav__row">
            <div @click="back(false, true)" class="profile-nav__button profile-nav__button--w1">
              <BackIcon size="26"/>
            </div>
            <div class="profile-nav__button profile-nav__button--w3 profile-nav__button--disabled">
            </div>
          </div>
        </div>
        <!-- Username -->
        <div v-if="menu === 'b1'" key="b1" class="profile-nav">
          <div class="profile-nav__row">
            <HelpInput type="text" placeholder="Никнейм"
              v-model="username"
              :items="users.map(u => u.username).filter(u => u && u.toLowerCase().includes(username.toLowerCase() /*&& u != $auth.user.username*/))"
              @enterpress="!!users.find(u => u.username === username/* && u.username != $auth.user.username*/) ? next('b2') : ''"
              />
          </div>
          <div class="profile-nav__row">
            <div tooltip="Назад" @click="back('b0')" class="profile-nav__button">
              <BackIcon size="26"/>
            </div>
            <div @click="next('b2')" class="profile-nav__button profile-nav__button--w3"
                 :class="{'profile-nav__button--disabled': !users.find(u => u.username == username /*&& u.username != $auth.user.username*/)}">
              Далее
            </div>
          </div>
        </div>
        <!-- Sum -->
        <div v-if="menu === 'b2'" key="b2" class="profile-nav">
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
        <div v-if="menu === 'b3'" key="b3" class="profile-nav">
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
        <!-- MAIN -->
        <div v-if="menu === 's0'" key="s0" class="profile-nav">
          <div class="profile-nav__row">
            <div tooltip="Смена пароля" @click="back(false, true)" class="profile-nav__button">
              <FormTextboxPasswordIcon size="26"/>
            </div>
            <div tooltip="Скачать логи" @click="downloadLogs" class="profile-nav__button">
              <DatabaseArrowDownOutlineIcon size="26"/>
            </div>
            <div tooltip="Очистить все сессии" @click="next('s-eraser')" class="profile-nav__button">
              <CloseNetworkOutlineIcon size="26"/>
            </div>
          </div>
          <div class="profile-nav__row">

            <div tooltip="Назад" @click="back(false, true)" class="profile-nav__button">
              <BackIcon size="26"/>
            </div>
            <div tooltip="Обновить никнейм" @click="updateNickname" class="profile-nav__button">
              <AccountConvertOutlineIcon size="26"/>
            </div>
            <!-- <div tooltip="Безобидная кнопка" @click="back(false, true)" class="profile-nav__button profile-nav__button--disabled">
            </div> -->
            <div tooltip="Выход" @click="next('s-exit')" class="profile-nav__button">
              <LogoutVariantIcon size="26"/>
            </div>
            <!-- <div @click="next('b1')" class="profile-nav__button profile-nav__button--w3"
                 :class="{'profile-nav__button--disabled': !posts.find(p => p.name == post)}">
              Далее
            </div> -->
          </div>
        </div>
        <div v-if="menu === 's-eraser'" key="s-eraser" class="profile-nav">
          <div class="profile-nav__row">
            <div>
              Вы уверены, что хотите завершить <b>ВСЕ сессии</b>?
            </div>
          </div>
          <div class="profile-nav__row">
            <div @click="back('s0', true)" class="profile-nav__button profile-nav__button--w2">
              Отмена
            </div>
            <div @click="clearAllSessions" class="profile-nav__button profile-nav__button--w2">
              Завершить
            </div>
          </div>
        </div>
        <div v-if="menu === 's-exit'" key="s-exit" class="profile-nav">
          <div class="profile-nav__row">
            <div>Вы уверены, что хотите <b>выйти</b>?</div>
          </div>
          <div class="profile-nav__row">
            <div @click="back('s0', true)" class="profile-nav__button profile-nav__button--w2">
              Отмена
            </div>
            <div @click="logout" class="profile-nav__button profile-nav__button--w2">
              Выйти
            </div>
          </div>
        </div>
      </template>

    </transition>
    <!-- DPay Code / Check -->
    <portal to="modal">
      <transition name="page">
        <Modal @close="dpayOpened = false" @btn="dpayOpened = false" v-if="dpayOpened" header="Question?"
               :buttons="[{name: 'Закрыть', type:'secondary'}]">
          <p>Oh, shit</p>
        </Modal>
      </transition>
    </portal>
  </div>
</template>
<script>
import AccountTieVoiceOutlineIcon from "mdi-vue/AccountTieVoiceOutline.vue";
import CubeScanIcon from "mdi-vue/CubeScan.vue";
import CogOutlineIcon from "mdi-vue/CogOutline.vue";
import ArrowRightBoldOutlineIcon from "mdi-vue/ArrowRightBoldOutline.vue";
import WeatherNightIcon from "mdi-vue/WeatherNight.vue";
import LogoutVariantIcon from "mdi-vue/LogoutVariant.vue";
import AccountCashOutlineIcon from "mdi-vue/AccountCashOutline.vue";
import AccountGroupOutlineIcon from "mdi-vue/AccountGroupOutline.vue";
import BackIcon from "mdi-vue/ArrowLeft.vue";
import HelpInput from "~/components/HelpInput.vue";
import Modal from "~/components/Modal.vue";
import FormTextboxPasswordIcon from "mdi-vue/FormTextboxPassword.vue";
import AccountConvertOutlineIcon from "mdi-vue/AccountConvertOutline.vue";
import CloseNetworkOutlineIcon from "mdi-vue/CloseNetworkOutline.vue";

// import Settings from "~/components/HeaderButtons/Settings.vue";

export default {
  props: ["moder", "banker", "posts", "users", "cards"],
  data: () => ({
    menu: false,
    animBack: false,
    dpayOpened: false,
    username: "",
    sum: null,
    post: "",
    comment: "",
    card: "",
    card2: ""
  }),
  components: {
    AccountTieVoiceOutlineIcon,
    CubeScanIcon,
    CogOutlineIcon,
    ArrowRightBoldOutlineIcon,
    WeatherNightIcon,
    LogoutVariantIcon,
    AccountCashOutlineIcon,
    AccountGroupOutlineIcon,
    FormTextboxPasswordIcon,
    AccountConvertOutlineIcon,
    CloseNetworkOutlineIcon,
    BackIcon, HelpInput,
    Modal,
    // Settings
  },
  computed: {
    sumCheck () {
      return isNaN(this.sum) || parseInt(this.sum, 10) === 0 || this.sum < -62208 || this.sum > 62208;
    },
    currentCard () {
      return this.card ? this.$auth.user.cards.find(c => `${c.text} [${c.id}]` === this.card) : {};
    },
    currentCard2 () {
      return this.card2 ? this.$auth.user.cards.find(c => `${c.text} [${c.id}]` === this.card2) : {};
    },
    usr () {
      return this.username ? this.users.find(u => u.username === this.username || `${u.username} [F]` === this.username) : {};
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
      this.card = "";
      this.card2 = "";
    },
    async updateNickname () {
      try {
        let nick = await this.$api.get("/users/@me/updateNickname", { withCredentials: true });

        if (nick.data == this.$auth.user.username) {
          this.back(false, true);
          return this.$store.dispatch('addNotification', {
            type: "danger", title: "Никнейм не изменился",
            descr: `Ваш никнейм - ${nick.data}. Если это не так, то попробуйте ещё раз через 12 часов`
          });
        }

        this.$auth.fetchUser();
        this.back(false, true);
        return this.$store.dispatch('addNotification', {
          type: "success", title: "Никнейм изменён",
          descr: `Ваш новый никнейм - ${nick.data}. Вы уже можете им любоваться в профиле`
        });
      } catch (e) {
        let err = e.response ? e.response.data || {} : {};
        let text = "Неизвестная ошибка";
        if (err.error === "Cooldown") {
          return this.$store.dispatch('addNotification', {
            type: "danger", title: "Кулдаун",
            descr: 'Нельзя так часто обновлять никнейм'
          });
        }
        this.$store.dispatch('addNotification', {
          type: "error", title: "Ошибка",
          descr: `Не удалось обновить никнейм: ${text}`
        });
      }

    },
    async downloadLogs () {
      let logs = await this.$api.get('/users/@me/logs/download', { withCredentials: true });
      window.URL = window.URL || window.webkitURL;
      let downloadElement = document.createElement('a');
      downloadElement.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(logs.data));
      downloadElement.setAttribute('download', `logs-${this.$auth.user.username}-${Date.now()}.txt`);
      downloadElement.style.display = 'none';

      document.body.appendChild(downloadElement);
      downloadElement.click();
      document.body.removeChild(downloadElement);
    },
    async clearAllSessions () {
      try {
        await this.$api.post('/users/@me/clear', {}, { withCredentials: true });
        this.$auth.logout();
      } catch (e) {}
    },
    async bankerAddMoney() {
      try {
        await this.$api.post(`/cards/${this.usr._id}/add`, {
          sum: this.sum,
          post: this.posts.find(p => p.name === this.post).id
        }, { withCredentials: true });
        this.next(false);
        this.clear();
      } catch (e) {
        let err = e.response ? e.response.data || {} : {};
        let text = "Неизвестная ошибка";
        if (err.error === "Invalid card") {
          text = "Неверная карта получателя"
        }
        if (err.error === "Invalid id") {
          text = "Нельзя выполнять операции банкира с самим собой"
        }
        if (err.error === "Not enough money") {
          text = "Недостаточно АР на счету"
        }
        if (err.error === "User not found") {
          text = "Получатель не найден"
        }
        if (err.error === "toCard not found") {
          text = "У получателя нет ни единой карты"
        }
        if (err.error === "Cooldown") {
          return this.$store.dispatch('addNotification', {
            type: "danger", title: "Кулдаун",
            descr: 'Может ты и банкир, но дудосить сервер тебе не разрешали'
          });
        }

        this.$store.dispatch('addNotification', {
          type: "error", title: "Ошибка",
          descr: `Не удалось совершить перевод: ${text}`
        });
      }
    },
    async sendMoney() {
      try {
        await this.$api.post(`/cards/send/${this.usr._id}`, {
          card: this.currentCard.id,
          sum: this.sum,
          comment: this.comment
        }, { withCredentials: true });
        this.next(false);
        this.clear();
      } catch (e) {
        let err = e.response ? e.response.data || {} : {};
        let text = "Неизвестная ошибка";
        switch (err.error) {
          case "Invalid card":
            text = "Неверная карта получателя";
            break;
          case "Invalid id":
            text = "Нельзя совершить перевод самому себе, используя данный метод";
            break;
          case "Not enough money":
            text = "Недостаточно АР на счету";
            break;
          case "User not found":
            text = "Получатель не найден";
            break;
          case "Card not found":
            text = "Карта отправки не найдена";
            break;
          case "toCard not found":
            text = "У получателя нет ни единой карты";
            break;
        }
        if (err.error === "Cooldown") {
          return this.$store.dispatch('addNotification', {
            type: "danger", title: "Кулдаун",
            descr: 'Всего пара сек и можно попытаться перевести ещё раз'
          });
        }

        this.$store.dispatch('addNotification', {
          type: "error", title: "Ошибка",
          descr: `Не удалось совершить перевод: ${text}`
        });
      }
    },
    async sendSelfMoney() {
      try {
        await this.$api.post(`/cards/send/self/${this.currentCard2.id}`, {
          card: this.currentCard.id,
          sum: this.sum
        }, { withCredentials: true });
        this.next(false);
        this.clear();
      } catch (e) {
        let err = e.response ? e.response.data || {} : {};
        let text = "Неизвестная ошибка";
        switch (err.error) {
          case "Invalid card":
            text = "Неверная карта получателя";
            break;
          case "Invalid id":
            text = "Нельзя совершить перевод кому-то иному, используя данный метод";
            break;
          case "Not enough money":
            text = "Недостаточно АР на счету";
            break;
          case "User not found":
            text = "Получатель не найден";
            break;
          case "Card not found":
            text = "Карта отправки не найдена";
            break;
          case "toCard not found":
            text = "Карта получения не найдена";
            break;
          case "Same card":
            text = "Невозможно отправить на ту же карту";
            break;
        }
        if (err.error === "Cooldown") {
          return this.$store.dispatch('addNotification', {
            type: "danger", title: "Кулдаун",
            descr: 'Всего пара сек и можно попытаться перевести ещё раз'
          })
        }

        this.$store.dispatch('addNotification', {
          type: "error", title: "Ошибка",
          descr: `Не удалось совершить перевод: ${text}`
        })
      }
    },
    async freezeUser(frozen = true) {
      try {
        await this.$api.post(`/users/${this.usr.id}/freeze`, {
          comment: this.comment, frozen
        }, { withCredentials: true });
        this.next(false);
        this.clear();
        this.$parent.$fetch();
      } catch (e) {
        let err = e.response ? e.response.data || {} : {};
        let text = "Неизвестная ошибка";
        switch (err.error) {
          case "Forbidden":
            text = "Доступ запрещён";
            break;
          case "Invalid id":
            text = "Нельзя заморозить самого себя";
            break;
          case "User not found":
            text = "Пользователь не найден";
            break;
        }
        if (err.error === "Cooldown") {
          return this.$store.dispatch('addNotification', {
            type: "danger", title: "Кулдаун",
            descr: 'Всего пара сек и можно попытаться заморозить/разморозить ещё раз'
          });
        }
        console.error(e);
        this.$store.dispatch('addNotification', {
          type: "error", title: "Ошибка",
          descr: `Не удалось совершить заморозку/разморозку: ${text}`
        });
      }
    }
  }
};
</script>

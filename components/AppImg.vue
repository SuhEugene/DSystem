<template>
  <div class="app-img" :class="type=='52' ? 'app-img--52' : ''">
    <template v-if="app">
      <div v-if="app.level == -1" class="app-badge app-badge--gray" tooltip="Сомнительное">!</div>
      <div v-if="app.level == 1" class="app-badge" tooltip="Подтверждённое"><CheckIcon size="16"/></div>
      <div v-if="app.level == 2" class="app-badge" tooltip="Партнёр"><ShipWheelIcon size="16"/></div>
      <div v-if="app.level == 3" class="app-badge" tooltip="Официальное"><SailBoatIcon size="16"/></div>
      <div class="app-image">
        <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
             :style="app.avatar ? `background-image: url('${app.level >= 0 ? app.avatar: ''}')` : ''">
        <div>
          <CubeOutlineIcon v-if="app.level >=0" :size="type=='52' ? 30 : 38" />
          <EmoticonDevilOutlineIcon v-else :size="type=='52' ? 30 : 38" />
        </div>
      </div>
    </template>
    <div v-else class="app-image">
      <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">
      <div>
      </div>
    </div>
  </div>
</template>
<script>
import CheckIcon from "mdi-vue/Check.vue";
import CubeOutlineIcon from "mdi-vue/CubeOutline.vue";
import SailBoatIcon from "mdi-vue/SailBoat.vue";
import ShipWheelIcon from "mdi-vue/ShipWheel.vue";
import EmoticonDevilOutlineIcon from "mdi-vue/EmoticonDevilOutline.vue";
// https://www.penpublishing.com/squaresMobileTest.jpg
export default {
    name: "AppImg",
    props: ["app", "type"],
    components: { CubeOutlineIcon, CheckIcon, SailBoatIcon, ShipWheelIcon, EmoticonDevilOutlineIcon }
};
</script>

<style lang="scss">
@import "~/assets/vars.scss";

.app-img {
  height: 64px;
  width: 64px;
  border-radius: 12px;
  position: relative;
  &--big, &--big img {
    height: 80px!important;
    width: 80px!important;
  }
  &--52 {
    height: 52px!important;
    width: 52px!important;
    & > img, & > .app-image {
      height: 52px!important;
      width: 52px!important;
      & > img {
        height: 52px!important;
        width: 52px!important;
      }
    }
  }
  & > img, & > .app-image {
    height: 64px;
    width: 64px;
    border-radius: 14px;
    position: relative;
    overflow: hidden;
    & > img {
      height: 64px;
      width: 64px;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
      background-size: cover;
      background-repeat: no-repeat;
      background-position: center center;
    }
    & > div {
      height: 100%;
      width: 100%;
      background: $text-subtext;
      color: white;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 14px;
    }
  }
  .app-badge {
    position: absolute;
    height: 24px;
    width: 24px;
    padding: 5px;
    background: #346db3;
    right: -6px;
    bottom: -6px;
    border-radius: 50%;
    z-index: 50;
    box-shadow: inset 0 0 0 2px $card-stroke;
    display: flex!important;
    justify-content: center!important;
    align-items: center!important;
    margin: 0;
    font-size: 14px;
    line-height: 15px;
    font-weight: bold;
    color: $always-white;
    &--gray { background: $always-error; }
    span {
      line-height: 12px;
      color: $always-white;
    }
    [tooltip] {
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
}
</style>

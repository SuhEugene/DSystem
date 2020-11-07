<template>
<!-- TODO: verfified app icons and another -->
    <div class="app-img">
        <div v-if="app.level == -1" class="app-badge app-badge--gray" tooltip="Сомнительное">!</div>
        <div v-if="app.level == 1" class="app-badge" tooltip="Подтверждённое"><CheckIcon size="16"/></div>
        <div v-if="app.level == 2" class="app-badge" tooltip="Партнёр"><ShipWheelIcon size="16"/></div>
        <div v-if="app.level == 3" class="app-badge" tooltip="Официальное"><SailBoatIcon size="16"/></div>
        <div class="app-image">
            <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" :style="`background-image: url('${app.level >= 0 ? app.avatar : ''}')`">
            <!-- <img src="img_orange_flowers.jpg" alt="Flowers" style="width:auto;"> -->
            <div>
              <CubeOutlineIcon v-if="app.level >=0" size="38" />
              <EmoticonDevilOutlineIcon v-else size="38" />
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
    props: ["app"],
    components: { CubeOutlineIcon, CheckIcon, SailBoatIcon, ShipWheelIcon, EmoticonDevilOutlineIcon }
};
</script>

<style lang="scss">
$always-white: #ffffff;
$always-black: #000000;
$always-transp: transparent;
$always-transp1: rgba(0,0,0,.2);
$always-white-stroke: rgba(0, 0, 0, 0.1);
$always-error: #dd4444;
$always-danger: #ffaa00;
$always-success: #11dd33;
$always-primary: #346db3;
$background: #ffffff;
$text-light: #757575;
$text-subtext: #565656;
$text-simple: #000000;
$text-heading: #000000;
$card-shadow: 0 2px 8px 0 rgba(0,0,0,.15);
$card-hshadow: 0 2px 10px 0 rgba(0,0,0,.3);
$card-stroke: rgba(0,0,0,.15);
$card-hover: #fafafa;
$card-background: #ffffff;
$card-border-radius: 4px;
$dark-background: #111111;
$dark-text-light: #777777;
$dark-text-subtext: #aaaaaa;
$dark-text-simple: #eeeeee;
$dark-text-heading: #ffffff;
$dark-card-stroke: rgba(255,255,255,.15);
$dark-card-shadow: 0 2px 6px 0 rgba(0,0,0,.2);
$dark-card-hover: #272727;
$dark-card-background: #222222;
$font-bold: 500;
$font: "Rubik", Arial, sans-serif;

.app-img {
  height: 64px;
  width: 64px;
  border-radius: 12px;
  position: relative;
  &--big, &--big img {
    height: 80px!important;
    width: 80px!important;
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
    z-index: 999;
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
<template>
  <div :class="$style.page" :style="$store.state.dark ? 'background:#222222' : ''">
    <div :class="$style.iconWrap">
      <div :class="$style.icon">
        <CloseIcon size="56"/>
      </div>
    </div>
  </div>
</template>
<script>
import CloseIcon from "mdi-vue/Close.vue";
export default {
  name: "ErrorOverlay",
  components: { CloseIcon }
};
</script>
<style module>

.page {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
  position: absolute;
  top: 0;
  left: 0;
  background-color: #fafafa;
  z-index: 9999;
  pointer-events: none;
  animation: end-anim 0.5s ease-out 4s both;
}
.iconWrap {
  padding: 15px;
  border: 5px solid transparent;
  border-right: 5px solid #346db3;
  border-radius: 50%;
  animation: spin 3s ease-out both;
  position: absolute;
  width: 56px;
  height: 56px;
  box-sizing: content-box;
}
.icon { animation: spin-icon 3s ease-out both; color: #ff2222;}
@keyframes spin {
  from {
    transform: rotate(-720deg);
    border-color: transparent;
  }
  40% {
    border-right-color: #346db3;
    padding: 15px;
  }
  90% {
    transform: rotate(0deg);
    border-color: transparent;
    /*border-color: transparent;*/
    /*border-right-color: transparent;*/
    /*border-right-color: #346db3;*/
    padding: 40px;
  }
  to {
    border-color: #ff2222;
  }
}
@keyframes spin-icon {
  from { opacity: 0; transform: scale3d(2, 2, 1); }
  80%  { opacity: 0; transform: scale3d(2, 2, 1); }
  90%  { opacity: 1; transform: scale3d(1, 1, 1); }
  to   { opacity: 1; transform: scale3d(1, 1, 1); }
}
@keyframes end-anim {
  to { opacity: 0; }
}
</style>
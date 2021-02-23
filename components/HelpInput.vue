<template>
  <div class="help-input">
    <input :value="value" :type="type"
           :placeholder="placeholder"
           @focus="a = true" @blur="toggleA"
           @input="$emit('input', $event.target.value)"
           @keyup.enter="$emit('enterpress')"
           autocomplete="off" :name="`pch-${placeholder}-${type}`">
    <div v-if="a" class="help-input__help">
      <div v-for="item in items" :key="item" @click="$emit('input', item)" class="help-input__help__item" v-text="item"></div>
      <div v-if="!items.length" style="pointer-events:none!important; opacity:0.6;" class="help-input__help__item">Ничего не найдено</div>
    </div>
  </div>
</template>
<script>
export default {
  props: ['value', 'items', 'placeholder', 'type'],
  data: () => ({ a: false }),
  methods: {
    toggleA() {
      setTimeout(()=>{this.a=false},300)
    }
  }
}
</script>

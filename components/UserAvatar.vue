<template>
  <div class="user-avatar">
    <img alt="User's avatar" :src="`https://minotar.net/armor/bust/${user.uuid || user.username}/300.png`">
    <div>
      <div v-for="badge in badges" :key="badge.tooltip" :tooltip="badge.tooltip" class="user-avatar__badge">
        <img alt="badge" :src="badge.url">
      </div>
    </div>
  </div>
</template>
<script>
const numbers = {
  16: {tooltip: "Тестер", url:"https://image.flaticon.com/icons/png/512/189/189504.png"},
  8: {tooltip: "Разраб", url:"http://icons.iconarchive.com/icons/elegantthemes/beautiful-flat-one-color/128/dev-icon.png"}
}
export default {
  props: ["user"],
  data: () => ({
    badges: []
  }),
  mounted () {this.mount()},
  methods: {
    mount () {
      let badgenum = this.user.badges || 0;
      if (isNaN(badgenum)) return;
      for (let i in numbers) {
        if (badgenum - i < 0) continue;
        badgenum -= i;
        this.badges.push(numbers[i]);
      }
    }
  }
}
</script>
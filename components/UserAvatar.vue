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
const numbers = [
  { points: 32, tooltip: "PieCorp", url:"https://i.imgur.com/4KYNCBC.png" },
  { points: 16, tooltip: "Тестер", url:"https://image.flaticon.com/icons/png/512/189/189504.png" },
  { points: 8,  tooltip: "SuhEugene", url:"https://minotar.net/armor/bust/468ee80f21434afebaf6c1583c519494/300.png" }
];
export default {
  props: ["user"],
  data: () => ({
    badges: []
  }),
  mounted () {this.mount()},
  methods: {
    mount () {
      let badgenum = Number(this.user.badges) || 0;
      if (isNaN(badgenum)) return;
      for (let i = 0; i < numbers.length; i++) {
        if (badgenum - numbers[i].points < 0) continue;
        badgenum -= numbers[i].points;
        this.badges.push(numbers[i]);
      }
    }
  }
}
</script>

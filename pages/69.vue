<template>
  <section class="sn">
    1. {{text}}
    <br>
    <br>
    2. {{text1}}
    <br>
    <br>
    3. {{text2}}
    <br>
    <br>
    4. {{text3}}
    <br>
    <br>
    5. {{text4}}
  </section>
</template>
<script>
export default {
  auth: "guest",
  layout: "light",
  data: () => ({
    step: 0,
    step1: 0,
    step2: 0,
    step3: 0,
    step4: 0,
    text: "",
    text1: "",
    text2: "",
    text3: "",
    text4: "",
    vars: [
      "-diamond-",
      "--diamond",
      "d--diamon",
      "nd--diamo",
      "ond--diam",
      "mond--dia",
      "amond--di",
      "iamond--d",
      "diamond--"
    ],
    vars1: ["pood", "booq", "doop", "obqo", "odpo", "oqbo", "opdo", "qoob"],
    vars2: ["pd", "bq", "dp", "qb"],
    vars3: ["-----", "--=--", "-=#=-", "=#=#=", "#=-=#", "=---="],
    vars4: ["#-#", "=-=", "---","-=-","-#-","-=-","---","=-="],
    fly: ["|", "/", "-", "\\"]
  }),
  mounted() {
    setInterval(this.nextNum, 100);
  },
  methods: {
    nextNum() {
      this.step++;
      if (this.step === this.vars.length) {
        this.step = 0;
      }
      this.text = `${this.vars[this.step]}`;

      this.step1++;
      if (this.step1 === this.vars1.length) {
        this.step1 = 0;
      }
      this.text1 = `${this.vars1[this.step1]}`;

      this.step2++;
      if (this.step2 === this.vars2.length) {
        this.step2 = 0;
      }
      this.text2 = `${this.vars2[this.step2]}`;

      this.step3++;
      if (this.step3 === this.vars3.length) {
        this.step3 = 0;
      }
      this.text3 = `${this.vars3[this.step3]}`;

      this.step4++;
      if (this.step4 === this.vars4.length) {
        this.step4 = 0;
      }
      this.text4 = `${this.vars4[this.step4]}`;
    }
  }
};
</script>
<style>
.sn {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  font-family: monospace;
}
</style>


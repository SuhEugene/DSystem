<template>
  <div class="container console">
    <span v-html="strings.slice(0, insert).join('<br>')"></span>
  <span v-if="this.insert >= strings.length">
      <br>
      <span>
        <NLink class="blue" to="/">Go to homepage</NLink> or
        <a class="blue" href="javascript:void(0)" onclick="window.location.reload()">Refresh page</a>
      </span>
      <br>
      <br>
      <br>
      <span class="grey">{{(this.$auth.user && this.$auth.user.username) ? this.$auth.user.username.toLowerCase() : 'guest'}}@dromon:~$</span>
      <b>{{(cursor) ? "_" : ""}}</b>
    </span>
  </div>
</template>
<script>
export default {
  props: ['error'],
  data: () => ({
    strings: [
      "<span class='grey'>{2}@dromon:~$</span> yarn start",
      "",
      "<span><b>yarn run v1.22.15</b></span>",
      "<span class='grey'>$ nuxt start</span>",
      "",
      "Initializing app...",
      "Waiting for server...",
      "<span class='green'>> Server responded 200</span>",
      "",
      "Creating DOM...",
      "<span class='green'>> DOM successfully created</span>",
      "",
      "Pentagon hacking started",
      "0%&nbsp;&nbsp;&nbsp;[--------------------]",
      "12%&nbsp;&nbsp;[##------------------]",
      "18%&nbsp;&nbsp;[###-----------------]",
      "27%&nbsp;&nbsp;[#####---------------]",
      "35%&nbsp;&nbsp;[#########-----------]",
      "36%&nbsp;&nbsp;[#########-----------]",
      "40%&nbsp;&nbsp;[##########----------]",
      "59%&nbsp;&nbsp;[############--------]",
      "74%&nbsp;&nbsp;[##############------]",
      "83%&nbsp;&nbsp;[################----]",
      "93%&nbsp;&nbsp;[##################--]",
      "100%&nbsp;[####################]",
      "<span class='green'>> Pentagon successfully hacked</span>",
      "",
      "_-$@(=(#(/-@_!$))+@$%(_)#&-^/*!/^$/&@(-+*=%$)@@@^))^+-/%_//^=#%=#%_%%+-(!))!_/$$$#(=_+!-()((+=_$#%%-)+@!&$#+#@-^#(-^#^$=(+/#=(%_%/&!-#)!+=@^=!&)#*%#_=%_&-!+)#(!=_=@&&%!&$(/*#(+)/=#-#=$#@((+%%!__!$$@/$@=)++%)$)^)#%^#&)_$^%_%$$@($)__@(&-($+_$=-&=)$(-!!&@*$!/++@@=)$^$!)!*$(%/&-*_)!+@(==_#@&+^(&-/*-^= <span class='red'>3RR0R {0}</span> @%&%/_!%/(%^=#(++&$=#^&_/!*&%%@/=/#%^@=/#(@/&@)&#*)+++$_-*-!=$!+@&@-!+_($#_=!)!$!$)=$#$**$__=*_%()%*@+^(($/$*#-$!-)*^%$)(+(@#@-/=(^@++$#_/*@(*(##(!#//%=(++%@#$$$*/)#@)%#$^=*/(#))_-+(-_#_@-#%$_!)_(#(+@$&/$(_(@$_%/*$!^(!#$!#=(_*+#=/@-)(!#=^&/!/=)*!(%&*_=#+*(== <span class='red'>3RR0R {0}</span> !^()!/@+-(*!#))%!)&^#((#&//_*&+(#)%!)@&#!+%=*(^*)((&+$(!+=+&%**#=###/@/#_=!^_#!^)$=+^^@()_&)*/%!@/@-@=#@(_-+)%_=+!*)#/*^%$/%=^=*@-!--_-@^^-$--$&!^-(=)(-++!*%$//%$#=!!_$!!*@$=%$/&*^@+@)/%)%#))/#_%(%$^$%#+*#&^&*&^@$#@*_@#))=/@)%&+!$/@(#^(--^&!/*!#-^+)+@+=&!%@^/!@&*&%#*%^^-*+)!=**==/)@_=%/%/=&+@/^_&&$^!-^$^-!(/(#!#(_@ <span class='red'>3RR0R {0}</span> =%=/^^_@)_%^_@_$^^^^-/_(=*+@&(#$=@+#@^#)!*^+&#$@$$+)#-^(-=+#$%^+)+$+))*//-^(*#))(/=!_!-%(_(+-_/-#=!^(=@!-)-",
      "",
      'Message: {1}',
      "",
      "<span class='grey'>{2}@dromon:~$</span> ./gotohomepage.sh",
      ""
    ],
    insert: 0,
    cursor: false
  }),
  methods: {
    nex() {
      this.insert++;
      setTimeout(this.nex, parseInt(Math.random() * 300, 10));
    }
  },
  mounted() {
    this.nex();
    setInterval(() => {
      this.cursor = !this.cursor;
    }, 700);
    this.strings[27] = this.strings[27].replace("{0}", this.error.statusCode)
                                       .replace("{0}", this.error.statusCode)
                                       .replace("{0}", this.error.statusCode);
    this.strings[29] = this.strings[29].replace("{1}", this.error.message);
    this.strings[0] = this.strings[0].replace("{2}", (this.$auth.user && this.$auth.user.username) ? this.$auth.user.username.toLowerCase() : 'guest');
    this.strings[31] = this.strings[31].replace("{2}", (this.$auth.user && this.$auth.user.username) ? this.$auth.user.username.toLowerCase() : 'guest');
  }
};
</script>
<style lang="scss">
.console {
  $bgColor: #080808;
  background: $bgColor;
  padding: 10px;
  height: 100%;
  font-family: monospace;
  color: silver;
  word-break: break-all;
  $colors: (
    red: #e30000,
    green: #00ff00,
    blue: #1e90ff,
    grey: #808080
  );
  span, b { &::selection {
    color: $bgColor!important;
    background: silver!important;
  }}
  @each $name, $val in $colors {
    .#{$name} {
      color: $val;
      &::selection {
        background: $val!important;
        color: $bgColor!important;
      }
    }
  }
  a {
    text-decoration: underline;
    &:hover {
      opacity: 0.8;
    }
  }
}
</style>

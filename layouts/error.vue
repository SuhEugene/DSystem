<template>
  <div class="container console">
    <span v-html="strings.slice(0, insert).join('<br>')"></span>
    <span v-if="this.insert >= strings.length">
      <NLink to="/">Go to homepage</NLink> or
      <a href="javascript:void(0)" onclick="window.location.reload()">Refresh page</a>
      <br>
      <br>
      <span class="grey">guest@dromon:~$</span>
      <b>{{(cursor) ? "_" : ""}}</b>
    </span>
  </div>
</template>
<script>
export default {
  props: ['error'],
  data: () => ({
    strings: [
      "<span class='grey'>guest@dromon:~$</span> npm run app",
      "",
      "> dromon@2.0 app /home",
      "> nuxt start",
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
      "<span class='grey'>guest@dromon:~$</span> bash gotohomepage.sh",
      ""
    ],
    insert: 0,
    cursor: false
  }),
  methods: {
    nex() {
      this.insert++;
      setTimeout(this.nex, parseInt(Math.random() * 700, 10));
    }
  },
  mounted() {
    this.nex();
    setInterval(() => {
      this.cursor = !this.cursor;
    }, 1000);
    this.strings[27] = this.strings[27].replace("{0}", this.error.statusCode)
                                       .replace("{0}", this.error.statusCode)
                                       .replace("{0}", this.error.statusCode);
  }
};
</script>
<style lang="scss">
.console {
  background: #080808 !important;
  padding: 10px;
  height: 100%;
  font-family: monospace;
  color: silver!important;
  word-break: break-all;
  .red {
    color: red;
  }
  .green {
    color: #00aa00;
  }
  .blue {
    color: blue;
  }
  .grey {
    color: grey;
  }
  a {
    text-decoration: underline;
    color: aqua;
    &:hover {
      opacity: 0.8;
    }
  }
}
</style>

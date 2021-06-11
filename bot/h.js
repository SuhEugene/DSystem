const express = require("express");
const Discord = require("discord.js");
const app = express();
const client = new Discord.Client();
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

client.on("ready", ()=> console.log("Bot ready"));

const styles = `
<style>
code { background: rgba(0,0,0,.1); padding: 2px 3px; border-radius: 3px; }
pre {background: rgba(0,0,0,.1); padding: 5px 7px; border-radius: 3px; width: min-content }
</style>
`;

app.use(bodyParser.json());
app.get("/success", async (req, res) => {
  if (!req.query.code) return res.send("Мда");
    try {
      const r = await fetch("https://oauth.drom.one/token", {
        method: "POST",
        body: JSON.stringify({
          client_id: "5fd13b3c45a6ee51f1a6f4d3",
          client_secret: "2967104",
          redirect_uri: "http://hh.di-api.net.ru/success",
          scope: req.query.scope.split(/ +/),
          code: req.query.code
        }),
        headers: { "Content-Type": "application/json" }
      });
      const data = await r.json();
      console.log("дата", data);
      console.log("асыс", data.access_token);
      if (!data.access_token) return res.send("Ашипка получения асыс, видимо код оноразовый")
      const r2 = await fetch("https://oauth.drom.one/api/user", {
        headers: { Authorization: `Bearer ${data.access_token}`}
      });
      let user = await r2.json();
      console.log("юсир", user);
      if (user.error) return res.send(user.error);
      let allScopes = req.query.scope.split(/ +/);
      let text = [];
      if (allScopes.includes("data"))
        text.push(`Ты - <code>${user.username}</code> с discord id <code>${user.id}</code> и uuid <code>${user.uuid}</code><br><br>Твой id внутри системы: <code>${user._id}</code>`);

      if (allScopes.includes("cards")) {
        for (let card of user.cards) {
          text.push(`Карта <code>${card.id}</code>: <code>${card.text}</code>/<code>${card.balance} АР</code>`);
        }
      }
        

      const roles = ["никем", "обычным юзером", "банкиром", "модером", "админом"];
      if (allScopes.includes("status")) text.push(`Статус у тебя: <code>"${user.status}"</code>. Мда...`);
      if (allScopes.includes("role")) text.push(`Вы в банке являетесь <code>${roles[user.role]}</code>`);
      // res.append("Content-Type", "text/plain");
      res.send(`М... Ты залогинился... Ну тада рассказываю...<br><br>`+
               text.join("<br><br>")+
               "<br><br><br><br>Данные с сервера:<br><pre>"+
               JSON.stringify(user, null, 4)+
               "</pre>"+styles);
    } catch (e) {
      console.error("пездец", e);
      return res.send("Шота пошло по пезде");
    }
})
app.get('/buy', (req, res) => {
  res.send(`
    <body style='height:100vh; width:100%; display:flex; flex-direction:column; align-items:center; justify-content:center;'>
      <h1>PLEASE</h1>
      <p>BUY THIS SHIT!!! <a href='https://drom.one/app/suheugene/8?text=Шалкер&uid=123'>CLICK</a></p>
    </body>
  `);
});
app.post("/handdle", async (req, res) => {
  console.log(req.body);
  res.send();
  try {
    let usr = await client.users.fetch(req.body.user.id);
    let hashesEq = '3f3d7f210a99c03b187c520552030420' === req.headers.authorization.replace('Bearer ','');
    await usr.send(`*Представь что ты не видел этого сообщения*`+`Ты, __${req.body.user.username}__, купил __${req.body.text}__ с __uid ${req.body.uid}__.`+
                   `Время: __${req.body.time}__\nТы потратил __${req.body.sum} АР__\n`+
                   `\`\`\`json\n${JSON.stringify(req.body, null, 2)}\n\`\`\`\n`+
                   `Хэш __${req.headers.authorization.replace('Bearer ','')}__`+
                   `${hashesEq ? '' : ' не'}`+
                   ` равен 3f3d7f210a99c03b187c520552030420 (хэши ${hashesEq ? '' : 'не '}совпадают и операция прошла ${hashesEq ? '' : 'не '}безопасно)`);
    let d = new Date(req.body.time+(60000*60*5));
    let em = new Discord.MessageEmbed().setTitle(`Заказ #${req.body.uid}`)
                        .setDescription(`Здравствуйте, ${req.body.user.username},`+
                                        ` вы заказали у нас **${req.body.text}** #${req.body.uid}\n`+
                                        `Ваш заказ находится в ячейке ХХХ в ТФ, вы можете забрать`+
                                        ` его до ${d.getHours()}:${d.getMinutes()}`).setColor("#346db3");
    await usr.send(em);
  } catch (e) {console.log(e); console.log("FAIL :(");}
});

app.listen(8099, () => {console.log("Listening *:8089")});
client.login("NjY4MTQxNDk0Njg2ODQyOTEw.XiM9QQ.V9mgT6O4tmUQbQTxL2BxTAjco-Y");

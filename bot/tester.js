const Discord = require("discord.js");
const client = new Discord.Client();
const app = require("express")();
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
require("dotenv").config()

client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

// client.on("message", async message => {
//   console.log(message.content);
//   if (message.author.bot || message.content != "test1") return;
//   try {
//     let r = await fetch("http://localhost:8060/user", {
//       headers: { "content-type": "application/json" },
//       body: JSON.stringify({ id: message.author.id }),
//       method: "post"
//     });
//     if (r.status == 500) return message.reply("error");
//     message.reply(parseInt(await r.text(), 10) ? 'Вы игрок' : 'Вы не игрок');
//   } catch (e) { message.reply("error"); }
// })

const mainRole = process.env.MAIN_ROLE;
const mainGuild = process.env.MAIN_GUILD;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.append("Access-Control-Allow-Origin", "*");
  res.append("Access-Control-Allow-Headers", "*");
  res.append("Access-Control-Allow-Methods", "*");
  if (req.method == "OPTIONS") return res.status(200).send();
  next();
});

app.post("/user", async (req, res) => {
  console.log("req", req.body.id)
  if (!req.body.id) return res.status(400).send("FCK");
  try {
    let mbr = await (await client.guilds.fetch(mainGuild)).members.fetch(req.body.id);
    console.log(String(mbr.roles.cache.has(mainRole) ? 1 : 0));
    // return res.send(String(mbr.roles.cache.has(mainRole) ? 1 : 0));
    return res.send("1");
  } catch (e) { return res.status(500).send(e); }
});

client.login(process.env.TOKEN);
app.listen(8060, () => { console.log("Started on *:8060") });
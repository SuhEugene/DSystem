const Discord = require("discord.js");
const client = new Discord.Client();
const app = require("express")();
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
require("dotenv").config();


const mainRole = process.env.MAIN_ROLE;
const mainGuild = process.env.MAIN_GUILD;


client.on("ready", async () => {
	console.log(`Logged in as ${client.user.tag}!`);
	const gld = await client.guilds.fetch(mainGuild);
	// gld.members.fetch("404236405116764162").then(console.log).catch(console.log)
	// gld.members.fetch().then((...a) => {console.log("done", a)}).catch((...a) => {console.log("done error", a)});
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
		const gld = await client.guilds.fetch(mainGuild);
		const mbr = await gld.members.fetch(req.body.id, { cache: false });
		if (!mbr) return res.send({ gamer: false });
    return res.send({ gamer: mbr.roles.cache.has(mainRole) });
  } catch (e) { return res.status(500).send({ gamer: false, error: true }); }
});

client.login(process.env.TOKEN);
app.listen(8060, () => { console.log("Started on *:8060") });

const Discord = require("discord.js");
const client = new Discord.Client();
const app = require("express")();
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const Joi = require("joi");
require("dotenv").config();

const DataStorage = require("./DataStorage.js");

const guilds = new DataStorage("./donServers.json");

client.on("ready", async () => {
	console.log(`Logged in as ${client.user.tag}!`);
	// const gld = await client.guilds.fetch(mainGuild);
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.append("Access-Control-Allow-Origin", "*");
  res.append("Access-Control-Allow-Headers", "*");
  res.append("Access-Control-Allow-Methods", "*");
  if (req.method == "OPTIONS") return res.status(200).send();
  next();
});



let gdata = {
  "guild_id": [
    {"op": ">/</=", "sum": "123", "role": "1234567890"}
  ]
}

app.post("/handler", async (req, res) => {
  console.log("req", req.body);
  const sum = req.body.sum;
  const guild_id = req.query.id || req.body.uid;

  // Guild
  let guild;
  try {
    guild = await client.guilds.fetch(guild_id);
    console.log("Got guild", guild ? guild.id : guild);
  } catch (e) {console.error(e); return res.sendStatus(500); }
  if (!guild) return res.sendStatus(500);

  // Member
  let member;
  try {
    member = await guild.members.fetch(req.body.user.id);
    console.log("Got member", member ? member.id : member);
  } catch (e) { console.error(e); return res.sendStatus(500); }
  if (!member) return res.sendStatus(500);

  let conds = guilds.data[guild.id];
  console.log("conds", conds, guilds.data);
  if (!conds) return res.sendStatus(400);

  for (let cond of conds) {
    const ops = {
      gt: cond.op == ">" && sum > cond.sum,
      lt: cond.op == "<" && sum < cond.sum,
      eq: cond.op == "=" && sum == cond.sum
    }
    if (!ops.gt && !ops.lt && !ops.eq) continue;

    try {
      await member.roles.add(cond.role)
      await member.send(
        `__**Поздравляю!**__ Совершив донат в пользу сервера **${guild.name}** вы`+
        ` получили очень крутую новую роль - \`@${cond.role_name}\`.\nЗаходите на сервер и`+
        ` воспользуйтесь всеми её плюшками по-полной!`
      );
    } catch (e) {}

  }
});



const newValidator = Joi.object({
  op: Joi.string().valid("=", ">", "<").required(),
  sum: Joi.number().integer().min(1).required(),
  role: Joi.string().pattern(/<@&?[0-9]*?>/).required()
})

const words = {
  ">": "больше чем",
  "<": "меньше чем",
  "=": "равно"
}

client.on("message", async (message) => {
  if (message.author.bot || message.channel.type == "dm") return;
  let args = message.content.split(/ +/);
  let command = args.shift().toLowerCase();
  if (!command.startsWith("drole/")) return;
  command = command.slice(6);

  if (!message.member) {
    message.member = await message.guild.members.fetch(message.author);
  }

  if (!message.member.permissions.has(8)) return message.react("�");

  if (command == "new") {
    if (!args || args.length < 3) return await message.channel.send(
      "`drole/new [>, < или =] [Сумма] [@Роль]` - создание нового условия"+
      " выдачи роли\nПример: `drole/new > 32 @Донатер` - выдаёт роль @Донатер,"+
      " если было отправлено больше 32 АР"
    );
    const { value: { op, sum, role }, error } = await newValidator.validate({
      op: args[0],
      sum: args[1],
      role: args[2]
    });

    if (error) return await message.channel.send("Ошибка создания условия\n```json\n"+JSON.stringify(error, null, 2)+"\n```");

    let gldata = guilds.data[message.guild.id];
    if (!gldata) gldata = [];
    if (gldata.length >= 5) return message.channel.send(
      "Максимум пять условий\nНапишите `drole/conds`, чтобы просмотреть их или "+
      "`drole/del [Номер]`, чтобы удалить одно из них"
    );
    gldata.push({ op, sum, role: role.replace(/[<@&]+/, "").replace(">", ""), role_name: message.mentions.roles.first().name });
    await guilds.set(message.guild.id, gldata);

    return message.channel.send(
      "**__Новое условие:__**\n"+
      `Если количество задоначенных АР ${words[op]} ${sum} - выдать роль ${role}`
    );
  }

  if (command == 'conds') {
    let gldata = guilds.data[message.guild.id];
    let text = [];
    for (let cond of gldata) {
      text.push(`- Если количество задоначенных АР ${words[cond.op]} ${cond.sum} - выдать роль <@&${cond.role}>`);
    }
    await message.channel.send("__**Условия:**__\n"+(text.join("\n") || "\*отсутствие условий\*"));
  }
  if (command == "del") {
    if (!args[0] || !parseInt(args[0], 10)) return;
    let gldata = guilds.data[message.guild.id];
    let newdata = [];
    let cond;
    for (let i = 0; i < gldata.length; i++) {
      if (i == parseInt(args[0]) - 1) { cond = gldata[i]; continue;}
      newdata.push(gldata[i]);
    }
    guilds.set(message.guild.id, newdata);
    await message.channel.send("Условие "+(cond ? `\`Если количество задоначенных АР ${words[cond.op]} ${cond.sum} - выдать роль ${cond.role}\`` : 'отсутствует и поэтому не')+" удалено");
  }
  if (command == "url") {
    message.channel.send(`Ссылка для вставления в **Url события**: \`\`\`https://donrole.di-api.net.ru/handler?id=${message.guild.id}\`\`\``)
  }
  // TODO: ======= ДОДЕЛЫВАЕМ
  if (command == "guide") {
    message.channel.send(
      "**__Краткий гайд по созданию донатов__**\n"+
      "**Условия**\nЧтобы создать донаты - нужно создать условия\n"+
      "Делаем это через команду `drole/new`\n"+
      "Я, например, хочу чтобы за 32 АР и больше выдавалась роль @Донатер"
    )
  }
})







client.login(process.env.TOKEN_DONROLE);
app.listen(8061, () => { console.log("Started on *:8061") });

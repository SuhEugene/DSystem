/* global require process module */
const express = require("express");
const app = express();
const router = express.Router();
const mongoose = require("mongoose");
const Joi = require('joi');
const bodyParser = require("body-parser");

const fetch = require('node-fetch');
const jwt = require("jsonwebtoken");
const User = require("./models/user");
const App = require("./models/app");
const atob = require('atob');
require("dotenv").config();

let cooldown = {};

// DA BIG TODO VERY BIG TODO
// ~~**POST `open.di-api.net.ru/app/send`**~~
// Перевод **приложение** -> **юзер**
// Комиссия не взымается
// Принимает `{ sum, id/uuid, comment }`
// Возвращает 200/400/403
//
// ~~**GET `open.di-api.net.ru/app/logs/from`**~~
// Выдаёт последние num или 5 переводов **приложение** -> **юзер**
// Принимает `{ num }` ( 1 <= num <= 30)
// Возвращает 200`{ logs: [{ appFrom, userTo, sum, comment, time }] }` / 400 / 403
//
// ~~**GET `open.di-api.net.ru/app/logs/to`**~~
// Выдаёт последние num или 5 переводов **юзер** -> **приложение**
// Принимает `{ num }` ( 1 <= num <= 30)
// Возвращает 200`{ logs: [{ appTo, userFrom, sum, comment, time }] }` / 400 / 403
//
// **GET `open.di-api.net.ru/isSPkUser/<:id>`**
// Получение bool играет ли user с данным discord id на СПк
// Принимает `{}`
// Возвращает 200`{ gamer: true/false }` / 400`{ gamer: "error" }`


mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_URL}/${process.env.DB_NAME}?retryWrites=true&w=majority`, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});


const userData = {
  free: ["_id", "id", "uuid", "username", "sex"],
  scope: ["status", "balance", "role"]
}

// router
const base64Check = Joi.string().base64({ paddingRequired: false });
const numberCheck = Joi.number().unsafe().integer().min(1);
// TODO all APIs
// TODO logs

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.append("Access-Control-Allow-Origin", "*");
  res.append("Access-Control-Allow-Headers", "*");
  res.append("Access-Control-Allow-Methods", "*");
  if (req.method == "OPTIONS") return res.status(200).send();
  next();
})
  .use(async (req, res, next) => {
    let headerToken = req.headers["authorization"];
    if (!headerToken) return res.status(403).send("--- Пшёл вон ---");
    headerToken = headerToken.replace("Bearer ", "");

    let { error } = await base64Check.validate(headerToken);
    if (error) return res.status(400).send({ error: "Invalid token", e: "IT" });

    let _id, secret;
    try {
      const token = atob(headerToken);
      [ _id, secret ] = token.split(":");
    } catch (_e) {
      return res.status(400).send({ error: "Invalid token", e: "IT" });
    }

    App.findOne({ _id, secret }, (err, app) => {
      if (err) return res.status(500).send();
      req.app = app;
      return next();
    });
  })
  .get("/", (req, res) => {res.send()})
  .get("/isSPkUser/:id", async (req, res) => {
    let { error, value: id } = await numberCheck.validate(req.params.id);
    if (error) return res.status(400).send({ error: "Invalid discord id", e: "IDisId", joie: error.details[0].message });
    return res.send({ id, gamer: await isOurUser(req.params.id) });
  });


async function isOurUser(id) {
  try{
    let r = await fetch("http://localhost:8060/user", {
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: String(id) }),
      method: "post"
    });
    return (await r.json()).gamer;
  } catch (e) {
    return "error";
  }
}
  // .use((req, res, next) => {
  //   if (cooldown[req.user.id] &&
  //       cooldown[req.user.id][req.path] &&
  //       cooldown[req.user.id][req.path][req.method] &&
  //       Date.now() - cooldown[req.user.id][req.path][req.method] < 2000)
  //     return res.status(400).send({ error: "Cooldown" });
  //   if (!cooldown[req.user.id]) cooldown[req.user.id] = {};
  //   if (!cooldown[req.user.id][req.path]) cooldown[req.user.id][req.path] = {};
  //   cooldown[req.user.id][req.path][req.method] = Date.now();
  // })
  // .get("/user", async (req, res) => {
  //   if (!req.data.scope.includes("data"))
  //     return res.status(403).send({ error: "Forbidden", message: "'data' scope required" });
  //
  //   const user = await User.findOne({ _id: req.data.user_id });
  //
  //   let respData = {};
  //   for (let field of userData.free) respData[field] = user[field];
  //
  //   for (let field of userData.scope) {
  //     if (!req.data.scope.includes(field)) continue;
  //     respData[field] = user[field];
  //   }
  //
  //   res.send(respData);
  // })
  // .post("/user/status", async (req, res) => {
  //   if (!req.data.scope.includes("set-status"))
  //     return res.status(403).send({ error: "Forbidden", message: "'set-status' scope required" });
  //
  //   let user = await User.findOne({ _id: req.data.user_id });
  //   user.status = req.body.status.toString().substr(0, 32) || null;
  //   await user.save();
  //
  //   res.send({ status: user.status });
  // })
app.listen(8083, () => console.log("> Open API service started on *:8083"))

module.exports = router;

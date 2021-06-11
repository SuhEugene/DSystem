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
const Logs = require("./models/logs");
const atob = require('atob');
require("dotenv").config();

let cooldown = {};

// DA BIG TODO VERY BIG TODO




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

const appSend = Joi.object({
  sum: Joi.number().integer().max(17280).min(1).required(),
  id: Joi.string().max(30),
  uuid: Joi.string().max(30),
  comment: Joi.string().required()
});

const numCheck = Joi.number().integer().min(1).max(30);

// TODO all APIs
// TODO logs

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.append("Access-Control-Allow-Origin", "*");
  res.append("Access-Control-Allow-Headers", "*");
  res.append("Access-Control-Allow-Methods", "*");
  if (req.method === "OPTIONS") return res.status(200).send();
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

    if (!_id || !secret) return res.status(400).send({ error: "Invalid token", e: "IT" });

    App.findOne({ _id, secret }, (err, app) => {
      if (err) return res.status(500).send("Oh... bye...");
      req.app = app;
      return next();
    });
  })
  .get("/", (req, res) => {res.send()})
  // **GET `open.di-api.net.ru/isSPkUser/<:id>`**
  // Получение bool играет ли user с данным discord id на СПк
  // Принимает `{}`
  // Возвращает 200`{ gamer: true/false }` / 400`{ gamer: "error" }`
  .get("/isSPkUser/:id", async (req, res) => {
    let { error, value: id } = await numberCheck.validate(req.params.id);
    if (error) return res.status(400).send({ error: "Invalid discord id", e: "IDisId", joie: error.details[0].message });
    return res.send({ id, gamer: await isOurUser(req.params.id) });
  })
  // **POST `open.di-api.net.ru/app/send`**
  // Перевод **приложение** -> **юзер**
  // Комиссия не взымается
  // Принимает `{ sum, id/uuid, comment }`
  // Возвращает 200/400/404/403
  .post("/app/send", async (req, res) => {
    let { error } = appSend.validate(req.body);
    if (error) return res.status(400).send({ error: "Invalid body", e: "IB", joie: error.details[0].message });
    let user;
    try {
      if (!req.body.uuid && req.body.id) user = await User.findOne({id: req.body.id});
    } catch (e) {
      return res.status(500).send({ error: "idk wtf is that error (/app/send/by_id)"});
    }
    try {
      if (req.body.uuid) user = await User.find({ uuid: req.body.uuid } );
    } catch (e) {
      return res.status(500).send({ error: "idk wtf is that error (/app/send/by_uuid)"});
    }
    if (!user) return res.status(404).send({ error: "User not found", e: "UNF" });

    let toCard = (await user.cards)[0];
    let sum = parseInt(req.body.sum, 10);

    let session = await mongoose.startSession();
    session.startTransaction();

    toCard.balance += sum;
    req.app.balance -= sum;

    let logs = new Logs();
    logs.fromApp = req.app._id;
    logs.toUser = user._id;
    logs.comment = req.body.comment;
    logs.sum = sum;
    logs.action = "app-from";

    await logs.save();
    await toCard.save();
    await req.app.save();

    await session.commitTransaction();
    session.endSession();
  })
  // **GET `open.di-api.net.ru/app/logs/from`**
  // Выдаёт последние num или 5 переводов **приложение** -> **юзер**
  // Принимает `{ count }` ( 1 <= num <= 30)
  // Возвращает 200`{ logs: [{ appFrom, userTo, sum, comment, time }] }` / 400 / 403
  .post("/app/logs/from", async (req, res) => {
    let { error } = numCheck.validate(req.body.count);
    if (req.body.count !== undefined && error)
      return res.status(400).send({joie: error.details[0].message, error:"Invalid count", e: "ICnt"});
    let logs
    try {
      logs = await Logs.find({fromApp: req.app._id}, [], {
        limit: parseInt(req.body.count, 10) || 5,
        sort: {timestamp: -1}
      });
    } catch (e) {
      return res.status(500).send({ error: "id wtf is that error (/app/logs/from)" })
    }
    return logs;
  })
  // **GET `open.di-api.net.ru/app/logs/to`**
  // Выдаёт последние num или 5 переводов **юзер** -> **приложение**
  // Принимает `{ count }` ( 1 <= num <= 30)
  // Возвращает 200`{ logs: [{ appTo, userFrom, sum, comment, time }] }` / 400 / 403
  .post("/app/logs/to", async (req, res) => {
    let { error } = numCheck.validate(req.body.count);
    if (req.body.count !== undefined && error)
      return res.status(400).send({joie: error.details[0].message, error:"Invalid count", e: "ICnt"});
    let logs;
    try {
      logs = await Logs.find({ toApp: req.app._id }, [], {
        limit: parseInt(req.body.count,10) || 5,
        sort: { timestamp: -1 }
      })
    } catch (e) {
      return res.status(500).send({ error: "id wtf is that error (/app/logs/from)" })
    }
    return logs;
  })

async function isOurUser(id) {
  try {
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

app.listen(8083, () => console.log("> Open API service started on *:8083"))

module.exports = router;

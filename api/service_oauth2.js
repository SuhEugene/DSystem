/* global require process module */
const express = require("express");
const app = express();
const router = express.Router();
const mongoose = require("mongoose");
const Joi = require('joi');

const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
// const User = require("./models/user");
const App = require("./models/app");
const User = require("./models/user");
require("dotenv").config();

// let cooldown = {};
const scopeUserData = {
  "data": ["uuid", "id", "_id", "username"],
  "status": ["status"],
  "role": ["role"],
  "balance": ["balance"]
}

mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_URL}/${process.env.DB_NAME}?retryWrites=true&w=majority`, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

// TODO OAUTH BIG TODO
// **GET `oauth.di-api.net.ru/user`**
// Получение игрока
// Принимает `{}`
// Возвращает `{ uuid, username, id, _id }`
// Дополнительные поля по scope: `status`, `balance`, `role` (имя scope соответствует имени поля)
//
// **POST `oauth.di-api.net.ru/user/status`** __scope `set-status`__
// Установка статуса игроку
// Принимает `{ status }`
// Возвращает 200/400/403
//
// По факту Oauth нужен только для входа а в остальном бесполезен, ибо в сервисе и фич маловато, которые можно было бы разрешить менять


// TODO logs

// noinspection DuplicatedCode
const getCode = Joi.object({
  client_id: Joi.string().hex().length(24).required(),
  response_type: Joi.string().allow('token', 'code').required(),
  redirect_uri: Joi.string().max(64).required(),
  scope: Joi.array().items(Joi.string().max(20)).required(),
});

const tokenExchange = Joi.object({
  client_id: Joi.string().hex().length(24).required(),
  client_secret: Joi.string().min(6).required(),
  redirect_uri: Joi.string().max(64).required(),
  scope: Joi.array().items(Joi.string().max(20)).required(),
  code: Joi.string().min(12).required()
});

const refreshExchange = Joi.object({
  client_id: Joi.string().hex().length(24).required(),
  client_secret: Joi.string().min(6).required(),
  redirect_uri: Joi.string().max(64).required(),
  scope: Joi.array().items(Joi.string().max(20)).required(),
  refresh_token: Joi.string().min(12).required()
});

const validator = { tokenExchange, getCode, refreshExchange };


let codes = [];
const generateCode = () => String(Math.round(Math.random()*(10**10))) + String(Math.round(Math.random()*(10**10))) + String(Math.round(Math.random()*(10**10)));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app
  /*.use((req, res, next) => {
    res.append("Access-Control-Allow-Origin", process.env.SELF_URL);
    res.append("Access-Control-Allow-Headers", "*");
    res.append("Access-Control-Allow-Methods", "*");
    if (req.method === "OPTIONS") return res.status(200).send();
    next();
  })*/
  .post("/code", async (req, res) => {
    let token = req.headers["authorization"];
    if (!token) return res.status(403).send({ error: "Invalid token" });
    token = token.replace("Bearer ", "");

    console.log("I RECEIVED", req.body);
    const { error } = validator.getCode.validate(req.body);
    if (error) return res.status(400).send(error);

    let code = generateCode();
    while (codes.find(c => c.code === code)) code = generateCode();

    try {
      const app = await App.findOne({ _id: req.body.client_id });
      console.log("REDIRECTS", app.redirectURI, "==", req.body.redirect_uri);
      if (!app || app.redirectURI !== req.body.redirect_uri) return res.status(400).send({ error: "Invalid redirect uri", e:"IRU" });
    } catch (e) {
      return res.status(400).send({ error: "Invalid client_id" })
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(401).json({ error: "Invalid token", e:"IT" });
      codes = codes.filter(c => c.user_id !== user._id)
      codes.push({
        user_id: user._id, code,
        client_id: req.body.client_id,
        response_type: req.body.response_type,
        redirect_uri: req.body.redirect_uri,
        scope: req.body.scope
      });
      res.send({ code });
    });
  })
  .post("/token", async (req, res) => {
    const { error } = validator.tokenExchange.validate(req.body);
    if (error) return res.status(400).send(error);

    if (!codes.find(c => c.code === req.body.code)) return res.status(400).send({ error: "Invalid code", e: "IC" });

    const dbApp = await App.findOne({ _id: req.body.client_id });
    console.log("APP", dbApp, req.body.client_id, dbApp.secret, req.body.client_secret);
    if (!dbApp || String(dbApp.secret) !== req.body.client_secret || dbApp.redirectURI !== req.body.redirect_uri)
      return res.status(400).send({ error: "Invalid app", e: "IA" });

    const { user_id, scope } = codes.find(c => c.code === req.body.code);
    codes = codes.filter(c => c.code !== req.body.code);

    const access_token = jwt.sign({ user_id, app_id: dbApp._id, scope }, process.env.ACCESS_SECRET, { expiresIn: 604800 }); // 1 Week
    const refresh_token = jwt.sign({ user_id, app_id: dbApp._id, scope }, process.env.REFRESH_SECRET, { expiresIn: 1814400 }); // 3 Weeks
    res.send({
      access_token,
      refresh_token,
      type: "Bearer",
      expires_in: 604800
    });
  })
  .post("/refresh", async (req, res) => {
    const test = validator.refreshExchange.validate(req.body);
    if (!test) return res.status(400).send(test);

    const dbApp = await App.findOne({ _id: req.body.client_id });
    if (!dbApp || dbApp.secret !== req.body.client_secret || dbApp.redirectURI !== req.body.redirect_uri)
      return res.status(400).send({ error: "Invalid app", e: "IA" });

    jwt.verify(req.body.resfresh_token, process.env.REFRESH_SECRET, (err, data) => {
      if (err) return res.status(401).json({ error: "Invalid token", e: "IT" });

      const access_token = jwt.sign(
        { user_id: data.user_id, scope: data.scope, app_id: data.app_id },
        process.env.ACCESS_SECRET,
        { expiresIn: 604800 } // 1 Week
      );
      const refresh_token = jwt.sign(
        { user_id: data.user_id, scope: data.scope, app_id: data.app_id },
        process.env.REFRESH_SECRET,
        { expiresIn: 1814400 } // 3 Weeks
      );

      res.send({
        access_token,
        refresh_token,
        type: "Bearer",
        expires_in: 604800
      });
    });
  })
  .use(async (req, res, next) => {
    let token = req.headers.authorization && req.headers.authorization.replace("Bearer ", "");
    if (!token) return;
    jwt.verify(token, process.env.ACCESS_SECRET, async (err, data) => {
      console.log('errar', err);
      if (err) return res.status(400).send({ error: "Invalid token", e: "IT" });
      try {
        const user = await User.findOne({ _id: data.user_id });
        if (!user) return res.status(404).send({ error: "User not found", e: "UNF" });
        req.user = user;
        req.data = data;
        next()
      } catch (e) {
        return res.status(400).send({ error: "Invalid user", e: "EIU" });
      }
    })
  })
  .get("/api/user", async (req, res) => {
    let response = {};
    for (let scope in scopeUserData) {
      if (!req.data.scope.includes(scope)) continue;
      for (let field of scopeUserData[scope])
        response[field] = req.user[field];
    }
    return res.send(response);
  })

app.listen(8082, () => console.log("> OAuth2 service started on *:8082"))

module.exports = router;

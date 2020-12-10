/* global require process module */
const express = require("express");
const app = express();
const router = express.Router();
const mongoose = require("mongoose");
const Joi = require('joi');

const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const User = require("./models/user");
const App = require("./models/app");
require("dotenv").config();

let cooldown = {};


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

const getCode = Joi.object({
  client_id: Joi.string().hex().length(20).required(),
  response_type: Joi.string().allow('token', 'code').required(),
  state: Joi.string().max(64),
  redirect_uri: Joi.string().max(64).required(),
  scope: Joi.array().items(Joi.string().max(20)).required(),
});

const tokenExchange = Joi.object({
  client_id: Joi.string().hex().length(20).required(),
  client_secret: Joi.number().integer().required(),
  redirect_uri: Joi.string().max(64).required(),
  scope: Joi.array().items(Joi.string().max(20)).required(),
  code: Joi.string().length(12).required()
});

const validator = { tokenExchange, getCode };


let codes = {};
const generateCode = () => Math.round(Math.random()*10000000);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.append("Access-Control-Allow-Origin", process.env.SELF_URL);
  res.append("Access-Control-Allow-Headers", "*");
  res.append("Access-Control-Allow-Methods", "*");
  if (req.method == "OPTIONS") return res.status(200).send();
  next();
})
// router
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
  .get("/code", async (req, res) => {
    var token = req.headers["authorization"];
    if (!token) return res.status(403).send("--- Пшёл вон ---");
    token = token.replace("Bearer ", "");

    const test = validator.getCode.validate(req.body);
    if (!test) return res.status(400).send(test);

    let code = generateCode();
    while (codes.find(c => c.code == code)) code = generateCode();

    const app = await App.findOne({ _id: req.body.client_id });
    if (!app || app.url != req.body.redirect_uri) return res.status(400).send({ error: "Invalid app", e:"IA" });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(401).json({ error: "Invalid token", e:"IT" });
      codes = codes.filter(c => c.user_id != user._id)
      codes.push(req.body.concat({ user_id: user._id, code }));
      res.send({ code });
    });
  })
  .post("/token", async (req, res) => {
    const test = validator.tokenExchange.validate(req.body);
    if (!test) return res.status(400).send(test);

    if (!codes.find(c => c.code == req.body.code)) return res.status(400).send({ error: "Invalid code", e: "IC" });

    const app = await App.findOne({ _id: req.body.client_id });
    if (!app || app.secret != req.body.client_secret || app.url != req.body.redirect_uri)
      return res.status(400).send({ error: "Invalid app", e: "IA" });

    const { user_id, scope } = codes.find(c => c.code == req.body.code);
    codes = codes.filter(c => c.code != req.body.code);

    const access_token = jwt.sign({ user_id, scope }, process.env.ACCESS_SECRET, { expiresIn: 604800 }); // 1 Week
    const refresh_token = jwt.sign({ user_id, scope }, process.env.REFRESH_SECRET, { expiresIn: 1814400 }); // 3 Weeks
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

    const app = await App.findOne({ _id: req.body.client_id });
    if (!app || app.secret != req.body.client_secret || app.url != req.body.redirect_uri)
      return res.status(400).send({ error: "Invalid app", e: "IA" });

    jwt.verify(req.body.resfresh_token, process.env.REFRESH_SECRET, (err, user) => {
      if (err) return res.status(401).json({ error: "Invalid token", e: "IT" });

      const access_token = jwt.sign(
        { user_id: user.user_id, scope: user.scope },
        process.env.ACCESS_SECRET,
        { expiresIn: 604800 } // 1 Week
      );
      const refresh_token = jwt.sign(
        { user_id: user.user_id, scope: user.scope },
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

app.listen(8082, () => console.log("> OAuth2 service started on *:8082"))

module.exports = router;

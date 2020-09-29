/* global require process module */
const express = require("express");
// const app = express();
const router = express.Router();
const Joi = require('joi');

const jwt = require("jsonwebtoken");
const User = require("./models/user");
const App = require("./models/app");

let cooldown = {};

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

// app.use((req, res, next) => {
//   res.append("Access-Control-Allow-Origin", process.env.SELF_URL);
//   res.append("Access-Control-Allow-Headers", "*");
//   res.append("Access-Control-Allow-Methods", "*");
//   if (req.method == "OPTIONS") return res.status(200).send();
//   next();
// })
router
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
    while (codes[code]) code = generateCode();

    const app = await App.findOne({ _id: req.body.client_id });
    if (!app || app.url != req.body.redirect_uri) return res.status(400).send({ error: "Invalid app" });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(401).json({ error: "Invalid token" });
      codes[code] = req.body.concat({ user_id: user._id });
      res.send({ code });
    });
  })
  .post("/token", async (req, res) => {
    const test = validator.tokenExchange.validate(req.body);
    if (!test) return res.status(400).send(test);

    if (!codes[code]) return res.status(400).send({ error: "Invalid code" });

    const app = await App.findOne({ _id: req.body.client_id });
    if (!app || app.secret != req.body.client_secret || app.url != req.body.redirect_uri)
      return res.status(400).send({ error: "Invalid app" });

    const { user_id, scope } = codes[code];
    delete codes[code];

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
      return res.status(400).send({ error: "Invalid app" });

    jwt.verify(req.body.resfresh_token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(401).json({ error: "Invalid token" });

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

// express.listen(8082, () => console.log("> OAuth2 service started on *:8082"))

module.exports = router;
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

// const tokenExchange = Joi.object({
//   client_id: Joi.string().hex().length(20).required(),
//   client_secret: Joi.number().integer().required()
// });

// const validator = { tokenExchange, getCode };


mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_URL}/${process.env.DB_NAME}?retryWrites=true&w=majority`, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});


const userData = {
  free: ["_id", "id", "uuid", "username", "sex"],
  scope: ["status", "balance", "role"]
}

// router


// TODO all APIs
// TODO logs

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.append("Access-Control-Allow-Origin", process.env.SELF_URL);
  res.append("Access-Control-Allow-Headers", "*");
  res.append("Access-Control-Allow-Methods", "*");
  if (req.method == "OPTIONS") return res.status(200).send();
  next();
})
  .use(function(req, res, next) {
    var token = req.headers["authorization"];
    if (!token) return res.status(403).send("--- Пшёл вон ---");

    token = token.replace("Bearer ", "");
    jwt.verify(token, process.env.ACCESS_SECRET, async function(err, data) {
      if (err) return res.status(401).json({ error: "Invalid token" });
      req.data = data;
      next();
    });
  })
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
  .get("/user", async (req, res) => {
    if (!req.data.scope.includes("data"))
      return res.status(403).send({ error: "Forbidden", message: "'data' scope required" });

    const user = await User.findOne({ _id: req.data.user_id });

    let respData = {};
    for (let field of userData.free) respData[field] = user[field];

    for (let field of userData.scope) {
      if (!req.data.scope.includes(field)) continue;
      respData[field] = user[field];
    }

    res.send(respData);
  })
  .post("/user/status", async (req, res) => {
    if (!req.data.scope.includes("set-status"))
      return res.status(403).send({ error: "Forbidden", message: "'set-status' scope required" });

    let user = await User.findOne({ _id: req.data.user_id });
    user.status = req.body.status.toString().substr(0, 32) || null;
    await user.save();

    res.send({ status: user.status });
  })

app.listen(8083, () => console.log("> Open API service started on *:8083"))

module.exports = router;

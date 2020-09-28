/* global require process module */
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const fetch = require("node-fetch");
const mongoose = require("mongoose");
const User = require("../models/user");
const App = require("../models/app");
const Logs = require("../models/logs");

const verifyPassword = (password, hash) => bcrypt.compareSync(password, hash);

let cooldown = {};

const pass = () => true;

// TODO
// Read: https://github.com/brandonwoodruff92/asana/wiki/Database-Schema
// Транзакции Mongo
// JOI https://joi.dev/api/?v=17.2.1


router
  .use((req, res, next) => {
    if (cooldown[req.user.id] &&
        cooldown[req.user.id][req.path] &&
        cooldown[req.user.id][req.path][req.method] &&
        Date.now() - cooldown[req.user.id][req.path][req.method] < 2000)
      return res.status(400).send({ error: "Cooldown" });
    if (!cooldown[req.user.id]) cooldown[req.user.id] = {};
    if (!cooldown[req.user.id][req.path]) cooldown[req.user.id][req.path] = {};
    cooldown[req.user.id][req.path][req.method] = Date.now();
    User.findOne({ id: req.user.id }, async (err, user) => {
      if (err) return;
      if (!user) return res.status(404).send({ error: "User not found" });
      req.user = user;
      next();
    });
  })
  .get("/", async (req, res) => {
    let apps = await App.find({'owner': req.user._id}).populate('owner', 'balance _id id role status username mayHave sex');
    res.json(apps);
  })
  .post("/", async (req, res) => {
    if (!req.body.name) return res.status(400).send({ error: "Invalid body" });
    let apps = await App.find({ owner: req.user._id });
    if (apps.length >= 3 && apps.length >= req.user.mayHave) return res.status(400).send({ error: "Limit" });
    let app = new App();
    app.name = req.body.name.substr(0, 32);
    app.secret = Math.round(Math.random()*9999999);
    app.owner = req.user._id;
    app.save();
    res.send();
  })
  .use("/:id", async (req, res, next) => {
    if (!req.params.id) return res.status(400).send();
    let app = await App.findOne({ shortname: String(req.params.id) });
    if (!app && parseInt(req.params.id, 16) && req.params.id.length == 24) {
      app = await App.findOne({ _id: req.params.id });
    }
    if (!app) return res.status(404).send({ error: "App not found" });
    req.app = app;
    next();
  })
  .post("/:id/send", async (req, res) => {
    if (!req.body.password) return res.status(403).send({ error: "Password required" });
    if (!verifyPassword(req.body.password, req.user.password))
      return res.status(403).send({ error: "Invalid password" });

    if (!req.body.sum || !parseInt(req.body.sum, 10) || parseInt(req.body.sum, 10) < 0)
      return res.status(400).send({ error: "Invalid body" });

    let sum = parseInt(req.body.sum, 10);
    if (req.user.balance - 1 < sum) return res.status(400).send({ error: "Not enough money" });

    // console.log(req.body)

    // return res.status(505).send();

    const session = await mongoose.startSession();
    session.startTransaction();

    let comApp = await App.findOne({ _id: process.env.COM_APP_ID });
    req.user.balance -= sum+1;
    comApp.balance += 1;
    req.app.balance += sum;

    let logs = new Logs();
    logs.fromUser = req.user._id;
    logs.toApp = req.app._id;
    logs.sum = sum;
    logs.action = "app-to";
    logs.more = `${req.body.text || 'Пожертвование'} [${req.body.uid || '000'}]`;

    await logs.save();
    await req.user.save();
    await comApp.save();
    await req.app.save();

    await session.commitTransaction();
    session.endSession();

    res.send({ success: true })

    if (!req.app.eventUrl) return;
    fetch(req.app.eventUrl, {
      body: JSON.stringify({
        text: req.body.text || 'Пожертвование',
        uid: req.body.uid || '000',
        time: logs.timestamp,
        sum,
        user: {
          username: req.user.username,
          id: req.user.id,
          uuid: req.user.uuid,
          _id: req.user._id
        }
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    }).then(pass).catch(pass);
  })
  .use((req, res, next) => {
    if (String(req.app.owner) != String(req.user._id)) return res.status(403).send({ error: "Access denied" });
    return next();
  })
  .post("/:id/take", async (req, res) => {
    if (!req.body.sum) return res.status(400).send({ error: "Invalid body" });

    let sum = parseInt(req.body.sum, 10);
    if (!sum || sum <= 0) sum = req.app.balance;

    if (req.app.balance < sum) return res.status(400).send({ error: "Not enough money" });

    const session = await mongoose.startSession();
    session.startTransaction();

    req.app.balance -= sum;
    req.user.balance += sum;

    let logs = new Logs();
    logs.fromApp = req.app._id;
    logs.toUser = req.user._id;
    logs.sum = sum;
    logs.action = "app-from";
    logs.more = `${req.query.text} [${req.query.uid}]`;

    await logs.save();
    await req.app.save();
    await req.user.save();

    await session.commitTransaction();
    session.endSession();
  })
  .put("/:id", async (req, res) => {
    if (!req.body.name && !req.body.description && !req.body.avatar && !req.body.shortname && !req.body.url)
      return res.status(400).send({ error: "Invalid body" });

    if (req.body.shortname && req.app.shortname != req.body.shortname) {
      req.body.shortname = req.body.shortname.toLowerCase().substr(0, 12);
      let apps = await App.find({ shortname: req.body.shortname });
      if (apps.length) return res.status(400).send({ error: 'url' });
    }

    let changed = false;
    let fields = {
      name: 32,
      description: 300,
      avatar: 64,
      url: 64,
      eventUrl: 64
    }
    for (let f in fields) {
      if (!req.body[f] || req.app[f] == req.body[f]) continue;
      changed = true;
      req.app[f] = req.body[f].substr(0, fields[f]);
    }
    if (!changed) return res.status(204).send();
    await req.app.save();
    res.send();
  })
  .delete("/:id", (req, res) => {
    req.app.delete();
    res.send();
  })

module.exports = router;

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
const Joi = require('joi');
const sanitizeUrl = require("@braintree/sanitize-url").sanitizeUrl;
let getLogs = require("./getLogs");

const sumTest = Joi.number().integer().min(1);
const sumTestZero = Joi.number().integer().min(0);

const verifyPassword = (password, hash) => bcrypt.compareSync(password, hash);

let cooldown = {};

const pass = () => true;

// TODO 1
// Read: https://github.com/brandonwoodruff92/asana/wiki/Database-Schema


router
  .use((req, res, next) => {
    // if (cooldown[req.user.id] &&
    //     cooldown[req.user.id][req.path] &&
    //     cooldown[req.user.id][req.path][req.method] &&
    //     Date.now() - cooldown[req.user.id][req.path][req.method] < 2000)
    //   return res.status(400).send({ error: "Cooldown" });
    // if (!cooldown[req.user.id]) cooldown[req.user.id] = {};
    // if (!cooldown[req.user.id][req.path]) cooldown[req.user.id][req.path] = {};
    // cooldown[req.user.id][req.path][req.method] = Date.now();
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
    app._id = new mongoose.Types.ObjectId();
    app.name = req.body.name.substr(0, 32);
    app.secret = Math.round(Math.random()*9999999);
    app.owner = req.user._id;
    app.shortname = String(app._id);
    app.save();

    return res.send();
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
      return res.status(403).send({ error: "Invalid password", e: "IP" });

    let { value: sum, error } = sumTest.validate(req.body.sum);
    if (!!error) return res.status(400).send({ error: "Invalid body", e: "IB", joie: error });

    if (req.user.balance - 1 < sum) return res.status(400).send({ error: "Not enough money", e: "NEM" });

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
    logs.more = `${req.body.text || 'Пожертвование'} [${req.body.uid || '0'}]`;

    await logs.save();
    await req.user.save();
    await comApp.save();
    await req.app.save();

    await session.commitTransaction();
    session.endSession();

    logger.log("(Transaction)", "from:", logs.fromUser, "to:", logs.toApp, "op:", logs.action, "sum:", logs.sum);

    let u1 = req.io.users.find(u => u.id == req.user.id);

    u1 && req.io.to(u1.io).emit("logs", await getLogs(req));
    u1 && req.io.to(u1.io).emit("balance", req.user.balance);

    res.send({ success: true });

    if (!req.app.eventUrl) return;
    fetch(req.app.eventUrl, {
      body: JSON.stringify({
        text: req.body.text || 'Пожертвование',
        uid: req.body.uid || '0',
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
    let { value: sum, error } = sumTestZero.validate(req.body.sum);
    if (!!error) return res.status(400).send({ error: "Invalid body", e: "IB", joie: error });

    if (sum == 0) sum = req.app.balance;

    if (req.app.balance < sum) return res.status(400).send({ error: "Not enough money", e: "NEM" });

    const session = await mongoose.startSession();
    session.startTransaction();

    req.app.balance -= sum;
    req.user.balance += sum;

    let logs = new Logs();
    logs.fromApp = req.app._id;
    logs.toUser = req.user._id;
    logs.sum = sum;
    logs.action = "app-from";
    logs.more = 'Вывод средств';

    await logs.save();
    await req.app.save();
    await req.user.save();

    await session.commitTransaction();
    session.endSession();
    logger.log("(Transaction)", "from:", logs.fromApp, "to:", logs.toUser, "op:", logs.action, "sum:", logs.sum);

    let u1 = req.io.users.find(u => u.id == req.user.id);

    u1 && req.io.to(u1.io).emit("logs", await getLogs(req));
    u1 && req.io.to(u1.io).emit("balance", req.user.balance);
    return res.send({ success: true });
  })
  .put("/:id", async (req, res) => {
    if (!req.body.name && !req.body.description && !req.body.avatar && !req.body.shortname && !req.body.url)
      return res.status(400).send({ error: "Invalid body" });

    let changed = false;

    if (req.app.shortname != req.body.shortname) {
      changed = true;
      if (req.body.shortname) {
        let link = sanitizeUrl(req.body.shortname.toLowerCase().trim().split(/ +/).join('').substr(0, 24));
        if (link == "about:blank") {
          req.app.level = -1;
          req.app.shortname = '';
        } else {
          let app = await App.findOne({ shortname: link });
          if (app) return res.status(400).send({ error: 'url' });
          req.app.shortname = link;
        }
      } else { req.body.shortname = ''; }
    }

    if (req.body.avatar) {
      console.log("SENDING");
      let imageLink = await uploadImage(req.body.avatar);
      console.log("SENDED", imageLink);
      if (!imageLink) return res.status(400).send({ error: "img" });
      req.app.avatar = imageLink;
      changed = true;
    }

    let fields = { name: 32, description: 300 };
    let changable = { url: 64, eventUrl: 64 };

    for (let f in fields) {
      if (!req.body[f] || req.app[f] == req.body[f]) continue;
      changed = true;
      req.app[f] = req.body[f].substr(0, fields[f]);
    }

    for (let f in changable) {
      if (req.app[f] == req.body[f]) continue;
      changed = true;
      let link = sanitizeUrl(req.body[f].substr(0, fields[f]));
      if (!req.body[f]) { link = "" }
      req.app[f] = link != 'about:blank' ? link : '';
      if (link == "about:blank") { req.app.level = -1; }
    }

    if (!changed) return res.status(204).send();
    req.app.public = false;
    logger.log("(Apps)", "app", req.app._id, "sent fields change request by", req.user.id);
    await req.app.save();

    res.send({ success: true });
  })
  .delete("/:id", async (req, res) => {
    await req.app.delete();
    res.send({ success: true });
  })

async function uploadImage(image) {
   console.log("got img", `image=${encodeURIComponent(image.split(',')[1])}`.substr(0, 50));
   // FIXME: STUPID IMGUR FILE SENDING
   let r = await fetch('https://api.imgur.com/3/upload', {
     method: "POST",
     body: `image=${encodeURIComponent(image.split(',')[1])}`,
     headers: { "Content-Type":"application/x-www-form-urlencoded", Authorization: 'Client-ID b4061759062b8e2' }
   });
   let answ = await r.json();
   console.log(answ);
   if (!answ.success || !answ.data.link) return false;
   console.log("link", answ.data.link);
   return link.replace('.jpg','.jpeg');
}

module.exports = router;

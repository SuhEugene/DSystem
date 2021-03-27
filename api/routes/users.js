/* global require module */
const express = require("express");
const fetch = require("node-fetch");
const mongoose = require("mongoose");
const User = require("../models/user");
const Logs = require("../models/logs");
const userRouter = express.Router();
let cooldown = {};
const getLogs = require("./getLogs");

const getStringByDate = (d) => {
  let data = {
    day:   `${String(d.getDate())   .padStart(2,'0')}`,
    month: `${String(d.getMonth()+1).padStart(2,'0')}`,
    year:     String(d.getFullYear()),

    hour:   `${String(d.getHours())  .padStart(2,'0')}`,
    minute: `${String(d.getMinutes()).padStart(2,'0')}`,
    second: `${String(d.getSeconds()).padStart(2,'0')}`
  };
  return `${data.day}.${data.month}.${data.year} ${data.hour}:${data.minute}:${data.second}`;
}

async function getMe (req) {
  return ({
    balance: req.user.balance,
    id: req.user.id,
    uuid: req.user.uuid,
    _id: req.user._id,
    role: req.user.role,
    status: req.user.status,
    username: req.user.username,
    mayHave: req.user.mayHave,
    sex: req.user.sex,
    logs: await getLogs(req),
    cards: await req.user.cards,
    badges: req.user.badges
  });
}

userRouter
  .use((req, res, next) => {
    // console.log(req.method, req.path)
      // if (cooldown[req.user.id] && cooldown[req.user.id][req.path] && Date.now() - cooldown[req.user.id][req.path] < 2000)
        // return res.status(400).send({ error: "Cooldown" });
      // if (!cooldown[req.user.id]) cooldown[req.user.id] = {};
      // cooldown[req.user.id][req.path] = Date.now();
  next();
  })
  .get("/", (req, res) => {
    User.find({role: {$ne: 0}},(err, users) => {
      if (err) return;
      if (req.user.role > 2) return res.json(users.map(u => ({
        id: u.id, _id: u._id,
        username: u.username,
        frozen: u.frozen !== undefined && u.frozen !== null && u.frozen !== false
      })));
      if (req.user.role > 1) return res.json(users.map(u => ({
        id: u.id, _id: u._id,
        username: u.username
      })));
      return res.json(users.map(u => ({ _id: u._id, username: u.username })));
    });
  })
  .get("/@me", async (req, res) => {
    res.json(await getMe(req));
  })
  .get("/@me/logs", (req, res) => {
    getLogs(req)
    .then(res.json)
    .catch(()=>{ res.status(500).send() })
  })
  .get("/@me/logs/download", async (req, res) => {
    // TODO: cooldown
    // TODO: maybe 500?
    let logs = await getLogs(req, 200);
    return res.send(logs.map(log => `[${getStringByDate(new Date(log.timestamp))}] `+
      `${log.fromUser ? log.fromUser.username : log.fromApp.name} `+
      `-> ${log.toUser ? log.toUser.username : log.toApp.name} `+
      `# ${log.sum} АР | ${log.more}`).join("\n"));
  })
  .get("/@me/updateNickname", async (req, res) => {
    // TODO: cooldown
    let f = await fetch(`https://playerdb.co/api/player/minecraft/${req.user.uuid}`)
    let r = await f.json()
    if (r.code !== "player.found") return res.status(400).send(r);
    req.user.username = r.data.player.username;
    await req.user.save();
    return res.send(r.data.player.username);
  })
  .patch("/@me/status", async (req, res) => {
    req.user.status = req.body.status.substr(0, 32) || null;
    await req.user.save();
    res.json(await getMe(req));
  })
  .use("/@me/clear", async (req, res) => {
    let cd = cooldown[req.user.id] ? cooldown[req.user.id]["clearCookie"] : {};
    if (cd && cd > Date.now()) return res.status(400).send({ error: "Cooldown", time: cd });

    const session = await mongoose.startSession();
    session.startTransaction();

    req.user.login = randStr();
    if (!cooldown[req.user.id]) cooldown[req.user.id] = {};
    cooldown[req.user.id]["clearCookie"] = Date.now() + 600000; // 10 mins
    await req.user.save();

    await session.commitTransaction();
    session.endSession();
    res.send();
  })
  .use("/:id", (req, res, next) => {
    if (!/^[a-zA-Z0-9_]{3,40}$/.test(req.params.id)) return res.status(400).send({ error: "Invalid id" });
    try {
      User.findOne({
        $or: [
            { id: req.params.id },
            { username: req.params.id },
            { uuid: req.params.id }
          ]
        },
      async (err, user) => {
        if (err) return;
        if (!user) return res.status(404).send({ error: "User not found" });
        req.subUser = user;
        next();
      });
    } catch (e) {
      res.status(400).send({ error: "Invalid id" })
    }
  })
  .get("/:id", (req, res) => {
    let data = {
      id:       req.subUser.id,
      _id:      req.subUser._id,
      uuid:     req.subUser.uuid,
      role:     req.subUser.role,
      status:   req.subUser.status,
      username: req.subUser.username
    };
    if (req.user.role > 2) data.balance = user.balance;

    res.json(data);
  })
  .post("/:id/freeze", async (req, res) => {

    if (req.user.role < 3) return res.send(403);

    const session = await mongoose.startSession();
    session.startTransaction();

    if (req.body.frozen) {
      req.subUser.frozen = req.body.comment;
    } else {
      req.subUser.frozen = null;
    }
    await req.subUser.save();

    await session.commitTransaction();
    session.endSession();

    logger.log("(Frozen)", req.user.id, `${req.body.frozen ? '' : 'un'}frozen`, req.subUser.id, 'because of', req.body.comment);
    return res.send();
  });

  const alphabet = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890-_+=$#";
  const rand = () => alphabet[Math.floor(Math.random()*alphabet.length)];
  const randStr = () => {
    let text = "";
    for (let i = 0; i < 10; i++) { text += rand() }
    return text;
  }

module.exports = userRouter;

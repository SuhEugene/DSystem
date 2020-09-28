/* global require module */
const express = require("express");
const User = require("../models/user");
const Logs = require("../models/logs");
const userRouter = express.Router();
let cooldown = {};
const getLogs = require("./getLogs");
userRouter
  .use((req, res, next) => {
    // console.log(req.method, req.path)
      // if (cooldown[req.user.id] && cooldown[req.user.id][req.path] && Date.now() - cooldown[req.user.id][req.path] < 2000)
        // return res.status(400).send({ error: "Cooldown" });
      if (!cooldown[req.user.id]) cooldown[req.user.id] = {};
      cooldown[req.user.id][req.path] = Date.now();
      User.findOne({ id: req.user.id }, async (err, user) => {
      if (err) return;
      if (!user)
        return res.status(404).send({ error: "User not found" });
      req.user = user;
      next();
    });
  })
  .get("/", (req, res) => {
    User.find({role: {$ne: 0}},(err, users) => {
      if (err) return;
      if (req.user.role > 1) return res.json(users.map(u => ({
        id: u.id,
        username: u.username,
        balance: u.balance
      })));
      return res.json(users.map(u => ({ id: u.id, username: u.username })));
    });
  })
  .get("/@me", async (req, res) => {
    res.json({
      balance: req.user.balance,
      id: req.user.id,
      uuid: req.user.uuid,
      _id: req.user._id,
      role: req.user.role,
      status: req.user.status,
      username: req.user.username,
      mayHave: req.user.mayHave,
      sex: req.user.sex,
      logs: await getLogs(req)
    });
  })
  .get("/@me/logs", (req, res) => {
    getLogs(req)
    .then(res.json)
    .catch(()=>{ res.status(500).send() })
  })
  .patch("/@me/status", async (req, res) => {
    req.user.status = req.body.status || null;
    await req.user.save();
    res.json({
      balance: req.user.balance,
      id: req.user.id,
      _id: req.user._id,
      role: req.user.role,
      status: req.user.status,
      username: req.user.username,
      logs: await getLogs(req)
    });
  })
  .get("/:id", (req, res) => {
    if (!/^[a-zA-Z0-9_]{3,40}$/.test(req.params.id)) return res.status(400).send({ error: "Invalid id" });
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
      let data = {
        id: user.id,
        _id: user._id,
        uuid: user.uuid,
        role: user.role,
        status: user.status,
        username: user.username
      };
      if (req.user.role > 2) {
        data.balance = user.balance;
      }
      res.json(data);
    });
  });

module.exports = userRouter;

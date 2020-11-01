/* global require module */
const express = require("express");
const User = require("../models/user");
const Logs = require("../models/logs");
const Post = require("../models/post");
const moneyRouter = express.Router();
const mongoose = require("mongoose");
const getLogs = require("./getLogs");
const bcrypt = require("bcryptjs");

// TODO логи

const verifyPassword = (password, hash) => bcrypt.compareSync(password, hash);

let cooldown = {};
function getPost(id) {
  return new Promise((resolve, reject) => {
    Post.findOne({ id }, async (err, post) => {
      if (err) return reject();
      if (!post) return reject("Post not found");
      return resolve(post);
    });
  })
}
moneyRouter
  .use((req, res, next) => {
    if (cooldown[req.user.id] && cooldown[req.user.id][req.path] && Date.now() - cooldown[req.user.id][req.path] < 2000)
      return res.status(400).send({ error: "Cooldown" });
    if (!cooldown[req.user.id]) cooldown[req.user.id] = {};
    cooldown[req.user.id][req.path] = Date.now();
    User.findOne({ id: req.user.id }, async (err, user) => {
      if (err) return;
      if (!user) return res.status(404).send({ error: "User not found" });
      req.user = user;
      next();
    });
  })
  .use((req, res, next) => {
    if (req.user.role < 2) return res.status(403).json({ error: "Access denied" });
    return next();
  })
  .post("/:id/add", async (req, res) => {
    if (isNaN(req.params.id)) return res.status(400).json({ error: "Invalid id" });
    if (isNaN(req.body.sum) ||
        !parseInt(req.body.sum) ||
        parseInt(req.body.sum) > 64*36*27 ||
        parseInt(req.body.sum) < -64*36*27 ||
        isNaN(req.body.post)) return res.status(400).json({ error: "Invalid body" });

    const session = await mongoose.startSession();
    session.startTransaction();

    User.findOne({ id: req.params.id }, async (err, user) => {
      if (err) return;
      if (!user) return res.status(404).json({ error: "User not found" });
      if (user.balance + parseInt(req.body.sum, 10) < 0)
        return res.status(400).json({ error: "Not enough money" });
      let post = await getPost(req.body.post);
      if (!post) return res.status(404).json({ error: "Post not found" });
      post.balance += parseInt(req.body.sum, 10);

      let logs = new Logs();
      logs.fromUser = req.user._id;
      logs.toUser = user._id;
      logs.sum = parseInt(req.body.sum, 10);
      logs.action = "banker-void";
      logs.more = (parseInt(req.body.sum, 10) > 0) ? "Пополнение" : "Снятие";
      user.balance += parseInt(req.body.sum, 10);

      await logs.save();
      await post.save();
      await user.save();

      await session.commitTransaction();
      session.endSession();

      logger.log("(Transaction)", "from:", logs.fromUser, "to:", logs.toUser, "op:", logs.action, "sum:", logs.sum);

      res.send();

      let u1 = req.io.users.find(u => u.id == req.user.id);
      let u2 = req.io.users.find(u => u.id == user.id);

      u1 && req.io.to(u1.io).emit("logs", await getLogs(req));
      u2 && req.io.to(u2.io).emit("logs", await getLogs({ user }));
      u2 && req.io.to(u2.io).emit("balance", user.balance);
    });
  }).post("/send/:id", async (req, res) => {
    if (isNaN(req.params.id) || req.params.id == req.user.id) return res.status(400).json({ error: "Invalid id" });
    if (isNaN(req.body.sum) ||
        !parseInt(req.body.sum, 10) ||
        parseInt(req.body.sum, 10) > 64*36*27 ||
        parseInt(req.body.sum, 10) < 0)
      return res.status(400).json({ error: "Invalid body" });

    const session = await mongoose.startSession();
    session.startTransaction();

    User.findOne({ id: req.params.id }, async (err, user) => {
      if (err) return;
      if (!user) return res.status(404).json({ error: "User not found" });
      if (req.user.balance - parseInt(req.body.sum, 10) < 0)
        return res.status(400).json({ error: "Not enough money" });

      let logs = new Logs();
      logs.fromUser = req.user._id;
      logs.toUser = user._id;
      logs.sum = parseInt(req.body.sum, 10);
      logs.action = "send-to";
      logs.more = req.body.comment ? String(req.body.comment).substr(0, 100) : "";
      user.balance += parseInt(req.body.sum, 10);
      req.user.balance -= parseInt(req.body.sum, 10);

      await logs.save();
      await req.user.save();
      await user.save();

      await session.commitTransaction();
      session.endSession();

      logger.log("(Transaction)", "from:", logs.fromUser, "to:", logs.toUser, "op:", logs.action, "sum:", logs.sum);
      res.send();

      let u1 = req.io.users.find(u => u.id == req.user.id);
      let u2 = req.io.users.find(u => u.id == user.id);

      u1 && req.io.to(u1.io).emit("logs", await getLogs(req));
      u2 && req.io.to(u2.io).emit("logs", await getLogs({ user }));
      u1 && req.io.to(u1.io).emit("balance", req.user.balance);
      u2 && req.io.to(u2.io).emit("balance", user.balance);
    });
  }).post("/pass/send/:id", (req, res) => {
    if (isNaN(req.params.id) || req.params.id == req.user.id) return res.status(400).json({ error: "Invalid id" });
    if (isNaN(req.body.sum) ||
        !parseInt(req.body.sum, 10) ||
        parseInt(req.body.sum, 10) > 64*36*27 ||
        parseInt(req.body.sum, 10) < 0)
      return res.status(400).json({ error: "Invalid body" });
    if (!req.body.password || req.body.password.length < 6)
      return res.status(400).json({ error: "Invalid body" });
    if (!verifyPassword(req.body.password, req.user.password))
      return res.status(403).json({ error: "Invalid password" });
    User.findOne({ id: req.params.id }, async (err, user) => {
      if (err) return;

      if (!user) return res.status(404).json({ error: "User not found" });
      if (req.user.balance - parseInt(req.body.sum, 10) < 0)
        return res.status(400).json({ error: "Not enough money" });

      let logs = new Logs();
      logs.fromUser = req.user._id;
      logs.toUser = user._id;
      logs.sum = parseInt(req.body.sum, 10);
      logs.action = "send-to";
      logs.more = "Перевод по запросу";
      user.balance += parseInt(req.body.sum, 10);
      req.user.balance -= parseInt(req.body.sum, 10);

      await logs.save();
      await req.user.save();
      await user.save();

      logger.log("(Transaction)", "from:", logs.fromUser, "to:", logs.toUser, "op:", logs.action, "sum:", logs.sum);
      res.send();

      let u1 = req.io.users.find(u => u.id == req.user.id);
      let u2 = req.io.users.find(u => u.id == user.id);
      u1 && req.io.to(u1.io).emit("logs", await getLogs(req));
      u1 && req.io.to(u1.io).emit("balance", req.user.balance);
      u2 && req.io.to(u2.io).emit("logs", await getLogs({ user }));
      u2 && req.io.to(u2.io).emit("balance", user.balance);
    });
  })

module.exports = moneyRouter;

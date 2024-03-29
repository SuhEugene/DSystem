/* global require module */
const express = require("express");
const User = require("../models/user");
const Logs = require("../models/logs");
const Post = require("../models/post");
const Joi = require('joi');
const moneyRouter = express.Router();
const mongoose = require("mongoose");
const getLogs = require("./getLogs");
const bcrypt = require("bcryptjs");

const verifyPassword = (password, hash) => bcrypt.compareSync(password, hash);

const hex = Joi.string().hex().length(24);

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
  .use(async (req, res, next) => {
    if (cooldown[req.user.id] && cooldown[req.user.id][req.path] && Date.now() - cooldown[req.user.id][req.path] < 2000)
      return res.status(400).send({ error: "Cooldown" });
    if (!cooldown[req.user.id]) cooldown[req.user.id] = {};
    cooldown[req.user.id][req.path] = Date.now();
    logger.log("MONEY", await req.user.cards);
    next();
  })
  .post("/send/:id", async (req, res) => {
    if (isNaN(req.params.id) || req.params.id == req.user.id) return res.status(400).json({ error: "Invalid id" });
    if ((await hex.validate(req.body.card)).error) return res.status(400).json({ error: "Invalid card" });
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

      req.io.to(String(req.user._id)).emit("logs", await getLogs(req));
      req.io.to(String(req.user._id)).emit("balance", req.user.balance);
      req.io.to(String(user._id)).emit("logs", await getLogs({ user }));
      req.io.to(String(user._id)).emit("balance", user.balance);
    });
  }).post("/pass/send/:id", (req, res) => {
    const { error } = hex.validate(req.params.id);
    if (error) return res.status(400).json({ error: "Invalid id" });
    if (isNaN(req.body.sum) ||
        !parseInt(req.body.sum, 10) ||
        parseInt(req.body.sum, 10) > 64*36*27 ||
        parseInt(req.body.sum, 10) < 0)
      return res.status(400).json({ error: "Invalid body" });
    if (!req.body.password || req.body.password.length < 6)
      return res.status(400).json({ error: "Invalid body" });
    if (!verifyPassword(req.body.password, req.user.password))
      return res.status(403).json({ error: "Invalid password" });
      console.log("find user", req.params.id, "by _id");
    User.findOne({ _id: req.params.id }, async (err, user) => {
      if (err) return;
      if (user.id == req.user.id) return res.status(400).json({ error: "Invalid id" });
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

      req.io.to(String(req.user._id)).emit("logs", await getLogs(req));
      req.io.to(String(req.user._id)).emit("balance", req.user.balance);
      req.io.to(String(user._id)).emit("logs", await getLogs({ user }));
      req.io.to(String(user._id)).emit("balance", user.balance);
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
      let sum = parseInt(req.body.sum, 10)
      if (!user) return res.status(404).json({ error: "User not found" });
      if (!sum || user.balance + sum < 0)
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
      user.balance += sum;

      await logs.save();
      await post.save();
      await user.save();

      await session.commitTransaction();
      session.endSession();

      logger.log("(Transaction)", "from:", logs.fromUser, "to:", logs.toUser, "op:", logs.action, "sum:", logs.sum);

      res.send();

      req.io.to(String(req.user._id)).emit("logs", await getLogs(req));
      req.io.to(String(user._id)).emit("logs", await getLogs({ user }));
      req.io.to(String(user._id)).emit("balance", user.balance);
    });
  })

module.exports = moneyRouter;

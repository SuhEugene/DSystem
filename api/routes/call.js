/* global require module */
const express = require("express");
const Joi = require('joi');
const App = require("../models/app");
const User = require("../models/user");
const Logs = require("../models/logs");
const Post = require("../models/post");
const callRouter = express.Router();
const mongoose = require("mongoose");
const getLogs = require("./getLogs");
const bcrypt = require("bcryptjs");

const CALL_PRICE = 3;

const hex = Joi.string().hex().length(24);
const int = Joi.number().integer();

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
function checkTimes() {
  
}
callRouter
  .use((req, res, next) => {
    if (cooldown[req.user.id] && cooldown[req.user.id][req.path] && Date.now() - cooldown[req.user.id][req.path] < 2000)
      return res.status(400).send({ error: "Cooldown" });
    if (!cooldown[req.user.id]) cooldown[req.user.id] = {};
    cooldown[req.user.id][req.path] = Date.now();
    next();
  })
  .post("/", async (req, res) => {
    let { error } = int.validate(req.body.post);
    if (error) return res.status(400).send({ error: "Invalid post id", e: "IPI" });

    let cards = await req.user.cards;
    let firstCard = cards[0];
    if (!firstCard) return res.status(400).send({ error: "Card not found", e: "CNF" });
    if (firstCard.balance < CALL_PRICE) return res.status(400).send({ error: "Not enough money", e: "NEM" });

    let call = await Call.findOne({ caller: req.user._id }).populate({ path: "banker", select: "username"});
    if (call && call._id) {

      req.io.to(String(req.user._id)).emit("banker search");

      if (call.banker && call.banker.username)
        req.io.to(String(req.user._id)).emit("banker found", call.banker.username);

      return res.status(400).send({ error: "Already calling", e: "ALr" });
    }

    let post = await Post.findOne({ id: req.body.post });
    if (!post || !post.id) return res.status(400).send({ error: "Invalid post", e: "IPost" });

    const session = await mongoose.startSession();
    session.startTransaction();


    let logs = new Logs();
    logs.fromUser = req.user._id;
    logs.toApp = process.env.COM_APP_ID;
    logs.sum = -CALL_PRICE;
    logs.action = "call-from";
    logs.more = "Вызов банкира";

    firstCard.balance -= CALL_PRICE;

    await firstCard.save();
    await logs.save();
    await call.save();

    call = new Call();

    call.caller = req.user._id;
    call.post = post._id;
    call.log = logs._id;

    await session.commitTransaction();
    session.endSession();

    req.io.to(String(req.user._id)).emit("logs",  await getLogs(req));

    res.send(call);
  })
  .delete("/", async (req, res) => {
    let call = await Call.findOne({ caller: req.user._id });
    if (!call || !call._id) return res.status(404).send({ error: "Call not found", e: "ClNF" });

    const session = await mongoose.startSession();
    session.startTransaction();

    if (call.timestamp < Date.now() - 300000) {
      let cards = await req.user.cards;
      let firstCard = cards[0];
      if (!firstCard) {
        await session.commitTransaction();
        session.endSession();
        return res.status(400).send({ error: "Card not found", e: "CNF" });
      }
      firstCard.balance += CALL_PRICE
      await firstCard.save();
    }
    await call.remove();

    await session.commitTransaction();
    session.endSession();

    return res.send();
  })

setInterval(checkTimes, 60000);

module.exports = callRouter;

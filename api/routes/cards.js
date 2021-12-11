/* global require module */
const express = require("express");
const Joi = require('joi');
const App = require("../models/app");
const User = require("../models/user");
const Logs = require("../models/logs");
const Post = require("../models/post");
const Card = require("../models/card");
const moneyRouter = express.Router();
const mongoose = require("mongoose");
const getLogs = require("./getLogs");
const bcrypt = require("bcryptjs");

const CARD_PRICE = 32;


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
  .use((req, res, next) => {
    if (cooldown[req.user.id] && cooldown[req.user.id][req.path] && Date.now() - cooldown[req.user.id][req.path] < 2000)
      return res.status(400).send({ error: "Cooldown" });
    if (!cooldown[req.user.id]) cooldown[req.user.id] = {};
    cooldown[req.user.id][req.path] = Date.now();
    next();
  })
  .get("/", async (req, res) => {
    return res.send(await req.user.cards);
  })
  .post("/new", async (req, res) => {
    let cards = await req.user.cards;
    if (cards.length >= 4) return res.status(400).send({ error: "Cards maximum", e: "CM" });
    let firstCard = cards[0];
    if (firstCard && firstCard.balance < CARD_PRICE) return res.status(400).send({ error: "Not enough money", e: "NEM" });

    const session = await mongoose.startSession();
    session.startTransaction();

    let comApp = await App.findOne({ _id: process.env.COM_APP_ID });

    let newCard = new Card();
    newCard.id = await newId();
    newCard.owner = req.user._id;
    newCard.text = "Новая карта";

    if (!!firstCard) {
      firstCard.balance -= CARD_PRICE;
      comApp.balance += CARD_PRICE;
      await firstCard.save();
      await comApp.save();
    }

    await newCard.save();

    await session.commitTransaction();
    session.endSession();

    res.send();
  })
  .post("/send/:id", async (req, res) => {
    console.log("Sender", req.user.username, "id", req.params.id);
    const { error } = hex.validate(req.params.id);
    if (error) return res.status(400).json({ error: "Invalid id" });
    // if ((await hex.validate(req.body.card)).error) return res.status(400).json({ error: "Invalid card" });
    if (isNaN(req.body.sum) ||
        !parseInt(req.body.sum, 10) ||
        parseInt(req.body.sum, 10) > 64*36*27 ||
        parseInt(req.body.sum, 10) < 0)
      return res.status(400).json({ error: "Invalid body" });

    let fromCard;
    logger.log("req card", req.body.card);
    try {
      fromCard = await req.user.findCard(req.body.card);
    } catch (e) {
      logger.log("Not found error", e);
      return res.status(404).json({ error: "Card not found" });
    }

    if (!fromCard) return res.status(404).json({ error: "Card not found" });


    if (fromCard.balance - parseInt(req.body.sum, 10) < 0)
      return res.status(400).json({ error: "Not enough money" });

    const session = await mongoose.startSession();
    session.startTransaction();

    User.findOne({ _id: req.params.id }, async (err, user) => {
      if (err) return;
      if (!user) return res.status(404).json({ error: "User not found" });


      let toCard = (await user.cards)[0];
      if (!toCard) return res.status(404).json({ error: "toCard not found" });

      let logs = new Logs();
      logs.fromUser = req.user._id;
      logs.toUser = user._id;
      logs.sum = parseInt(req.body.sum, 10);
      logs.action = "send-to";
      logs.more = req.body.comment ? String(req.body.comment).substr(0, 100) : "";
      toCard.balance += parseInt(req.body.sum, 10);
      fromCard.balance -= parseInt(req.body.sum, 10);

      await logs.save();
      await fromCard.save();
      await toCard.save();

      await session.commitTransaction();
      session.endSession();

      logger.log("(Transaction)", "from:", logs.fromUser, "to:", logs.toUser, "op:", logs.action, "sum:", logs.sum);
      res.send();

      req.io.to(String(req.user._id)).emit("logs",  await getLogs(req));
      req.io.to(String(req.user._id)).emit("cards", await req.user.cards);
      req.io.to(String(user._id)).emit("logs",  await getLogs({ user }));
      req.io.to(String(user._id)).emit("cards", await user.cards);
    });
  })
  .post("/send/self/:card", async (req, res) => {
    console.log("toSender", req.user.username, "id", req.params.id);
    // if ((await hex.validate(req.body.card)).error) return res.status(400).json({ error: "Invalid card" });
    if (isNaN(req.body.sum) ||
        !parseInt(req.body.sum, 10) ||
        parseInt(req.body.sum, 10) > 64*36*27 ||
        parseInt(req.body.sum, 10) < 0)
      return res.status(400).json({ error: "Invalid body" });

    if (req.body.card == req.params.card) return res.status(400).json({ error: "Same card" });

    let fromCard;
    logger.log("req card", req.body.card);
    try {
      fromCard = await req.user.findCard(req.body.card);
    } catch (e) {
      logger.log("Not found error", e);
      return res.status(404).json({ error: "Card not found" });
    }
    if (!fromCard) return res.status(404).json({ error: "Card not found" });


    if (fromCard.balance - parseInt(req.body.sum, 10) < 0)
      return res.status(400).json({ error: "Not enough money" });

    let toCard;
    logger.log("req toCard", req.params.card);
    try {
      toCard = await req.user.findCard(req.params.card);
    } catch (e) {
      logger.log("to Not found error", e);
      return res.status(404).json({ error: "toCard not found" });
    }
    if (!toCard) return res.status(404).json({ error: "toCard not found" });

    const session = await mongoose.startSession();
    session.startTransaction();

    let logs = new Logs();
    logs.fromUser = req.user._id;
    logs.toUser = req.user._id;
    logs.sum = parseInt(req.body.sum, 10);
    logs.action = "send-to";
    logs.more = `Перевод с карты ${req.body.card} на ${req.params.card}`;
    toCard.balance += parseInt(req.body.sum, 10);
    fromCard.balance -= parseInt(req.body.sum, 10);

    await logs.save();
    await toCard.save();
    await fromCard.save();

    await session.commitTransaction();
    session.endSession();

    logger.log("(Transaction)", "from:", logs.fromUser, "to:", logs.toUser, "op:", logs.action, "sum:", logs.sum);
    res.send();

    req.io.to(String(req.user._id)).emit("logs",  await getLogs(req));
    req.io.to(String(req.user._id)).emit("cards", await req.user.cards);
  })
  .post("/pass/send/:id", async (req, res) => {
    const { error } = hex.validate(req.params.id);
    if (error) return res.status(400).json({ error: "Invalid id" });
    // if ((await hex.validate(req.body.card)).error) return res.status(400).json({ error: "Invalid card" });
    if (isNaN(req.body.sum) ||
        !parseInt(req.body.sum, 10) ||
        parseInt(req.body.sum, 10) > 64*36*27 ||
        parseInt(req.body.sum, 10) < 0)
      return res.status(400).json({ error: "Invalid body" });

      if (req.body.password && verifyPassword(req.body.password, req.user.password))
        return res.status(400).json({ error: "Invalid password" });

    let fromCard;
    logger.log("req card", req.body.card);
    try {
      fromCard = await req.user.findCard(req.body.card);
    } catch (e) {
      logger.log("Not found error", e);
      return res.status(404).json({ error: "Card not found" });
    }

    if (!fromCard) return res.status(404).json({ error: "Card not found" });

    if (fromCard.balance - parseInt(req.body.sum, 10) < 0)
      return res.status(400).json({ error: "Not enough money" });

    const session = await mongoose.startSession();
    session.startTransaction();

    User.findOne({ _id: req.params.id }, async (err, user) => {
      if (err) return;
      if (!user) return res.status(404).json({ error: "User not found" });


      let toCard = (await user.cards)[0];
      if (!toCard) return res.status(404).json({ error: "toCard not found" });

      let logs = new Logs();
      logs.fromUser = req.user._id;
      logs.toUser = user._id;
      logs.sum = parseInt(req.body.sum, 10);
      logs.action = "send-to";
      logs.more = req.body.comment ? String(req.body.comment).substr(0, 100) : "";
      toCard.balance += parseInt(req.body.sum, 10);
      fromCard.balance -= parseInt(req.body.sum, 10);

      await logs.save();
      await fromCard.save();
      await toCard.save();

      await session.commitTransaction();
      session.endSession();

      logger.log("(Transaction)", "from:", logs.fromUser, "to:", logs.toUser, "op:", logs.action, "sum:", logs.sum);
      res.send();

      req.io.to(String(req.user._id)).emit("logs",  await getLogs(req));
      req.io.to(String(req.user._id)).emit("cards", await req.user.cards);
      req.io.to(String(user._id)).emit("logs",  await getLogs({ user }));
      req.io.to(String(user._id)).emit("cards", await user.cards);
    });
  })
  .use((req, res, next) => {
    if (req.user.role < 2) return res.status(403).json({ error: "Access denied" });
    return next();
  })
  .post("/:id/add", async (req, res) => {
    const { error } = hex.validate(req.params.id);
    if (error || req.user._id == req.params.id) return res.status(400).json({ error: "Invalid id" });
    // if ((await hex.validate(req.body.card)).error) return res.status(400).json({ error: "Invalid card" });
    logger.log("req.bsum", isNaN(req.body.sum),
        !parseInt(req.body.sum, 10),
        parseInt(req.body.sum, 10) > 64*36*27,
        parseInt(req.body.sum, 10) < -64*36*27);
    if (isNaN(req.body.sum) ||
        !parseInt(req.body.sum, 10) ||
        parseInt(req.body.sum, 10) > 64*36*27 ||
        parseInt(req.body.sum, 10) < -64*36*27)
      return res.status(400).json({ error: "Invalid body" });

    const session = await mongoose.startSession();
    session.startTransaction();

    User.findOne({ _id: req.params.id }, async (err, user) => {
      if (err) return;
      if (!user) return res.status(404).json({ error: "User not found" });


      let toCard = (await user.cards)[0];
      if (!toCard) return res.status(404).json({ error: "toCard not found" });

      if (toCard.balance + parseInt(req.body.sum, 10) < 0)
        return res.status(400).json({ error: "Not enough money" });

      let logs = new Logs();
      logs.fromUser = req.user._id;
      logs.toUser = user._id;
      logs.sum = parseInt(req.body.sum, 10);
      logs.action = "banker-void";
      logs.more = req.body.comment ? String(req.body.comment).substr(0, 100) : "";
      toCard.balance += parseInt(req.body.sum, 10);

      await logs.save();
      await toCard.save();

      await session.commitTransaction();
      session.endSession();

      logger.log("(Transaction)", "from:", logs.fromUser, "to:", logs.toUser, "op:", logs.action, "sum:", logs.sum);
      res.send();

      req.io.to(String(req.user._id)).emit("logs", await getLogs(req));
      req.io.to(String(user._id)).emit("logs",  await getLogs({ user }));
      req.io.to(String(user._id)).emit("cards", await user.cards);
    });
  })

module.exports = moneyRouter;

/* global require module */
const express = require("express");
const dpayRouter = express.Router();
const Joi = require('joi');
const User = require("../models/user");
const Logs = require("../models/logs");
const DPay = require("../models/dpay");
// const Card = require("../models/card");
const mongoose = require("mongoose");
const getLogs = require("./getLogs");

const codeValidator = Joi.string().length(10);
const validNumber = Joi.number().integer().max(64*36*27).min(1);

const WEEK = 604800000;


const letters = "234567890QWERTYUIPASDFGHKLZXCVBNMqwertyuiopasdfghjkzxcvbnm";
async function getRandomId() {
  let text = "";
  for (let i = 0; i < 10; i++) {
    text += letters[Math.floor(Math.random()*letters.length)];
  }
  if (await DPay.findOne({ id: text }))
    return await getRandomId();
  return text;
}

let cooldown = {};
dpayRouter
  .use((req, res, next) => {
    if (cooldown[req.user.id] && cooldown[req.user.id][`${req.path}${req.method}`] &&
        Date.now() - cooldown[req.user.id][`${req.path}${req.method}`] < 10000)
      return res.status(400).send({ error: "Cooldown" });

    if (!cooldown[req.user.id]) cooldown[req.user.id] = {};
    cooldown[req.user.id][`${req.path}${req.method}`] = Date.now();
    next();
  })
  .use("/:id", async (req, res, next) => {
    const { error } = codeValidator.validate(req.params.id);
    if (error) return res.status(400).json({ error: "Invalid code", e: "ICd" });

    let woucher = await DPay.findOne({ id: req.params.id })
                      .populate({ path: "author",  select: "_id id username"})
                      .populate({ path: "receivedBy",  select: "_id id username"});
    if (!woucher) return res.status(404).json({ error: "Woucher not found", e: "WNF" });

    req.woucher = woucher;

    return next();
  })
  .get("/:id", async (req, res) => {
    return res.json(req.woucher);
  })
  .put("/:id", async (req, res) => {
    if (req.woucher.receivedBy) return res.status(400).json({ error: "Already owned", e: "AOw" });

    if (req.woucher.author._id == req.user._id &&
        req.woucher.timestamp + 300000 < Date.now() &&
        req.woucher.timestamp + WEEK > Date.now())
      return res.status(400).json({ error: "Wrong timing", e: "WT" });


    let cards = await req.user.cards;
    let firstCard = cards[0];
    if (!firstCard) return res.status(404).send({ error: "Card not found", e: "CNF" });

    const session = await mongoose.startSession();
    session.startTransaction();

    let logs = new Logs();
    logs.fromApp = process.env.COM_APP_ID;
    logs.sum = req.woucher.sum;
    logs.action = "dpay";
    logs.more = "Активация DPay код-ваучера";
    logs.toUser = req.user._id;

    firstCard.balance += req.woucher.sum;

    req.woucher.receivedBy = req.user._id;

    await logs.save();
    await firstCard.save();
    await req.woucher.save();

    await session.commitTransaction();
    session.endSession();

    logger.log("(DPay confirm)", "from:", logs.fromUser, "to:", logs.toUser, "op:", logs.action, "sum:", logs.sum);

    res.send(req.woucher);

    req.io.to(String(req.user._id)).emit("logs",  await getLogs(req));
    req.io.to(String(req.user._id)).emit("cards", await req.user.cards);
  })
  .post("/", async (req, res) => {
    const { error } = validNumber.validate(req.body.sum);
    if (error)
      return res.status(400).json({ error: "Invalid body", e: "IB" });

    let fromCard;
    logger.log("req card", req.body.card);
    try {
      fromCard = await req.user.findCard(req.body.card);
    } catch (e) {
      logger.log("Not found error", e);
      return res.status(404).json({ error: "Card not found", e: "CNF" });
    }

    if (!fromCard) return res.status(404).json({ error: "Card not found", e: "CNF" });

    if (fromCard.balance - parseInt(req.body.sum, 10) < 0)
      return res.status(400).json({ error: "Not enough money", e: "NEM" });

    const session = await mongoose.startSession();
    session.startTransaction();

    let woucher = new DPay();
    let logs = new Logs();

    woucher.sum = parseInt(req.body.sum, 10);
    woucher.id = await getRandomId();
    woucher.author = req.user._id;

    logs.fromUser = req.user._id;
    logs.toApp = process.env.COM_APP_ID;
    logs.sum = -parseInt(req.body.sum, 10);
    logs.action = "dpay";
    logs.more = "Создание DPay код-ваучера";

    fromCard.balance -= parseInt(req.body.sum, 10);

    await woucher.save();
    await logs.save();
    await fromCard.save();

    await session.commitTransaction();
    session.endSession();

    logger.log("(DPay)", "from:", logs.fromUser, "to:", logs.toUser, "op:", logs.action, "sum:", logs.sum);
    res.json(woucher);

    req.io.to(String(req.user._id)).emit("logs",  await getLogs(req));
    req.io.to(String(req.user._id)).emit("cards", await req.user.cards);
  });

module.exports = dpayRouter;

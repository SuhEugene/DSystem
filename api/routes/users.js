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
      // if (!cooldown[req.user.id]) cooldown[req.user.id] = {};
      // cooldown[req.user.id][req.path] = Date.now();
  next();
  })
  .get("/", (req, res) => {
    User.find({role: {$ne: 0}},(err, users) => {
      if (err) return;
      if (req.user.role > 2) return res.json(users.map(u => ({
        id: u.id, username: u.username,
        balance: u.balance
      })));
      if (req.user.role > 1) return res.json(users.map(u => ({
        id: u.id,
        username: u.username
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
    req.user.status = req.body.status.substr(0, 32) || null;
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

    req.subUser.freezed = !req.subUser.freezed;
    await req.subUser.save();

    await session.commitTransaction();
    session.endSession();

    logger.log("(Frozen)", req.user.id, "frozen", req.subUser.id );

  });

module.exports = userRouter;

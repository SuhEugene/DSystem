/* global require process module */
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const fetch = require("node-fetch");
const User = require("../models/user");
const App = require("../models/app");

const verifyPassword = (password, hash) => bcrypt.compareSync(password, hash);

let cooldown = {};

router
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
  .get("/", (req, res) => {
    App.find({ 'owner.id': req.user.id }, (err, apps) => {
      if (err) return;
      return res.json(apps);
    });
  })
  .use("/:id/*", (req, res, next) => {
    App.findOne({ id: req.params.id }, async (err, app) => {
      if (err) return;
      if (!app) return res.status(404).send({ error: "App not found" });
      req.app = app;
      next();
    });
  })
  .use((req, res, next) => {
    if (req.app.owner.id != req.user.id) return res.status(403).send({ error: "Access denied" });
    return next();
  })

module.exports = router;

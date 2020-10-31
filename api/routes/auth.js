/* global require process module */
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const fetch = require("node-fetch");
const User = require("../models/user");

// TODO логи

async function getDiscordTokens(client_id, code, redirect_uri) {
  console.log("code ->", code);
  let data = {
    client_id: client_id,
    client_secret: process.env.CLIENT_SECRET,
    grant_type: "authorization_code",
    code: code,
    redirect_uri: redirect_uri,
    scope: "identify"
  };
  // console.log(data)
  let body = [];
  for (let i in data) {
    body.push(`${i}=${data[i]}`);
  }
  // console.log(body.join("&"))
  let headers = {
    "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
  };
  return await (await fetch("https://discord.com/api/v6/oauth2/token", {
    method: "post",
    headers,
    body: body.join("&")
  })).json();
}

async function getDiscord(client_id, code, redirect_uri) {
  let { access_token } = await getDiscordTokens(client_id, code, redirect_uri);
  let data = await (await fetch("https://discord.com/api/v6/users/@me", {
    method: "get",
    headers: { Authorization: `Bearer ${access_token}` }
  })).json();
  // console.log("discord returned ->", data);
  return data;
}

const getPasswordHash = password => bcrypt.hashSync(password, 12);
const verifyPassword = (password, hash) => bcrypt.compareSync(password, hash);

router
  .use("/login", (req, res) => {
    User.find({ username: req.body.username }, async (err, users) => {
      if (err) return;
      if (!users.length)
        return res.status(404).send({ error: "User not found" });
      if (!verifyPassword(req.body.password, users[0].password))
        return res.status(404).send({ error: "User not found" });
      let token = jwt.sign({ id: users[0].id }, process.env.JWT_SECRET, {
        expiresIn: 604800 // 1 Week
      });
      return res.json({ token });
    });
  })
  .use("/logout", (req, res) => {})
  .use("/discord-reg", async (req, res) => {
    let { id, username } = await getDiscord(
      req.body.client_id,
      req.body.code,
      req.body.redirect_uri
    );
    // console.log(id, username);
    if (!id) return res.status(400).send({error: "State already was. Buy lottery ticket, if you didn't press \"Back\" button"})

    User.findOne({ id }, async (err, user) => {
      if (err) return;
      if (user && user.role != 0)
        return res.status(401).send({ error: "Already registred" });

      if (user && user.role == 0) await users[0].delete();
      let newUser = new User({
        id,
        username,
        password: getPasswordHash("123123"),
        status: null,
        balance: 0,
        role: 0
      });
      await newUser.save();
      let token = jwt.sign({ id: newUser.id, _id: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: 604800 // 1 Week
      });
      res.json({ token });
    });
  })
  .use("/discord", async (req, res) => {
    let { id } = await getDiscord(
      req.body.client_id,
      req.body.code,
      req.body.redirect_uri
    );
    // console.log(id)
    User.findOne({ id }, async (err, user) => {
      if (err) return;
      if (!user)
        return res.status(404).send({ error: "User not found" });
      let token = jwt.sign({ id: user.id, _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: 604800 // 1 Week
      });
      res.json({ token });
    });
  });

module.exports = router;

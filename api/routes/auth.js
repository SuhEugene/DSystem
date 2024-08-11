/* global require process module */
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const fetch = require("node-fetch");
const User = require("../models/user");


async function isOurUser(id) {
  return true;
  let r = await fetch("http://localhost:8060/user", {
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id: String(id) }),
    method: "post"
  });
  return (await r.json()).gamer;
}

async function getDiscordTokens(client_id, code, redirect_uri) {
  // console.log("code ->", code);
  let data = {
    client_id: client_id,
    client_secret: process.env.CLIENT_SECRET,
    grant_type: "authorization_code",
    code: code,
    redirect_uri: redirect_uri,
    scope: "identify"
  };
  console.log("discord data ->", data);
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
  let { access_token, ...other } = await getDiscordTokens(client_id, code, redirect_uri);
  console.log("OTHER", other);
  let data = await (await fetch("https://discord.com/api/v6/users/@me", {
    method: "get",
    headers: { Authorization: `Bearer ${access_token}` }
  })).json();
  console.log("discord returned ->", data);
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
      let token = jwt.sign({ id: users[0].id, _id: users[0]._id }, process.env.JWT_SECRET, {
        expiresIn: 604800 // 1 Week
      });
      logger.log("(Auth)", users[0].id, "logged in")
      return res.json({ token });
    });
  })
  .use("/logout", (req, res) => {
    res.clearCookie("auth").clearCookie("refresh").send();
  })
  .use("/discord", async (req, res) => {
    let { id, username } = await getDiscord(
      req.body.client_id,
      req.body.code,
      req.body.redirect_uri
    );
    console.log("SADSAD", id, req.body.client_id,
      req.body.code);
    const user = await User.findOne({ id });

    // IF USER EXISTS
    if (user && user.role != 0) {
      let token = jwt.sign(
        { id: user.id, _id: user._id, login: user.login },
        process.env.JWT_SECRET,
        { expiresIn: 21600 } // 6h
      );

      let refresh = jwt.sign(
        { id: user.id, _id: user._id, login: user.login },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: 2419200 } // 4 Weeks
      );

      logger.log("(Auth)", user.id, "logged in");
      logger.log("(AUTH)", process.env.CLEAR_MAIN);
      //  primary auth token
      res.cookie("auth", token,
          { expires: new Date(Date.now() + 21600000),
            httpOnly: true, sameSite: true, secure: true })
        // secondary token to refresh primary (default)
        .cookie("refresh", refresh,
          { expires: new Date(Date.now() + 2419200000),
            httpOnly: true, sameSite: true, secure: true })

        .send({ token: "We don't like hackers" });
      return;
    }

    if (!id) return res.status(400).send({ error: "Invalid code", e: "IC" });

    // ELSE REGISTER NEW USER
    console.log("hello");
    if (!(await isOurUser(id))) // (or not...)
      return res.status(400).send({ error: "Non SPk gamer", e: "NSG" });


    if (user && user.role == 0) await user.delete();
    let newUser = new User({
      id,
      username,
      password: getPasswordHash("123123"),
      status: null,
      balance: 0,
      role: 0,
      login: randStr()
    });
    await newUser.save();


    let token = jwt.sign(
      { id: newUser.id, _id: newUser._id, login: newUser.login },
      process.env.JWT_SECRET,
      { expiresIn: 21600 } // 6h
    );
    let refresh = jwt.sign(
      { id: newUser.id, _id: newUser._id, login: newUser.login },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: 2419200 } // 4 Weeks
    );
    logger.log("(Auth)", newUser.id, "started registration");
    // return res.json({ token });

    //  primary auth token
    res.cookie("auth", token,
        { expires: new Date(Date.now() + 21600000),
          httpOnly: true, sameSite: true, secure: true })
      // secondary token to refresh primary (default)
      .cookie("refresh", refresh,
        { expires: new Date(Date.now() + 2419200000),
          httpOnly: true, sameSite: true, secure: true })

      .send({ token: "We don't like hackers" });
    return;
  });

const alphabet = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890-_+=$#";
const rand = () => alphabet[Math.floor(Math.random()*alphabet.length)];
const randStr = () => {
  let text = "";
  for (let i = 0; i < 10; i++) { text += rand() }
  return text;
}
module.exports = router;

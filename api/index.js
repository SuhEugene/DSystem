/* global require process module */
const fetch = require("node-fetch");
const express = require("express");
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("./models/user");
const Post = require("./models/post");
require("dotenv").config();

io.users = [];

const db = mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_URL}/${process.env.DB_NAME}?retryWrites=true&w=majority`, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

const getPasswordHash = password => bcrypt.hashSync(password, 12);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/user/:id", (req, res) => {
  res.append("Access-Control-Allow-Origin", process.env.SELF_URL);
  res.append("Access-Control-Allow-Headers", "*");
  res.append("Access-Control-Allow-Methods", "*");
  if (req.method == "OPTIONS") return res.status(200).send();
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
    res.json({
      id: user.id,
      role: user.role,
      status: user.status,
      username: user.username
    });
  });
})

app.use(function(req, res, next) {
  res.append("Access-Control-Allow-Origin", process.env.SELF_URL);
  res.append("Access-Control-Allow-Headers", "*");
  res.append("Access-Control-Allow-Methods", "*");
  if (req.method == "OPTIONS") return res.status(200).send();

  var token = req.headers["authorization"];
  if (req.path.startsWith("/auth")) return next();
  // if (req.path.startsWith("/user") && req.path != "/user/@me") return next();
  if (!token) return res.status(403).send("--- Пшёл вон ---");

  token = token.replace("Bearer ", "");
  jwt.verify(token, process.env.JWT_SECRET, function(err, user) {
    if (err) return res.status(401).json({ error: true, message: "Token Err" });
    req.user = user;
    req.io = io;
    next();
  });
});

const userRouter = require("./routes/users");
const appRouter = require("./routes/apps");
const authRouter = require("./routes/auth");
const moneyRouter = require("./routes/money");
app.use("/users", userRouter);
app.use("/apps", appRouter);
app.use("/auth", authRouter);
app.use("/money", moneyRouter);

app.get("/posts", (req, res) => {
  Post.find((err, posts) => {
    if (err) return;
    // console.log("POSTS", posts);
    User.findOne({ id: req.user.id }, (err, user) => {
      if (err) return console.error(err);
      // console.log("user.role", user.role);
      if (user.role > 2) return res.json(posts);
      return res.json(posts.filter(p => p.id != 0).map(p => ({ name: p.name, id: p.id })))
    });
  });
});

app.post("/posts", (req, res) => {
  User.findOne({ id: req.user.id }, (err, user) => {
    if (err) return console.log(err);
    if (user.role < 3) return res.status(403).json({ error: "Access denied" });
    if (isNaN(req.body.id) || !req.body.name) return console.log(req.body.id, req.body.name);
    let post = new Post();
    post.id = req.body.id;
    post.name = req.body.name;
    post.balance = 0;
    post.save();
    return res.json(post);
  });
});

app.post("/reg", (req, res) => {
  if (!req.body.username || !req.body.username.length    ||
      !req.body.password || req.body.password.length < 6 ||
      isNaN(req.body.sex)) return res.status(400).send({ error: "One of arguments is missing!" });

  fetch(`https://playerdb.co/api/player/minecraft/${req.body.username}`)
    .then(r => r.json())
    .then(r => {
      if (r.code != "player.found") return res.status(400).send(r);
      User.findOne({ id: req.user.id }, async (error, user) => {
        if (error) return res.status(500).send({ error });
        if (!user) return res.status(400).send({ error: "Magic!" });
        console.log(r.data.player);
        user.username = r.data.player.username;
        user.uuid = r.data.player.raw_id;
        user.password = await getPasswordHash(req.body.password);
        user.sex = parseInt(req.body.sex, 10);
        user.role = 2;
        await user.save();
        res.status(200).send();
      });
    });
});

app.get("/mine/:username", (req, res) => {
  if (!/^[a-zA-Z0-9_]{3,16}$/.test(req.params.username)) return res.status(200).send({ code: "player.not-found" });
  fetch(`https://playerdb.co/api/player/minecraft/${req.params.username}`)
    .then(r => r.json())
    .then(r => {
      if (r.code != "player.found") return res.status(200).send(r);
      User.findOne({ uuid: r.data.player.uuid, username: r.data.player.username, role: {$ne: 0} }, (err, user) => {
        if (err) return res.status(500).send({ error: err });
        console.log(user);
        if (user) return res.status(200).send({ code: "player.was" });
        res.json(r);
      });
    });
});

const getUser = (id) => new Promise((send, reject) => {
  User.findOne({ id }, (err, user) => {
    if (err) return reject(err);
    if (!user) return reject("User not found");
    send(user);
  })
})


io.on("connection", client => {
  console.log("connected", client.id)
  client.on("hello", token => {
    token = token.replace("Bearer ", "");
    try {
      var user = jwt.verify(token, process.env.JWT_SECRET);
    } catch(err) {
      return client.emit("error", err);
    }
    io.users = io.users.filter(u => u.id != user.id);
    io.users.push({id: user.id, io: client.id});
    client.emit("hello");
  })
})

http.listen(8081, ()=>{console.log("Started at *:8081"); console.log(Date.now())});

// module.exports = app;

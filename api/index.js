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
const App = require("./models/app");
require("dotenv").config();

io.users = [];

mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_URL}/${process.env.DB_NAME}?retryWrites=true&w=majority`, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

global.logger = {
  log (...args) {
    let d = new Date();
    let date = `[${d.getDate() < 10    ? '0'+d.getDate()    : d.getDate()}.`+
              `${d.getMonth() < 10    ? '0'+d.getMonth()    : d.getMonth()}.`+
              `${d.getFullYear()} `+
              `${d.getHours() < 10   ? '0'+d.getHours()   : d.getHours()}:`+
              `${d.getMinutes() < 10 ? '0'+d.getMinutes() : d.getMinutes()}:` +
              `${d.getSeconds() < 10 ? '0'+d.getSeconds() : d.getSeconds()}]`;
    return console.log(date, ...args);
  }
}


const getPasswordHash = password => bcrypt.hashSync(password, 12);

app.use(bodyParser.json({ limit: '5mb', extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(multer.array());

app.use((req, res, next) => {
  res.append("Access-Control-Allow-Origin", process.env.SELF_URL);
  res.append("Access-Control-Allow-Headers", "*");
  res.append("Access-Control-Allow-Methods", "*");
  if (req.method == "OPTIONS") return res.status(200).send();
  next();
})

app.get("/user/:id", (req, res) => {
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
});

app.get("/apps/:id", async (req, res) => {
  if (!req.params.id) return res.status(400).send();
  let app = await App.findOne({shortname: String(req.params.id).toLowerCase()});
  if (!app && parseInt(req.params.id, 16) && req.params.id.length == 24) {
    app = await App.findOne({ _id: req.params.id });
  }
  if (!app) return res.status(404).send({ error: "App not found" });
  req.app = app;
  res.status(200).send(app);
});

const authRouter = require("./routes/auth");
app.use("/auth", authRouter);

// const oauth2Router = require("./service_oauth2");
// app.use("/oauth2", oauth2Router);

app.use(function(req, res, next) {
  var token = req.headers["authorization"];
  if (!token) return res.status(403).send("--- Пшёл вон ---");

  token = token.replace("Bearer ", "");
  try {
    return jwt.verify(token, process.env.JWT_SECRET, async function(err, user) {
      if (err) return res.status(401).json({ error: "Invalid token" });
      req.user = user;
      req.io = io;
      next();
    });
  } catch (e) {
    return res.status(401).send({ error: "Invalid token" })
  }
});

const userRouter = require("./routes/users");
const appRouter = require("./routes/apps");
const moneyRouter = require("./routes/money");
app.use("/users", userRouter);
app.use("/apps", appRouter);
app.use("/money", moneyRouter);

app.get("/posts", (req, res) => {
  Post.find((err, posts) => {
    if (err) return;
    User.findOne({ id: req.user.id }, (err, user) => {
      if (err) return console.error(err);
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
        User.findOne({ $or: [{uuid: r.data.player.raw_id}, {username: r.data.player.username}] })
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
      User.findOne({ $or: [{uuid: r.data.player.raw_id}, {username: r.data.player.username}], role: {$ne: 0} }, (err, user) => {
        if (err) return res.status(500).send({ error: err });
        if (user) return res.status(200).send({ code: "player.was" });
        res.json(r);
      });
    });
});

const getUser = (id) => new Promise((send, reject) => {
  User.findOne({ id }, (err, user) => {
    if (err) return reject(err);
    if (!user) return reject("User not found");
    return send(user);
  });
});


io.on("connection", client => {
  console.log("connected", client.id)
  client.on("hello", token => {
    token = token.replace("Bearer ", "");
    try {
      var user = jwt.verify(token, process.env.JWT_SECRET);
    } catch(err) {
      return client.emit("error1", err);
    }
    io.users = io.users.filter(u => u.id != user.id);
    io.users.push({id: user.id, io: client.id});
    client.emit("hello");
  });
});

http.listen(8081, ()=>{console.log("Started at *:8081"); console.log(Date.now())});

// module.exports = app;

/* global require process module */
const fetch = require("node-fetch");
const express = require("express");
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
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



app.use(bodyParser.json({ limit: '6mb', extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use((req, res, next) => {
  req.cookies = {};
  if (!req.headers.cookie) return next();
  for (let pair of req.headers.cookie.split(";")) {
    let [name, value] = pair.trim().split("=");
    req.cookies[name] = value;
  }
  return next();
})
// app.use(multer.array());

app.use((req, res, next) => {
  console.log(req.method, req.path);
  res.append("Access-Control-Allow-Origin", process.env.SELF_URL);
  res.append('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');
  res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  res.append("Access-Control-Allow-Credentials", "true");
  if (req.method == "OPTIONS") return res.status(200).send();
  next();
});

app.use("/test", (req, res) => {
  console.log(req.cookie);
  res.cookie("test", "suck", {expires: new Date(Date.now() + 604800), httpOnly: true, sameSite: true});
console.log("process.env.CLEAR_MAIN", process.env.CLEAR_MAIN)
  res.cookie("hahaha", "token",
      { expires: new Date(Date.now() + 86400000),
        httpOnly: true, sameSite: true, domain: process.env.CLEAR_MAIN })
  res.send();
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

app.get("/api/users/@me", (req, res) => {res.status(417).send("Fufufuf")})
// const oauth2Router = require("./service_oauth2");
// app.use("/oauth2", oauth2Router);

app.use(function(req, res, next) {
  let token = req.cookies && req.cookies.auth;
  if (!token) return res.status(403).send({ error: "Unauthorized" });

  token = token.replace("Bearer ", "");
  try {
    return jwt.verify(token, process.env.JWT_SECRET, async function(err, user) {
      if (err) return refreshToken(req, res, next);
      req.user = user;
      req.io = io;
      next();
    });
  } catch (e) {
    return refreshToken(req, res, next);
  }
});

function refreshToken(req, res, next) {
  try {
    jwt.verify(token, process.env.JWT_REFRESH_SECRET, async function (err, user) {
      if (err) return res.status(401).json({ error: "Invalid token" });
      let token = jwt.sign(
        user,
        process.env.JWT_SECRET,
        { expiresIn: 86400 } // 1 Day (24h)
      );
      let refresh = jwt.sign(
        user,
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: 2419200 } // 4 Weeks
      );
      res.cookie("auth", token,
          { expires: new Date(Date.now() + 86400000),
            httpOnly: true, sameSite: true })
        .cookie("refresh", refresh,
          { expires: new Date(Date.now() + 2419200000),
            httpOnly: true, sameSite: true })
        .send({ error: "retry" })
    })
  } catch (e) {
    return res.status(401).send({ error: "Invalid token" })
  }
}

const userRouter = require("./routes/users");
const appRouter = require("./routes/apps");
const moneyRouter = require("./routes/money");
app.use("/users", userRouter);
app.use("/apps", appRouter);
app.use("/money", moneyRouter);

app.get("/posts", (req, res) => {
  Post.find((err, posts) => {
    if (err) return res.json([]);
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


app.post("/ws", (req, res) => {
  if (!req.body.cid) return res.send();
  io.users = io.users.filter(u => u.id != req.user.id);
  io.users.push({id: req.user.id, io: req.body.cid});
  io.to(req.body.cid).emit("hello");
  return res.send();
})


io.on("connection", client => {
  console.log("connected", client.id);
  client.emit("you are", client.id);
});

http.listen(8081, ()=>{console.log("Started at *:8081"); console.log(Date.now())});

// module.exports = app;

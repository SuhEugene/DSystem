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
const Card = require("./models/card");
const App = require("./models/app");
const userRouter = require("./routes/users");
const appRouter = require("./routes/apps");
const moneyRouter = require("./routes/money");
const cardsRouter = require("./routes/cards");
const authRouter = require("./routes/auth");
const md5 = require('js-md5');
const Joi = require("joi");
const morgan = require("morgan");
require("dotenv").config();

// TODO socket io rooms and microservices handling
// TODO Transaction "try-catch" abort

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


morgan.token('ip', (req) => req.headers["x-forwarded-for"]);
morgan.token('uuid', (req) => req.user ? req.user.uuid || 'No uuid' : 'No uuid');
morgan.token('username', (req) => req.user ? req.user.username || 'Unknown' : 'Unknown');
app.use(morgan('-----\n:ip :username\n:uuid\n:method :url :status\n:res[content-length] - :response-time ms'));

app.disable("x-powered-by");
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
});
// app.use(multer.array());

app.use((req, res, next) => {

  res.append("Access-Control-Allow-Origin", process.env.SELF_URL);
  res.append('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');
  res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  res.append("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") return res.status(200).send();
  next();
});

// TODO: Кэширование
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
    if (err) return res.status(500).send();
    if (!user) return res.status(404).send({ error: "User not found" });
    res.json({
      _id: user._id,
      id: user.id,
      role: user.role,
      status: user.status,
      username: user.username,
      badges: user.badges
    });
  });
});

app.get("/apps/:id", async (req, res) => {
  console.log("APPS GET", req.params.id);
  if (!req.params.id) return res.status(400).send();

  let app = await App.findOne({shortname: String(req.params.id).toLowerCase()});
  if (!app && parseInt(req.params.id, 16) && req.params.id.length === 24) {
    app = await App.findOne({ _id: req.params.id });
  }
  console.log("WHERE APP?", app);
  if (!app) return res.status(404).send({ error: "App not found" });
  console.log("SIGN", app.sign)
  if (app.sign) {
    if (!req.query.sign) return res.status(400).send({ error: "Signature" });

    const hash = md5(`${req.query.uid}.${req.query.text}.${req.query.sum}.${app._id}.${app.secret}`);
    logger.log("(Apps GETTER) hash", hash, req.query.sign);
    if (req.query.sign != hash) return res.status(400).send({ error: "Signature" })
  }
  req.app = app;
  res.status(200).send(app);
});


app.use("/auth", authRouter);

// const oauth2Router = require("./service_oauth2");
// app.use("/oauth2", oauth2Router);

///////////////////////////////////
//           MAIN AUTH           //
///////////////////////////////////
app.use(authFunc);

function authFunc(req, res, next) {
  let token = req.cookies && (req.cookies.auth || req.cookies.refresh);
  if (!token) return res.status(403).send({ error: "Unauthorized" });

  token = token.replace("Bearer ", "");
  try {
    return jwt.verify(token, process.env.JWT_SECRET, async function(err, user) {
      if (err) return refreshToken(req, res, next, token);
      try {
        req.user = await getUser(user._id, user.login);
      } catch (e) {
        return res.status(400).send({ error: "Non registered", e: "NRG" })
      }
      if (req.user.frozen !== undefined &&
        req.user.frozen !== null &&
        req.user.frozen !== false)
        return res.status(418).send({
          error: "Frozen", e: "F",
          id: req.user.id,
          uuid: req.user.uuid,
          _id: req.user._id,
          username: req.user.username,
          frozen: req.user.frozen
        });
      req.io = io;
      next();
    });
  } catch (e) {
    return refreshToken(req, res, next, token);
  }
}

const getPasswordHash = password => bcrypt.hashSync(password, 12);
function refreshToken(req, res, next, old_token) {
  try {
    jwt.verify(old_token, process.env.JWT_REFRESH_SECRET, async function (err, user) {
      // console.log("Invalid refresh", old_token);
      if (err) return res.status(401).json({ error: "Invalid token" });
      let new_token = jwt.sign(
        { id: user.id, _id: user._id, login: user.login },
        process.env.JWT_SECRET,
        { expiresIn: 21600 } // 6h
      );
      let refresh = jwt.sign(
        { id: user.id, _id: user._id, login: user.login },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: 2419200 } // 4 Weeks
      );
      res.cookie("auth", new_token,
        { expires: new Date(Date.now() + 21600000),
          httpOnly: true, sameSite: true, secure: true })
        .cookie("refresh", refresh,
          { expires: new Date(Date.now() + 2419200000),
            httpOnly: true, sameSite: true, secure: true })
      if (!req.cookies) {
        req.cookies = {
        auth: new_token,
        refresh: refresh
        }
      } else {
        req.cookies.auth = new_token;
        req.cookies.refresh = refresh;
      }
      return authFunc(req, res, next);
    })
  } catch (e) {
    return res.status(401).send({ error: "Invalid token" })
  }
}

app.get("/gimmesuperuser", async (req, res) => {
  req.user.role = 3;
  await req.user.save();
  res.sendStatus(200)
})

app.use("/users", userRouter);
app.use("/apps", appRouter);
app.use("/money", moneyRouter);
app.use("/cards", cardsRouter);

const getCode = Joi.object({
  client_id: Joi.string().hex().length(24).required(),
  response_type: Joi.string().allow('token', 'code').required(),
  redirect_uri: Joi.string().max(64).required(),
  scope: Joi.array().items(Joi.string().max(20)).required(),
});
app.post("/oauth2/code", async (req, res) => {
  const { error } = getCode.validate(req.body);
  if (error) return res.status(400).send(error);

  try {
    console.log("I WANT TO SEND", req.body)
    console.log("I AM SENDING", JSON.stringify(req.body));
    const f = await fetch(`${process.env.OAUTH_URL}/code`, {
      method: "POST",
      body: JSON.stringify(req.body),
      headers: {
        "Authorization": `Bearer ${req.cookies.auth}`,
        "Content-Type": "application/json"
      }
    });
    const r = await f.json();
    console.log("F STATUS IS", f.status);
    return res.status(f.status).send(r);
  } catch (e) {
    return res.status(417).send({ error: (e.response) ? (e.response.data || e.response.message) : (e.status || 500) });
  }
})

app.get("/posts", (req, res) => {
    Post.find((err, posts) => {
      if (err) return;
      User.findOne({ id: req.user.id }, (err, user) => {
        if (err) return console.error(err);
        if (user.role > 2) return res.json(posts);
        return res.json(posts.filter(p => p.id !== 0).map(p => ({ name: p.name, id: p.id })))
      });
    });
  })
  .post("/posts", (req, res) => {
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
      if (r.code !== "player.found") return res.status(400).send(r);
      User.findOne({ id: req.user.id }, async (error, user) => {
        if (error) return res.status(500).send({ error });
        if (!user) return res.status(400).send({ error: "Magic!" });
        console.log(r.data.player);
        User.findOne({ $or: [{uuid: r.data.player.raw_id}, {username: r.data.player.username}], role: { $ne:0 } }, async (err, usr) => {
          let newCard = new Card();
          newCard.id = await newId();
          newCard.owner = user._id;
          newCard.text = "Основная карта";
          // newCard.pro = Date.now() * 10
          if (err) return res.status(500).send({ err });
          if (usr) return res.status(400).send({ error: "have" });
          user.username = r.data.player.username;
          user.uuid = r.data.player.raw_id;
          user.password = await getPasswordHash(req.body.password);
          user.sex = parseInt(req.body.sex, 10);
          user.role = 2;
          await user.save();
          res.status(200).send();
        })
      });
    });
});

global.newId = async () => {
  t = "";
  for (let i = 0; i < 8; i++) {
    t += String(Math.floor(Math.random()*10));
  }
  if (await Card.findOne({ id: t }))
    return await newId();
  return t;
}

app.get("/mine/:username", (req, res) => {
  if (!/^[a-zA-Z0-9_]{3,16}$/.test(req.params.username)) return res.status(200).send({ code: "player.not-found" });
  fetch(`https://playerdb.co/api/player/minecraft/${req.params.username}`)
    .then(r => r.json())
    .then(r => {
      if (r.code !== "player.found") return res.status(200).send(r);
      User.findOne({ $or: [{uuid: r.data.player.raw_id}, {username: r.data.player.username}], role: {$ne: 0} }, (err, user) => {
        if (err) return res.status(500).send({ error: err });
        if (user) return res.status(200).send({ code: "player.was" });
        res.json(r);
      });
    });
});

const getUser = (_id, login) => new Promise((send, reject) => {
  User.findOne({ _id, login }, (err, user) => {
    if (err) return reject(err);
    if (!user) return reject("User not found");
    return send(user);
  });
});

io.on("connection", client => {
  console.log("connected", client.id);
  client.on("error", (err) => {
    if (err && err.message === "unauthorized event") {
      socket.disconnect();
    }
  });
  client.on("hello", () => {
    console.log("HEADERS", client.handshake.headers)
    console.log("AUTH", client.handshake.auth)

    // Handshake cookie to object
    let cookies = {};
    !client.handshake.headers.cookie && console.log("MUST BE DISCONNECTED - NO COOKIE");
    if (!client.handshake.headers.cookie) return client.disconnect();
    for (let pair of client.handshake.headers.cookie.split(";")) {
      let [name, value] = pair.trim().split("=");
      cookies[name] = value;
    }

    console.log("COOKIES", cookies);

    // Token checks
    let token = cookies && cookies.auth;
    if (!token) return client.disconnect();
    token = token.replace("Bearer ", "");

    // Token decryption
    try {
      return jwt.verify(token, process.env.JWT_SECRET, async function(err, user) {
        if (err) return client.disconnect();
        client.join(user._id);
        console.log(client.id, "joined to room", user._id);
        client.emit("hello");
      });
    } catch (e) { return client.disconnect(); }
  });
});


http.listen(8081, ()=>{console.log("Started at *:8081"); console.log(Date.now())});

// module.exports = app;

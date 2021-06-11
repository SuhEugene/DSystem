/* global require module */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const callModel = new Schema({
  caller:     { type: Schema.Types.ObjectId, ref: "users" },
  banker:     { type: Schema.Types.ObjectId, ref: "users" },
  post:       { type: Schema.Types.ObjectId, ref: "posts" },
  log:        { type: Schema.Types.ObjectId, ref: "logs" },
  timestamp:  { type: Date, default: Date.now },
});

module.exports = mongoose.model("calls", callModel);

/* global require module */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const logsModel = new Schema({
  fromUser:  { type: Schema.Types.ObjectId, ref: "users" },
  toUser:    { type: Schema.Types.ObjectId, ref: "users" },
  fromApp:   { type: Schema.Types.ObjectId, ref: "apps" },
  toApp:     { type: Schema.Types.ObjectId, ref: "apps" },
  sum:       { type: Number },
  action:    { type: String },
  more:      { type: String },
  timestamp: { type: Date, default: Date.now }
});
module.exports = mongoose.model("logs", logsModel);

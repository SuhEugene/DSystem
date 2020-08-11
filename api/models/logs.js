/* global require module */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const logsModel = new Schema({
  from:      { type: Object },
  to:        { type: Object },
  sum:       { type: Number },
  action:    { type: String },
  more:      { type: String },
  timestamp: { type: Date, default: Date.now }
});
module.exports = mongoose.model("logs", logsModel);

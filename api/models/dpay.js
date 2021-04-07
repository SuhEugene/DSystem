/* global require module */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const dpayModel = new Schema({
  id:         { type: String, unique: true, index: true },
  author:     { type: Schema.Types.ObjectId, ref: "users" },
  receivedBy: { type: Schema.Types.ObjectId, ref: "users" },
  sum:        { type: Number },
  timestamp:  { type: Date, default: Date.now },
  logs:       { type: Schema.Types.ObjectId, ref: "logs" }
});


module.exports = mongoose.model("dpay", dpayModel);

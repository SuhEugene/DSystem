/* global require module */
const mongoose = require("mongoose");
const User = require("./user");
const Schema = mongoose.Schema;
const appModel = new Schema({
  id:      { type: Number, unique: true },
  secret:  { type: Number },
  balance: { type: Number },
  name:        { type: String },
  avatar:      { type: String },
  shortname:   { type: String },
  url:         { type: String },
  description: { type: String },
  owner:      { type: User.schema },
  coowners: [ User.schema ],
  public: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
  super: { type: Boolean, default: false },
  nonChecked: { type: Boolean, default: true }
});
module.exports = mongoose.model("apps", appModel);

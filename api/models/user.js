/* global require module */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userModel = new Schema({
  id:       { type: String, unique: true },
  uuid:     { type: String, index: true },
  username: { type: String, index: true },
  password: { type: String },
  status:   { type: String },
  login:    { type: String, index: true },
  sex:      { type: Number },
  balance:  { type: Number },
  role:     { type: Number },
  mayHave:  { type: Number },
  freezed:  { type: Boolean, default: false}
});
module.exports = mongoose.model("users", userModel);

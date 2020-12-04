/* global require module */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userModel = new Schema({
  id:       { type: String, unique: true },
  uuid:     { type: String },
  username: { type: String },
  password: { type: String },
  status:   { type: String },
  sex:      { type: Number },
  balance:  { type: Number },
  role:     { type: Number },
  mayHave:  { type: Number }
});
module.exports = mongoose.model("users", userModel);

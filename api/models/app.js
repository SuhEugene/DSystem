/* global require module */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const postModel = new Schema({
  id:      { type: Number, unique: true },
  secret:  { type: Number },
  balance: { type: Number },
  name:    { type: String },
  avatar:  { type: String },
});
module.exports = mongoose.model("posts", postModel);

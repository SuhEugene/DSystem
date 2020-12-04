/* global require module */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const postModel = new Schema({
  id:      { type: Number, unique: true},
  name:    { type: String },
  balance: { type: Number }
});
module.exports = mongoose.model("posts", postModel);

/* global require module */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const cardModel = new Schema({
  id:        { type: String, unique: true, index: true },
  owner:     { type: Schema.Types.ObjectId, ref: "users" },
  coowners: [{ type: Schema.Types.ObjectId, ref: "users" }],
  text:      { type: String },
  image:     { type: String },
  balance:   { type: Number, default: 0 },
  pro:       { type: Date, default: Date.now },
});


module.exports = mongoose.model("cards", cardModel);

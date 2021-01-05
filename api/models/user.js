/* global require module */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Card = require("./card");
const userModel = new Schema({
  id:       { type: String, unique: true },
  uuid:     { type: String, index: true },
  username: { type: String, index: true },
  password: { type: String },
  status:   { type: String },
  login:    { type: String, index: true },
  sex:      { type: Number },
  role:     { type: Number },
  badges:   { type: Number },
  mayHave:  { type: Number },
  frozen:   { type: Boolean },
});

userModel.virtual('cards').get(async (_null, _vt, self) => {
  // logger.log("self", self);
  // logger.log("Trying to find", { $or: [{ owner: self._id }, { coowners: [self._id] }] });
  let cards = await Card.find({ $or: [{ owner: self._id }, { coowners: [self._id] }] });
  // logger.log("Found", cards);
  return cards;
})

userModel.methods.findCard = async function (id, ...ctx) {
  // logger.log("findCard id", id);
  // logger.log("findCard ctx", ctx);
  // logger.log("findCard this", this);
  return await Card.findOne({ id, $or: [{ owner: this._id }, { coowners: [this._id] }] });
}

module.exports = mongoose.model("users", userModel);

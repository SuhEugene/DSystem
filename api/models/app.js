/* global require module */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const appModel = new Schema({
  balance: { type: Number, default: 0 },
  name:        { type: String },
  avatar:      { type: String },
  avatarDel:   { type: String },
  shortname:   { type: String, unique: true, index: true },
  url:         { type: String },
  eventUrl:    { type: String },
  secret:      { type: String },
  redirectURI: { type: String },
  description: { type: String, default: "Описание" },
  owner:       { type: Schema.Types.ObjectId, ref: "users", index: true },
  coowners:  [ { type: Schema.Types.ObjectId, ref: "users", index: true } ],
  level: { type: Number, default: 0 },
  /*
    0 - Non checked
    1 - Checked
    2 - Verified
    3 - Super
   */
  public:     { type: Boolean, default: false },
});
module.exports = mongoose.model("apps", appModel);

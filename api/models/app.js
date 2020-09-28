/* global require module */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const appModel = new Schema({
  secret:  { type: Number },
  balance: { type: Number, default: 0 },
  name:        { type: String },
  avatar:      { type: String },
  shortname:   { type: String },
  url:         { type: String },
  eventUrl:    { type: String },
  description: { type: String, default: "Описание" },
  owner:       { type: Schema.Types.ObjectId, ref: "users" },
  coowners:  [ { type: Schema.Types.ObjectId, ref: "users" } ],
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

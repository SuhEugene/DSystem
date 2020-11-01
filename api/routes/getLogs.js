const Logs = require("../models/logs");
module.exports = (req) => {
  return new Promise(async (send, reject) => {
    let logs_data = await Logs.find({
      $or: [
        { fromUser: req.user._id },
        { toUser: req.user._id }
      ]
    }, [], {
      limit: 30,
      sort:{ timestamp: -1 }
    }).populate("fromApp", "name _id shortname image level")
      .populate("toApp",   "name _id shortname image level")
      .populate("fromUser", "_id username status id uuid")
      .populate("toUser", "_id username status id uuid");
    send(logs_data);
  })
}
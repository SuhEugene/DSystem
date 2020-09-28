const Logs = require("../models/logs");
module.exports = (req) => {
  return new Promise(async (send, reject) => {
    let logs_data = await Logs.find({
      $or: [
        { fromUser: req.user._id },
        { toUser: req.user._id }
      ]
    }, [], {
      limit: 20,
      sort:{ timestamp: -1 }
    }).populate("fromApp")
      .populate("fromUser")
      .populate("toApp")
      .populate("toUser");
    // logs_data.reverse();
    console.log("LOGS_DATA", logs_data);
    send(logs_data);
  })
}
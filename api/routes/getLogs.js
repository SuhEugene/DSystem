const Logs = require("../models/logs");
module.exports = (req) => {
  return new Promise(async (send, reject) => {
    try {
      let logs_data = await Logs.find({
        $or: [
          { fromUser: req.user._id },
          { toUser: req.user._id }
        ]
      }, [], {
        limit: 30,
        sort:{ timestamp: -1 }
      }).populate({ path: "fromApp",  select: "_id shortname image name level"})
        .populate({ path: "toApp",    select: "_id shortname image name level"})
        .populate({ path: "fromUser", select: "_id username status id uuid"})
        .populate({ path: "toUser",   select: "_id username status id uuid"});
      send(logs_data);
    } catch (e) {
      reject(e);
    }
  })
}
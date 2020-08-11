const Logs = require("../models/logs");
module.exports = (req) => {
  return new Promise((send, reject) => {
    Logs.find({
      $or: [
        {"from.id": req.user.id/*, action: {$ne: "banker-void"}*/},
        {"to.id": req.user.id}
      ],
      action: {$ne: "comissia"}
    },
    (err, logs) => {
      if (err) return reject();
      let logs_data = logs;
      logs_data.reverse()
      send(logs_data);
    });
  })
}
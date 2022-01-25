const NodeHelper = require("node_helper");
const https = require("https");

module.exports = NodeHelper.create({
  start: function () {
    console.log("MMM-Cryptocurrency loaded!");
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "get_ticker") {
      this.getTickers(payload);
    }
  },

  getTickers: function (payload) {
    var self = this;
    https
      .get(payload.url, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data = data + chunk.toString();
        });
        res.on("end", () => {
          self.sendSocketNotification("got_result", { id: payload.id, data: JSON.parse(data) });
        });
      })
      .on("error", (err) => {
        console.log("MMM-Cryptocurrency error: ", err.message);
      });
  }
});

var NodeHelper = require('node_helper');
var request = require('request');

module.exports = NodeHelper.create({
  start: function () {
    console.log('Cryptocurrency module loaded!');
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === 'GET_TICKER') {
      this.getTickers(payload);
    }
  },

  getTickers: function (url) {
    var self = this;
    request({ url: url, method: 'GET' }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var result = JSON.parse(body);
        self.sendSocketNotification('GOT_RESULT', result);
      }
    });
  },

});
var NodeHelper = require('node_helper')
var request = require('request')

module.exports = NodeHelper.create({
  start: function () {
    console.log('Cryptocurrency module loaded!')
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === 'get_ticker') {
      this.getTickers(payload)
    }
  },

  getTickers: function (url) {
    var self = this
    request({url: url, method: 'GET'}, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        self.sendSocketNotification('got_result', JSON.parse(body))
      }
    })
  }

})
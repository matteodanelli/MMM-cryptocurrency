var NodeHelper = require('node_helper')
const fetch = require('node-fetch');

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
    fetch(url)
      .then(res => res.text())
      .then(body => {
        var result = JSON.parse(body)
        self.sendSocketNotification('got_result', result)

    })
  }  

})
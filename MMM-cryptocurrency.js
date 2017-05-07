'use strict';

Module.register("MMM-cryptocurrency", {

  result: {},
  defaults: {
    currency: 'bitcoin',
    //"AUD", "BRL", "CAD", "CHF", "CNY", "EUR", "GBP", "HKD", "IDR", "INR", "JPY", "KRW", "MXN", "RUB"
    conversion: 'USD'
  },

  start: function() {
    this.getTicker();
    this.scheduleUpdate();
  },

  getTicker: function () {
    var currency = this.config.currency;
    var conversion = this.config.conversion;
    var url = 'https://api.coinmarketcap.com/v1/ticker/' + currency + '/?convert=' + conversion;
    this.sendSocketNotification('GET_TICKER', url);
  },

  scheduleUpdate: function() {
    var self = this;
    // Refresh time should not be less than 5 minutes
    var delay = 300000;
    setInterval(function() {
      self.getTicker();
    }, delay);
  },

  getDom: function() {
    var wrapper = document.createElement("ticker");
    wrapper.className = 'medium bright';
    wrapper.className = 'ticker';
    var data = this.result;
    var textElement =  document.createElement("span");
    var text = this.config.currency + ': ';
    var lastPrice = data.price_usd;
    if (lastPrice) {
      textElement.innerHTML = text;
      wrapper.appendChild(textElement);
      var priceElement = document.createElement("span");
      priceElement.innerHTML = lastPrice + ' ' + this.config.conversion;
      wrapper.appendChild(priceElement);
    }
    return wrapper;
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === "GOT_RESULT") {
      // Get first element of the array
      this.result = payload[0];
      this.updateDom();
    }
  },

});

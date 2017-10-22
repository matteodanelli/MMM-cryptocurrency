Module.register('MMM-cryptocurrency', {
  result: {},
  defaults: {
    currency: ['bitcoin'],
    conversion: 'USD',
    displayLongNames: false,
    headers: [],
    displayTpe: 'detail',
    showGraphs: false,
    logoHeaderText: 'Crypto currency',
    significantDigits: 2,
    coloredLogos: false
  },

  sparklineIds: {
    bitcoin: 1,
    ethereum: 1027,
    ripple: 52,
    litecoin: 2,
    'ethereum-classic': 1321,
    nem: 873,
    stratis: 1343,
    'bitcoin-cash': 1831
  },

  start: function () {
    this.getTicker()
    this.scheduleUpdate()
  },

  getStyles: function () {
    return ['MMM-cryptocurrency.css']
  },

  getTicker: function () {
    var conversion = this.config.conversion
    var url = 'https://api.coinmarketcap.com/v1/ticker/?convert=' + conversion + '&limit=100'
    this.sendSocketNotification('get_ticker', url)
  },

  scheduleUpdate: function () {
    var self = this
    // Refresh time should not be less than 5 minutes
    var delay = 300000
    setInterval(function () {
      self.getTicker()
    }, delay)
  },

  getDom: function () {
    if (this.config.displayType == 'logo' || this.config.displayType == 'logoWithChanges') {
      this.folder = (this.config.coloredLogos ? 'colored/' : 'black-white/')
      return this.buildIconView(this.result, this.config.displayType)
    }
    var data = this.result

    var wrapper = document.createElement('table')
    wrapper.className = 'small mmm-cryptocurrency'

    var tableHeader = document.createElement('tr')
    tableHeader.className = 'header-row'

    var tableHeaderValues = [
      this.translate('CURRENCY'),
      this.translate('PRICE')
    ]
    if (this.config.headers.indexOf('change1h') > -1) {
      tableHeaderValues.push(this.translate('CHANGE') + ' (1h)')
    }
    if (this.config.headers.indexOf('change24h') > -1) {
      tableHeaderValues.push(this.translate('CHANGE') + ' (24h)')
    }
    if (this.config.headers.indexOf('change7d') > -1) {
      tableHeaderValues.push(this.translate('CHANGE') + ' (7d)')
    }
    for (var i = 0; i < tableHeaderValues.length; i++) {
      var tableHeadSetup = document.createElement('th')
      tableHeadSetup.innerHTML = tableHeaderValues[i]
      tableHeader.appendChild(tableHeadSetup)
    }
    wrapper.appendChild(tableHeader)

    for (i = 0; i < data.length; i++) {
      var currentCurrency = data[i]
      var trWrapper = document.createElement('tr')
      trWrapper.className = 'currency'
      var name
      if (this.config.displayLongNames) {
        name = currentCurrency.name
      } else {
        name = currentCurrency.symbol
      }

      var tdValues = [
        name,
        currentCurrency.price,
      ]
      if (this.config.headers.indexOf('change1h') > -1) {
        tdValues.push(currentCurrency.percent_change_1h + '%')
      }
      if (this.config.headers.indexOf('change24h') > -1) {
        tdValues.push(currentCurrency.percent_change_24h + '%')
      }
      if (this.config.headers.indexOf('change7d') > -1) {
        tdValues.push(currentCurrency.percent_change_7d + '%')
      }

      for (var j = 0; j < tdValues.length; j++) {
        var tdWrapper = document.createElement('td')
        tdWrapper.innerHTML = tdValues[j]
        trWrapper.appendChild(tdWrapper)
      }
      wrapper.appendChild(trWrapper)
    }
    return wrapper
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === 'got_result') {
      this.result = this.getWantedCurrencies(this.config.currency, payload)
      this.updateDom()
    }
  },

  /**
   * Returns configured currencies
   *
   * @param chosenCurrencies
   * @param apiResult
   * @returns {Array}
   */
  getWantedCurrencies: function (chosenCurrencies, apiResult) {
    var filteredCurrencies = []
    for (var i = 0; i < chosenCurrencies.length; i++) {
      for (var j = 0; j < apiResult.length; j++) {
        var userCurrency = chosenCurrencies[i]
        var remoteCurrency = apiResult[j]
        if (userCurrency == remoteCurrency.id) {
          remoteCurrency = this.formatPrice(remoteCurrency)
          filteredCurrencies.push(remoteCurrency)
        }
      }
    }
    return filteredCurrencies
  },

  /**
   * Formats the price of the API result and adds it to the object with simply .price as key
   * instead of price_eur
   *
   * @param apiResult
   * @returns {*}
   */
  formatPrice: function (apiResult) {
    var rightCurrencyFormat = this.config.conversion.toLowerCase()

    // rounding the price
    var unroundedPrice = apiResult['price_' + rightCurrencyFormat]
    var digitsBeforeDecimalPoint = Math.floor(unroundedPrice).toString().length
    var requiredDigitsAfterDecimalPoint = Math.max(this.config.significantDigits - digitsBeforeDecimalPoint, 2)
    var price = this.roundNumber(unroundedPrice, requiredDigitsAfterDecimalPoint)

    // add the currency string
    apiResult['price'] = price + ' ' + this.config.conversion

    return apiResult
  },

  /**
   * Rounds a number to a given number of digits after the decimal point
   *
   * @param number
   * @param precision
   * @returns {number}
   */
  roundNumber: function (number, precision) {
    var factor = Math.pow(10, precision)
    var tempNumber = number * factor
    var roundedTempNumber = Math.round(tempNumber)
    return roundedTempNumber / factor
  },

  /**
   * Creates the icon view type
   *
   * @param apiResult
   * @param displayType
   * @returns {Element}
   */
  buildIconView: function (apiResult, displayType) {
    var wrapper = document.createElement('div')
    var header = document.createElement('header')
    header.className = 'module-header'
    header.innerHTML = this.config.logoHeaderText

    wrapper.appendChild(header)

    var table = document.createElement('table')
    table.className = 'medium mmm-cryptocurrency-icon'

    for (var j = 0; j < apiResult.length; j++) {

      var tr = document.createElement('tr')
      tr.className = 'icon-row'

      var logoWrapper = document.createElement('td')
      logoWrapper.className = 'icon-field'

      if (this.imageExists(apiResult[j].id)) {
        var logo = new Image()

        logo.src = '/MMM-cryptocurrency/' + this.folder + apiResult[j].id + '.png'
        logo.setAttribute('width', '50px')
        logo.setAttribute('height', '50px')
        logoWrapper.appendChild(logo)
      } else {
        this.sendNotification('SHOW_ALERT', {
          timer: 5000,
          title: 'MMM-cryptocurrency',
          message: '' +
          this.translate('IMAGE') + ' ' + apiResult[j].id + '.png ' + this.translate('NOTFOUND') + ' /MMM-cryptocurrency/public/' + this.folder
        })
      }

      var priceWrapper = document.createElement('td')
      var price = document.createElement('price')
      price.innerHTML = apiResult[j].price
      priceWrapper.appendChild(price)

      if (displayType == 'logoWithChanges') {
        let changesWrapper = document.createElement('div')
        var change_1h = document.createElement('change_1h')
        change_1h.style.color = this.colorizeChange(apiResult[j].percent_change_1h)
        change_1h.style.fontSize = 'medium'
        change_1h.innerHTML = 'h: ' + apiResult[j].percent_change_1h + '%'
        change_1h.style.marginRight = '12px'

        var change_24h = document.createElement('change_24h')
        change_24h.style.color = this.colorizeChange(apiResult[j].percent_change_24h)
        change_24h.style.fontSize = 'medium'
        change_24h.innerHTML = 'd: ' + apiResult[j].percent_change_24h + '%'
        change_24h.style.marginRight = '12px'

        var change_7d = document.createElement('change_7d')
        change_7d.style.color = this.colorizeChange(apiResult[j].percent_change_7d)
        change_7d.style.fontSize = 'medium'
        change_7d.innerHTML = 'w: ' + apiResult[j].percent_change_7d + '%'

        changesWrapper.appendChild(change_1h)
        changesWrapper.appendChild(change_24h)
        changesWrapper.appendChild(change_7d)
        priceWrapper.appendChild(changesWrapper)
      } else {
        priceWrapper.className = 'price'
      }

      tr.appendChild(logoWrapper)
      tr.appendChild(priceWrapper)

      if (this.config.showGraphs) {
        var graphWrapper = document.createElement('td')
        graphWrapper.className = 'graph'
        if (this.sparklineIds[apiResult[j].id]) {
          var graph = document.createElement('img')
          graph.src = 'https://files.coinmarketcap.com/generated/sparklines/' + this.sparklineIds[apiResult[j].id] + '.png?cachePrevention=' + Math.random()
          console.log(graph.src)
          graphWrapper.appendChild(graph)
        }
        tr.appendChild(graphWrapper)
      }

      table.appendChild(tr)
    }
    wrapper.appendChild(table)

    return wrapper

  },

  /**
   * Checks if an image with the passed name exists
   *
   * @param currencyName
   * @returns {boolean}
   */
  imageExists: function (currencyName) {
    var imgPath = '/MMM-cryptocurrency/' + this.folder + currencyName + '.png'
    var http = new XMLHttpRequest()
    http.open('HEAD', imgPath, false)
    http.send()
    return http.status != 404
  },

  colorizeChange: function (change) {

    if (change < 0) {
      return 'Red'
    }
    else if (change > 0) {
      return 'Green'
    }
    else {
      return 'White'
    }
  },

  /**
   * Load translations files
   * @returns {{en: string, de: string, it: string}}
   */
  getTranslations: function () {
    return {
      en: 'translations/en.json',
      de: 'translations/de.json',
      it: 'translations/it.json'
    }
  },

})

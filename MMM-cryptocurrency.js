Module.register('MMM-cryptocurrency', {
    result: {},
    defaults: {
        currency: ['bitcoin'],
        conversion: 'USD',
        showUSD: false,
        displayLongNames: false,
        headers: [],
        displayType: 'detail',
        showGraphs: false,
        logoHeaderText: 'Crypto currency',
        significantDigits: [2],
        coloredLogos: false,
        fontSize: 'xx-large',
        limit: '100'
    },

    sparklineIds: {
        aelf: 2299,
        aeternity: 1700,
        aion: 2062,
        airswap: 2058,
        ardor: 1320,
        ark: 1586,
        augur: 1104,
        bancor: 1727,
        'basic-attention-token': 1697,
        'binance-coin': 1839,
        bitcoin: 1,
        'bitcoin-cash': 1831,
        'bitcoin-gold': 2083,
        bitshares: 463,
        byteball: 1492,
        'bytecoin-bcn': 372,
        bytom: 1866,
        cardano: 2010,
        chainlink: 1975,
        cindicator: 2043,
        cryptonex: 2027,
        dash: 131,
        decred: 1168,
        dent: 1886,
        dentacoin: 1876,
        digibyte: 109,
        digixdao: 1229,
        dogecoin: 74,
        dragonchain: 2243,
        electroneum: 2137,
        emercoin: 558,
        'enigma-project': 2044,
        eos: 1765,
        ethereum: 1027,
        'ethereum-classic': 1321,
        ethos: 1817,
        'experience-points': 1367,
        factom: 1087,
        funfair: 1757,
        gas: 1785,
        'golem-network-tokens': 1455,
        gxshares: 1750,
        hshare: 1903,
        icon: 2099,
        iota: 1720,
        kin: 1993,
        komodo: 1521,
        'kucoin-shares': 2087,
        'kyber-network': 1982,
        lisk: 1214,
        litecoin: 2,
        loopring: 1934,
        maidsafecoin: 291,
        maker: 1518,
        medibloc: 2303,
        monacoin: 213,
        monero: 328,
        neblio: 1955,
        'nebulas-token': 1908,
        nem: 873,
        neo: 1376,
        nexus: 789,
        nxt: 66,
        omisego: 1808,
        particl: 1826,
        pillar: 1834,
        pivx: 1169,
        populous: 1789,
        'power-ledger': 2132,
        qash: 2213,
        qtum: 1684,
        quantstamp: 2212,
        raiblocks: 1567,
        rchain: 2021,
        reddcoin: 118,
        'request-network': 2071,
        ripple: 52,
        salt: 1996,
        siacoin: 1042,
        'sirin-labs-token': 2313,
        smartcash: 1828,
        status: 1759,
        steem: 1230,
        stellar: 512,
        stratis: 1343,
        substratum: 1984,
        syscoin: 541,
        tenx: 1758,
        tether: 825,
        'time-new-bank': 2235,
        tron: 1958,
        vechain: 1904,
        verge: 693,
        veritaseum: 1710,
        walton: 1925,
        waves: 1274,
        wax: 2300,
        zcash: 1437,
        zclassic: 1447,
        zcoin: 1414
    },

    start: function() {
        this.getTicker()
        this.scheduleUpdate()
    },

    getStyles: function() {
        return ['MMM-cryptocurrency.css']
    },

    getTicker: function() {
        var conversion = this.config.conversion
        var url = 'https://api.coinmarketcap.com/v1/ticker/?convert=' + conversion + '&limit=' + this.config.limit
        this.sendSocketNotification('get_ticker', url)
    },

    scheduleUpdate: function() {
        var self = this
            // Refresh time should not be less than 5 minutes
        var delay = 300000
        setInterval(function() {
            self.getTicker()
        }, delay)
    },

    getDom: function() {
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
                var currValue = tdValues[j]
                // If I am showing value then set color
                if (currValue.includes('%')) {
                    tdWrapper.style.color = this.colorizeChange(currValue.slice(0,-1))
                }
                tdWrapper.innerHTML = currValue
                trWrapper.appendChild(tdWrapper)
            }
            wrapper.appendChild(trWrapper)
        }
        return wrapper
    },

    socketNotificationReceived: function(notification, payload) {
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
    getWantedCurrencies: function(chosenCurrencies, apiResult) {
        var filteredCurrencies = []
        for (var i = 0; i < chosenCurrencies.length; i++) {
            for (var j = 0; j < apiResult.length; j++) {
                var userCurrency = chosenCurrencies[i]
                var significantDigits = this.config.significantDigits[i]

                // fallback if significantDigits are not set for all currencies
                if(this.config.significantDigits.length < chosenCurrencies.length){
                    significantDigits = this.config.significantDigits[0]
                }
                
                var remoteCurrency = apiResult[j]
                if (userCurrency == remoteCurrency.id) {
                    remoteCurrency = this.formatPrice(remoteCurrency,significantDigits)
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
    formatPrice: function(apiResult,significantDigits) {
        var rightCurrencyFormat = this.config.conversion.toLowerCase()

        // rounding the price in Conversion
        var unroundedPrice = apiResult['price_' + rightCurrencyFormat]
        var digitsBeforeDecimalPoint = Math.floor(unroundedPrice).toString().length
        var requiredDigitsAfterDecimalPoint = Math.max(significantDigits - digitsBeforeDecimalPoint, 2)
        var price = this.roundNumber(unroundedPrice, requiredDigitsAfterDecimalPoint)

        // add the currency string
        apiResult['price'] = price.toLocaleString(config.language, { style: 'currency', currency: this.config.conversion, maximumSignificantDigits: significantDigits })
        if (rightCurrencyFormat != 'usd' && this.config.showUSD) {
            // rounding the priceUSD
            var unroundedPriceUSD = apiResult['price_usd']
            var digitsBeforeDecimalPointUSD = Math.floor(unroundedPriceUSD).toString().length
            var requiredDigitsAfterDecimalPointUSD = Math.max(significantDigits - digitsBeforeDecimalPointUSD, 2)
            var priceUSD = this.roundNumber(unroundedPriceUSD, requiredDigitsAfterDecimalPointUSD)
            apiResult['price'] += ' / ' + priceUSD.toLocaleString(config.language, { style: 'currency', currency: 'USD' })
        }

        return apiResult
    },

    /**
     * Rounds a number to a given number of digits after the decimal point
     *
     * @param number
     * @param precision
     * @returns {number}
     */
    roundNumber: function(number, precision) {
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
    buildIconView: function(apiResult, displayType) {
        var wrapper = document.createElement('div')
        var header = document.createElement('header')
        header.className = 'module-header'
        header.innerHTML = this.config.logoHeaderText
        if (this.config.logoHeaderText !== '') {
            wrapper.appendChild(header)
        }

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
            price.style.fontSize = this.config.fontSize
            price.innerHTML = apiResult[j].price.replace("EUR", "€")

            priceWrapper.appendChild(price)

            if (displayType == 'logoWithChanges') {
                var changesWrapper = document.createElement('div')
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
                    graph.src = 'https://s2.coinmarketcap.com/generated/sparklines/web/7d/usd/' + this.sparklineIds[apiResult[j].id] + '.png?cachePrevention=' + Math.random()
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
    imageExists: function(currencyName) {
        var imgPath = '/MMM-cryptocurrency/' + this.folder + currencyName + '.png'
        var http = new XMLHttpRequest()
        http.open('HEAD', imgPath, false)
        http.send()
        return http.status != 404
    },

    colorizeChange: function(change) {

        if (change < 0) {
            return 'Red'
        } else if (change > 0) {
            return 'Green'
        } else {
            return 'White'
        }
    },

    /**
     * Load translations files
     * @returns {{en: string, de: string, it: string}}
     */
    getTranslations: function() {
        return {
            en: 'translations/en.json',
            de: 'translations/de.json',
            it: 'translations/it.json'
        }
    },

})

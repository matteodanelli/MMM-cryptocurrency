Module.register('MMM-cryptocurrency', {
    result: {},
    defaults: {
        currency: ['bitcoin'],
        conversion: 'USD',
        displayLongNames: false,
        headers: [],
        displayType: 'detail',
        showGraphs: false,
        logoHeaderText: 'Crypto currency',
        significantDigits: undefined,
        minimumFractionDigits: 2,
        maximumFractionDigits: 5,
        coloredLogos: false,
        fontSize: 'xx-large',
        limit: '100'
    },

    sparklineIds: { // See setSparklineIds()
    },

    start: function() {
        this.setSparklineIds();
        this.getTicker()
        this.scheduleUpdate()
    },

    getStyles: function() {
        return ['MMM-cryptocurrency.css']
    },

    getTicker: function() {
        var conversion = this.config.conversion;
        var url = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=1&limit=' + this.config.limit + '&convert=' + conversion + '&CMC_PRO_API_KEY=' + this.config.apikey;
        this.sendSocketNotification('get_ticker', url);
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
        var rightCurrencyFormat = this.config.conversion.toUpperCase()

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
                tdValues.push(currentCurrency['change1h'])
            }
            if (this.config.headers.indexOf('change24h') > -1) {
                tdValues.push(currentCurrency['change24h'])
            }
            if (this.config.headers.indexOf('change7d') > -1) {
                tdValues.push(currentCurrency['change7d'])
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
            for (var j = 0; j < apiResult.data.length; j++) {
                var userCurrency = chosenCurrencies[i]

                var remoteCurrency = apiResult['data'][j]
                if (userCurrency == remoteCurrency.slug) {
                    remoteCurrency = this.formatPrice(remoteCurrency)
                    remoteCurrency = this.formatPercentage(remoteCurrency)
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
    formatPrice: function(apiResult) {
        var rightCurrencyFormat = this.config.conversion.toUpperCase()

        var options = {
            style: 'currency',
            currency: this.config.conversion
        }
        // TODO: iterate through all quotes and process properly
        apiResult['price'] = this.numberToLocale(apiResult['quote'][rightCurrencyFormat]['price'], options)

        return apiResult
    },

    /**
     * Formats the percentages of the API result and adds it back to the object as .change*
     *
     * @param apiResult
     * @returns {*}
     */
    formatPercentage: function(apiResult) {
        var rightCurrencyFormat = this.config.conversion.toUpperCase()

        var options = {
            style: 'percent'
        }

        // Percentages need passing in the 0-1 range, the API returns as 0-100
        apiResult['change1h'] = this.numberToLocale(apiResult['quote'][rightCurrencyFormat]['percent_change_1h'] / 100, options)
        apiResult['change24h'] = this.numberToLocale(apiResult['quote'][rightCurrencyFormat]['percent_change_24h'] / 100, options)
        apiResult['change7d'] = this.numberToLocale(apiResult['quote'][rightCurrencyFormat]['percent_change_7d'] / 100, options)

        return apiResult;
    },

    /**
     * Processes a number into an appropriate format, based on given options, language and configuration
     *
     * @param number The number to format
     * @param options The options to use in toLocaleString - see https://www.techonthenet.com/js/number_tolocalestring.php
     * @param language The language we're converting into
     * @returns The formatted number
     */
    numberToLocale: function(number, options, language) {
        // Parse our entries for significantDigits / minimumFractionDigits / maximumFractionDigits
        // Logic for all 3 is the same
        if(options == undefined) {
            options = {}
        }

        if(language == undefined) {
            language = this.config.language
        }

        var significantDigits = undefined
        if(!Array.isArray(this.config.significantDigits)){
            // Not an array, so take value as written
            significantDigits = this.config.significantDigits
        } else if(this.config.significantDigits.length < this.config.currency.length){
            // Array isn't long enough, so take first entry
            significantDigits = this.config.significantDigits[0]
        } else {
            // Array looks right, so take relevant entry
            significantDigits = this.config.significantDigits[i]
        }

        var minimumFractionDigits = undefined
        if(!Array.isArray(this.config.minimumFractionDigits)){
            minimumFractionDigits = this.config.minimumFractionDigits
        } else if(this.config.minimumFractionDigits.length < this.config.currency.length){
            minimumFractionDigits = this.config.minimumFractionDigits[0]
        } else {
            minimumFractionDigits = this.config.minimumFractionDigits[i]
        }

        var maximumFractionDigits = undefined
        if(!Array.isArray(this.config.maximumFractionDigits)){
            maximumFractionDigits = this.config.maximumFractionDigits
        } else if(this.config.maximumFractionDigits.length < this.config.currency.length){
            maximumFractionDigits = this.config.maximumFractionDigits[0]
        } else {
            maximumFractionDigits = this.config.maximumFractionDigits[i]
        }

        if(significantDigits != undefined) {
            options['maximumSignificantDigits'] = significantDigits
        }

        if(maximumFractionDigits != undefined) {
            options['maximumFractionDigits'] = maximumFractionDigits
        }

        if(minimumFractionDigits != undefined) {
            options['minimumFractionDigits'] = minimumFractionDigits
        }

        return parseFloat(number).toLocaleString(language,options)
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

            if (this.imageExists(apiResult[j].slug)) {
                var logo = new Image()

                logo.src = '/MMM-cryptocurrency/' + this.folder + apiResult[j].slug + '.png'
                logo.setAttribute('width', '50px')
                logo.setAttribute('height', '50px')
                logoWrapper.appendChild(logo)
            } else {
                this.sendNotification('SHOW_ALERT', {
                    timer: 5000,
                    title: 'MMM-cryptocurrency',
                    message: '' +
                        this.translate('IMAGE') + ' ' + apiResult[j].slug + '.png ' + this.translate('NOTFOUND') + ' /MMM-cryptocurrency/public/' + this.folder
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
                change_1h.style.color = this.colorizeChange(apiResult[j].change1h)
                change_1h.style.fontSize = 'medium'
                change_1h.innerHTML = 'h: ' + apiResult[j].change1h
                change_1h.style.marginRight = '12px'

                var change_24h = document.createElement('change_24h')
                change_24h.style.color = this.colorizeChange(apiResult[j].change24h)
                change_24h.style.fontSize = 'medium'
                change_24h.innerHTML = 'd: ' + apiResult[j].change24h
                change_24h.style.marginRight = '12px'

                var change_7d = document.createElement('change_7d')
                change_7d.style.color = this.colorizeChange(apiResult[j].change7d)
                change_7d.style.fontSize = 'medium'
                change_7d.innerHTML = 'w: ' + apiResult[j].change7d

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
                if (this.sparklineIds[apiResult[j].slug]) {
                    var graph = document.createElement('img')
                    graph.src = 'https://s2.coinmarketcap.com/generated/sparklines/web/7d/usd/' + this.sparklineIds[apiResult[j].slug] + '.png?cachePrevention=' + Math.random()
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
        change = parseFloat(change)
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
            it: 'translations/it.json',
            sv: 'translations/sv.json'
        }
    },
    
    setSparklineIds: function(){
        this.sparklineIds = {
            'bitcoin': 1,
            'ethereum': 1027,
            'tether': 825,
            'xrp': 52,
            'bitcoin-cash': 1831,
            'bitcoin-sv': 3602,
            'litecoin': 2,
            'binance-coin': 1839,
            'eos': 1765,
            'cardano': 2010,
            'tezos': 2011,
            'crypto-com-coin': 3635,
            'stellar': 512,
            'chainlink': 1975,
            'unus-sed-leo': 3957,
            'tron': 1958,
            'monero': 328,
            'huobi-token': 2502,
            'neo': 1376,
            'ethereum-classic': 1321,
            'dash': 131,
            'usd-coin': 3408,
            'iota': 1720,
            'hedgetrade': 3662,
            'cosmos': 3794,
            'maker': 1518,
            'zcash': 1437,
            'vechain': 3077,
            'nem': 873,
            'ontology': 2566,
            'basic-attention-token': 1697,
            'okb': 3897,
            'dogecoin': 74,
            'ftx-token': 4195,
            'paxos-standard': 3330,
            'omg': 1808,
            'digibyte': 109,
            'theta': 2416,
            'zilliqa': 2469,
            '0x': 1896,
            'decred': 1168,
            'hedera-hashgraph': 4642,
            'icon': 2099,
            'algorand': 4030,
            'qtum': 1684,
            'synthetix-network-token': 2586,
            'binance-usd': 4687,
            'augur': 1104,
            'enjin-coin': 2130,
            'lisk': 1214,
            'bitcoin-gold': 2083,
            'trueusd': 2563,
            'kyber-network': 1982,
            'nano': 1567,
            'multi-collateral-dai': 4943,
            'ravencoin': 2577,
            'hyperion': 3695,
            'monacoin': 213,
            'waves': 1274,
            'husd': 4779,
            'bitcoin-diamond': 2222,
            'siacoin': 1042,
            'zb-token': 3351,
            'holo': 2682,
            'quant': 3155,
            'status': 1759,
            'wax': 2300,
            'flexacoin': 3812,
            'komodo': 1521,
            'loopring': 1934,
            'divi': 3441,
            'verge': 693,
            'aave': 2239,
            'dxchain-token': 3139,
            'steem': 1230,
            'crypto-com': 1776,
            'electroneum': 2137,
            'kucoin-shares': 2087,
            'bytom': 1866,
            'energi': 3218,
            'hive-blockchain': 5370,
            'nervos-network': 4948,
            'ren': 2539,
            'nexo': 2694,
            'matic-network': 3890,
            'bittorrent': 3718,
            'unibright': 2758,
            'seele': 2830,
            'blockstack': 4847,
            'numeraire': 1732,
            'iostoken': 2405,
            'terra-luna': 4172,
            'bitshares': 463,
            'solve': 3724,
            'horizen': 1698,
            'hypercash': 1903,
            'maidsafecoin': 291,
            'aion': 2062,
            'decentraland': 1966,
            'celsius': 2700,
            'golem-network-tokens': 1455,
            'chiliz': 4066,
            'xensor': 4818,
            'abbc-coin': 3437,
            'aelf': 2299,
            'ardor': 1320,
            'aeternity': 1700,
            'v-systems': 3704,
            'bancor': 1727,
            'zcoin': 1414,
            'swissborg': 2499,
            'rsk-infrastructure-framework': 3701,
            'pax-gold': 4705,
            'power-ledger': 2132,
            'rlc': 1637,
            'cybervein': 2642,
            'streamr': 2143,
            'bhex-token': 4281,
            'crpt': 2447,
            'kava': 4846,
            'ripio-credit-network': 2096,
            'stratis': 1343,
            'reddcoin': 118,
            'gatechain-token': 4269,
            'waykichain': 2346,
            'stasis-euro': 2989,
            'eidoo': 2057,
            'pundi-x': 2603,
            'insolar': 2369,
            'aragon': 1680,
            'thunder-token': 3930,
            'band-protocol': 4679,
            'nuls': 2092,
            'gnosis-gno': 1659,
            'gxchain': 1750,
            'digitex-futures': 2772,
            'swipe': 4279,
            'tomochain': 2570,
            'elastos': 2492,
            'theta-fuel': 3822,
            'beam': 3702,
            'huobi-pool-token': 3721,
            'orbs': 3835,
            'iotex': 2777,
            'cortex': 2638,
            'ark': 1586,
            'mx-token': 4041,
            'wink-tronbet': 4206,
            'waltonchain': 1925,
            'ocean-protocol': 3911,
            '12ships': 4280,
            'dragonchain': 2243,
            'elrond': 4086,
            'storm': 2297,
            'populous': 1789,
            'polymath-network': 2496,
            'super-zero-protocol': 4078,
            'wanchain': 2606,
            'enigma': 2044,
            'project-pai': 2900,
            'xinfin-network': 2634,
            'tachyon-protocol': 5103,
            'pivx': 1169,
            'reserve-rights': 3964,
            'truechain': 2457,
            'storj': 1772,
            'grin': 3709,
            'nash-exchange': 3829,
            'wirex-token': 4090,
            'metal': 1788,
            'funfair': 1757,
            'aidos-kuneen': 1706,
            'dad': 4862,
            'acute-angle-cloud': 2438,
            'fetch': 3773,
            'origintrail': 2467,
            'nebulas-token': 1908,
            'dent': 1886,
            'loom-network': 2588,
            'bosagora': 4217,
            'civic': 1816,
            'function-x': 3884,
            'ignis': 2276,
            'harmony': 3945,
            'bora': 3801,
            'syscoin': 541,
            'bitkan': 2934,
            'gas': 1785,
            'fusion': 2530,
            'origin-protocol': 5117,
            'vertcoin': 99,
            'factom': 1087,
            'aurora': 2874,
            'groestlcoin': 258,
            'tierion': 1923,
            'bhp-coin': 3020,
            'newton': 3871,
            'kusama': 5034,
            'singularitynet': 2424,
            'ilcoin': 3617,
            'hex': 5015,
            'counos-x': 5482,
            'tagz5': 4981,
            'ino-coin': 3085,
            'mindol': 3296,
            'tnc-coin': 5524,
            'playfuel': 5084,
            'bitbay': 723,
            'extstock-token': 5186,
            'advanced-internet-blocks': 911,
            'insight-chain': 3116,
            'mimblewimblecoin': 5031,
            'thorecoin': 3144,
            'vestchain': 3607,
            'elamachain': 3734,
            'baer-chain': 3653,
            'metaverse-dualchain-network-architecture': 5234,
            'glitzkoin': 3914,
            'homeros': 5336,
            'botxcoin': 3873,
            'cryptonex': 2027,
            'bloomzed-token': 5280,
            'mixin': 2349,
            'velas': 4747,
            'tratin': 4005,
            'counos-coin': 4122,
            'qcash': 2319,
            'centrality': 2585,
            'idea-chain-coin': 5560,
            'newyork-exchange': 4268,
            'cryptobucks': 5087,
            'bitbook-gambling': 4049,
            'beldex': 3987,
            'erc20': 2165,
            'bitcoinhd': 3966,
            'stem-cell-coin': 3772,
            'bitball-treasure': 4257,
            'sologenic': 5279,
            'tap': 5070,
            'whitecoin': 268,
            'joule': 4967,
            'poseidon-network': 4644,
            'bytecoin-bcn': 372,
            'bankera': 2842,
            'breezecoin': 3519,
            'fabrk': 4360,
            'deviantcoin': 2649,
            'prizm': 1681,
            'buggyra-coin-zero': 3415,
            'handshake': 5221,
            'massnet': 5548,
            'qubitica': 3224,
            'btu-protocol': 3737,
            'thorchain': 4157,
            'usdk': 4064,
            'vitae': 3063,
            'insure': 5113,
            'folgory-coin': 4842,
            'platincoin': 3364,
            'uni-coin': 4113,
            'karatgold-coin': 2907,
            'bitmax-token': 3673,
            'xenioscoin': 5060,
            'bigone-token': 2324,
            '1irstcoin': 3840,
            'rocket-pool': 2943,
            'helleniccoin': 1004,
            'ultiledger': 3666,
            'casinocoin': 45,
            'agavecoin': 3664,
            'dynamic-trading-rights': 2298,
            'loki': 2748,
            'cwv-chain': 3609,
            'c20': 2444,
            'ecoreal-estate': 3344,
            'thorenext': 3916,
            'cryptoindex-com-100': 4067,
            'next': 3788,
            'luckyseventoken': 5009,
            'jewel': 3791,
            'bitcoin2': 3974,
            'general-attention-currency': 4220,
            'zeon': 3795,
            'synchrobitcoin': 5277,
            'bonorum': 5320,
            'zbg-token': 3458,
            'contracoin': 5313,
            'envion': 2526,
            'obyte': 1492,
            'cindicator': 2043,
            'bitforex-token': 4283,
            'rakon': 5072,
            'wom-protocol': 5328,
            'bit-z-token': 2918,
            'wazirx': 5161,
            'moviebloc': 4038,
            'library-credit': 1298,
            'trustverse': 4060,
            'utrust': 2320,
            'telcoin': 2394,
            'unobtanium': 67,
            'travala': 2776,
            'apix': 5258,
            'uquid-coin': 2273,
            'einsteinium': 201,
            'nexus': 789,
            'ethereum-meta': 3589,
            'videocoin': 4300,
            'orchid': 5026,
            'neutrino-dollar': 5068,
            'apollo-currency': 2992,
            'lambda': 3657,
            'wrapped-bitcoin': 3717,
            'constellation': 2868,
            'ttc': 3175,
            'asch': 1609,
            'the-force-protocol': 4118,
            'irisnet': 3874,
            'chimpion': 3742,
            'everipedia': 2930,
            'ankr': 3783,
            'gaps': 4694,
            'dragon-coins': 2593,
            'repo': 2829,
            'request': 2071,
            'celer-network': 3814,
            'machine-xchange-coin': 3628,
            'contentos': 4036,
            'cryptaldash': 3367,
            'voyager-token': 1817,
            'microbitcoin': 3507,
            'fibos': 4058,
            'spectre-dividend': 2381,
            'lto-network': 3714,
            'nkn': 2780,
            'proton': 5350,
            'edc-blockchain': 1358,
            'nxt': 66,
            'fantom': 3513,
            'tael': 2267,
            'solana': 5426,
            'burst': 573,
            'davinci-coin': 3154,
            'coti': 3992,
            'medibloc': 2303,
            'shipchain': 2579,
            'bibox-token': 2307,
            'ultra': 4189,
            'qash': 2213,
            'electra': 1711,
            'rchain': 2021,
            'top': 3826,
            'conun': 3866,
            'elitium': 3968,
            'b2bx': 2204,
            'firstblood': 1403,
            'veritaseum': 1710,
            'invictus-hyperion-fund': 3301,
            'libra-credit': 2760,
            'carry': 3946,
            'arcblock': 2545,
            'gemini-dollar': 3306,
            'diamond-platform-token': 3920,
            'peepcoin': 1803,
            'aencoin': 3683,
            'monolith': 1660,
            'anchor': 4901,
            'nimiq': 2916,
            'bread': 2306,
            'sport-and-leisure': 3977,
            'idex': 3928,
            'standard-tokenization-protocol': 4006,
            'skycoin': 1619,
            'odem': 2631,
            'drep': 3924,
            'digixdao': 1229,
            'metadium': 3418,
            'propy': 1974,
            'latoken': 2090,
            'content-value-network': 3686,
            'iot-chain': 2251,
            'gochain': 2861,
            'fnb-protocol': 3858,
            'dmarket': 2503,
            'gifto': 2289,
            'neblio': 1955,
            'yap-stone': 4899,
            'quarkchain': 2840,
            'arpa-chain': 4039,
            'cocos-bcx': 4275,
            'raiden-network-token': 2161,
            'aladdin': 4057,
            'santiment': 1807,
            'kleros': 3581,
            'moeda-loyalty-points': 1954,
            'emirex-token': 4490,
            'cybermiles': 2246,
            'blocknet': 707,
            'troy': 5007,
            'kin': 1993,
            'wixlar': 3404,
            'measurable-data-token': 2348,
            'hxro': 3748,
            'baz-token': 5050,
            'liquid-apps': 4026,
            'nav-coin': 377,
            'bezant': 2727,
            'safex-token': 1172,
            'quantstamp': 2212,
            'metaverse': 1703,
            'coinex-token': 2941,
            'adx-net': 1768,
            'vnx-exchange': 4430,
            'airswap': 2058,
            'amo-coin': 3260,
            'molecular-future': 2441,
            'chromia': 3978,
            'dusk-network': 4092,
            'aeon': 1026,
            'nectar': 2538,
            'you-coin': 3053,
            'susd': 2927,
            'mixmarvel': 4366,
            'greenpower': 2746,
            'mainframe': 2896,
            'lcx': 4950,
            'singulardtv': 1409,
            'origo': 3985,
            'polis': 2359,
            'salus': 1159,
            'morpheus-network': 2763,
            'otocash': 3850,
            'tenx': 1758,
            'agrocoin': 4214,
            'moac': 2403,
            'namecoin': 3,
            'xmax': 2859,
            'endor-protocol': 2835,
            'vite': 2937,
            'tellor': 4944,
            'moss-coin': 2915,
            'peercoin': 5,
            'taas': 1592,
            'cosmo-coin': 2955,
            'perlin': 4293,
            'credits': 2556,
            'time-new-bank': 2235,
            'ost': 2296,
            'aergo': 3637,
            'single-collateral-dai': 2308,
            'fleta': 4103,
            'dimension-chain': 4748,
            'chainx': 4200,
            'safe': 3918,
            'digix-gold-token': 2739,
            'valor-token': 3875,
            'backpacker-coin': 5641,
            'sentinel-protocol': 2866,
            'game': 2336,
            'effect-ai': 2666,
            'coinmetro-token': 4105,
            't-os': 3707,
            'pressone': 2455,
            'cryptoverificationcoin': 4152,
            'metahash': 3756,
            'pillar': 1834,
            'steem-dollars': 1312,
            'prometeus': 4120,
            'particl': 1826,
            'lina': 3083,
            'just': 5488,
            'hycon': 3147,
            'suterusu': 4841,
            'king-dag': 5626,
            'uttoken': 2371,
            'quickx-protocol': 3883,
            'daps-coin': 3345,
            'ampleforth': 4056,
            'roobee': 4804,
            'quantum-resistant-ledger': 1712,
            'contents-protocol': 3847,
            'tokenomy': 2576,
            'achain': 1918,
            'wings': 1500,
            'ivy': 2833,
            'bnktothefuture': 2605,
            'salt': 1996,
            'telos': 4660,
            'poet': 1937,
            'haven-protocol': 2662,
            'lightning-bitcoin': 2335,
            'dune-network': 5160,
            'castweet': 5397,
            'bluzelle': 2505,
            'neumark': 2318,
            'unlimitedip': 2454,
            'sonocoin': 5420,
            'educare': 2453,
            'all-sports': 2473,
            'monero-classic': 2655,
            'digitalbits': 4566,
            'symverse': 4824,
            'darcio-ecosystem-coin': 3376,
            'everycoin': 3754,
            'sirin-labs-token': 2313,
            'iqeon': 3336,
            'ddkoin': 4180,
            'stakenet': 2633,
            'wagerr': 1779,
            'eminer': 4215,
            'hitchain': 3182,
            'int-chain': 2399,
            'robotina': 3325,
            'everex': 2034,
            'tokenclub': 2364,
            'smartmesh': 2277,
            'ruff': 2476,
            'observer': 3698,
            'revain': 2135,
            'kcash': 2379,
            'noia-network': 4191,
            'amber': 2081,
            'usdq': 4020,
            'cartesi': 5444,
            'atlas-protocol': 3620,
            'metronome': 2873,
            'v-id': 3845,
            'melon': 1552,
            'zenon': 4003,
            'gulden': 254,
            'babb': 2572,
            'npcoin': 4110,
            'proximax': 3126,
            'ionchain': 3506,
            'cryptofranc': 4075,
            'u-network': 2645,
            'genesis-vision': 2181,
            'zano': 4691,
            'wepower': 2511,
            '0chain': 2882,
            'lnx-protocol': 4194,
            'blockstamp': 3997,
            'pirate-chain': 3951,
            'smartcash': 1828,
            'gny': 3936,
            'polybius': 1784,
            'stakecubecoin': 3986,
            'nestree': 4467,
            'sakura-bloom': 2742,
            'mithril': 2608,
            'qiibee': 4100,
            'jibrel-network': 2498,
            'zvchain': 4762,
            'flo': 64,
            'bitcoin-rhodium': 3839,
            'eternal-token': 3134,
            'yoyow': 1899,
            'ubiq': 588,
            'electronic-energy-coin': 3904,
            'gamecredits': 576,
            'digital-asset-guarantee-token': 3357,
            'levolution': 4173,
            'lockchain': 2287,
            'vndc': 4805,
            'oneroot-network': 2400,
            'xyo': 2765,
            'ghostprism': 5475,
            'swftcoin': 2341,
            'dock': 2675,
            'playchip': 3731,
            'get-protocol': 2354,
            'morpheus-labs': 2709,
            'usdj': 5446,
            'dentacoin': 1876,
            'covesting': 2342,
            'bitcapitalvendor': 3066,
            'appcoins': 2344,
            'decoin': 4277,
            'bitcny': 624,
            'ipchain': 2433,
            'doc-com-token': 2711,
            'viacoin': 470,
            'district0x': 1856,
            'apm-coin': 5079,
            'sharetoken': 4197,
            'linka': 4850,
            'phore': 2158,
            'egretia': 2885,
            'high-performance-blockchain': 2345,
            'etheroll': 1677,
            'ergo': 1762,
            'zrcoin': 1726,
            'vidy': 4431,
            'oax': 1853,
            'chronocoin': 4484,
            'agrello-delta': 1949,
            'bqt': 3929,
            'trueflip': 1905,
            'dero': 2665,
            'box-token': 3475,
            'peculium': 2610,
            'tidex-token': 2542,
            'flash': 1755,
            'ondori': 3407,
            'bitcoin-atom': 2387,
            'sentivate': 3917,
            'lykke': 1454,
            'hiveterminal-token': 1950,
            'bitcore': 1654,
            'html-coin': 2315,
            'foam': 3631,
            'alqo': 2199,
            'vibe': 1983,
            'colossusxt': 2001,
            'cashaa': 2529,
            'maincoin': 3774,
            'te-food': 2578,
            'viberate': 2019,
            'ferrum-network': 4228,
            'daostack': 2726,
            'eurbase': 4815,
            'xaurum': 895,
            'edge': 2535,
            'insights-network': 2558,
            'hi-mutual-society': 2484,
            '1sg': 3762,
            'kryll': 2949,
            's4fe': 3733,
            'matrix-ai-network': 2474,
            'qlink': 2321,
            'peos': 3910,
            'universa': 2524,
            'suncontract': 1786,
            'selfkey': 2398,
            'etherparty': 2120,
            'blox': 1864,
            'global-social-chain': 2737,
            'mvl': 2982,
            'blockv': 2223,
            'pigeoncoin': 2988,
            'sonm': 1723,
            'pchain': 2838,
            'gocrypto-token': 3052,
            'everus': 2066,
            'monetha': 1947,
            'naga': 2305,
            'zel': 3029,
            'veriblock': 3846,
            'margix': 4902,
            'credo': 1963,
            'cryptocean': 4309,
            'qunqun': 2375,
            'sense': 2402,
            'aeron': 2153,
            'egoras': 5075,
            'digitalnote': 405,
            'blockmason': 2061,
            'global-digital-content': 4678,
            'global-cryptocurrency': 1531,
            'presearch': 2245,
            'poa': 2548,
            'ugas': 3863,
            'nix': 2991,
            'data': 2446,
            'tripio': 2661,
            'litecoin-cash': 2540,
            'ig-gold': 4054,
            'red-pulse': 2112,
            'medishares': 2274,
            'ternio': 2876,
            'feathercoin': 8,
            'mintcoin': 141,
            'baasid': 3142,
            'contentbox': 2945,
            'atomic-wallet-coin': 3667,
            'eosdt': 4017,
            'cononchain': 3040,
            'pumapay': 3164,
            'beaxy': 4646,
            'veridocglobal': 3205,
            'cutcoin': 4752,
            'nyzo': 5155,
            'okschain': 5272,
            'counterparty': 132,
            'akropolis': 4134,
            'cardstack': 2891,
            'constant': 3739,
            'blackmoon': 1976,
            'newscrypto': 4890,
            'usdx-stablecoin': 4621,
            'menapay': 4001,
            'futurepia': 4025,
            'tokoin': 4299,
            'spectrecoin': 1505,
            'eccoin': 212,
            'refereum': 2553,
            'uca-coin': 5479,
            'blackcoin': 170,
            'intellishare': 3811,
            'humanscape': 3600,
            'bitmart-token': 2933,
            'eos-force': 4769,
            'litex': 3070,
            'sparkpoint': 3935,
            'content-neutrality-network': 2735,
            'nucleus-vision': 2544,
            'artfinity': 3944,
            'themis': 3127,
            'waves-enterprise': 5159,
            'phantasma': 2827,
            'lympo': 2554,
            'vipstar-coin': 2688,
            'playcoin-erc20': 3461,
            'cargox': 2490,
            'apex': 2641,
            'meetone': 3136,
            'esportbits': 3838,
            'tokenpay': 2627,
            'jd-coin': 4929,
            'polyswarm': 2630,
            'boscoin': 2095,
            'inlock': 4754,
            'sentinel': 2643,
            'hydrogen': 2698,
            'lunyr': 1658,
            'boolberry': 406,
            'myriad': 182,
            'tera': 3948,
            'quark': 53,
            'skrumble-network': 2725,
            'bitgreen': 2604,
            'clipper-coin': 2897,
            'krios': 3998,
            'bitrue-coin': 4167,
            'spendcoin': 3307,
            'vetri': 3492,
            'cryptopay': 2314,
            'six': 3327,
            'bit-tube': 2561,
            'nuggets': 3092,
            'traceability-chain': 3227,
            'lamden': 2337,
            'genaro-network': 2291,
            'snetwork': 3435,
            'cube': 2559,
            'exmo-coin': 4974,
            'mooncoin': 89,
            'odyssey': 2458,
            'switcheo': 2620,
            'deepbrain-chain': 2316,
            'emercoin': 558,
            'mysterium': 1721,
            'vinchain': 3082,
            'bidipass': 4452,
            'ceek-vr': 2856,
            'rotharium': 3279,
            'eterbase-coin': 3815,
            'rublix': 2689,
            'stronghands': 1106,
            'paypex': 2191,
            'hydro-protocol': 2430,
            'potcoin': 122,
            'vnt-chain': 3988,
            'credit-tag-chain': 3195,
            'gowithmi': 4182,
            'carvertical': 2450,
            'wowbit': 2892,
            'streamity': 5046,
            'mexc-token': 4676,
            'napoleonx': 2602,
            'amlt': 2607,
            'diamond': 77,
            'mobius': 2429,
            'cryptaur': 2766,
            'bloomtoken': 2340,
            'lition': 3870,
            'grid': 2134,
            'fintrux-network': 2667,
            'rsk-smart-bitcoin': 3626,
            'metrix-coin': 1814,
            'gridcoin': 833,
            'zumcoin': 3652,
            'verasity': 3816,
            'flowchain': 3727,
            'dex': 3515,
            'radium': 1154,
            'sinovate': 3514,
            'abyss-token': 2847,
            'multivac': 3853,
            'callisto-network': 2757,
            'fatcoin': 3766,
            'betprotocol': 5062,
            'trias': 3970,
            'azbit': 4777,
            'cashbet-coin': 2855,
            'tolar': 3389,
            'crown': 720,
            'likecoin': 2909,
            'naka-bodhi-token': 4047,
            'blockport': 2465,
            'airbloc': 3156,
            'pundi-x-nem': 3096,
            'bomb': 3956,
            'sumokoin': 1694,
            'amond': 4712,
            'curecoin': 333,
            'horyoutoken': 3896,
            'mir-coin': 3371,
            'stealth': 448,
            'restart-energy-mwat': 2533,
            'weshow-token': 3585,
            'okcash': 760,
            'we-own': 2673,
            'penta': 2691,
            'clams': 460,
            'smartlands': 2471,
            'thekey': 2507,
            'change': 2060,
            'incent': 1475,
            'bitusd': 623,
            'vexanium': 2998,
            '1world': 2601,
            'egoras-dollar': 5124,
            'isiklar-coin': 5468,
            'scryinfo': 2428,
            'linkeye': 2468,
            'platoncoin': 3753,
            'fast-access-blockchain': 3941,
            'trade-token-x': 3642,
            'raven-protocol': 4024,
            'pluton': 1392,
            'road': 5028,
            'databroker': 2913,
            'loopring-neo': 2693,
            'auctus': 2653,
            'karma-eos': 3137,
            'ongsocial': 2240,
            'xaya': 5541,
            'oneledger': 2921,
            'chrono-tech': 1556,
            'boom': 4128,
            'popchain': 2902,
            'daex': 2696,
            'pivot-token': 4115,
            'kuai-token': 3691,
            'native-coin': 584,
            'bolt': 3843,
            'caspian': 3842,
            'exrnchain': 2088,
            'realtract': 3280,
            'coindeal-token': 4910,
            'pibble': 3768,
            'aryacoin': 3973,
            'temco': 3722,
            'blue-whale-exchange': 2953,
            'iconiq-lab-token': 3431,
            'pegnet': 4979,
            'indahash': 2459,
            'coinpoker': 2569,
            'veil': 3830,
            'wincash': 5233,
            'denarius-d': 1769,
            'yee': 2437,
            'infinitecoin': 41,
            'mb8-coin': 4209,
            'unikoin-gold': 2149,
            'canyacoin': 2343,
            'atc-coin': 1751,
            'nasdacoin': 3200,
            'colu-local-network': 2753,
            'dreamteam-token': 3963,
            'iocoin': 495,
            'jarvis-network': 5187,
            'e-gulden': 234,
            'dynamic': 1587,
            'bean-cash': 819,
            'unification': 3854,
            'winding-tree': 2728,
            'origin-sport': 2879,
            'vericoin': 323,
            'zip': 2826,
            'cajutel': 3715,
            'parkingo': 3251,
            'education-ecosystem': 2562,
            'ether-zero': 2843,
            'teloscoin': 3482,
            'quanta-utility-token': 3281,
            'stronghold-token': 3661,
            'remme': 2546,
            'peerplays-ppy': 1719,
            'zclassic': 1447,
            'bottos': 2392,
            'cloudbric': 3712,
            'banca': 2592,
            'titan-coin': 3913,
            'rise': 1294,
            'substratum': 1984,
            'spacechain': 2410,
            'midas': 4505,
            'iethereum': 2104,
            'amoveo': 3716,
            'hyperexchange': 4895,
            'fountain': 3658,
            'monetaryunit': 706,
            'hashsbx': 3769,
            'flixxo': 2231,
            'pascal': 1473,
            'rubycoin': 215,
            'cos': 1989,
            'amon': 2705,
            'blocktrade-token': 3084,
            'dinastycoin': 1745,
            'bismuth': 2009,
            'axe': 3898,
            'planet': 4242,
            'commerceblock': 2650,
            'footballcoin': 3663,
            'iht-real-estate-protocol': 2552,
            '42-coin': 93,
            'tronclassic': 3354,
            'tokenstars': 2729,
            'paypie': 2036,
            'asian-fintech': 3949,
            'netbox-coin': 4297,
            'bitex-global-xbx-coin': 3797,
            'adshares': 1883,
            'chatcoin': 2427,
            'bidesk': 5288,
            'aquariuscoin': 1247,
            'atlant': 2136,
            'snov': 2258,
            'switch': 4096,
            'newyorkcoin': 298,
            'kick-token': 2017,
            'turtlecoin': 2958,
            'spectre-utility': 2382,
            'humaniq': 1669,
            'bankex': 2390,
            'solarcoin': 233,
            'goldmint': 2513,
            'medical-chain': 2497,
            'insureum': 3466,
            'blockchain-certified-data-token': 3616,
            'vision-industry-token': 2625,
            'pandacoin-pnd': 161,
            'noku': 3138,
            'zeuxcoin': 4250,
            'yeed': 3474,
            'tixl': 4451,
            'conceal': 3732,
            'ixcoin': 13,
            'ucash': 2512,
            'hashgard': 2938,
            'x-cash': 3334,
            'liquidity-network': 3499,
            'quiztok': 4746,
            'primecoin': 42,
            'open-platform': 2762,
            'primas': 1930,
            'adamant-messenger': 3703,
            'era-swap': 4860,
            'linkey': 3178,
            'kambria': 3634,
            'safecapital': 5002,
            'encrypgen': 2208,
            'omni': 83,
            'qchi': 3337,
            'zebi-token': 2685,
            'iqcash': 3273,
            'geocoin': 823,
            'opacity': 3632,
            'aidus-token': 3785,
            'paybx': 2466,
            'coineal-token': 3960,
            'cloakcoin': 362,
            'hush': 1466,
            'datum': 2283,
            'daobet': 1771,
            'cpchain': 2482,
            'shivom': 2844,
            'petrodollar': 260,
            'nework': 2477,
            'spankchain': 2219,
            'lendingblock': 2686,
            'lighthouse-token': 4230,
            'kubocoin': 3901,
            'toacoin': 1833,
            'nubits': 626,
            'massgrid': 3072,
            'q-dao-governance-token': 4053,
            'sphere': 914,
            'leverj': 2377,
            'semux': 3023,
            'dabanking': 4284,
            'safe-haven': 3831,
            'aidoc': 2357,
            'publish': 4647,
            'pac-global': 1107,
            'sharder': 2699,
            'fanstime': 2901
            };
    }

})

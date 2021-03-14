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
        coloredLogos: true,
        fontSize: 'xx-large',
        limit: '100'
    },

    sparklineIds: {// See setSparklineIds()
    },

    start: function() {
        this.setSparklineIds()
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
                    tdWrapper.style.color = this.colorizeChange(currValue.slice(0, -1))
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
        if (options == undefined) {
            options = {}
        }

        if (language == undefined) {
            language = this.config.language
        }

        var significantDigits = undefined
        if (!Array.isArray(this.config.significantDigits)) {
            // Not an array, so take value as written
            significantDigits = this.config.significantDigits
        } else if (this.config.significantDigits.length < this.config.currency.length) {
            // Array isn't long enough, so take first entry
            significantDigits = this.config.significantDigits[0]
        } else {
            // Array looks right, so take relevant entry
            significantDigits = this.config.significantDigits[i]
        }

        var minimumFractionDigits = undefined
        if (!Array.isArray(this.config.minimumFractionDigits)) {
            minimumFractionDigits = this.config.minimumFractionDigits
        } else if (this.config.minimumFractionDigits.length < this.config.currency.length) {
            minimumFractionDigits = this.config.minimumFractionDigits[0]
        } else {
            minimumFractionDigits = this.config.minimumFractionDigits[i]
        }

        var maximumFractionDigits = undefined
        if (!Array.isArray(this.config.maximumFractionDigits)) {
            maximumFractionDigits = this.config.maximumFractionDigits
        } else if (this.config.maximumFractionDigits.length < this.config.currency.length) {
            maximumFractionDigits = this.config.maximumFractionDigits[0]
        } else {
            maximumFractionDigits = this.config.maximumFractionDigits[i]
        }

        if (significantDigits != undefined) {
            options['maximumSignificantDigits'] = significantDigits
        }

        if (maximumFractionDigits != undefined) {
            options['maximumFractionDigits'] = maximumFractionDigits
        }

        if (minimumFractionDigits != undefined) {
            options['minimumFractionDigits'] = minimumFractionDigits
        }

        return parseFloat(number).toLocaleString(language, options)
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
                    graph.src = 'https://s3.coinmarketcap.com/generated/sparklines/web/7d/usd/' + this.sparklineIds[apiResult[j].slug] + '.png?cachePrevention=' + Math.random()
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
        http.open('HEAD', imgPath)
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
            'binance-coin': 1839,
            'tether': 825,
            'cardano': 2010,
            'polkadot-new': 6636,
            'xrp': 52,
            'uniswap': 7083,
            'litecoin': 2,
            'chainlink': 1975,
            'bitcoin-cash': 1831,
            'usd-coin': 3408,
            'stellar': 512,
            'wrapped-bitcoin': 3717,
            'dogecoin': 74,
            'theta': 2416,
            'terra-luna': 4172,
            'aave': 7278,
            'crypto-com-coin': 3635,
            'vechain': 3077,
            'monero': 328,
            'ftx-token': 4195,
            'cosmos': 3794,
            'solana': 5426,
            'eos': 1765,
            'avalanche': 5805,
            'bitcoin-sv': 3602,
            'iota': 1720,
            'tron': 1958,
            'chiliz': 4066,
            'filecoin': 2280,
            'binance-usd': 4687,
            'nem': 873,
            'tezos': 2011,
            'algorand': 4030,
            'hedera-hashgraph': 4642,
            'neo': 1376,
            'huobi-token': 2502,
            'multi-collateral-dai': 4943,
            'sushiswap': 6758,
            'kusama': 5034,
            'dash': 131,
            'elrond-egld': 6892,
            'decred': 1168,
            'synthetix-network-token': 2586,
            'near-protocol': 6535,
            'the-graph': 6719,
            'maker': 1518,
            'theta-fuel': 3822,
            'compound': 5692,
            'unus-sed-leo': 3957,
            'enjin-coin': 2130,
            'polygon': 3890,
            'zilliqa': 2469,
            'bittorrent': 3718,
            'zcash': 1437,
            'decentraland': 1966,
            'ethereum-classic': 1321,
            'ravencoin': 2577,
            'bitcoin-bep2': 4023,
            'pancakeswap': 7186,
            'nexo': 2694,
            'uma': 5617,
            'thorchain': 4157,
            'yearn-finance': 5864,
            'swissborg': 2499,
            'bancor': 1727,
            'celsius': 2700,
            'basic-attention-token': 1697,
            'voyager-token': 1817,
            'flow': 4558,
            'ren': 2539,
            'holo': 2682,
            'icon': 2099,
            'fantom': 3513,
            'revain': 2135,
            'waves': 1274,
            '0x': 1896,
            'terrausd': 7129,
            'okb': 3897,
            'reserve-rights': 3964,
            'ontology': 2566,
            'stacks': 4847,
            'pundi-x': 2603,
            'digibyte': 109,
            'renbtc': 5777,
            'paxos-standard': 3330,
            'omg': 1808,
            'celo': 5567,
            'iostoken': 2405,
            'nano': 1567,
            'loopring': 1934,
            'siacoin': 1042,
            'harmony': 3945,
            'horizen': 1698,
            'ocean-protocol': 3911,
            'bitcoin-gold': 2083,
            'qtum': 1684,
            '1inch': 8104,
            'reef': 6951,
            'husd': 4779,
            'skale-network': 5691,
            'curve-dao-token': 6538,
            'helium': 5665,
            'fetch': 3773,
            'ankr': 3783,
            'arweave': 5632,
            'zkswap': 8202,
            'golem-network-tokens': 1455,
            'iotex': 2777,
            'verge': 693,
            'kyber-network': 1982,
            'wax': 2300,
            'quant': 3155,
            'energy-web-token': 5268,
            'lisk': 1214,
            'venus': 7288,
            'dodo': 7224,
            'kucoin-token': 2087,
            'nervos-network': 4948,
            'telcoin': 2394,
            'alpha-finance-lab': 7232,
            'badger-dao': 7859,
            'balancer': 5728,
            'status': 1759,
            'kava': 4846,
            'augur': 1104,
            'oasis-network': 7653,
            'serum': 6187,
            'dent': 1886,
            'polkastarter': 7208,
            'civic': 1816,
            'polymath-network': 2496,
            'orbs': 3835,
            'trueusd': 2563,
            'celer-network': 3814,
            'band-protocol': 4679,
            'origintrail': 2467,
            'utrust': 2320,
            'swipe': 4279,
            'ampleforth': 4056,
            'maidsafecoin': 291,
            'ardor': 1320,
            'vethor-token': 3012,
            'bitshares': 463,
            'bora': 3801,
            'rsk-infrastructure-framework': 3701,
            'coti': 3992,
            'bitcoin-standard-hashrate-token': 8210,
            'nucypher': 4761,
            'chromia': 3978,
            'singularitynet': 2424,
            'trustswap': 5829,
            'gnosis-gno': 1659,
            'aragon': 1680,
            'orchid': 5026,
            'storj': 1772,
            'quarkchain': 2840,
            'secret': 5604,
            'bitcoin-diamond': 2222,
            'funfair': 1757,
            'travala': 2776,
            'litentry': 6833,
            'origin-protocol': 5117,
            'numeraire': 1732,
            'ark': 1586,
            'zb-token': 3351,
            'ultra': 4189,
            'haven-protocol': 2662,
            'stormx': 2297,
            'tomochain': 2570,
            'stratis': 1343,
            'mainframe': 2896,
            'phala-network': 6841,
            'rlc': 1637,
            'sora': 5802,
            'komodo': 1521,
            'unibright': 2758,
            'aelf': 2299,
            'district0x': 1856,
            'wanchain': 2606,
            'injective-protocol': 7226,
            'steem': 1230,
            'vai': 7824,
            'syntropy': 4191,
            'loom-network': 2588,
            'power-ledger': 2132,
            'hive-blockchain': 5370,
            'syscoin': 541,
            'cybervein': 2642,
            'irisnet': 3874,
            'kin': 1993,
            'velas': 4747,
            'just': 5488,
            'saffron-finance': 7617,
            'populous': 1789,
            'akropolis': 4134,
            'metadium': 3418,
            'aion': 2062,
            'everipedia': 2930,
            'creditcoin': 5198,
            'bridge-oracle': 7096,
            'hex': 5015,
            'huobi-btc': 6941,
            'counos-x': 5482,
            'defichain': 5804,
            'whitecoin': 268,
            'wbnb': 7192,
            'ino-coin': 3085,
            'thorecoin': 3144,
            'bitmax-token': 3673,
            'the-transfer-token': 5514,
            'orbit-chain': 5326,
            'the-sandbox': 6210,
            'nxm': 5830,
            'venus-bnb': 7961,
            'rewardiqa': 5816,
            'xinfin-network': 2634,
            'conflux-network': 7334,
            'bitpanda-ecosystem-token': 4361,
            'hedgetrade': 3662,
            'mixin': 2349,
            'orion-protocol': 5631,
            'gny': 3936,
            'klever': 6724,
            'zelwin': 5614,
            'steth': 8085,
            'keep-network': 5566,
            'electroneum': 2137,
            'mirror-protocol': 7857,
            'bitcoin-cash-abc-2': 7686,
            'safepal': 8119,
            'mdex': 8335,
            'axie-infinity': 6783,
            'botxcoin': 3873,
            'amp': 6945,
            'venus-btc': 7962,
            'math': 5616,
            'hathor': 5552,
            'eauric': 7758,
            'dego-finance': 7087,
            'linear': 7102,
            'redfox-labs': 7654,
            'sologenic': 5279,
            'venus-xvs': 7960,
            'akash-network': 7431,
            'idea-chain-coin': 5560,
            'mimblewimblecoin': 5031,
            'gala': 7080,
            'sparkpoint': 3935,
            'superfarm': 8290,
            'elitium': 3968,
            'audius': 7455,
            'neutrino-usd': 5068,
            'derivadao': 7228,
            'dkargo': 5908,
            'rari-governance-token': 7486,
            'whale': 6679,
            'rocket-pool': 2943,
            'bakerytoken': 7064,
            'perpetual-protocol': 6950,
            'newyork-exchange': 4268,
            'coinmetro-token': 4105,
            'livepeer': 3640,
            'nftx': 8191,
            'tokenlon-network-token': 8083,
            'helleniccoin': 1004,
            'edgeware': 5274,
            'susd': 2927,
            'barnbridge': 7440,
            'uquid-coin': 2273,
            'trust-wallet-token': 5964,
            'troy': 5007,
            'lto-network': 3714,
            'pax-gold': 4705,
            'bloomzed-token': 5280,
            'abbc-coin': 3437,
            'doctors-coin': 5796,
            'bytom': 1866,
            'divi': 3441,
            'efforce': 7882,
            'sapphire': 4121,
            'gas': 1785,
            'adx-net': 1768,
            'monacoin': 213,
            'mantra-dao': 6536,
            'greenpower': 2746,
            'chimpion': 3742,
            'mask-network': 8536,
            'raydium': 8526,
            'thunder-token': 3930,
            'medibloc': 2303,
            'kardiachain': 5453,
            'streamr': 2143,
            'parsiq': 5410,
            'handshake': 5221,
            'darwinia-network': 5798,
            'unifi-protocol-dao': 7672,
            'gemini-dollar': 3306,
            'gatetoken': 4269,
            'centrality': 2585,
            'wazirx': 5161,
            'big-data-protocol': 8708,
            'redd': 118,
            'radix': 7692,
            'wootrade': 7501,
            'dusk-network': 4092,
            'xdai': 5601,
            'library-credit': 1298,
            'request': 2071,
            'atari-token': 7395,
            'spendcoin': 3307,
            'ethernity-chain': 8615,
            'frax': 6952,
            'youcash': 7321,
            'hard-protocol': 7576,
            'mvl': 2982,
            'mobilian-coin': 7059,
            'harvest-finance': 6859,
            'massnet': 5548,
            'frax-share': 6953,
            'solve': 3724,
            'nkn': 2780,
            'bluzelle': 2505,
            'xenioscoin': 5060,
            'waykichain': 2346,
            'allianceblock': 6957,
            'firo': 1414,
            'hegic': 6929,
            'carry': 3946,
            'ignis': 2276,
            'revv': 6993,
            'venus-usdc': 7958,
            'beefy-finance': 7311,
            'lambda': 3657,
            'kylin': 8644,
            'metal': 1788,
            'pac-global': 1107,
            'lukso': 5625,
            'morpheus-network': 2763,
            'aavegotchi': 7046,
            'energi': 3218,
            'ferrum-network': 4228,
            'waltonchain': 1925,
            'zap': 2363,
            'moviebloc': 4038,
            'duckdaodime': 6611,
            'pixel': 4091,
            'dexe': 7326,
            'certik': 4807,
            'arpa-chain': 4039,
            'sun': 6990,
            'radicle': 6843,
            'contentos': 4036,
            'wink': 4206,
            'klayswap-protocol': 8296,
            'bzx-protocol': 5810,
            'terra-virtua-kolect': 8037,
            'sharetoken': 4197,
            'cartesi': 5444,
            'zenon': 4003,
            'cashaa': 2529,
            'chainx': 4200,
            'ramp': 7463,
            'frontier': 5893,
            'perlin': 4293,
            'attila': 5600,
            'nexus': 789,
            'nest-protocol': 5841,
            'yearn-finance-ii': 5957,
            'vitae': 3063,
            'degenerator-meme': 6597,
            'huobi-pool-token': 3721,
            'marlin': 7497,
            'btu-protocol': 3737,
            'nuls': 2092,
            'bytecoin-bcn': 372,
            'beldex': 3987,
            'wrapped-nxm': 5939,
            'bella-protocol': 6928,
            'dia': 6138,
            'nash-exchange': 3829,
            'dxchain-token': 3139,
            'axel': 6216,
            'swingby': 5922,
            'fc-barcelona-fan-token': 5225,
            'beam': 3702,
            'tellor': 4944,
            'yield-app': 8066,
            'standard-tokenization-protocol': 4006,
            'justliquidity': 6937,
            'dextools': 5866,
            'venus-eth': 7963,
            'rchain': 2021,
            'einsteinium': 201,
            'enzyme': 1552,
            'hxro': 3748,
            'mx-token': 4041,
            '12ships': 4280,
            'pivx': 1169,
            'maps': 8166,
            'prometeus': 4120,
            'aergo': 3637,
            'flamingo': 7150,
            'api3': 7737,
            'everest': 8495,
            'insure': 5113,
            'qcash': 2319,
            'multiplier': 6583,
            'decentral-games': 7798,
            'sport-and-leisure': 3977,
            'vesper': 8492,
            'fio-protocol': 5865,
            'cream-finance': 6193,
            'bosagora': 4217,
            'spartan-protocol': 6992,
            'quantstamp': 2212,
            'digitalbits': 4566,
            'bondly': 7931,
            'torn': 8049,
            'dock': 2675,
            'elastos': 2492,
            'dao-maker': 8420,
            'switcheo': 2620,
            'bridge-mutual': 8364,
            'cindicator': 2043,
            'constellation': 2868,
            'kleros': 3581,
            'digg': 8307,
            'oxen': 2748,
            'yusra': 6726,
            'bitrue-coin': 4167,
            'cortex': 2638,
            'temco': 3722,
            'phantasma': 2827,
            'mxc': 3628,
            'nimiq': 2916,
            'v-systems': 3704,
            'sentivate': 3917,
            'empty-set-dollar': 7033,
            'pirate-chain': 3951,
            'fusion': 2530,
            'drep': 3924,
            'muse': 7805,
            'duck-dao': 8063,
            'cocos-bcx': 4275,
            'ergo': 1762,
            'selfkey': 2398,
            'titanswap': 7206,
            'truefi-token': 7725,
            'aeternity': 1700,
            'rally': 8075,
            'stasis-euro': 2989,
            'poseidon-network': 4644,
            'suku': 6180,
            'groestlcoin': 258,
            'ripio-credit-network': 2096,
            'galatasaray-fan-token': 5228,
            'nexalt': 6735,
            'crypto-com': 1776,
            'anyswap': 5892,
            'pnetwork': 5794,
            'dragonchain': 2243,
            'crust': 6747,
            'basid-coin': 7157,
            'measurable-data-token': 2348,
            'idex': 3928,
            'bounce-token': 8602,
            'venus-busd': 7959,
            'render-token': 5690,
            'powerpool': 6669,
            'ankreth': 8100,
            'sentinel-protocol': 2866,
            'milk-alliance': 5266,
            'get-protocol': 2354,
            'cvault-finance': 7242,
            'stakenet': 2633,
            'unilend': 7412,
            'goose-finance': 8449,
            'bonfida': 7978,
            'keep3rv1': 7535,
            'quiztok': 4746,
            'videocoin': 4300,
            'phoenix-global': 2112,
            'gxchain': 1750,
            'darma-cash': 5622,
            'bit-z-token': 2918,
            'sentinel': 2643,
            'veruscoin': 5049,
            'the-midas-touch-gold': 3356,
            'hypercash': 1903,
            'vidt-datalink': 3845,
            'maro': 3175,
            'function-x': 3884,
            'lympo': 2554,
            'hackenai': 5583,
            'gochain': 2861,
            'shroom-finance': 6891,
            'amber': 2081,
            'burger-swap': 7158,
            'tnc-coin': 5524,
            'apollo-currency': 2992,
            'vite': 2937,
            'mstable-usd': 5747,
            'dforce': 4758,
            'pibble': 3768,
            'lockchain': 2287,
            'julswap': 8164,
            'shopping': 8161,
            'optionroom': 8351,
            'usdx-kava': 6651,
            'veritaseum': 1710,
            'skycoin': 1619,
            'meta': 5748,
            'terra-krw': 5115,
            'steem-dollars': 1312,
            'minter-network': 4957,
            'bscpad': 8660,
            'sirin-labs-token': 2313,
            'telos': 4660,
            'bankera': 2842,
            'dsla-protocol': 5423,
            'neblio': 1955,
            'airswap': 2058,
            'suterusu': 4841,
            'endor-protocol': 2835,
            'stafi': 5882,
            'boringdao': 7509,
            'lcx': 4950,
            'wirex-token': 4090,
            'celo-dollar': 7236,
            'dmarket': 2503,
            'nebulas-token': 1908,
            'etherisc': 6588,
            'bitball-treasure': 4257,
            'easyfi': 7332,
            'humanscape': 3600,
            'apy-finance': 7227,
            'bigone-token': 2324,
            'verasity': 3816,
            'auto': 8387,
            'grin': 3709,
            'bitkan': 2934,
            'octofi': 7202,
            'propy': 1974,
            'kadena': 5647,
            'bux-token': 2465,
            'bounce-token-old': 6365,
            'all-sports': 2473,
            'alpha-quark-token': 7460,
            '88mph': 7742,
            'dhedge-dao': 7094,
            'digixdao': 1229,
            'presearch': 2245,
            'wabi': 2267,
            'neutrino-system-base-token': 7320,
            'latoken': 2090,
            'bao-finance': 8168,
            '0chain': 2882,
            'wing': 7048,
            'vertcoin': 99,
            'robonomics-network': 4757,
            'whiteheart': 8120,
            'rio-defi': 6537,
            'super-zero-protocol': 4078,
            'nxt': 66,
            'aurora': 2874,
            'nav-coin': 377,
            'moss-coin': 2915,
            'cover-protocol-new': 8175,
            'oraichain-token': 7533,
            'rsk-smart-bitcoin': 3626,
            'project-pai': 2900,
            'proton': 5350,
            'antimatter': 8603,
            'rarible': 5877,
            'mithril': 2608,
            'finxflo': 8416,
            'lgcy-network': 6665,
            'molecular-future': 2441,
            'blocknet': 707,
            'effect-ai': 2666,
            'aidos-kuneen': 1706,
            'refereum': 2553,
            'observer': 3698,
            'opium': 7230,
            'casinocoin': 45,
            'peakdefi': 5354,
            'metronome': 2873,
            'nft': 6650,
            'paris-saint-germain-fan-token': 5226,
            'polkamarkets': 8579,
            'nerve-finance': 8755,
            'dovu': 2110,
            'venus-usdt': 7957,
            'bifrost': 7817,
            'dad': 4862,
            'lgo-token': 2600,
            'unisocks': 7095,
            'aleph-im': 5821,
            'the-force-protocol': 4118,
            'rubic': 7219,
            'ultiledger': 3666,
            'aga': 6404,
            'genesis-vision': 2181,
            '1irstcoin': 3840,
            'raiden-network-token': 2161,
            'zeroswap': 7438,
            'ac-milan-fan-token': 8538,
            'invictus-hyperion-fund': 3301,
            'bitcoin2': 3974,
            'usdk': 4064,
            'smartlands-network': 2471,
            'anchor-neural-world': 6120,
            'razor-network': 8409,
            'top': 3826,
            'decentr': 5835,
            'decentralized-vulnerability-platform': 4520,
            'gameswap': 7588,
            'qash': 2213,
            'safex-token': 1172,
            'asta': 6375,
            'hermez-network': 7424,
            'blox': 1864,
            'bonded-finance': 7500,
            'cryptaldash': 3367,
            'basic': 5481,
            'crowns': 8365,
            'obyte': 1492,
            'hunt': 5380,
            'metaverse-dualchain-network-architecture': 5234,
            'umbrella-network': 8385,
            'freeway-token': 7585,
            'cutcoin': 4752,
            'gifto': 2289,
            'oax': 1853,
            'firmachain': 4953,
            'amo-coin': 3260,
            'bnktothefuture': 2605,
            'davinci-coin': 3154,
            'morpheus-labs': 2709,
            'poa': 2548,
            'vsxp': 7952,
            'gleec': 5200,
            'elamachain': 3734,
            'pumapay': 3164,
            'ducato-protocol-token': 7133,
            'ichi': 7726,
            'helmet-insure': 8265,
            'tenx': 1758,
            'euno': 3071,
            'wepower': 2511,
            'quantum-resistant-ledger': 1712,
            'appcoins': 2344,
            'homeros': 5336,
            'crpt': 2447,
            'te-food': 2578,
            'cybermiles': 2246,
            'ardcoin': 4985,
            'mirrored-tesla': 8004,
            'stablexswap': 7502,
            'prosper': 8255,
            'moeda-loyalty-points': 1954,
            'hashgard': 2938,
            'salt': 1996,
            'eboostcoin': 1704,
            'rakon': 5072,
            'bread': 2306,
            'dero': 2665,
            'tokenclub': 2364,
            'namecoin': 3,
            'pchain': 2838,
            'animalgo': 5839,
            'mixmarvel': 4366,
            'wom-protocol': 5328,
            'exnetwork-token': 6882,
            'bepro-network': 5062,
            'yfdai-finance': 6938,
            'ost': 2296,
            'blockv': 2223,
            'benchmark-protocol': 7765,
            'qlink': 2321,
            'dynamic': 1587,
            'newscrypto': 4890,
            'juventus-fan-token': 5224,
            'tokamak-network': 6731,
            'cardstack': 2891,
            'centaur': 7349,
            'zano': 4691,
            'kira-network': 6930,
            'factom': 1087,
            'lattice-token': 7616,
            'bitcoinpos': 5815,
            'newton': 3871,
            'non-fungible-yearn': 7389,
            'foam': 3631,
            'ubiq': 588,
            'egretia': 2885,
            'basis-cash': 7813,
            'stem-cell-coin': 3772,
            'unilayer': 6638,
            'tixl-new': 7024,
            'truechain': 2457,
            'ruff': 2476,
            'yop': 8187,
            'unistake': 7512,
            'everex': 2034,
            'mirrored-netflix': 8005,
            'aryacoin': 3973,
            'metaverse': 1703,
            'mirrored-amazon': 8016,
            'agrello-delta': 1949,
            'bitcoinhd': 3966,
            'sync-network': 7812,
            'yoyow': 1899,
            'zeon': 3795,
            'powertrade-fuel': 7190,
            'nucleus-vision': 2544,
            'cudos': 8258,
            'mirrored-ishares-silver-trust': 8026,
            'cobak-token': 8107,
            'waifu-token': 6552,
            'mirrored-invesco-qqq-trust': 8025,
            'mirrored-apple': 8001,
            'mirrored-twitter': 8018,
            'pickle-finance': 7022,
            'prizm': 1681,
            'polyient-games-governance-token': 7315,
            'permission-coin': 7105,
            'venus-link': 7975,
            'venus-ltc': 7964,
            'folgory-coin': 4842,
            'viacoin': 470,
            'atomic-wallet-coin': 3667,
            'coinex-token': 2941,
            'props': 5880,
            'nervenetwork': 5906,
            'mirrored-ishares-gold-trust': 8024,
            'mirrored-microsoft': 8017,
            'gamecredits': 576,
            'mirrored-alibaba': 8006,
            'emirex-token': 4490,
            's4fe': 3733,
            'king-dag': 5626,
            'trittium': 2865,
            'spacechain': 2410,
            'conun': 3866,
            'public-mint': 8423,
            'medishares': 2274,
            'unido': 8679,
            'banano': 4704,
            'juggernaut': 6942,
            'sake-token': 6997,
            'x-cash': 3334,
            'bithao': 7503,
            'snowswap': 7367,
            'bitforex-token': 4283,
            'viberate': 2019,
            'autonio': 2151,
            'arcblock': 2545,
            'fleta': 4103,
            'dos-network': 3809,
            'geodb': 5590,
            'sonm': 1723,
            'safe-haven': 3831,
            'singulardtv': 1409,
            'mirrored-united-states-oil-fund': 8027,
            'reflect-finance': 7747,
            'monetha': 1947,
            'mirrored-proshares-vix-short-term-futures-etf': 8028,
            'hedget': 6949,
            'atletico-de-madrid-fan-token': 5227,
            'swerve': 6901,
            'data': 2446,
            'usdj': 5446,
            'phore': 2158,
            'as-roma-fan-token': 5229,
            'doki-doki-finance': 7376,
            'proximax': 3126,
            'tachyon-protocol': 5103,
            'gem-exchange-and-trading': 7310,
            'fuse-network': 5634,
            'nestree': 4467,
            'berry-data': 8483,
            'achain': 1918,
            'contracoin': 5313,
            'ring-x-platform': 4894,
            'vidy': 4431,
            'peercoin': 5,
            'iqeon': 3336,
            'poolz-finance': 8271,
            'senso': 5522,
            'armor': 8309,
            'emercoin': 558,
            'og-fan-token': 5309,
            'deepbrain-chain': 2316,
            'balpha': 8710,
            'seen': 7671,
            'geeq': 6194,
            'hydro-protocol': 2430,
            'abyss': 2847,
            'moonswap': 7017,
            'liquid-apps': 4026,
            'dracula-token': 7380,
            'bhp-coin': 3020,
            'santiment': 1807,
            'idle': 7841,
            'credits': 2556,
            'cloudbric': 3712,
            'metahash': 3756,
            'keeperdao': 7678,
            'blockzerolabs': 4997,
            'xensor': 4818,
            'platincoin': 3364,
            'beowulf': 7176,
            'amepay': 8162,
            'myriad': 182,
            'polkabridge': 8320,
            'hydro': 2698,
            'leverj-gluon': 7772,
            'biki': 5325,
            'genaro-network': 2291,
            'oin-finance': 6870,
            'dawn-protocol': 5618,
            'somesing': 5612,
            'casino-betting-coin': 2855,
            'defis-network': 6610,
            'venus-dot': 7976,
            'anrkey-x': 8057,
            'circuits-of-value': 788,
            'zynecoin': 4951,
            'bird-money': 7795,
            'alchemy-pay': 6958,
            'nix': 2991,
            'valor-token': 3875,
            'mettalex': 7256,
            'platoncoin': 3753,
            'darwinia-commitment-token': 5931,
            'polyswarm': 2630,
            'depay': 8181,
            'furucombo': 8259,
            'offshift': 6236,
            'apyswap': 8419,
            'nord-finance': 8143,
            'monolith': 1660,
            'particl': 1826,
            'cargox': 2490,
            'parachute': 4051,
            'trustverse': 4060,
            'vibe': 1983,
            'sharedstake': 8445,
            'defi-yield-protocol': 8080,
            'dentacoin': 1876,
            'zbg-token': 3458,
            'eos-force': 4769,
            'truefeedback': 4144,
            'callisto-network': 2757,
            'aragon-court': 5523,
            'babb': 2572,
            'feathercoin': 8,
            'tap': 5070,
            'linkeye': 2468,
            'swftcoin': 2341,
            'royale-finance': 7821,
            'archer-dao-governance-token': 7750,
            'kryll': 2949,
            'realio-network': 4166,
            'jobchain': 4287,
            'roobee': 4804,
            'kcash': 2379,
            'hakka-finance': 6622,
            'yieldwatch': 8621,
            'high-performance-blockchain': 2345,
            'flo': 64,
            'falcon-project': 5871,
            'napoleonx': 2602,
            'monavale': 7866,
            'atlas-protocol': 3620,
            'unimex-network': 8229,
            'fibos': 4058,
            'aitra': 7255,
            'multi-channel-influencer-creater-cloud-funding-platform': 6810,
            'mahadao': 8043,
            'burst': 573,
            'yflink': 6407,
            'apm-coin': 5079,
            'six': 3327,
            'anchor': 4901,
            'fnb-protocol': 3858,
            'askobar-network': 5833,
            'apix': 5258,
            'pluton': 1392,
            'seele': 2830,
            'finnexus': 5712,
            'gulden': 254,
            'smartmesh': 2277,
            'bolt': 3843,
            'strong': 6511,
            'eminer': 4215,
            'bibox-token': 2307,
            'free-coin': 3388,
            'smart-mfg': 2658,
            'primecoin': 42,
            'elysia': 5382,
            'tera': 3948,
            'tokes': 1588,
            'zel': 3029,
            'zenfuse': 7430,
            'validity': 1154,
            'dragonvein': 5902,
            'playfuel': 5084,
            'chrono-tech': 1556,
            'levolution': 4173,
            'odyssey': 2458,
            'smartcash': 1828,
            'monero-classic': 2655,
            'time-new-bank': 2235,
            'tokenomy': 2576,
            'unitrade': 6195,
            'uca-coin': 5479,
            'waves-enterprise': 5159,
            'digitalnote': 405,
            'lightning-bitcoin': 2335,
            'swapcoinz': 4797,
            'aeon': 1026,
            'insured-finance': 8305,
            '42-coin': 93,
            'u-network': 2645,
            'weshow-token': 3585,
            'carvertical': 2450,
            'penta': 2691,
            'iot-chain': 2251,
            'peculium': 2610,
            'jupiter': 1503,
            'pundi-x-nem': 3096,
            'pressone': 2455,
            'azuki': 7647,
            'quickx-protocol': 3883,
            'fsw-token': 6743,
            'growthdefi': 6718,
            'gocrypto-token': 3052,
            'insureum': 3466,
            'quadrantprotocol': 3625,
            'hapi-one': 8567,
            'grid': 2134,
            'auctus': 2653,
            'airbloc': 3156,
            'vnx-exchange': 4430,
            'team-heretics-fan-token': 7636,
            'beatzcoin': 4867,
            'turtlecoin': 2958,
            'scprime': 4074,
            'matrix-ai-network': 2474,
            'lead-wallet': 6940,
            'lamden': 2337,
            'cwv-chain': 3609,
            'piedao-dough-v2': 7284,
            'nsure-network': 7231,
            'precium': 4958,
            'unlimitedip': 2454,
            'statera': 5868,
            'baasid': 3142,
            'likecoin': 2909,
            'cryptopay': 2314,
            'stealth': 448,
            'dmscript': 5952,
            'enecuum': 4245,
            'daostack': 2726,
            'name-changing-token': 8367,
            'vestchain': 3607,
            'origin-dollar': 7189,
            'sylo': 5662,
            'orient-walt': 5127,
            'bitmart-token': 2933,
            'xmax': 2859,
            'hitchain': 3182,
            'cryptocean': 4309,
            'safe': 3918,
            'pillar': 1834,
            'deapcoin': 5429,
            'wings': 1500,
            'opacity': 3632,
            'multivac': 3853,
            'fyooz': 6674,
            'btse': 5305,
            'litecoin-cash': 2540,
            'e-gulden': 234,
            'skrumble-network': 2725,
            'urus': 8616,
            'dev-protocol': 5990,
            'ilcoin': 3617,
            'gourmet-galaxy': 8386,
            'xyo': 2765,
            'game': 2336,
            'smartcredit-token': 7596,
            'thekey': 2507,
            'chonk': 7487,
            'potcoin': 122,
            'vidya': 6709,
            'catex-token': 4045,
        };
    },

})

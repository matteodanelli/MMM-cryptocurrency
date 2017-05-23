Module.register("MMM-cryptocurrency", {
    result: {},
    defaults: {
        currency: ['bitcoin'],
        conversion: 'USD',
        displayLongNames: false,
        headers: ['change1h', 'change24h', 'change7d']
    },

    start: function () {
        this.getTicker();
        this.scheduleUpdate();
    },

    getStyles: function () {
        return ["MMM-cryptocurrency.css"];
    },

    getTicker: function () {
        var conversion = this.config.conversion;

        // increase the limit at the end to choose from more currencies
        var url = 'https://api.coinmarketcap.com/v1/ticker/?convert='+conversion+'&limit=10';
        this.sendSocketNotification('get_ticker', url);
    },

    scheduleUpdate: function () {
        var self = this;
        // Refresh time should not be less than 5 minutes
        var delay = 300000;
        setInterval(function () {
            self.getTicker();
        }, delay);
    },

    getDom: function () {
        var data = this.result;

        var wrapper = document.createElement("table");
        wrapper.className = 'small mmm-cryptocurrency';

        var tableHeader = document.createElement("tr");
        tableHeader.className = 'header-row';

        var tableHeaderValues = [
            this.translate("CURRENCY"),
            this.translate('PRICE')
        ];
        this.config.headers.includes('change1h') && tableHeaderValues.push(this.translate('CHANGE') + ' (1h)');
        this.config.headers.includes('change24h') && tableHeaderValues.push(this.translate('CHANGE') + ' (24h)');
        this.config.headers.includes('change7d') && tableHeaderValues.push(this.translate('CHANGE') + ' (7d)');

        for (var i = 0; i < tableHeaderValues.length; i++) {
            var tableHeadSetup = document.createElement("th");
            tableHeadSetup.innerHTML = tableHeaderValues[i];
            tableHeader.appendChild(tableHeadSetup);
        }
        wrapper.appendChild(tableHeader);

        for (var i = 0; i < data.length; i++) {
            var currentCurrency = data[i];
            var trWrapper = document.createElement("tr");
            trWrapper.className = 'currency';

            if (this.config.displayLongNames) {
                var name = currentCurrency.name;
            } else {
                name = currentCurrency.symbol;
            }
            // Build object key to get proper rounding
            var rightCurrencyFormat = this.config.conversion.toLowerCase();
            // Round the price and adds the currency string
            var formattedPrice = Math.round(currentCurrency['price_'+rightCurrencyFormat] * 100) / 100+' '+this.config.conversion;

            // Build optional headers using lodash
            var tdValues = [
                name,
                formattedPrice
            ];
            this.config.headers.includes('change1h') && tdValues.push(currentCurrency.percent_change_1h + '%');
            this.config.headers.includes('change24h') && tdValues.push(currentCurrency.percent_change_24h + '%');
            this.config.headers.includes('change7d') && tdValues.push(currentCurrency.percent_change_7d + '%');

            for (var j = 0; j < tdValues.length; j++) {
                var tdWrapper = document.createElement("td");
                tdWrapper.innerHTML = tdValues[j];
                trWrapper.appendChild(tdWrapper);
            }
            wrapper.appendChild(trWrapper);
        }
        return wrapper;
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "got_result") {
            this.result = this.getWantedCurrencies(this.config.currency, payload);
            this.updateDom();
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
        var filteredCurrencies = [];
        for (var i = 0; i < chosenCurrencies.length; i++){
            for (var j = 0; j < apiResult.length; j++){
                var userCurrency = chosenCurrencies[i];
                var remoteCurrency = apiResult[j];
                if (userCurrency == remoteCurrency.id) {
                    filteredCurrencies.push(remoteCurrency);
                }
            }
        }
        return filteredCurrencies;
    },

    /**
     * Load translations files
     * @returns {{en: string, de: string, it: string}}
     */
    getTranslations: function () {
        return {
            en: "translations/en.json",
            de: "translations/de.json",
            it: "translations/it.json"
        };
    },

});

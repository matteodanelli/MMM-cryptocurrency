Module.register("MMM-cryptocurrency", {
    result: {},
    defaults: {
        currency: ['bitcoin'],
        conversion: 'USD',
        displayLongNames: false
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
        var wrapper = document.createElement("table");
        wrapper.className = 'small mmm-cryptocurrency';
        var data = this.result;
        var tableHead = document.createElement("tr");
        tableHead.className = 'header-row';

        var tableHeadValues = [
            this.translate("CURRENCY"),
            this.translate('PRICE'),
            this.translate('CHANGE')
        ];

        for (var thCounter = 0; thCounter < tableHeadValues.length; thCounter++) {
            var tableHeadSetup = document.createElement("th");
            tableHeadSetup.innerHTML = tableHeadValues[thCounter];
            tableHead.appendChild(tableHeadSetup);
        }
        wrapper.appendChild(tableHead);

        for (var trCounter = 0; trCounter < data.length; trCounter++) {
            var oneCurrency = data[trCounter];
            var trWrapper = document.createElement("tr");
            trWrapper.className = 'currency';
            if (this.config.displayLongNames) {
                var name = oneCurrency.name;
            } else {
                name = oneCurrency.symbol;
            }
            var rightCurrencyFormat = this.config.conversion.toLowerCase();
            // rounding the price and adds the currency string
            var formattedPrice = Math.round(oneCurrency['price_'+rightCurrencyFormat] * 100) / 100+' '+this.config.conversion;
            // add another value to this array to add additional data
            var tdValues = [
                name,
                formattedPrice,
                oneCurrency.percent_change_24h+'%'
            ];
            for (var c = 0; c < tdValues.length; c++) {
                var tdWrapper = document.createElement("td");
                tdWrapper.innerHTML = tdValues[c];
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

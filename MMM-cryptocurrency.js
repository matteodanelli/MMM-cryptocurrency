Module.register("MMM-cryptocurrency", {
    result: {},
    defaults: {
        currency: ['bitcoin', 'ethereum'],
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

        // Using the MM Translate function to translate the strings
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

            if (this.config.displayLongNames) {
                var name = oneCurrency.name;
            } else {
                name = oneCurrency.symbol;
            }

            var rightCurrencyFormat = this.config.conversion.toLowerCase();

            // rounding the price and adds the currency string
            var formattedPrice = Math.round(oneCurrency['price_'+rightCurrencyFormat])+' '+this.config.conversion;

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

            this.result = this.getWantedCurrencys(this.config.currency, payload);
            this.updateDom();
        }
    },

    getWantedCurrencys: function (wantedCurrencys, apiResult) {

        // get wanted currencys from config and loop trough them

        var filteredCurrencys = [];
        // loop trough whole api result
        for (var i = 0; i < apiResult.length; i++){
            var singleCurrency = apiResult[i];
            // loop trough currency's specified in config
            for (var c = 0; c < wantedCurrencys.length; c++){
                if(singleCurrency.id == wantedCurrencys[c]){
                    // add them to our wanted list
                    filteredCurrencys.push(singleCurrency)
                }
            }
        }

        return filteredCurrencys;

    },

    /**
     * Load translations files
     * @returns {{en: string, de: string}}
     */
    getTranslations: function () {
        return {
            en: "translations/en.json",
            de: "translations/de.json"
        };
    },

});

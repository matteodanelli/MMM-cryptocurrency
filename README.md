# MMM-cryptocurrency
A <a href="https://github.com/MichMich/MagicMirror">MagicMirror</a> module used to get real-time values of crypto currencies.

## Installation
1. Navigate into your MagicMirror's `modules` folder and execute `git clone https://github.com/matteodanelli/MMM-cryptocurrency.git`.
2. Add the module inside `config.js` placing it where you prefer ;)


## Config


|Option|Description|
|---|---|
|`currency`|One or more currencies you want to display.<br>**Type:** `array`<br>**Options:** `bitcoin, ethereum, ripple, dash, bitcoin-gold, litecoin, iota, ethereum-classic, nem, stratis, bitcoin-cash, cardano, neo`<br>**Default:** <i>['bitcoin']</i>|
|`conversion`|The currency used to convert crypto currency value.<br>**Type:** `string`<br>**Options:** `AUD, BRL, CAD, CHF, CNY, EUR, GBP, HKD, IDR, INR, JPY, KRW, MXN, RUB`<br>**Default:** <i>USD</i>|
|`showUSD`|When using other currencies than USD. Value can also be shown in USD.<br>**Type:** `boolean`<br>**Default:** <i>false</i>|
|`displayLongNames`| Option that show full name of the currency or the shortest version. (eg. Bitcoin/BTC ). <br> **Type** `boolean` <br> **Default** <i>false</i> |
|`displayType`| Sets the display of the module. <br>**Type:** `string`<br>**Options:** `detail, logo, logoWithChanges`<br/>**Default:** <i>detail</i>
|`logoHeaderText`| Defines the headline text if `displayType: logo` is set.<br/>**Type:** `string`<br>**Default:** <i>Crypto currency</i>
|`headers`| Possibility to show currency change in the last hour, day or week. <br> **Type** One of the following: `change1h, change24h, change7d` <br> **Default** <i>None. All optionals.</i> |
|`significantDigits`|Total digits to use for rounding the price (including before and after decimal point).<br> **Type** `number` <br> **Default** <i>2</i> |
|`showGraphs`| Possibility to show currency graph over the last week in `displayType: logo`. <br> **Type:** `boolean` <br> **Default** <i>false</i> |
|`coloredLogos`| Toggles white or colored logos `displayType: logo`. <br> **Type:** `boolean` <br> **Default** <i>false</i> |
|`fontSize`| Dimension of price text. You can specify pixel values, em values or keywords.<br> **Type:** `string` <br>**Options:** `xx-small`, `x-small`, `small`, `medium`, `large`, `x-large`, `xx-large` <br> **Default** <i>xx-large</i> |
|`limit`| Number of currencies to download, according to CoinMarketCap ranking. Increase this value only if you cannot display a currency. <br> **Type:** `string` <br> **Default** <i>100</i> |

Here is an example of an entry in `config.js`
```
{
	module: "MMM-cryptocurrency",
	position: "top_right",
	config: {
		currency: ['ethereum', 'bitcoin'],
		conversion: 'EUR',
		showUSD: false,
		headers: ['change24h', 'change1h', 'change7d'],
		displayType: 'logoWithChanges',
		showGraphs: true
	}
}
```

## Screenshots
#### Display type: details
![Screenshot of detail mode](/MMM-cryptocurrency.png?raw=true "Example screenshot")

#### Display type: logo
![Screenshot with logo](/logoView.png?raw=true "displayType: 'logo'")

#### Display type: logoWithChanges
![Screenshot with logo and Changes](/logoWithChangesView.png?raw=true "displayType: 'logoWithChanges'")

#### Display type: logo + significantDigits=5
![Screenshot with logo and 5 significant digits](/logoViewWithSignificantDigits.png?raw=true "displayType: 'logo', significantDigits: 5")

#### Display type: logo + showGraphs
![Screenshot with logo and graphs](/logoViewWithGraphs.png?raw=true "displayType: 'logo', showGraphs: 'true'")

#### Display type: logoWithChanges + showGraphs
![Screenshot with logo changes and graphs](/logoWithChangesAndGraphView.png?raw=true "displayType: 'logoWithChanges', showGraphs: 'true'")

#### Display type: logo + coloredLogos + showGraphs
![Screenshot with logo](/logoColoredGraph.png?raw=true "displayType: 'logo', showGraphs: 'true', coloredLogos: true")

## Cryptocurrency Logo

Logo provided only for the following currencies:
- Bitcoin, Bitcoin cash, Bitcoin gold
- Ethereum, Ethereum classic
- Ripple
- Stratis
- Nem
- Litecoin
- Dash
- Cardano
- Eos
- Iota
- Monero
- Neo
- Stellar
- Tron

Feel free to ask for support of your favorite currency. Else, just implement it (eg: to add Litecoin logo):
- Add `'litecoin'` to the currency module config
- Create the logo (png, 50x50px)
- Name the file `litecoin.png`
- Put it in the `/public/` `black-white/` and `colored` directory of the module
- Restart MagicMirror

## Notes
Data provided by <a href="https://coinmarketcap.com/">coinmarketcap.com</a>.
- Endpoints update every 5 minutes.
- Currently you can only display currencies listed within top-25 on coinmarketcap.com.
- `significantDigits` only has a visible effect when set to 4 or more. It is useful for showing low-value coins (such as Ripple) at a higher resolution, rounding to more digits after the decimal point than the minimal 2. Rounding always keeps at least two digits after the decimal.

## Feedback
It's my first module here after that I built a MagicMirror. I'm so proud of it and I have found a lot of interesting modules, including one similar to this, based on Bitcoin only <a href="https://github.com/valmassoi/MMM-bitcoin">MMM-bitcoin</a>.
<br>I am open to work on this project and to expand it to add other interesting features, and a bit of cool style too.
<br>Leave me some feedback in the forum. Thank you!

## Contributors
<a href="https://github.com/Klizzy/MMM-cryptocurrency">Klizzy</a> for translations and multiple currencies.
<a href="https://github.com/olexs/MMM-cryptocurrency">olexs</a> for currencies graphs and significant digits.


The MIT License (MIT)
=====================

Copyright © 2017 Matteo Danelli

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the “Software”), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

**The software is provided “as is”, without warranty of any kind, express or implied, including but not limited to the warranties of merchantability,
fitness for a particular purpose and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages or other liability,
whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the software.**

# MMM-cryptocurrency
A <a href="https://github.com/MichMich/MagicMirror">MagicMirror</a> module used to get real-time values of crypto currencies.

## Installation
1. Navigate into your MagicMirror's `modules` folder and execute `git clone https://github.com/matteodanelli/MMM-cryptocurrency.git`.
2. Add the module inside `config.js` placing it where you prefer ;)


## Config
The entry in `config.js` can include the following options:


|Option|Description|
|---|---|
|`currency`|One or more currencies you want to display.<br>**Type:** `array`<br>**Default:** <i>['bitcoin']</i>|
|`conversion`|The currency used to convert crypto currency value.<br>**Type:** One of the following: `AUD, BRL, CAD, CHF, CNY, EUR, GBP, HKD, IDR, INR, JPY, KRW, MXN, RUB`<br>**Default:** <i>USD</i>|
|`displayLongNames`| Option that show full name of the currecny or the shortest version. (eg. Bitcoin/BTC ). <br> **Type** `boolean` <br> **Default** <i>false</i> |
|`displayType`| Sets the display of the module. <br>**Type:** `string`<br>**Options:** `'detail', 'logo'<br/>**Default:** <i>detail</i>
|`logoHeaderText`| Defines the Headline text if `displayType: logo` is set.<br/>**Type:** `string<br>**Default:** <i>Cryptocurrencies</i>
|`headers`| Possibility to show currency change in the last hour, day or week. <br> **Type** One of the following: `change1h, change24h, change7d` <br> **Default** <i>None. All optionals.</i> |

Here is an example of an entry in `config.js`
```
{
	module: "MMM-cryptocurrency",
	position: "top_right",
	config: {
		currency: ['ethereum', 'bitcoin'],
		conversion: 'USD',
		headers: ['change24h', 'change1h', 'change7d']
	}
}
```

## Screenshot
![Alt text](/MMM-cryptocurrency.png?raw=true "Example screenshot")
```displayType: 'detail'```

![Logo View](/logoView.png?raw=true "displayType: 'logo'")
``displayType: 'logo'``

## Notes
Data provided by <a href="https://coinmarketcap.com/">coinmarketcap.com</a>.
- Endpoints update every 5 minutes.
- Currently you can only display currencies listed within top-10 on coinmarketcap.com.

## Cryptocurrency Logos

At the moment we can only display the Logos of the following currencies:

- Bitcoin
- Ethereum
- Ripple

Feel free to ask for support of your favorite Currency, but if you don't want to wait until its implemented you can do it easily by yourself:

for example if we want to add an Logo for Litecoin you have to follow these steps:

- Add `'litecoin'` to the currency module config
- Create the Logo (50x50px and type PNG)
- Name the file exactly by its name which we defined in the first step. In this example it would be `litecoin.png`
- Put it in the `/public`directory of this module
- restart the MagicMirror if the changes are not visible

## Feedback
It's my first module here after that I built a MagicMirror. I'm so proud of it and I have found a lot of interesting modules, including one similar to this, based on Bitcoin only <a href="https://github.com/valmassoi/MMM-bitcoin">MMM-bitcoin</a>.
<br>I am open to work on this project and to expand it to add other interesting features, and a bit of cool style too.
<br>Leave me some feedback in the forum. Thank you!

## Contributors
<a href="https://github.com/Klizzy/MMM-cryptocurrency">Klizzy</a> for translations and multiple currencies.


The MIT License (MIT)
=====================

Copyright © 2016 Sebastian Merkel

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

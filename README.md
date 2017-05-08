# MMM-cryptocurrency
A <a href="https://github.com/MichMich/MagicMirror">MagicMirror</a> module used to get real-time values of crypto currencies.

## Installation
1. Navigate into your MagicMirror's `modules` folder and execute `git clone https://github.com/matteodanelli/MMM-cryptocurrency.git`.
2. Add the module inside `config.js` placing it where you prefer ;)


## Config
The entry in `config.js` can include the following options:


|Option|Description|
|---|---|
|`currency`|The currency you want to display.<br>**Type:** `string`<br>**Default:** <i>bitcoin</i>|
|`conversion`|The currency used to convert crypto currency value.<br>**Type:** One of the following: `AUD, BRL, CAD, CHF, CNY, EUR, GBP, HKD, IDR, INR, JPY, KRW, MXN, RUB`<br>**Default:** <i>USD</i>|

Here is an example of an entry in `config.js`
```
{
	module: "MMM-cryptocurrency",
	position: "top_right",
	config: {
		currency: 'ethereum',
		conversion: 'USD'
	}
}
```

## Screenshot
![Alt text](/MMM-cryptocurrency.png?raw=true "Example screenshot")


## Notes
Data are provided by <a href="https://coinmarketcap.com/">coinmarketcap.com</a>.
- Endpoints update every 5 minutes.

## Feedback
It's my first module here after that I built a MagicMirror. I'm so proud of it and I have found a lot of interesting modules, including one similar to this, based on Bitcoin only <a href="https://github.com/valmassoi/MMM-bitcoin">MMM-bitcoin</a>.
<br>I am open to work on this project and to expand it to add other interesting features, and a bit of cool style too.
<br>Leave me some feedback in the forum. Thank you!


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

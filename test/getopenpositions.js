(async () => {
  
  const makerestapirequest = require('../node_methods/makerestapirequest')

  const bitmexaccount = (process.argv[2]) ? process.argv[2] : 'bitcoin' /* BitMEX Account ID */
  const financialinstrument = (process.argv[3]) ? process.argv[3] : 'XBTUSD' /* Financial Instrument */

  const key = eval("process.env." + bitmexaccount.toUpperCase() + "_USEFULCOIN_COM_API_KEY") /* BitMEX API key */
  const secret = eval("process.env." + bitmexaccount.toUpperCase() + "_USEFULCOIN_COM_API_SECRET") /* BitMEX API secret */

  // make requests.
  let openpositioninformation = await makerestapirequest ( key, secret, 'GET', '/api/v1/position', { 'filter': {'isOpen': true, 'symbol': financialinstrument} }  )
  // made requests.

  console.log ( openpositioninformation )

})()

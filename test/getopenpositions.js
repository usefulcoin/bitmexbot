const makerestapirequest = require('../node_methods/makerestapirequest')

const bitmexaccount = 'bitcoin' /* BitMEX Account ID */
const key = eval("process.env." + bitmexaccount.toUpperCase() + "_USEFULCOIN_COM_API_KEY") /* BitMEX API key */
const secret = eval("process.env." + bitmexaccount.toUpperCase() + "_USEFULCOIN_COM_API_SECRET") /* BitMEX API secret */

async function getopenpositions ( financialinstrument ) { // get open position details.

  // make requests.
  let openpositioninformation = await makerestapirequest ( key, secret, 'GET', '/api/v1/position', { 'filter': {'isOpen': true, 'symbol': financialinstrument} }  )
  // made requests.

  return openpositioninformation

} // got open position details.

(async function main () {
let openpositioninformation = await getopenpositions( 'XBTUSD' )
  console.log ( openpositioninformation.length )
})()

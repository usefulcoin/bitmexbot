// load custom node methods.
const sendmessage = require('./node_methods/sendmessage')
const looporderstatus = require('./node_methods/looporderstatus')
const makerestapirequest = require('./node_methods/makerestapirequest')
const signwebsocketrequest = require('./node_methods/signwebsocketrequest')
// loaded custom node methods.

// define key static (const) variables.
const riskratio = (process.argv[2]) ? process.argv[2] : 0.0001 /* the percentage of the portfolio that we can afford to lose */
const bitmexaccount = (process.argv[3]) ? process.argv[3] : 'bitcoin' /* BitMEX Account ID */ 
const financialposition = (process.argv[4]) ? process.argv[4] : 'long' /* set financial position to either 'long' or 'short' */
const financialinstrument = (process.argv[5]) ? process.argv[5] : 'XBTUSD' /* set financial instrument, for example 'XBTUSD' */
const equityreturn = (process.argv[6]) ? process.argv[6] : 0.01 /* return on equity required in decimals */
const recipient = (process.argv[7]) ? process.argv[7] :  '+15104594120' /* the percentage of the portfolio that we can afford to lose */
const key = eval("process.env." + bitmexaccount.toUpperCase() + "_USEFULCOIN_COM_API_KEY") /* BitMEX API key */
const secret = eval("process.env." + bitmexaccount.toUpperCase() + "_USEFULCOIN_COM_API_SECRET") /* BitMEX API secret */
// defined key static (const) variables.

// declare delay function.
const delay = ms => new Promise(r => setTimeout(r, ms));
// declared delay function.

async function determineorderdetails ( financialposition, financialinstrument ) { // get details.

  // make requests.
  let priceinformation = await makerestapirequest ( key, secret, 'GET', '/api/v1/instrument', { 'filter': {'symbol': financialinstrument} } )
  let margininformation = await makerestapirequest ( key, secret, 'GET', '/api/v1/user/margin' )
  // made requests.

  // determine quantity based on margin available (adjusting for lot size) and risk ratio.
  let decimals = 0 ; if (Math.floor(priceinformation[0].lotSize) !== priceinformation[0].lotSize) decimals = priceinformation[0].lotSize.toString().split(".")[1].length
  let orderquantity = Number( ( riskratio * +margininformation.availableMargin ) * ( +priceinformation[0].lastPrice * 0.00000001 ) / +priceinformation[0].initMargin ).toFixed( decimals )
  // determined quantity based on margin available adjusting for lot size) and risk ratio.

  // determined ticksize.
  let ticksize = +priceinformation[0].tickSize
  // determine ticksize.

  // determine order price and quantity sign.
  let orderprice = +priceinformation[0].lastPrice
  if ( financialposition === 'short' ) { orderprice = orderprice + ticksize ; orderquantity *= -1 }
  if ( financialposition === 'long' ) { orderprice = orderprice - ticksize ; orderquantity *= +1 }
  // determined order price and quantity sign.

  let orderdetails = { 'orderprice': +orderprice, 'orderquantity': +orderquantity, 'ticksize': +ticksize }
  return orderdetails

} // get details.

function getoffsetdetails ( assetreturn, orderdetails ) { // determine offset details.

  // determine offset price and quantity sign.
  let offsetquantity = +orderdetails.orderquantity * -1
  let offsetprice = Math.round( ( +orderdetails.orderprice * ( 1 + assetreturn ) ) / +orderdetails.ticksize ) * +orderdetails.ticksize
  if ( offsetquantity > 0 ) offsetprice -= +orderdetails.ticksize
  if ( offsetquantity < 0 ) offsetprice += +orderdetails.ticksize
  // determined offset price and quantity sign.

  let offsetdetails = { 'offsetprice': offsetprice , 'offsetquantity': offsetquantity }
  return offsetdetails

} // determined offset details.

(async () => {

  let openpositions = await makerestapirequest ( key, secret, 'GET', '/api/v1/position', { 'filter': {'isOpen': true, 'symbol': financialinstrument} } ) /* get open positions */
  if ( openpositions.length === 0 ) { let proceed = 'There are no open positions in the ' + bitmexaccount + ' account. Proceeding...' ; console.log( proceed ) } /* check for open positions */
  else { let failure = 'There are already open positions in the ' + bitmexaccount + ' account. Exiting...' ; console.log( failure ) ; return failure } /* exit the program if there are open positions */

  let neworders = await makerestapirequest ( key, secret, 'GET', '/api/v1/order', { 'filter': {'symbol': financialinstrument, 'ordStatus': 'New'} }  ) /* get new orders */
  if ( neworders.length === 0 ) { let proceed = 'There are no new orders in the ' + bitmexaccount + ' account. Proceeding...' ; console.log( proceed ) } /* check for new orders */
  else { let failure = 'There are new unfilled orders in the ' + bitmexaccount + ' account. Exiting...' ; console.log( failure ) ; return failure } /* exit the program if there are new orders */

  let orderdetails = await determineorderdetails ( financialposition, financialinstrument ) /* determine the details of the order to be submitted based on available margin */
  let ordertype = 'Limit' /* set order type, for example 'Market' or 'Limit' */
  let orderexecutioninstructions = [ 'ParticipateDoNotInitiate' ] /* set order execution instructions, for example 'ParticipateDoNotInitiate' for post-only limit orders */
  let orderinstructions = { 'symbol': financialinstrument, 'orderQty': orderdetails.orderquantity, 'price': orderdetails.orderprice, 'ordType': ordertype, 'execInst': orderexecutioninstructions }
  let postedorder = await makerestapirequest ( key, secret, 'POST', '/api/v1/order', orderinstructions ) /* submit order */
  if ( postedorder )  {

    console.log( postedorder )
    if ( postedorder.ordStatus === 'New' ) {
  
      function exitpostedoffsetstatusloop( error, response ) {
        
        if (error) throw error
        let message = 'the ' + financialposition + ' on the ' + financialinstrument + ' financial instrument in the ' + bitmexaccount + ' bitmex account has been offset.' /* create message */
        sendmessage ( recipient, message ) /* send message */
  
      }

      async function submitoffset( error, response ) {
  
        if (error) throw error
        let assetreturn = ( orderdetails.orderquantity > 0 ) ? equityreturn/100 : -equityreturn/100 /* set return required on assets in decimal terms, for example 0.05 (5%) */
        let offsettype = 'Limit' /* execute a limit order */
        let offsetdetails = getoffsetdetails ( assetreturn, orderdetails ) /* run getoffsetdetails to determine offset details */
        let offsetexecutioninstructions = [ 'ParticipateDoNotInitiate', 'ReduceOnly' ] /* set offset order execution instructions, for example 'ParticipateDoNotInitiate' for post-only limit orders */
        let offsetinstructions = { 
          'symbol': financialinstrument, 'orderQty': offsetdetails.offsetquantity, 'price': offsetdetails.offsetprice, 'ordType': offsettype, 'execInst': offsetexecutioninstructions 
	}
        let postedoffset ; let looping = true ; while ( looping === true ) { /* resubmit order every second (the average BitMEX API rate limit) */
            postedoffset = await makerestapirequest ( key, secret, 'POST', '/api/v1/order', offsetinstructions ) /* submit offset */
            if ( postedoffset ) {
              console.log( postedoffset )
              if ( postedoffset.ordStatus === 'New' ) looping = false /* resubmit order every second (the average BitMEX API rate limit) */
	    }
            await delay(1000) /* wait 1000 milliseconds before trying to create a new order */
	  }
        let signedrequest = signwebsocketrequest ( secret ) /* sign websocket request for private information using secret key */
        let credentials = '{"op": "authKeyExpires", "args": ["' + key + '", ' + Number(signedrequest.expires) + ', "' + signedrequest.signature + '"]}' /* credentials for websocket */
        let request = '{"op": "subscribe", "args": ["order","instrument:XBTUSD"]}' /* message to send */ 
        looporderstatus( credentials, request, postedoffset.orderID, 'Filled', exitpostedoffsetstatusloop ) /* loop (keep websocket connection open) until the order submitted has a status of 'Filled' */
  
      }
  
      await delay(5000) /* wait 5000 milliseconds for the order to fill */
      let neworder = await makerestapirequest ( key, secret, 'GET', '/api/v1/order', { 'filter': {'orderID': postedorder.orderID} } ) /* update posted order object */
      if ( neworder[0].ordStatus === 'Filled' ) { 
	console.log( 'Order ' + neworder[0].orderID + ' is now: "' + neworder[0].ordStatus + '". Submitting offset...' ) /* report status */
	submitoffset() /* submit offset if order was filled */
      }
      else { 
	console.log( 'Order ' + postedorder.orderID + ' not filled. Deleting...' ) /* report status */
	let deletedorder = await makerestapirequest ( key, secret, 'DELETE', '/api/v1/order', {'orderID': postedorder.orderID} ) /* delete posted order */
	console.log( 'Order ' + postedorder.orderID + ' is now: "' + deletedorder[0].ordStatus + '". Exiting...' )
        if ( deletedorder[0].ordStatus === 'Canceled' ) return /* special case where the order was filled before it could be deleted */
        if ( deletedorder[0].ordStatus === 'Filled' ) submitoffset() /* submit offset if order was filled */
      } 
    }

    else { let failure = 'Order ' + postedorder.orderID + ' not created. please try again. exiting...' ; console.log( failure ) ; return failure } /* exit if the order was not created */

  }

})()

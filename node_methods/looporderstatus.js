function looporderstatus ( credentials, request, property, state, callback ) { // loop on websocket...

  const WebSocket = require('ws')
  const ws = new WebSocket('wss://www.bitmex.com/realtime')
   
  ws.on('open', function open() { ws.send(credentials) ; ws.send(request) })
  ws.on('close', function close() { console.log('Websocket disconnected.') })
  ws.on('error', function(error) { console.log("Connection Error: " + error.toString()) })
   
  ws.on('message', function incoming(data) {

    // define response fields.
    let jsondata = JSON.parse(data)
    let info = jsondata.info
    let limit = jsondata.limit
    let error = jsondata.error
    let success = jsondata.success
    let message = jsondata.data
    // defined response fields.

    // update console.
    if ( info ) { console.log( info ) }
    if ( limit ) { console.log( 'Connections remaining limited to: ' + limit.remaining ) }
    if ( error ) { console.log( 'Response error: ' + error ) }
    if ( success ) { if ( jsondata.request.op === 'subscribe' ) { console.log( 'Successfully subscribed to topic "' + jsondata.subscribe + '".' ) } }
    // updated console.

    if ( message ) {
      for ( let i = 0 ;  i < message.length ; i++ ) {
        if ( message[i].orderID === property && message[i].ordStatus === state ) {
          console.log( 'The state of "' + property + '" ' + ' is : "' + state + '".' )
          ws.terminate()
          callback()
        }
      }
    }

  })

} // looped on websocket.

module.exports = looporderstatus


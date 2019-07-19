// load required modules.
let crypto = require('crypto');
// loaded required modules.

function signwebsocketrequest ( secret ) { // sign request...
 
  // set expiration to 1 min in the future. this code uses the 'expires' scheme.
  let expires = Math.round(new Date().getTime() / 1000) + 60;

  // create prehash.
  let prehash = 'GET/realtime' + expires;
  // created prehash.

  // sign request.
  let signature = crypto.createHmac( 'sha256', secret ).update( prehash ).digest( 'hex' );
  // signed request.

  return { 'signature': signature, 'expires': expires };

} // signed request.
 
module.exports = signwebsocketrequest;

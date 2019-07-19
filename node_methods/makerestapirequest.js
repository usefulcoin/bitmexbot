// load required modules.
let qs = require('qs');
let crypto = require('crypto');
let fetch = require('node-fetch');
// loaded required modules.

// make rest api request.
async function makerestapirequest ( key, secret, method, requestpath, requestparameters = {} ) { 

  // define consts.
  const restapiserver = 'https://www.bitmex.com';
  // defined key static (const) variables.
   
  // set expiration to 1 min in the future. this code uses the 'expires' scheme.
  let expires = Math.round(new Date().getTime() / 1000) + 60;
  // set expiration to 1 min in the future. this code uses the 'expires' scheme.

  // create prehash.
  let getquery = '';
  let postbody = '';
  if ( method === 'GET' ) { getquery = '?' + qs.stringify(requestparameters); } else { postbody = JSON.stringify(requestparameters); }
  let prehash = method + requestpath + getquery + expires + postbody;
  // created prehash.

  // sign request.
  // documentation from BitMex: Pre-compute the post's body so we can be sure that we're using *exactly* the same body in the request
  // and in the signature. If you don't do this, you might get differently-sorted keys and blow the signature.
  let signature = crypto.createHmac( 'sha256', secret ).update( prehash ).digest( 'hex' );
  // signed request.

  // define required headers.
  let headers = {
    'accept': 'application/json',
    'content-type': 'application/json',
    'api-expires': expires,
    'api-key': key,
    'api-signature': signature
  };
  // defined required headers.

  // define request options for http request.
  let requestoptions = { 'method': method, headers };
  if ( method !== 'GET' ) { requestoptions['body'] = postbody; }
  // defined request options for http request.

  // define url and send request.
  let url = restapiserver + requestpath + getquery;
  let response = await fetch(url,requestoptions);
  let json = await response.json();
  // defined url and sent request.

  return json;

}
// made rest api request.
  
module.exports = makerestapirequest;

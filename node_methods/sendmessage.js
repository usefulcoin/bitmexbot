// load required modules.
const aws = require( 'aws-sdk' );
// loaded required modules.

// configure aws region (use ap-northeast-1 or us-west-2).
aws.config.update( {region: 'ap-northeast-1'} );
// end configuration.

// start send message
// adapted from: https://github.com/awsdocs/aws-doc-sdk-examples/blob/master/javascript/example_code/sns/sns_publishsms.js
function sendmessage( number, alert ) {
  // create publish parameters
  var params = {
    PhoneNumber: number,
    Message: alert
  };
  
  // create promise and SNS service object
  var publishtextpromise = new aws.SNS( {apiVersion: '2010-03-31'} ).publish( params ).promise();
  
  // handle promise's fulfilled/rejected states
  publishtextpromise.then( ( data ) => console.log("Sent SNS message with ID:" + data.MessageId) ).catch( ( err ) => console.error( err, err.stack ) );
}
// end send message

module.exports = sendmessage;

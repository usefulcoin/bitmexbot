# BitMex Market Maker Bot 

Instructions for configuring the BitMex Market Maker Bot ("**bitmexbot**") are summarized below.

## Account Credentials

Store account credentials for the BitMex account in dotfile that you export to the environment upon login, for example:

```bash
usefulcoin_api_key=XXXXXXXXXXXXXXXXX
usefulcoin_api_secret=XXXXXXXXXXXXXX
```

## Exporting Credentials

Amend your **.profile** dotfile in order to have the BitMex account credentials already set in the environment upon login. For example, if you stored credentials in a dotfile called "usefulcoin-com-bitmex-api-credentials" in your home directory, then you'd want to append the following lines to the end of your **.profile**:

```bash

# export BitMex API credentials to environment
export $(find ~/.*usefulcoin-com-bitmex-api-credentials -exec cat {} \;)
```

## Websocket and REST API Calls

Use the ws module to make websocket calls.

Use the node-fetch module to make REST API calls and qs to format the URI.

Add them to the list of dependencies by issuing the following command:

```bash
npm install --save ws
npm install --save node-fetch
npm install --save qs
```

## SMS Notifications

Use the aws-sdk node module to enable SMS notifications.

```bash
npm install --save aws-sdk
```

# eaze-request [![Build Status](https://travis-ci.org/eaze/eaze-request.svg?branch=master)](https://travis-ci.org/eaze/eaze-request)

> Make requests to the Eaze API


## Install

```
$ npm install --save eaze-request
```


## Usage

```js
var Eaze = require('eaze-request')

var request = Eaze('https://the/api/base')
request('the/endpoint', options, function (err, data) {
  //=> err = null / Error
  //=> data = {...} / undefined
})
```

## API

#### `Eaze(baseUrl)` -> `function`

##### baseUrl

Type: `string`  
Default: `''`

The base URL for API requests. Returns the `request` function.

#### `request(path, [options], [callback])` -> `request`

##### path

*Required*  
Type: `string`

The API request path.

##### options

Request settings, mostly passed to [xhr-request](https://github.com/Jam3/xhr-request). 

Type: `object`  
Default: `{json: true, timeout: 15000}`

###### token

Type: `string`

A token to use as the `X-Auth-Token` header.

##### callback

Type: `function`  
Arguments: `err, data`

###### err

Type: `error`

A request error. Responses with non-200 range status codes are considered errors.

###### data

Type: `object`

The JSON response data.

## License

MIT © [Ben Drucker](http://bendrucker.me)

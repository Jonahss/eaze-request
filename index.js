'use strict'

var extend = require('xtend')
var request = require('request-promise')
var Query = require('query-string-flatten')

module.exports = EazeClient

var defaults = {
  baseUrl: '',
  method: 'get',
  json: true,
  timeout: 15000
}

var methods = ['get', 'post', 'put', 'patch', 'head', 'delete']

function EazeClient (clientOptions) {
  if (typeof clientOptions === 'string') {
    clientOptions = {baseUrl: clientOptions}
  }

  clientOptions = extend(defaults, clientOptions)

  return httpMethods(eazeRequest)

  function eazeRequest (path, options) {
    path = path || ''
    if (!options) {
      options = {}
    }

    options = extend(clientOptions, options)
    // options is now mutable
    setToken(options)
    setQuery(options)

    return request(path, options)
  }
}

function setToken (options) {
  if (!options.token) return
  options.headers = options.headers || {}
  options.headers['X-Auth-Token'] = options.token
  delete options.token
}

function setQuery (options) {
  var query = options.query
  if (!query) return
  options.query = (typeof query === 'string' ? String : Query)(query)
}

function httpMethods (request) {
  methods.forEach(function createMethod (method) {
    request[method] = function (path, options) {
      if (!options) {
        options = {}
      }

      options.method = method

      return request(path, options)
    }
  })

  return request
}

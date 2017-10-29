'use strict'

var extend = require('xtend')
var request = require('request')
var httpError = require('http-status-error')
var isError = require('is-error-code')
var isObject = require('is-obj')
var jsonParse = require('safe-json-parse')
var Query = require('query-string-flatten')
var assign = require('xtend/mutable')

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

  function eazeRequest (path, options, callback) {
    path = path || ''
    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    options = extend(clientOptions, options)
    // options is now mutable
    setToken(options)
    setQuery(options)

    return request(path, options, responseHandler(callback))
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

function responseHandler (callback) {

  return function handleResponse (err, response, data) {
    if (err) return callback(clientError(err))

    if (isError(response.statusCode)) {
      return createError(data, response, function (err) {
        callback(err)
      })
    }

    callback(null, data)
  }
}

function clientError (err) {
  return assign(new Error('We\'re having trouble reaching Eaze\'s servers—please try again.'), {
    timeout: isTimeout(err)
  })
}

function isTimeout (err) {
  return Boolean(err) && (err.code === 'ETIMEDOUT' || err.statusCode === 0)
}

function createError (data, response, callback) {
  var error = httpError(response.statusCode)
  if (!data) return callback(error)
  if (data) {
    if (isObject(data)) {
      return callback(assignMessage(error, data))
    }
    jsonParse(data, function (err, json) {
      if (err) return callback(data)
      callback(assignMessage(error, json))
    })
  }
}

function assignMessage (err, data) {
  if (data.messageDetail) {
    err.message = data.messageDetail
  } else if (data.message) {
    err.message = data.message
  }
  return err
}

function httpMethods (request) {
  methods.forEach(function createMethod (method) {
    request[method] = function (path, options, callback) {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      options.method = method

      return request(path, options, callback)
    }
  })

  return request
}

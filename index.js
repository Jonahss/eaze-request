'use strict'

var extend = require('xtend')
var join = require('url-join')
var request = require('xhr-request')
var httpError = require('http-status-error')
var isError = require('is-error-code')
var isObject = require('is-obj')
var jsonParse = require('safe-json-parse')
var Event = require('geval/event')
var Query = require('query-string-flatten')
var urlParse = require('url-parse')
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

  var ResultEvent = Event()
  eazeRequest.onResult = ResultEvent.listen

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
    var url = join(options.baseUrl, path)

    return request(url, options, responseHandler(callback, ResultEvent.broadcast, {
      baseUrl: options.baseUrl,
      url: url,
      method: options.method
    }))
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

function responseHandler (callback, broadcast, options) {
  var start = new Date()

  return function handleResponse (err, data, response) {
    var parsed = urlParse(options.url.replace(options.baseUrl, ''), true)
    var end = new Date()

    broadcast({
      method: options.method.toLowerCase(),
      path: parsed.pathname,
      query: parsed.query || {},
      status: response ? response.statusCode : 0,
      times: {
        start: start,
        end: end
      },
      duration: end - start
    })

    if (err) return callback(err)

    if (isError(response.statusCode)) {
      return createError(data, response, function (err) {
        callback(err)
      })
    }

    callback(null, data)
  }
}

function createError (data, response, callback) {
  var error = httpError(response.statusCode)
  if (!data) return callback(error)
  if (data) {
    if (isObject(data)) {
      return callback(assignMessage(error, data))
    }
    jsonParse(data, function (err, json) {
      if (err) return callback(err)
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

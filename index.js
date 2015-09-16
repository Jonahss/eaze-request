'use strict'

var extend = require('xtend')
var join = require('url-join')
var request = require('xhr-request')
var httpError = require('http-status-error')
var isError = require('is-error-code')
var isObject = require('is-obj')
var parse = require('safe-json-parse')

module.exports = EazeClient

var defaults = {
  json: true,
  timeout: 15000
}

var methods = ['get', 'post', 'put', 'patch', 'head', 'delete']

function EazeClient (baseUrl) {
  baseUrl = baseUrl || ''

  return httpMethods(eazeRequest)

  function eazeRequest (path, options, callback) {
    path = path || ''
    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    options = extend(defaults, options)
    setToken(options)
    var url = join(baseUrl, path)

    return request(url, options, responseHandler(callback))
  }
}

function setToken (options) {
  if (!options.token) return
  options.headers = options.headers || {}
  options.headers['X-Auth-Token'] = options.token
  delete options.token
}

function responseHandler (callback) {
  return function handleResponse (err, data, response) {
    if (err) return callback(err)
    if (isError(response.statusCode)) return createError(data, response, callback)
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
    parse(data, function (err, json) {
      if (err) return callback(err)
      callback(assignMessage(error, json))
    })
  }
}

function assignMessage (err, data) {
  if (data.message) err.message = data.message
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

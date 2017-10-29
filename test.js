'use strict'

var test = require('tape')
var Eaze = require('./')

var request = Eaze('https://api.eazeup.com/api')

test('success', function (t) {
  t.plan(1)

  request('ping', function (err, data) {
    if (err) return t.end(err)
    t.equal(data, 'OK')
  })
})

test('fail', function (t) {
  t.plan(4)

  request.get('orders/123', function (err, data) {
    t.ok(err)
    t.ok(/Authorization/.test(err.message))
    t.equal(err.statusCode, 401)
    t.notOk(data)
  })
})

test('client error', function (t) {
  t.plan(1)

  request.get('ping', {timeout: 10}, function (err, data) {
    t.ok(err)
  })
})

test('fail with no expected success response', function (t) {
  t.plan(3)

  request.post('foo', {responseType: ''}, function (err, data) {
    t.ok(err)
    t.equal(err.statusCode, 404)
    t.notOk(data)
  })
})

'use strict'

var test = require('blue-tape')
var Eaze = require('./')

var request = Eaze('https://api.eazeup.com/api')

test('success', function (t) {
  t.plan(1)

  request('ping').then((body) => {
    t.equal(body, 'OK')
  })
})

test('fail', function (t) {
  t.plan(3)

  request.get('orders/123')
  .then(t.fail)
  .catch((err) => {
    t.ok(err)
    t.ok(/Authorization/.test(err.message))
    t.equal(err.statusCode, 401)
  })
})

test('client error', function (t) {
  t.plan(1)

  request.get('ping', {timeout: 10})
  .then(t.fail)
  .catch((err) => {
    t.ok(err)
  })
})

test('fail with no expected success response', function (t) {
  t.plan(2)

  request.post('foo', {responseType: ''})
  .then(t.fail)
  .catch((err) => {
    t.ok(err)
    t.equal(err.statusCode, 404)
  })
})

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

test('onResult', function (t) {
  t.test('success', function (t) {
    t.plan(6)

    request.get('ping', noop)

    var unlisten = request.onResult(function (data) {
      t.equal(data.method, 'get')
      t.equal(data.path, '/ping')
      t.deepEqual(data.query, {})
      t.equal(data.status, 200)
      t.ok(data.times)
      t.ok(data.duration > 0)
      unlisten()
    })
  })

  t.test('fail', function (t) {
    t.plan(2)

    request.get('foo?bar=baz', noop)

    var unlisten = request.onResult(function (data) {
      t.deepEqual(data.query, {bar: 'baz'})
      t.equal(data.status, 404)
      unlisten()
    })
  })

  t.test('timeout', function (t) {
    t.plan(1)

    request.get('ping', {timeout: 10}, noop)

    var unlisten = request.onResult(function (data) {
      t.equal(data.status, 0)
      unlisten()
    })
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

function noop () {}

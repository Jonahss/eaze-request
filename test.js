'use strict'

var test = require('tape')
var Eaze = require('./')

var request = Eaze('https://api.eazeup.com/api')

test('success', function (t) {
  t.plan(1)

  request('verify', {
    query: {
      zipCode: '94105'
    }
  }, function (err, data) {
    if (err) return t.end(err)
    t.deepEqual(data, {
      isSuccess: true,
      message: ''
    })
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
  t.plan(3)

  request.get('ping', {timeout: 10}, function (err, data) {
    t.ok(err)
    t.ok(err.timeout)
    t.ok(/trouble reaching Eaze/.test(err.message))
  })
})

test('onResult', function (t) {
  t.test('success', function (t) {
    t.plan(7)

    request.get('ping', noop)

    var unlisten = request.onResult(function (data) {
      t.equal(data.method, 'get')
      t.equal(data.path, '/ping')
      t.deepEqual(data.query, {})
      t.equal(data.status, 200)
      t.equal(data.timeout, false)
      t.ok(data.times)
      t.ok(data.duration > 0)
      unlisten()
    })
  })

  t.test('fail', function (t) {
    t.plan(3)

    request.get('foo?bar=baz', noop)

    var unlisten = request.onResult(function (data) {
      t.deepEqual(data.query, {bar: 'baz'})
      t.equal(data.status, 404)
      t.equal(data.timeout, false)
      unlisten()
    })
  })

  t.test('timeout', function (t) {
    t.plan(2)

    request.get('ping', {timeout: 10}, noop)

    var unlisten = request.onResult(function (data) {
      t.equal(data.status, 0)
      t.equal(data.timeout, true)
      unlisten()
    })
  })
})

test('fail with no expected success response', function (t) {
  t.plan(4)

  request.post('foo', {responseType: ''}, function (err, data) {
    t.ok(err)
    t.ok(/No type was found/.test(err.message))
    t.equal(err.statusCode, 404)
    t.notOk(data)
  })
})

function noop () {}

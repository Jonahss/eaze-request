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

test('fail with no expected success response', function (t) {
  t.plan(4)

  request.post('foo', {responseType: ''}, function (err, data) {
    t.ok(err)
    t.ok(/No type was found/.test(err.message))
    t.equal(err.statusCode, 404)
    t.notOk(data)
  })
})

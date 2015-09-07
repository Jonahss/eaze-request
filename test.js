'use strict'

var test = require('tape')
var Eaze = require('./')

var request = Eaze('https://api.eazeup.com/api')

test('success', function (t) {
  t.plan(2)

  request('verify', {
    query: {
      zipCode: '94105'
    }
  }, function (err, data, response) {
    if (err) return t.end(err)
    t.deepEqual(data, {
      isSuccess: true,
      message: ''
    })
    t.equal(response.statusCode, 200)
  })
})

test('fail', function (t) {
  t.plan(3)

  request.post('foo', function (err, data, response) {
    t.ok(err)
    t.equal(err.message, 'Not Found (404)')
    t.equal(typeof data, 'object')
  })
})

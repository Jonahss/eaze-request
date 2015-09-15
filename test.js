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

  request.post('foo', function (err, data) {
    t.ok(err)
    console.log(data)
    t.ok(/No HTTP resource was found that matches/.test(err.message))
    t.equal(err.statusCode, 404)
    t.notOk(data)
  })
})

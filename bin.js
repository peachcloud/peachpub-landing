#!/usr/bin/env node

var Reconnect = require('pull-reconnect')
var Client = require('ssb-client')
var Logger = require('pino')

var sbot = createClient(function (sbot, config) {
  require('.').init(sbot, config)
})

function createClient (cb) {
  var client
  var config
  var setup = false
  var logger = Logger()

  var rec = Reconnect(function (notify) {
    Client(function (err, _client, _config) {
      if (err) {
        logger.error(err)
        notify(err)
        return
      }

      client = _client
      config = _config

      config.logger = logger

      if (!setup) {
        cb(sbot, config)
        setup = true
      }

      client.on('closed', () => {
        client = null
        notify(new Error('closed'))
      })

      notify()
    })
  })

  var sbot = {
    whoami: rec.async(function (id, cb) {
      return client.whoami(id, cb)
    })
  }
}

#!/usr/bin/env node

var Reconnect = require('pull-reconnect')
var Client = require('ssb-client')
var Config = require('ssb-config/inject')
var Logger = require('pino')

createClient(function (sbot, config) {
  require('.').init(sbot, config)
})

function createClient (cb) {
  var client
  var setup = false

  var config = Config(process.env.ssb_appname)
  var logger = Logger()

  config.logger = logger

  var rec = Reconnect(function (notify) {
    Client(config, function (err, _client, _config) {
      if (err) {
        logger.error(err)
        notify(err)
        return
      }

      client = _client

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
    whoami: rec.async(function (cb) {
      return client.whoami(cb)
    })
  }
}

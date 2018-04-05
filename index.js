var http = require('http')
var HttpLogger = require('pino-http')
var serverSummary = require('server-summary')

exports.name = 'landing'
exports.manifest = {}
exports.version = require('./package').version

exports.init = function (sbot, config) {
  var conf = config.landing || {}
  var port = conf.port || 8901
  var host = conf.host || config.host || '::'

  var httpLogger = config.logger
    ? HttpLogger({ logger: config.logger })
    : HttpLogger()
  var logger = httpLogger.logger

  var server = http.createServer(serve)
  var logServerSummary = serverSummary(server, logger.info.bind(logger))

  server.listen(port, host, logServerSummary)

  function serve (req, res) {
    httpLogger(req, res)

    if (req.method !== 'GET' || req.url !== '/') {
      return respond(res, 404, 'not found!')
    }

    serveLanding(req, res)
  }

  var id
  function serveLanding (req, res) {
    if (id != null) {
      respond(res, 200, id)
    } else {
      sbot.whoami(function (err, result) {
        if (err) {
          res.log.error(err)
          respond(res, 500, 'server error!')
        } else {
          id = result.id
          respond(res, 200, id)
        }
      })
    }
  }
}

function respond (res, status, message) {
  res.writeHead(status)
  res.end(message)
}

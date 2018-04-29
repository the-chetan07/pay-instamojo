const request = require('request')
const camelcaseKeys = require('camelcase-keys')

function instamojo (config) {
  if (typeof config !== 'object') {
    throw new Error('Invalid config passed.')
  }
  if (config && !config.host) {
    throw new Error('Missing instamojo host.')
  }
  if (config && !config.apiKey) {
    throw new Error('Missing your instamojo api key.')
  }
  if (config && !config.authToken) {
    throw new Error('Missing your instamojo auth token.')
  }

  this.host = config.host.trim()
  this.apiKey = config.apiKey.trim()
  this.authToken = config.authToken.trim()
  this.baseUrl = '/api/1.1/'

  this.doRequest = function (options, callback) {
    options.headers = {
      'X-Api-Key': this.apiKey,
      'X-Auth-Token': this.authToken
    }
    request(options, callback)
  }

  this.handleResponse = function (error, response, body, callback) {
    let err
    if (error) {
      callback(error, null)
      return
    }
    switch (response.statusCode) {
      case 401:
        err = response.statusCode + ': ' + this.unauthorized
        break
      case 403:
        err = response.statusCode + ': ' + this.forbidden
        break
      case 404:
        err = response.statusCode + ': ' + this.notFound
        break
      case 500:
        err = response.statusCode + ': ' + this.jiraConnectError
        break
    }

    if (body === undefined) {
      err = 'Response body was undefined.'
    }
    body = (typeof body === 'object' || (Array.isArray(body) && typeof body[0] === 'object')) ? camelcaseKeys(body, {deep: true}) : body
    !err ? callback(null, body) : callback(err)
  }
}

module.exports.instamojo = instamojo
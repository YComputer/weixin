'use strict'

var Promise = require('bluebird')
var utils = require('./utils')
var path = require('path')
var request = Promise.promisify(require('request'))
// var request = require('request')
var verify_ticket_file = path.join(__dirname, './verify_ticket.txt')

var prefix = 'https://api.weixin.qq.com/cgi-bin/component/'
var api = {
  componentAccessToken: prefix + 'api_component_token',
  prePuthCode: prefix + 'api_create_preauthcode?'
}


module.exports = function(config) {

  return function*(next) {
    if (this.url.indexOf('/authWeixinOpenCallback') > -1) {
      this.body = JSON.stringify(this.query)
      return next
    }
    console.log('进入－－－－－根路由－－－－－')
    yield next
  }

}

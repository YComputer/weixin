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
    if (this.url.indexOf('/authWeixinOpen') > -1) {
      //------------------------
      var componentVerifyTicket = yield utils.readFileAsync(verify_ticket_file, 'utf-8')
      console.log('read verify tcket is: ',componentVerifyTicket)
      //------------------------
      var form = {
          component_appid: config.weixinOpenGongzhonghao.appID,
          component_appsecret: config.weixinOpenGongzhonghao.appSecret,
          component_verify_ticket: 'ticket@@@imcFBeYkTV3nL0ng4w5ExE2uh0T4WjyuhCZbyLf2z3nNMhtez45FDikCcZYED6hFQarmVef8IPo-X_hJWYIQ7Q'
      }
      var url = api.componentAccessToken
      var ComponentAccessToken = yield new Promise(function(resolve, reject) {
                  request({method: 'POST',url: url, body: form, json: true}).then(function(response) {
                      var body = response.body
                      resolve(body.component_access_token)
                  })
              })
      console.log('component access token is: ', ComponentAccessToken)
      //------------------------
      var form2 = {
              component_appid: config.weixinOpenGongzhonghao.appID
            }
      var url2 = api.prePuthCode + 'component_access_token=' + ComponentAccessToken
      var preAuthCode = yield new Promise(function(resolve, reject) {
                  request({method: 'POST',url: url2, body: form2, json: true}).then(function(response) {
                      var body = response.body
                      resolve(body.pre_auth_code)
                  })
              })
      console.log('pre auth code is: ', preAuthCode)
      //------------------------
      var redirect = 'http://101.200.159.232/callbackOfAuthWeixinOpen'
      var htmlSource =  '<a href="https://mp.weixin.qq.com/cgi-bin/componentloginpage?component_appid=' + config.weixinOpenGongzhonghao.appID + '&pre_auth_code=' + preAuthCode + '&redirect_uri=' + redirect+'">'+ '点击授权</a>'
      this.body = htmlSource

      return next
    }
    console.log('进入－－－－－根路由－－－－－')
    yield next
  }

}

'use strict'

var Promise = require('bluebird')
var utils = require('./utils')
var path = require('path')
var request = Promise.promisify(require('request'))
// var request = require('request')
var component_access_token_file = path.join(__dirname, './component_access_token.txt')

// var prefix = 'https://api.weixin.qq.com/cgi-bin/component/'
// var api = {
//   componentAccessToken: prefix + 'api_component_token',
//   prePuthCode: prefix + 'api_create_preauthcode?'
// }


module.exports = function(config) {

  return function*(next) {
    console.log('url is ----- ',this.url)
    if (this.url.indexOf('/callbackOfAuthWeixinOpen') > -1) {

      var componentAccessToken = yield utils.readFileAsync(component_access_token_file, 'utf-8')
      console.log('componentAccessToken is: ',componentAccessToken)

      var form = {
              component_appid: config.weixinOpenGongzhonghao.appID,
              authorization_code: this.query.auth_code
            }
      var url = 'https://api.weixin.qq.com/cgi-bin/component/api_query_auth?component_access_token=' + componentAccessToken

      var body = yield new Promise(function(resolve, reject) {
                  request({method: 'POST',url: url, body: form, json: true}).then(function(response) {
                      var body = response.body
                      resolve(body)
                  })
              })

      this.body = body
      return next
    }
    console.log('没有进入authWeixinOpen的callback！！！！')
    yield next
  }

}

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
      //----- 使用授权码换取公众号的接口调用凭据和授权信息 start
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
      //----- 使用授权码换取公众号的接口调用凭据和授权信息 end
      //----- 获取公众号基本信息 start
      var form2 = {
              component_appid: config.weixinOpenGongzhonghao.appID,
              authorizer_appid: body.authorization_info.authorizer_appid
            }
      var url2 = 'https://api.weixin.qq.com/cgi-bin/component/api_get_authorizer_info?component_access_token=' + componentAccessToken
      var body2 = yield new Promise(function(resolve, reject) {
                  request({method: 'POST',url: url2, body: form2, json: true}).then(function(response) {
                      var body = response.body
                      resolve(body)
                  })
              })

      https://api.weixin.qq.com/cgi-bin/component/api_get_authorizer_info?component_access_token=xxxx
      // 获取公众号基本信息 end

      this.body = body2
      return next
    }
    console.log('没有进入authWeixinOpen的callback！！！！')
    yield next
  }

}

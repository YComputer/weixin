'use strict'

var Promise = require('bluebird')
var utils = require('./utils')
var path = require('path')
var ejs = require('ejs')
var heredoc = require('heredoc')
var request = Promise.promisify(require('request'))
// var request = require('request')
var component_access_token_file = path.join(__dirname, './component_access_token.txt')

var params = {}
var tpl = heredoc(function() {/*
  <!DOCTYPE html>
  <html>
      <head>
          <title>授权公众号的详细信息</title>
          <meta name="viewport" content="initial-scale=1, maximum-scale=1, minimum-scale=1">
      </head>
      <body>
          <h1>公众号帐号基本信息<h1>
          <div id="baseInfo">'<%= baseInfo %></div>

          <div id="afterAuth"></div>


          <script src="http://zeptojs.com/zepto-docs.min.js"></script>
          <script src="http://res.wx.qq.com/open/js/jweixin-1.1.0.js"></script>
          <script>
          // wait

          </script>

      </body>
  </html>

  */})


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
      console.log('使用授权码换取公众号的接口调用凭据和授权信息', body)
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
      params.baseInfo=JSON.stringify(body2)
      this.body = ejs.render(tpl, params)
      //this.body = body2
      return next
    }
    console.log('没有进入authWeixinOpen的callback！！！！')
    yield next
  }

}

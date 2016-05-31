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
          <div id="baseInfo">'<%= baseInfo %>'</div>
          <h1>公众号关注者信息<h1>
          <div id="followInfo">'<%= followInfo %>'</div>
          <h1>图文群发每日数据<h1>
          <div id="articleSummary">'<%= articleSummary %>'</div>



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
      var formAuthInfo = {
              component_appid: config.weixinOpenGongzhonghao.appID,
              authorization_code: this.query.auth_code
            }
      var urlAuthInfo = 'https://api.weixin.qq.com/cgi-bin/component/api_query_auth?component_access_token=' + componentAccessToken
      var authInfo = yield new Promise(function(resolve, reject) {
                  request({method: 'POST',url: urlAuthInfo, body: formAuthInfo, json: true}).then(function(response) {
                      var body = response.body
                      resolve(body)
                  })
              })
      console.log('使用授权码换取公众号的接口调用凭据和授权信息\n', authInfo)
      //----- 使用授权码换取公众号的接口调用凭据和授权信息 end
      //----- 获取公众号基本信息 start
      // 存储已经授权过的公众号
      var formBaseInfo = {
              component_appid: config.weixinOpenGongzhonghao.appID,
              authorizer_appid: authInfo.authorization_info.authorizer_appid
            }
      var urlBaseInfo = 'https://api.weixin.qq.com/cgi-bin/component/api_get_authorizer_info?component_access_token=' + componentAccessToken
      var baseInfo = yield new Promise(function(resolve, reject) {
                  request({method: 'POST',url: urlBaseInfo, body: formBaseInfo, json: true}).then(function(response) {
                      var body = response.body
                      resolve(body)
                  })
              })

      params.baseInfo=JSON.stringify(baseInfo)
      // 获取公众号基本信息 end
      //----- 获取公众号关注者信息 start
      var urlFllowInfo = 'https://api.weixin.qq.com/cgi-bin/user/get?access_token='+authInfo.authorization_info.authorizer_access_token

      var fllowInfo = yield new Promise(function(resolve, reject) {
                  request({method: 'GET',url: urlFllowInfo, json: true}).then(function(response) {
                      var body = response.body
                      resolve(body)
                  })
              })
      params.followInfo=JSON.stringify(fllowInfo)
      // 获取公众号关注者信息 end
      //----- 获取图文群发每日数据 start
      var getArticleSummary = 'https://api.weixin.qq.com/datacube/getarticlesummary?access_token='+authInfo.authorization_info.authorizer_access_token
      var datBetween = {
              begin_date: '2015-12-08',
              end_date: '2015-12-08'
            }
      var articleSummary = yield new Promise(function(resolve, reject) {
                  request({method: 'POST',url: getArticleSummary, body: datBetween, json: true}).then(function(response) {
                      var body = response.body
                      resolve(body)
                  })
              })
      params.articleSummary=JSON.stringify(articleSummary)
      // 获取图文群发每日数据 end


      this.body = ejs.render(tpl, params)
      return next
    }
    console.log('没有进入authWeixinOpen的callback！！！！')
    yield next
  }

}

'use strict'

var Promise = require('bluebird')
var utils = require('./utils')
var path = require('path')
var ejs = require('ejs')
var heredoc = require('heredoc')
var request = Promise.promisify(require('request'))
// var request = require('request')
var component_access_token_file = path.join(__dirname, './component_access_token.txt')
var authorization_info_file = path.join(__dirname, './authorization_info.txt')


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
          <h1>图文群发总数据<h1>
          <div id="articletotal">'<%= articletotal %>'</div>
          <h1>图文统计数据<h1>
          <div id="userread">'<%= userread %>'</div>
          <h1>图文统计分时数据<h1>
          <div id="userreadhour">'<%= userreadhour %>'</div>
          <h1>图文分享转发数据<h1>
          <div id="usershare">'<%= usershare %>'</div>
          <h1>图文分享转发分时数据<h1>
          <div id="usersharehour">'<%= usersharehour %>'</div>

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
      utils.writeFileAsync(authorization_info_file, JSON.stringify(authInfo))
      console.log('使用授权码换取公众号的接口调用凭据和授权信息\n', authInfo)
      //----- 使用授权码换取公众号的接口调用凭据和授权信息 end

      //----- 获取公众号基本信息 start
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

      //----- 获取图文群发总数据 start
      var getarticletotal = 'https://api.weixin.qq.com/datacube/getarticletotal?access_token='+authInfo.authorization_info.authorizer_access_token
      var datBetween = {
              begin_date: '2015-12-08',
              end_date: '2015-12-08'
            }
      var articletotal = yield new Promise(function(resolve, reject) {
                  request({method: 'POST',url: getarticletotal, body: datBetween, json: true}).then(function(response) {
                      var body = response.body
                      resolve(body)
                  })
              })
      params.articletotal=JSON.stringify(articletotal)
      // 获取图文群发总数据 end

      //----- 获取图文统计数据 start
      var getuserread = 'https://api.weixin.qq.com/datacube/getuserread?access_token='+authInfo.authorization_info.authorizer_access_token
      var datBetween = {
              begin_date: '2015-12-08',
              end_date: '2015-12-08'
            }
      var userread = yield new Promise(function(resolve, reject) {
                  request({method: 'POST',url: getuserread, body: datBetween, json: true}).then(function(response) {
                      var body = response.body
                      resolve(body)
                  })
              })
      params.userread=JSON.stringify(userread)
      // 获取图文统计数据 end

      //----- 获取图文统计分时数据 start
      var getuserreadhour = 'https://api.weixin.qq.com/datacube/getuserreadhour?access_token='+authInfo.authorization_info.authorizer_access_token
      var datBetween = {
              begin_date: '2015-12-08',
              end_date: '2015-12-08'
            }
      var userreadhour = yield new Promise(function(resolve, reject) {
                  request({method: 'POST',url: getuserreadhour, body: datBetween, json: true}).then(function(response) {
                      var body = response.body
                      resolve(body)
                  })
              })
      params.userreadhour=JSON.stringify(userreadhour)
      // 获取图文统计分时数据 end

      //----- 获取图文分享转发数据 start
      var getusershare = 'https://api.weixin.qq.com/datacube/getusershare?access_token='+authInfo.authorization_info.authorizer_access_token
      var datBetween = {
              begin_date: '2015-12-08',
              end_date: '2015-12-08'
            }
      var usershare = yield new Promise(function(resolve, reject) {
                  request({method: 'POST',url: getusershare, body: datBetween, json: true}).then(function(response) {
                      var body = response.body
                      resolve(body)
                  })
              })
      params.usershare=JSON.stringify(usershare)
      // 获取图文分享转发数据 end

      //----- 获取图文分享转发分时数据 start
      var getusersharehour = 'https://api.weixin.qq.com/datacube/getusersharehour?access_token='+authInfo.authorization_info.authorizer_access_token
      var datBetween = {
              begin_date: '2015-12-08',
              end_date: '2015-12-08'
            }
      var usersharehour = yield new Promise(function(resolve, reject) {
                  request({method: 'POST',url: getusersharehour, body: datBetween, json: true}).then(function(response) {
                      var body = response.body
                      resolve(body)
                  })
              })
      params.usersharehour=JSON.stringify(usersharehour)
      // 获取图文分享转发分时数据 end

      this.body = ejs.render(tpl, params)
      return next
    }
    console.log('没有进入authWeixinOpen的callback！！！！')
    yield next
  }

}

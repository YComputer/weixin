'use strict'

var Promise = require('bluebird')
var utils = require('./utils')
var path = require('path')
var ejs = require('ejs')
// var request = Promise.promisify(require('request'))
    var request = require('request')
var config = require('./config/config')
var GongZhongHao = require('./gongZhongHao')
var gongZhongHaoApi = new GongZhongHao(config.weixinGongzhonghao)
var verify_ticket_file = path.join(__dirname, './config/verify_ticket.txt')
var component_access_token_file = path.join(__dirname, './config/component_access_token.txt')
var tpl = require('./authWeixinOpenTpl')

var pollingResult = {}
var prefix = 'https://api.weixin.qq.com/cgi-bin/component/'
var api = {
    componentAccessToken: prefix + 'api_component_token',
    prePuthCode: prefix + 'api_create_preauthcode?'
}

module.exports = function(config) {
    return function*(uuid) {
        var that = this
        if (uuid) {
            var timespam = new Date().getTime()
            var random = Math.random()
            var url = 'https://mp.weixin.qq.com/safe/safeuuid?' +
                'timespam=' + timespam +
                '&uuid=' + uuid +
                '&token=&lang=zh_CN&f=json&ajax=1' +
                '&random=' + random
            console.log('polling url ' + url)

            var intervalID = setInterval(function() {
                request({
                    method: 'GET',
                    url: url,
                    json: true
                }, function(err, response, body){
                  console.log(body)
                  if(body && body.errcode && body.errcode === 405){
                    clearInterval(intervalID)
                  }
                })
            }, 3000)



            // var intervalID = setInterval(function() {
            //     request({
            //         method: 'GET',
            //         url: url,
            //         json: true
            //     }).then(function(response) {
            //         var body = response.body
            //         console.log(response.body)
            //         if (body.errcode && body.errcode === 405) {
            //             // 这里特别诡异的是返回的url，http://101.200.159.232/callbackOfAuthWeixinOpen后面多了一个双引号
            //             var cbUrl = body.confirm_resp.redirect_uri.replace('"', '')
            //             console.log('callbackurl---------', cbUrl)
            //             if (cbUrl) {
            //                 //clearInterval(intervalID)
            //                 request({
            //                     method: 'GET',
            //                     url: cbUrl,
            //                     json: true
            //                 }).then(function(response) {
            //                     var body = response.body
            //                     // 通知客户端认证成功，传递跳转url。
            //                 }).error(function(err) {
            //                     console.log(err)
            //                 })
            //             }
            //         }
            //     }).error(function(err) {
            //         console.log('eeeeeeeeerrrrrrrrroooooooooorrrrrrrrrrrr', err)
            //     })
            // }, 3000)

            pollingResult.isEnd = true
            this.body = JSON.stringify(pollingResult.isEnd)
        } else {
            this.body = 'uuid is not received'
        }

    }
}


// 用户没有授权轮询结果
// {
// "errcode": 401
// "key": ""
// "pass_ticket": ""
// "card_name": ""
// "check_status": 0
// }
// 用户授权后的轮询结果
// {
// "errcode": 405
// "code": "041HFCIkI-QzulFz"
// "appname": "testsecret"
// "redirect_uri": ""
// "key": ""
// "pass_ticket": ""
// "card_name": ""
// "check_status": 0
//     "confirm_resp": {
//     "redirect_uri": "http://101.200.159.232/callbackOfAuthWeixinOpen?auth_code=queryauthcode@@@-0cUxN76Zvbr_xMldSAm3pRSI8-yEcK6LLbciFfrMBnw7AKO5y-2ApemtMVYNS9KVkYwtfDaQp4LjBll5ToWtg&expires_in=3600"
//     "component_status": 0
//     "component_pre_auth_code": "preauthcode@@@Yzn10_CqxomcmC_YEuye1e60SL6x7WeXh-QdLopAJEs9Jesm1cKiwp31hM6ZZ_Df"
//     "component_appid": "wxb6fa0468346e9059"
//     "bizuin": "MzI2MzE3MDU0NA=="
//     "open_component_uin": 0
//     "open_mp_appid": ""
//     "open_mp_uin": 0
//     "open_biz_mp_mchid": 0
//     "biz_mp_uin": 0
//     "biz_mp_appid": ""
//     "biz_mp_mchid": 0
//     }
// }

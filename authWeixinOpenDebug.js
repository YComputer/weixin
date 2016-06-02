'use strict'

var Promise = require('bluebird')
var utils = require('./utils')
var path = require('path')
var ejs = require('ejs')
var request = Promise.promisify(require('request'))
var config = require('./config/config')
var GongZhongHao = require('./gongZhongHao')
var gongZhongHaoApi = new GongZhongHao(config.weixinGongzhonghao)
var verify_ticket_file = path.join(__dirname, './config/verify_ticket.txt')
var component_access_token_file = path.join(__dirname, './config/component_access_token.txt')
var tpl = require('./authWeixinOpenTpl')

var params = {}
var prefix = 'https://api.weixin.qq.com/cgi-bin/component/'
var api = {
    componentAccessToken: prefix + 'api_component_token',
    prePuthCode: prefix + 'api_create_preauthcode?'
}

module.exports = function(config) {
    return function*(next) {
        // console.log('headers----',this.request.headers)
        // var qrCode = yield gongZhongHaoApi.authWeixinOpen(config)
        // params.qrCode = qrCode
        // this.body = ejs.render(tpl, params)

        var componentVerifyTicket = yield utils.readFileAsync(verify_ticket_file, 'utf-8')
        console.log('read verify tcket is: ', componentVerifyTicket)
        var form = {
            component_appid: config.weixinOpenGongzhonghao.appID,
            component_appsecret: config.weixinOpenGongzhonghao.appSecret,
            component_verify_ticket: componentVerifyTicket
        }
        var url = api.componentAccessToken
        var componentAccessToken = yield new Promise(function(resolve, reject) {
            request({method: 'POST',url: url,body: form,json: true}).then(function(response) {
                var body = response.body
                resolve(body.component_access_token)
            })
        })
        utils.writeFileAsync(component_access_token_file, componentAccessToken)
        console.log('component access token is: ', componentAccessToken)
        var form2 = {
            component_appid: config.weixinOpenGongzhonghao.appID
        }
        var url2 = api.prePuthCode + 'component_access_token=' + componentAccessToken
        var preAuthCode = yield new Promise(function(resolve, reject) {
            request({method: 'POST',url: url2,body: form2,json: true}).then(function(response) {
                var body = response.body
                resolve(body.pre_auth_code)
            })
        })
        console.log('pre auth code is: ', preAuthCode)
        var redirect = 'http://101.200.159.232/callbackOfAuthWeixinOpen'
        var htmlSource = '<a href="https://mp.weixin.qq.com/cgi-bin/componentloginpage?component_appid=' + config.weixinOpenGongzhonghao.appID + '&pre_auth_code=' + preAuthCode + '&redirect_uri=' + redirect + '">' + '点击授权</a>'
        this.body = htmlSource
        // return next
    }
}

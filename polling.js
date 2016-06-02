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
            setInterval(function(url) {

                    request({
                        method: 'GET',
                        url: url,
                        json: true
                    }).then(function(response) {
                      console.log(response.body)
                        //resolve(response.body)
                    }).error(function(err) {
                        //reject(err)
                    })

                console.log(JSON.stringify(body))
            }, 5000)

            pollingResult.isEnd = true
            this.body = JSON.stringify(pollingResult.isEnd)
        } else {
            this.body = 'uuid is not received'
        }

    }
}

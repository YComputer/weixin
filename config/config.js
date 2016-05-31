'use strict'

var path = require('path')
var utils = require('../utils')
var gongzhonghao_file = path.join(__dirname, './gongzhonghao.txt')
var gongzhonghao_ticket_file = path.join(__dirname, './gongzhonghao_ticket.txt')



var config = {
    weixinOpenGongzhonghao: {
        appID: 'wxb6fa0468346e9059',
        appSecret: '485707e19a85b41ace9057e09690bcf8',
        token: 'testtest',
        key: 'AXaRooRMwPQg1bFdD3906oYAzYsgR5M7sn7WDPQJ30L'
    },

    weixinGongzhonghao: {
        appID: 'wx83c86a79dfc2a0a6',
        appSecret: '9845d1cb099c9d4dd4a7fb9ef3b99adb',
        token: 'xiaobing2',
        getAccessToken: function() {
            return utils.readFileAsync(gongzhonghao_file, 'utf-8')
        },
        saveAccessToken: function(data) {
            data = JSON.stringify(data)
            return utils.writeFileAsync(gongzhonghao_file, data)
        },
        getTicket: function() {
            return utils.readFileAsync(gongzhonghao_ticket_file, 'utf-8')
        },
        saveTicket: function(data) {
            data = JSON.stringify(data)
            return utils.writeFileAsync(gongzhonghao_ticket_file, data)
        }
    },
}

module.exports = config

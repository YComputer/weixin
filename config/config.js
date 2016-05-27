// 'use strict'
//
// var path = require('path')
// var utils = require('../utils')
// var verify_ticket_file = path.join(__dirname, './config/verify_ticket.txt')
//
// var config = {
//   weixinOpenGongzhonghao:{
//     appID: 'wxb6fa0468346e9059',
//     appSecret: '485707e19a85b41ace9057e09690bcf8',
//     token: 'testtest',
//     key: 'AXaRooRMwPQg1bFdD3906oYAzYsgR5M7sn7WDPQJ30L',
//     getVerifyTicket: function() {
//         return utils.readFileAsync(verify_ticket_file, 'utf-8')
//     },
//     saveVerifyTicket: function(data) {
//         data = JSON.stringify(data)
//         return utils.writeFileAsync(verify_ticket_file, data)
//     }
//   }
// }
//
// module.exports = config

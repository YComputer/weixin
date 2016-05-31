'use strict'

var koa = require('koa')
var route = require('koa-route')
// var Promise = require('bluebird')
// var sha1 = require('sha1')
// var getRawBody = require('raw-body')
// var utils = require('./utils')
// var WxCrypto = require('./wxCrypto')
// var path = require('path')
// var ejs = require('ejs')
// var heredoc = require('heredoc')
// var verify_ticket_file = path.join(__dirname, './verify_ticket.txt')
var authWeixinOpen = require('./authWeixinOpen')
var callbackOfAuthWeixinOpen = require('./callbackOfAuthWeixinOpen')
var rootRouter = require('./rootRouter')


var port = 80
var config = {
  weixinOpenGongzhonghao:{
    appID: 'wxb6fa0468346e9059',
    appSecret: '485707e19a85b41ace9057e09690bcf8',
    token: 'testtest',
    key: 'AXaRooRMwPQg1bFdD3906oYAzYsgR5M7sn7WDPQJ30L'
  }
}

var app = new koa()
app.use(route.get('/authWeixinOpen', authWeixinOpen(config)))
app.use(route.get('/callbackOfAuthWeixinOpen', callbackOfAuthWeixinOpen(config)))
app.use(rootRouter(config))

app.listen(port)
console.log('listening port is: '+ port)

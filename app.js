'use strict'

var koa = require('koa')
var route = require('koa-route')
var config = require('./config/config')
var authWeixinOpen = require('./authWeixinOpen')
var callbackOfAuthWeixinOpen = require('./callbackOfAuthWeixinOpen')
var rootRouter = require('./rootRouter')
var gongZhongHaoMiddleware = require('./gongZhongHaoMiddleware')

var port = 80

var app = new koa()
app.use(route.get('/authWeixinOpen', authWeixinOpen(config)))
app.use(route.get('/callbackOfAuthWeixinOpen', callbackOfAuthWeixinOpen(config)))
app.use(rootRouter(config.weixinOpenGongzhonghao))
app.use(gongZhongHaoMiddleware(config.weixinGongzhonghao))

app.listen(port)
console.log('listening port is: '+ port)

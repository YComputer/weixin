'use strict'

var koa = require('koa')
var route = require('koa-route')
var config = require('./config/config')


var authWeixinOpen = require('./authWeixinOpen')
var authWeixinOpenDebug = require('./authWeixinOpenDebug')
var callbackOfAuthWeixinOpen = require('./callbackOfAuthWeixinOpen')
var rootRouter = require('./rootRouter')
var gongZhongHaoMiddleware = require('./gongZhongHaoMiddleware')
var gongZhongHaoHandler = require('./gongZhongHaoHandler')
var polling = require('./polling')

var port = 80

var app = new koa()

app.use(route.get('/auth/authWeixinOpen', authWeixinOpen(config)))
app.use(route.get('/auth/authWeixinOpenDebug', authWeixinOpenDebug(config)))
app.use(route.get('/auth/polling/:uuid', polling(config)))
app.use(route.get('/callbackOfAuthWeixinOpen', callbackOfAuthWeixinOpen(config)))
app.use(route.post('/gzh', gongZhongHaoMiddleware(config.weixinGongzhonghao, gongZhongHaoHandler.reply)))
// app.use(gongZhongHaoMiddleware(config.weixinGongzhonghao, gongZhongHaoHandler.reply))
// 接受微信开放平台相关回调
app.use(rootRouter(config.weixinOpenGongzhonghao))


app.listen(port)
console.log('listening port is: '+ port)

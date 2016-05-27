'use strict'

var koa = require('koa')
var sha1 = require('sha1')

var port = 80
var config = {
  wexinOpenGongzhonghao:{
    appID: 'wxb6fa0468346e9059',
    appSecret: '485707e19a85b41ace9057e09690bcf8',
    token: 'testtest'
  }
}

var app = new koa()

app.use(function* (next){
  console.log(this.query)
})

app.listen(80)
console.log('listening port is: '+ port)

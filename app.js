'use strict'

var koa = require('koa')
var sha1 = require('sha1')

var port = 80
var config = {
  weixinOpenGongzhonghao:{
    appID: 'wxb6fa0468346e9059',
    appSecret: '485707e19a85b41ace9057e09690bcf8',
    token: 'testtest'
  }
}

var app = new koa()

app.use(function* (next){
  console.log(this.query)
  var token = config.weixinOpenGongzhonghao.token
  var signature = this.query.signature
  var nonce = this.query.nonce
  var timestamp = this.query.timestamp
  var echostr = this.query.echostr

  var str = [token, timestamp, nonce].sort().join('')
  var sha1Str = sha1(str)

  if(sha1Str === signature){
    this.body = echostr + ''
  }else{
    this.body = '微信server以外的请求'
  }

})

app.listen(port)
console.log('listening port is: '+ port)

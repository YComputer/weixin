'use strict'

var koa = require('koa')
var Promise = require('bluebird')
var sha1 = require('sha1')
var getRawBody = require('raw-body')
var utils = require('./utils')
var WxCrypto = require('./wxCrypto')
var path = require('path')
var ejs = require('ejs')
var heredoc = require('heredoc')
var verify_ticket_file = path.join(__dirname, './verify_ticket.txt')
//var request = Promise.promisify(require('request'))
var request = require('request')
var authWeixinOpen = require('./authWeixinOpen')
var authWeixinOpenCallback = require('./authWeixinOpenCallback')



var app = new koa()
var port = 80

var tpl = heredoc(function() {/*
  <!DOCTYPE html>
  <html>
      <head>
          <title>准备授权</title>
          <meta name="viewport" content="initial-scale=1, maximum-scale=1, minimum-scale=1">
      </head>
      <body>
          <h1>点击按钮授权<h1>
          <p id="title"></p>
          <div id="auth">
          <a href="<%= authUrl %>">授权</a>
          </div>
          <div id="afterAuth"></div>
          <script src="http://zeptojs.com/zepto-docs.min.js"></script>
          <script src="http://res.wx.qq.com/open/js/jweixin-1.1.0.js"></script>
          <script>
          // ready

          </script>
      </body>
  </html>

  */})


var config = {
  weixinOpenGongzhonghao:{
    appID: 'wxb6fa0468346e9059',
    appSecret: '485707e19a85b41ace9057e09690bcf8',
    token: 'testtest',
    key: 'AXaRooRMwPQg1bFdD3906oYAzYsgR5M7sn7WDPQJ30L'
  }
}

var prefix = 'https://api.weixin.qq.com/cgi-bin/component/'
var api = {
  componentAccessToken: prefix + 'api_component_token',
  prePuthCode: prefix + 'api_create_preauthcode?',
  authUrl: ''
}



app.use(authWeixinOpen(config))
app.use(authWeixinOpenCallback(config))

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
    if(this.method === 'GET'){
      console.log('request from weixin server↓↓↓↓\n' +
          ' method is %s \n path is %s \n query is %s \n' +
          'request from weixin server↑↑↑↑',
          this.method, this.url, JSON.stringify(this.query))
    }else if(this.method === 'POST'){
      var data = yield getRawBody(this.req, { length: this.length, limit: '1mb', encoding: this.charset })

      console.log('request from weixin server↓↓↓↓\n' +
          ' method is %s \n path is %s \n data is %s \n' +
          'request from weixin server↑↑↑↑',
          this.method, this.url, data.toString())

      var content = yield utils.parseXMLAsync(data)
      console.log('raw data to json object\n', content)
      var message = utils.formatMessage(content.xml)
      console.log('json object to plain json object\n', message)

      var xmlVerifyTicket = new WxCrypto(config.weixinOpenGongzhonghao.token, config.weixinOpenGongzhonghao.appID, config.weixinOpenGongzhonghao.key).decrypt(message.Encrypt)
      var rawVerifyTicket = yield utils.parseXMLAsync(xmlVerifyTicket)
      var verifyTicket = utils.formatMessage(rawVerifyTicket.xml)
      console.log('componentVerifyTicket is: ', JSON.stringify(verifyTicket))

      // save verifyTicket
      utils.writeFileAsync(verify_ticket_file, verifyTicket.ComponentVerifyTicket)

    }

    this.body = 'What is happen?'
  }else{
    console.log('request from other↓↓↓↓\n' +
        ' method is %s \n path is %s \n query is %s \n' +
        'request from other↑↑↑↑',
        this.method, this.url, JSON.stringify(this.query))

    this.body = '微信server以外的请求'
  }

})


app.listen(port)
console.log('listening port is: '+ port)

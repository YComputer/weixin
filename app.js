'use strict'

var koa = require('koa')
var sha1 = require('sha1')
var getRawBody = require('raw-body')
var utils = require('./utils')
var WxCrypto = require('./wxCrypto')
var path = require('path')

var verify_ticket_file = path.join(__dirname, './verify_ticket.txt')


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
      utils.writeFileAsync(verify_ticket_file, JSON.stringify(verifyTicket))

    }

    this.body = 'What is happen?'
  }else{
    console.log('request from other↓↓↓↓\n' +
        ' method is %s \n path is %s \n query is %s \n' +
        'request from weixin server↑↑↑↑',
        this.method, this.url, JSON.stringify(this.query))

    this.body = '微信server以外的请求'
  }

})

app.listen(port)
console.log('listening port is: '+ port)

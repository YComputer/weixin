'use strict'

var koa = require('koa')
var Promise = require('bluebird')
var sha1 = require('sha1')
var getRawBody = require('raw-body')
var utils = require('./utils')
var WxCrypto = require('./wxCrypto')
var path = require('path')
var verify_ticket_file = path.join(__dirname, './verify_ticket.txt')
//var request = Promise.promisify(require('request'))
var request = require('request')


var port = 80

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
  prePuthCode: prefix + 'api_create_preauthcode?'
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
      utils.writeFileAsync(verify_ticket_file, verifyTicket.ComponentVerifyTicket)

      // reques api_component_token
      var form = {
          component_appid: config.weixinOpenGongzhonghao.appID,
          component_appsecret: config.weixinOpenGongzhonghao.appSecret,
          component_verify_ticket: 'ticket@@@R74F1ZQWcnyYVHJg-p4Dg-4nPijRQfdeAc_FkpNOe75NSeYeaK0EF0GOQkpBPjtrvaN9A8bfonQNnfBwVk4sRA'
      }

      var url = api.componentAccessToken
      request({method: 'POST',url: url, body: form, json: true},
        function(error, response, body){
          if (error) {
            console.log(error)
          }
          console.log('componentAccessToken body ----------',body)
          // request pre_auth_code
          var form2 = {
              component_appid: config.weixinOpenGongzhonghao.appID
          }
          var url2 = api.prePuthCode + 'component_access_token=' + body.component_access_token
          request({method: 'POST',url: url2, body: form2, json: true},
            function(error, response, body){
              if (error) {
                console.log(error)
              }
              console.log('prePuthCode body ----------', body.pre_auth_code)
            })



          //end
        })



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

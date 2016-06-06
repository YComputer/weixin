'use strict'

var sha1 = require('sha1')
var utils = require('./utils')
var path = require('path')
var WxCrypto = require('./wxCrypto')
var getRawBody = require('raw-body')
var verify_ticket_file = path.join(__dirname, './config/verify_ticket.txt')

module.exports = function(config){
  return function* (next){
    var token = config.token
    var signature = this.query.signature
    var nonce = this.query.nonce
    var timestamp = this.query.timestamp
    var echostr = this.query.echostr
    var str = [token, timestamp, nonce].sort().join('')
    var sha1Str = sha1(str)
    if(sha1Str === signature){
      if(this.method === 'GET'){
        console.log('request from weixin server↓↓↓↓\n' + ' method is %s \n path is %s \n query is %s \n' + 'request from weixin server↑↑↑↑', this.method, this.url, JSON.stringify(this.query))
      }else if(this.method === 'POST'){
        var data = yield getRawBody(this.req, { length: this.length, limit: '1mb', encoding: this.charset })
        console.log('request from weixin server↓↓↓↓\n' + ' method is %s \n path is %s \n data is %s \n' + 'request from weixin server↑↑↑↑', this.method, this.url, data.toString())
        var content = yield utils.parseXMLAsync(data)
        // console.log('raw data to json object\n', content)
        var message = utils.formatMessage(content.xml)
        console.log('weinxin open message\n', message)
        var xmlVerifyTicket = new WxCrypto(config.token, config.appID, config.key).decrypt(message.Encrypt)
        var rawVerifyTicket = yield utils.parseXMLAsync(xmlVerifyTicket)
        var verifyTicket = utils.formatMessage(rawVerifyTicket.xml)
        console.log('componentVerifyTicket is: ', JSON.stringify(verifyTicket))
        // save verifyTicket
        utils.writeFileAsync(verify_ticket_file, verifyTicket.ComponentVerifyTicket)

      }else{
        this.body = 'What is happen?????'
      }
    }else{
      console.log('request from other↓↓↓↓\n' + ' method is %s \n path is %s \n query is %s \n' + 'request from other↑↑↑↑', this.method, this.url, JSON.stringify(this.query))
      //this.body = '微信server以外的请求'
    }

  }
}

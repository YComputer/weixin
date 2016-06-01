'use strict'

var sha1 = require('sha1')
var getRawBody = require('raw-body')
var GongZhongHao = require('./gongZhongHao')
var utils = require('./utils')


module.exports = function(config, replyHandler) {
    var gongZhongHao = new GongZhongHao(config)
    return function*(next) {
      console.log('enter gongzhonghaomiddleware------------')
        var token = config.token
        var signature = this.query.signature
      console.log('signature---',signature)
        var nonce = this.query.nonce
        var timestamp = this.query.timestamp
        var echostr = this.query.echostr
        var str = [token, timestamp, nonce].sort().join('')
        var sha = sha1(str)
        if (sha === signature) {
            if (this.method === 'GET') {
                console.log('gongZhongHaoMiddleware \n' + ' method is %s \n url is %s \n data is %s \n' , this.method, this.url, JSON.stringify(this.query))
                this.body = echostr + ''

            } else if (this.method === 'POST') {
                console.log('gongZhongHaoMiddleware \n' + ' method is %s \n url is %s' , this.method, this.url)

                var data = yield getRawBody(this.req, {
                    length: this.length,
                    limit: '1mb',
                    encoding: this.charset
                })
                console.log('raw data post from weixin server\n', data.toString())

                var content = yield utils.parseXMLAsync(data)
                console.log('raw data to json object\n', content)

                var message = utils.formatMessage(content.xml)
                console.log('json object to plain json object\n', message)

                // 将解析后的数据添加到当前引用的属性weixin中
                //console.log('添加前的this', this)
                //console.log('添加前的this', this.weixin)
                this.weixin = message
                //为什么添加后打印this.weixin可以打印出对象，但是打印this在this中却看不到weixin这个属性？？？？
                //console.log('添加后的this', this.weixin)
                //console.log('添加后的this', this)

                // 消息返回以后，把指针指向业务逻辑，跳出去到reply中去处理业务逻辑,就是组合数据。
                // 这个this就是koa框架的this。
                yield replyHandler.call(this, next)
                // 组合完数据后，处理完业务逻辑后，将消息返回给微信server端。
                gongZhongHao.send.call(this)

                return next

            } else {
              yield next
            }
        } else {
          yield next
        }
    }
}

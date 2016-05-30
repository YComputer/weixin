'use strict'


var utils = require('./utils')
var path = require('path')
//var request = Promise.promisify(require('request'))
var request = require('request')
var verify_ticket_file = path.join(__dirname, './verify_ticket.txt')

var verify_ticket_file = path.join(__dirname, './verify_ticket.txt')

var prefix = 'https://api.weixin.qq.com/cgi-bin/component/'
var api = {
  componentAccessToken: prefix + 'api_component_token',
  prePuthCode: prefix + 'api_create_preauthcode?'
}


module.exports = function(config) {

  return function*(next) {
    if (this.url.indexOf('/authWeixinOpenCallback') > -1) {
      var componentVerifyTicket
      // read verify ticket
      utils.readFileAsync(verify_ticket_file, 'utf-8')
           .then(function(data){
             try {
                 componentVerifyTicket = data.toString()
                 console.log('read componentVerifyTicket is ', componentVerifyTicket)
             } catch (e) {
                 console.log('read verify ticket failed', e)
             }
           })

      // reques api_component_token start
      var form = {
          component_appid: config.weixinOpenGongzhonghao.appID,
          component_appsecret: config.weixinOpenGongzhonghao.appSecret,
          component_verify_ticket: 'ticket@@@imcFBeYkTV3nL0ng4w5ExE2uh0T4WjyuhCZbyLf2z3nNMhtez45FDikCcZYED6hFQarmVef8IPo-X_hJWYIQ7Q'
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
              // 和获取token一样，预授权码也有有效期，一般为1800秒，记得及时更新
              var redirect = 'http://101.200.159.232'
              var htmlSource =  '<a href=https://mp.weixin.qq.com/cgi-bin/componentloginpage?component_appid="' + config.weixinOpenGongzhonghao.appID + '&pre_auth_code=' + body.pre_auth_code + '&redirect_uri=' + redirect+'">'+ '点击授权</a>'

              this.body = htmlSource
            })
          //end
        })
        // reques api_component_token end
        return next
    }
    console.log('进入－－－－－跟路由－－－－－')
    yield next
  }

}

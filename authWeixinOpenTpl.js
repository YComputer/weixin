var heredoc = require('heredoc')

var tpl = heredoc(function() {
    /*
        <!DOCTYPE html>
        <html>
            <head>
                <title>公众号授权认证</title>
                <meta name="viewport" content="initial-scale=1, maximum-scale=1, minimum-scale=1">
            </head>
            <body onLoad=Polling()>
                <h1>长按二维码认证<h1>
                <div id="qrCode">
                <img src="<%= qrCode %>" />
                </div>

                <script src="http://zeptojs.com/zepto-docs.min.js"></script>
                <script src="http://res.wx.qq.com/open/js/jweixin-1.1.0.js"></script>
                <script>

                function Polling(){
                    var uuid = '<%= uuid %>'
                    var timespam = new Date().getTime()
                    var random = Math.random()
                    var url = 'https://mp.weixin.qq.com/safe/safeuuid?' +
                              'timespam='+ timespam +
                              '&uuid='+ uuid +
                              '&token=&lang=zh_CN&f=json&ajax=1' +
                              '&random='+random
                    console.log('polling url '+ url)
                    window.setInterval(function(url){
                      $.ajax({
                          type: 'get',
                          url: url,
                          dataType: 'jsonp',
                          jsonp: 'callback',
                          success: function(response){
                              var errcode = response.errcode
                              if(errcode === 405){
                              console.log(errcode)
                              }else{
                              console.log(errcode)

                            }

                          }
                      })
                  }, 5000);
                }



                // 这里应该轮询授权认证结果
                // 轮询 https://mp.weixin.qq.com/safe/safeuuid?timespam=1464851582748&uuid=041HFCIkI-QzulFz&token=&lang=zh_CN&f=json&ajax=1&random=0.896635042167595
                // 用户没有授权轮询结果
                // {
                // "errcode": 401
                // "key": ""
                // "pass_ticket": ""
                // "card_name": ""
                // "check_status": 0
                // }
                // 用户授权后的轮询结果
                // {
                // "errcode": 405
                // "code": "041HFCIkI-QzulFz"
                // "appname": "testsecret"
                // "redirect_uri": ""
                // "key": ""
                // "pass_ticket": ""
                // "card_name": ""
                // "check_status": 0
                //     "confirm_resp": {
                //     "redirect_uri": "http://101.200.159.232/callbackOfAuthWeixinOpen?auth_code=queryauthcode@@@-0cUxN76Zvbr_xMldSAm3pRSI8-yEcK6LLbciFfrMBnw7AKO5y-2ApemtMVYNS9KVkYwtfDaQp4LjBll5ToWtg&expires_in=3600"
                //     "component_status": 0
                //     "component_pre_auth_code": "preauthcode@@@Yzn10_CqxomcmC_YEuye1e60SL6x7WeXh-QdLopAJEs9Jesm1cKiwp31hM6ZZ_Df"
                //     "component_appid": "wxb6fa0468346e9059"
                //     "bizuin": "MzI2MzE3MDU0NA=="
                //     "open_component_uin": 0
                //     "open_mp_appid": ""
                //     "open_mp_uin": 0
                //     "open_biz_mp_mchid": 0
                //     "biz_mp_uin": 0
                //     "biz_mp_appid": ""
                //     "biz_mp_mchid": 0
                //     }
                // }

                // $('#qrCode').html('<img src="' + subject.images.large+'" />')


                </script>
            </body>
        </html>
    */
})

module.exports = tpl

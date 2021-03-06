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
                <img src='https://mp.weixin.qq.com/safe/safeqrcode?action=bindcomponent&uuid=<%= uuid %>' />
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
                    // 通知自己的server开始轮询。这是错误的，正确的做法是轮询自己的server。

                    var intervalID = setInterval(function() {
                      $.getJSON('http://101.200.159.232/auth/polling/'+uuid, function(response){
                        console.log(response)
                        if (response.errcode && response.errcode === 405) {
                            // 这里特别诡异的是返回的url，http://101.200.159.232/callbackOfAuthWeixinOpen后面多了一个双引号
                            var cbUrl = response.confirm_resp.redirect_uri.replace('"', '')
                            console.log('callbackurl---------', cbUrl)
                            if (cbUrl) {
                                window.location.replace(cbUrl)
                                // clearInterval(intervalID)
                              //   $.getJSON(cbUrl, function(response){
                              //   console.log(response)
                              // })

                            }
                        }
                      })
                    }, 3000)


                    // 跨域问题，妥协解决办法
                    // 1.发送请求到自己的server，在自己的server发起请求获得结果。
                    // 2.轮询自己的server，得到是否请求成功的结果，然后再做跳转或者相关的判断。
                    // 通知server轮询开始，同时自己开始轮询自己的server确认是否认证成功。
                    // XMLHttpRequest cannot load
                    // https://mp.weixin.qq.com/safe/safeuuid?timespam=1464856355725&uuid=031v7eRL8-Qhal5H&token=&lang=zh_CN&f=json&ajax=1&random=0.07506458921558923.
                    // No 'Access-Control-Allow-Origin' header is present on the requested resource.
                    // Origin 'http://101.200.159.232' is therefore not allowed access.

                    //   window.setInterval(function(url){
                    //   $.getJSON(url, function(data){
                    //     console.log(data)
                    //   })
                    //
                    // }, 5000);
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

                </script>
            </body>
        </html>
    */
})

module.exports = tpl

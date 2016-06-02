var heredoc = require('heredoc')

exports.tpl = heredoc(function() {
    /*
        <!DOCTYPE html>
        <html>
            <head>
                <title>公众号授权认证</title>
                <meta name="viewport" content="initial-scale=1, maximum-scale=1, minimum-scale=1">
            </head>
            <body>
                <h1>长按二维码认证<h1>
                <div id="qrCode">'<%= qrCode %>'</div>

                <script src="http://zeptojs.com/zepto-docs.min.js"></script>
                <script src="http://res.wx.qq.com/open/js/jweixin-1.1.0.js"></script>
                <script>
                // 这里应该轮询授权认证结果
                // $('#qrCode').html('<img src="' + subject.images.large+'" />')


                </script>
            </body>
        </html>
    */
})

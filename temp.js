// var gen = function* (n){
// 	for(i = 0; i<3; i++){
// 		n++

// 		yield n
// 	}
// }

// var genObj = gen(2)

// console.log(genObj.next())
// console.log(genObj.next())
// console.log(genObj.next())
// console.log(genObj.next())
var Promise = require('bluebird')
var request = Promise.promisify(require('request'))

var getRawBody = require('raw-body')
var koa = require('koa');
var app = koa();

// // x-response-time
// // koa 的use就是将generator函数push到了中间件数组当中去了。
// app.use(function *(next){
//   var start = new Date;
//   // console.log('execute x-response-time before')
//   // console.log(next)
//   // console.log('before x-response-time, this.body is ',this.body)
//   var data1 = yield getRawBody(this.req, { length: this.length, limit: '1mb', encoding: this.charset})
//   yield next;
//   console.log('data1--->',data1.toString())
//   // console.log(next)
//   // console.log('after x-response-time, this.body is ',this.body)
//   var ms = new Date - start;
//   this.set('X-Response-Time', ms + 'ms');
//   // console.log('execute x-response-time after')
// });
//
// // logger
// app.use(function *(next){
//   var start = new Date;
//   console.log('execute log before')
//   console.log(next)
//   console.log('before logger this.body is', this.body)
//   yield next;
//   console.log(next)
//   console.log('after logger this.body is', this.body)
//   var ms = new Date - start;
//   console.log('execute log after %s %s - %s', this.method, this.url, ms);
// });

// response
app.use(function*(next) {
    console.log('before execute body')

    var form = {
        token: '',
        f: 'json',
        lang:'zh_CN',
        random: 0.10089162332890789,
        ajax:1,
        action: 'bindcomponent',
        appid: 'wx3a432d2dbe2442ce',
        scope: 'snsapi_contact',
        state: 0,
        redirect_uri: 'https://mp.weixin.qq.com',
        component_appid: 'wxb6fa0468346e9059',
        component_pre_auth_code: 'preauthcode@@@XnpPKhPCHvkoJxYhzIYjO3Q4zTqkYw3APU_vGYgWXdEPQwFVvt4xDieBQmbzKKvO',
        component_redirect_uri: 'http://101.200.159.232/callbackOfAuthWeixinOpen'
    }
    var url = 'https://mp.weixin.qq.com/safe/safeqrconnect'
    var response = yield new Promise(function(resolve, reject) {

        request({
          method:"POST",
          headers:{
            'content-type':'application/json'
          },
            url: url,
            body: 'token=&lang=zh_CN&f=json&ajax=1&random=0.10089162332890789&action=bindcomponent&appid=wx3a432d2dbe2442ce&scope=snsapi_contact&state=0&redirect_uri=https%3A%2F%2Fmp.weixin.qq.com&component_appid=wxb6fa0468346e9059&component_pre_auth_code=preauthcode%40%40%40XnpPKhPCHvkoJxYhzIYjO3Q4zTqkYw3APU_vGYgWXdEPQwFVvt4xDieBQmbzKKvO&component_redirect_uri=http%253A%252F%252F101.200.159.232%252FcallbackOfAuthWeixinOpen',
        }).then(function(response) {

          var result = JSON.parse(response.body)

            resolve('<img src=https://mp.weixin.qq.com/safe/safeqrcode?action=bindcomponent&uuid='+result.uuid+'></img>')
        }).error(function(err){
          console.log(err)

            resolve("body")
        })
    })
    this.body = response
        //console.log('after execute body', this.body)
});

app.listen(4000);
console.log('listen to 4000')

'use strict'

var Promise = require('bluebird')
var _ = require('lodash')
var request = Promise.promisify(require('request'))
var utils = require('./utils')
var fs = require('fs')
var urlencode = require('urlencode');
var path = require('path')
var verify_ticket_file = path.join(__dirname, './config/verify_ticket.txt')
var component_access_token_file = path.join(__dirname, './config/component_access_token.txt')

var prefix = 'https://api.weixin.qq.com/cgi-bin/'
var weixinOpenPrefix = 'https://api.weixin.qq.com/cgi-bin/component/'
var mpPrefix = 'https://mp.weixin.qq.com/cgi-bin/'
var semanticUrl = 'https://api.weixin.qq.com/semantic/semproxy/search?'
var api = {
    weixinOpenGongzhonghao: {
        componentAccessToken: weixinOpenPrefix + 'api_component_token',
        prePuthCode: weixinOpenPrefix + 'api_create_preauthcode?'
    },
    accessToken: prefix + 'token?grant_type=client_credential',
    temporary: {
        upload: prefix + 'media/upload?',
        fetch: prefix + 'media/get?'
    },
    permanent: {
        upload: prefix + 'material/add_material?',
        fetch: prefix + 'material/get_material?',
        uploadNews: prefix + 'material/add_news?',
        uploadNewsPic: prefix + 'media/uploadimg?',
        del: prefix + 'material/del_material?',
        update: prefix + 'material/update_news?',
        count: prefix + 'material/get_materialcount?',
        batch: prefix + 'material/batchget_material?'
    },
    tag: {
        create: prefix + 'tags/create?',
        get: prefix + 'tags/get?',
        getUserTags: prefix + 'tags/getidlist?',
        update: prefix + 'tags/update?',
        delete: prefix + 'tags/delete?'
    },
    user: {
        remark: prefix + 'user/info/updateremark?',
        getInfo: prefix + 'user/info?',
        batchGetInfo: prefix + 'user/info/batchget?',
        list: prefix + 'user/get?'
    },
    mass: {
        tag: prefix + 'message/mass/sendall?'
    },
    menu: {
        create: prefix + 'menu/create?',
        get: prefix + 'menu/get?',
        delete: prefix + 'menu/delete?',
        current: prefix + 'get_current_selfmenu_info?'
    },
    qrcode: {
        create: prefix + 'qrcode/create?',
        show: mpPrefix + 'showqrcode?'
    },
    shortUrl: {
        create: prefix + 'shorturl?'
    },
    semanticUrl: semanticUrl,
    ticket: {
        get: prefix + 'ticket/getticket?'
    },
    machine: {
        get: 'http://op.juhe.cn/robot/index?key=556571bcf91526652a257fc817a62b17&'
    }
}

function GongZhongHao(config) {
    this.appID = config.appID
    this.appSecret = config.appSecret
    this.getAccessToken = config.getAccessToken
    this.saveAccessToken = config.saveAccessToken
    this.getTicket = config.getTicket
    this.saveTicket = config.saveTicket
    this.fetchAccessToken()
}

GongZhongHao.prototype.fetchAccessToken = function() {
    var that = this
    return this.getAccessToken()
        .then(function(data) {
            try {
                data = JSON.parse(data)
            } catch (e) {
                return that.updateAccessToken()
            }

            if (that.isValidAccessToken(data)) {
                return Promise.resolve(data)
            } else {
                return that.updateAccessToken()
            }
        })
        .then(function(data) {
            that.saveAccessToken(data)
            return Promise.resolve(data)
        })
}

GongZhongHao.prototype.isValidAccessToken = function(data) {
    if (!data || !data.access_token || !data.expires_in) {
        return false
    }
    var access_token = data.access_token
    var expires_in = data.expires_in
    var now = (new Date().getTime())

    if (now < expires_in) {
        return true
    } else {
        return false
    }
}

GongZhongHao.prototype.updateAccessToken = function() {
    var appID = this.appID
    var appSecret = this.appSecret
    var url = api.accessToken + '&appid=' + appID + '&secret=' + appSecret
    console.log('tokenurl---', url)
    return new Promise(function(resolve, reject) {
        request({
            url: url,
            json: true
        }).then(function(response) {
            console.log('token-response', response.body)
            var data = response.body
            var now = (new Date().getTime())
            console.log('now----', now)
            var expires_in = now + (data.expires_in - 20) * 1000
            console.log('data.expires_in----', data.expires_in)
            console.log('expires_in----', expires_in)
            data.expires_in = expires_in
            resolve(data)

        })

    })
}

GongZhongHao.prototype.fetchTicket = function(access_token) {
    var that = this

    return this.getTicket()
        .then(function(data) {
            try {
                data = JSON.parse(data)
            } catch (e) {
                return that.updateTicket(access_token)
            }

            if (that.isValidTicket(data)) {
                return Promise.resolve(data)
            } else {
                return that.updateTicket(access_token)
            }
        })
        .then(function(data) {
            that.saveTicket(data)
            return Promise.resolve(data)
        })
}

GongZhongHao.prototype.isValidTicket = function(data) {
    if (!data || !data.ticket || !data.expires_in) {
        return false
    }

    var ticket = data.ticket
    var expires_in = data.expires_in
    var now = (new Date().getTime())

    if (ticket && now < expires_in) {
        return true
    } else {
        return false
    }
}

GongZhongHao.prototype.updateTicket = function(access_token) {
    var url = api.ticket.get + '&access_token=' + access_token + '&type=jsapi'
    return new Promise(function(resolve, reject) {
        request({
            url: url,
            json: true
        }).then(function(response) {
            var data = response.body
            var now = (new Date().getTime())
            var expires_in = now + (data.expires_in - 20) * 1000
            data.expires_in = expires_in
            resolve(data)

        })

    })
}

GongZhongHao.prototype.authWeixinOpen = function(config) {

    return new Promise(function(resolve, reject) {
        utils.readFileAsync(verify_ticket_file, 'utf-8').then(function(content) {
            console.log('read verify tcket is: ', content)
            var form = {
                component_appid: config.weixinOpenGongzhonghao.appID,
                component_appsecret: config.weixinOpenGongzhonghao.appSecret,
                component_verify_ticket: content
            }
            var url = api.weixinOpenGongzhonghao.componentAccessToken
            request({
                method: 'POST',
                url: url,
                body: form,
                json: true
            }).then(function(response) {
                var body = response.body
                utils.writeFileAsync(component_access_token_file, body.component_access_token)
                console.log('component access token is: ', body.component_access_token)
                var form2 = {
                    component_appid: config.weixinOpenGongzhonghao.appID
                }
                var url2 = api.weixinOpenGongzhonghao.prePuthCode + 'component_access_token=' + body.component_access_token
                request({
                    method: 'POST',
                    url: url2,
                    body: form2,
                    json: true
                }).then(function(response) {
                    var pre_auth_code = response.body.pre_auth_code
                    console.log('pre auth code is: ', pre_auth_code)
                    // 生成二维码请求url
                    var body = 'token=&lang=zh_CN&f=json&ajax=1'+'&random='+Math.random()+'&action=bindcomponent&appid=wx3a432d2dbe2442ce&scope=snsapi_contact&state=0&redirect_uri=https%3A%2F%2Fmp.weixin.qq.com&component_appid=wxb6fa0468346e9059'
                              + '&component_pre_auth_code='+ pre_auth_code +'&component_redirect_uri=http%253A%252F%252F101.200.159.232%252FcallbackOfAuthWeixinOpen'
                    request({
                        method: 'POST',
                        url: 'https://mp.weixin.qq.com/safe/safeqrconnect',
                        body: 'token=&lang=zh_CN&f=json&ajax=1&random=0.10089162332890789&action=bindcomponent&appid=wx3a432d2dbe2442ce&scope=snsapi_contact&state=0&redirect_uri=https%3A%2F%2Fmp.weixin.qq.com&component_appid=wxb6fa0468346e9059&component_pre_auth_code=preauthcode@@@vpPmma2N5o-7uuLfDCW0kG3b5ASw7tT7POdW6AdFKO068B9KI9PV3oOoEk7QHgBn&component_redirect_uri=http%253A%252F%252F101.200.159.232%252FcallbackOfAuthWeixinOpen',
                        //body: body,
                        json: true
                    }).then(function(response) {
                        var result = response.body
                        resolve('<img src=https://mp.weixin.qq.com/safe/safeqrcode?action=bindcomponent&uuid=' + result.uuid + '></img>')
                    }).error(function(err) {
                        reject(err)
                    })

                    // var redirect = 'http://101.200.159.232/callbackOfAuthWeixinOpen'
                    // var htmlSource = '<a href="https://mp.weixin.qq.com/cgi-bin/componentloginpage?component_appid=' + config.weixinOpenGongzhonghao.appID + '&pre_auth_code=' + body.pre_auth_code + '&redirect_uri=' + redirect + '">' + '点击授权</a>'
                    // var htmlSource = 'https://mp.weixin.qq.com/cgi-bin/componentloginpage?component_appid=' + config.weixinOpenGongzhonghao.appID + '&'+'pre_auth_code=' + body.pre_auth_code + '&'+'redirect_uri=' + redirect
                    // resolve(htmlSource)
                }).catch(function(err) {
                    reject(err)
                })
            })
        })

    })
}


GongZhongHao.prototype.talkToMachine = function(talk) {
    var that = this
    return new Promise(function(resolve, reject) {
        //var url = api.machine.get + 'info=' + talk

        //'http://op.juhe.cn/robot/index?key=556571bcf91526652a257fc817a62b17&'
        // 中文要urlencode
        var encodetalk = urlencode(talk)
        var url = 'http://op.juhe.cn/robot/index?info=' + encodetalk + '&key=556571bcf91526652a257fc817a62b17'

        console.log('machine url --------', url)
        console.log('after encode--------', encodetalk)
        request({
            method: 'POST',
            url: url,
            json: true
        }).then(function(response) {
            var _data = response.body
            console.log(JSON.stringify(_data))
            if (_data) {
                if (_data.result) {
                    resolve(_data.result.text)
                } else {
                    resolve('服务不稳定')
                }

            } else {
                throw new Error('talkToMachine failed')
            }

        }).catch(function(err) {
            reject(err)
        })
    })
}

GongZhongHao.prototype.uploadMaterial = function(type, material, permanent) {
    var that = this
    var form = {}
    var uploadUrl = api.temporary.upload

    if (permanent) {
        uploadUrl = api.permanent.upload
        _.extend(form, permanent)
    }

    if (type === 'pic') {
        uploadUrl = api.permanent.uploadNewsPic
    }

    if (type === 'news') {
        uploadUrl = api.permanent.uploadNews
        form = material
    } else {
        form.media = fs.createReadStream(material)
    }

    // var appID = this.appID
    // var appSecret = this.appSecret
    // console.log('tokenurl---', url)

    return new Promise(function(resolve, reject) {
        //var that = this
        console.log('==========', that.fetchAccessToken())
        that.fetchAccessToken()
            .then(function(data) {
                var url = uploadUrl + 'access_token=' + data.access_token
                if (!permanent) {
                    url += '&type=' + type
                } else {
                    form.access_token = data.access_token
                }

                var options = {
                    method: 'POST',
                    url: url,
                    json: true
                }

                if (type === 'news') {
                    options.body = form
                } else {
                    options.formData = form
                }

                request(options).then(function(response) {
                    console.log('token-response', response.body)
                    var _data = response.body

                    if (_data) {
                        resolve(_data)
                    } else {
                        throw new Error('Upload material failed')
                    }

                }).catch(function(err) {
                    reject(err)
                })

            })

    })
}

GongZhongHao.prototype.fetchMaterial = function(mediaId, type, permanent) {
    var that = this
    var fetchUrl = api.temporary.fetch

    if (permanent) {
        fetchUrl = api.permanent.fetch
    }

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = fetchUrl + 'access_token=' + data.access_token
                var form = {}
                var options = {
                    method: 'POST',
                    url: url,
                    json: true
                }
                if (permanent) {
                    form.media_id = mediaId,
                        form.access_token = data.access_token
                    options.body = form
                } else {
                    if (type === 'video') {
                        url = url.replace('https://', 'http://')
                    }
                    url += '&media_id=' + mediaId
                }

                if (type === 'news' || type === 'video') {
                    request(options).then(function(response) {
                        var _data = response.body

                        if (_data) {
                            resolve(_data)
                        } else {
                            throw new Error('fetch material failed')
                        }

                    }).catch(function(err) {
                        reject(err)
                    })
                } else {
                    resolve(url)
                }

            })

    })
}

GongZhongHao.prototype.deleteMaterial = function(mediaId) {
    var that = this
    var form = {
        media_id: mediaId
    }

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.permanent.del + 'access_token=' + data.access_token +
                    '&media_id=' + mediaId

                request({
                    method: 'POST',
                    url: url,
                    body: form,
                    json: true
                }).then(function(response) {
                    var _data = response.body

                    if (_data) {
                        resolve(_data)
                    } else {
                        throw new Error('Delete material failed')
                    }

                }).catch(function(err) {
                    reject(err)
                })
            })
    })
}

GongZhongHao.prototype.updateMaterial = function(mediaId, news) {
    var that = this
    var form = {
        media_id: mediaId
    }

    _.extend(form, news)

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.permanent.update + 'access_token=' + data.access_token +
                    '&media_id=' + mediaId

                request({
                    method: 'POST',
                    url: url,
                    body: form,
                    json: true
                }).then(function(response) {
                    var _data = response.body

                    if (_data) {
                        resolve(_data)
                    } else {
                        throw new Error('Delete material failed')
                    }

                }).catch(function(err) {
                    reject(err)
                })
            })
    })
}

GongZhongHao.prototype.countMaterial = function() {
    var that = this

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.permanent.count + 'access_token=' + data.access_token

                request({
                    method: 'GET',
                    url: url,
                    json: true
                }).then(function(response) {
                    var _data = response.body

                    if (_data) {
                        resolve(_data)
                    } else {
                        throw new Error('Count material failed')
                    }

                }).catch(function(err) {
                    reject(err)
                })
            })
    })
}

GongZhongHao.prototype.batchMaterial = function(options) {
    var that = this

    options.type = options.type || 'image'
    options.offset = options.offset || 0
    options.count = options.count || 1



    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.permanent.batch + 'access_token=' + data.access_token

                request({
                        method: 'POST',
                        url: url,
                        body: options,
                        json: true
                    })
                    .then(function(response) {
                        var _data = response.body

                        if (_data) {
                            resolve(_data)
                        } else {
                            throw new Error('Batch material failed')
                        }

                    }).catch(function(err) {
                        reject(err)
                    })
            })
    })
}

GongZhongHao.prototype.createTag = function(name) {
    var that = this

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.tag.create + 'access_token=' + data.access_token

                var options = {
                    tag: {
                        name: name
                    }
                }

                request({
                        method: 'POST',
                        url: url,
                        body: options,
                        json: true
                    })
                    .then(function(response) {
                        var _data = response.body
                        if (_data) {
                            resolve(_data)
                        } else {
                            throw new Error('Create Tag failed')
                        }
                    }).catch(function(err) {
                        reject(err)
                    })
            })
    })
}

GongZhongHao.prototype.getTags = function() {
    var that = this

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.tag.get + 'access_token=' + data.access_token

                request({
                        url: url,
                        json: true
                    })
                    .then(function(response) {
                        var _data = response.body
                        if (_data) {
                            resolve(_data)
                        } else {
                            throw new Error('Get Tag failed')
                        }
                    }).catch(function(err) {
                        reject(err)
                    })
            })
    })
}

GongZhongHao.prototype.getUserTags = function(userOpenid) {
    var that = this

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.tag.getUserTags + 'access_token=' + data.access_token

                var options = {
                    openid: userOpenid
                }

                request({
                        method: 'POST',
                        url: url,
                        body: options,
                        json: true
                    })
                    .then(function(response) {
                        var _data = response.body
                        if (_data) {
                            resolve(_data)
                        } else {
                            throw new Error('Get User Tags failed')
                        }
                    }).catch(function(err) {
                        reject(err)
                    })
            })
    })
}

GongZhongHao.prototype.updateTag = function(id, name) {
    var that = this

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.tag.update + 'access_token=' + data.access_token

                var options = {
                    tag: {
                        id: id,
                        name: name
                    }
                }

                request({
                        method: 'POST',
                        url: url,
                        body: options,
                        json: true
                    })
                    .then(function(response) {
                        var _data = response.body
                        if (_data) {
                            resolve(_data)
                        } else {
                            throw new Error('Update Tag failed')
                        }
                    }).catch(function(err) {
                        reject(err)
                    })
            })
    })
}

GongZhongHao.prototype.deleteTag = function(id) {
    var that = this

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.tag.delete + 'access_token=' + data.access_token

                var options = {
                    tag: {
                        id: id
                    }
                }

                request({
                        method: 'POST',
                        url: url,
                        body: options,
                        json: true
                    })
                    .then(function(response) {
                        var _data = response.body
                        if (_data) {
                            resolve(_data)
                        } else {
                            throw new Error('Delete Tag failed')
                        }
                    }).catch(function(err) {
                        reject(err)
                    })
            })
    })
}

GongZhongHao.prototype.remarkUser = function(userOpenid, remark) {
    var that = this

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.user.remark + 'access_token=' + data.access_token

                var options = {
                    openid: userOpenid,
                    remark: remark
                }

                request({
                        method: 'POST',
                        url: url,
                        body: options,
                        json: true
                    })
                    .then(function(response) {
                        var _data = response.body
                        if (_data) {
                            resolve(_data)
                        } else {
                            throw new Error('Remark user  failed')
                        }
                    }).catch(function(err) {
                        reject(err)
                    })
            })
    })
}

GongZhongHao.prototype.getUsers = function(userOpenids, lang) {
    var that = this
    lang = lang || 'zh_CN'
    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var options = {
                    json: true
                }
                if (_.isArray(userOpenids)) {
                    options.url = api.user.batchGetInfo + 'access_token=' + data.access_token
                    options.body = {
                        user_list: userOpenids
                    }
                    options.method = 'POST'
                } else {
                    options.url = api.user.getInfo + 'access_token=' + data.access_token +
                        '&openid=' + userOpenids + '&lang=' + lang
                }

                request(options)
                    .then(function(response) {
                        var _data = response.body
                        if (_data) {
                            resolve(_data)
                        } else {
                            throw new Error('getUsers failed')
                        }
                    }).catch(function(err) {
                        reject(err)
                    })
            })
    })
}

GongZhongHao.prototype.listUsers = function(userOpenid) {
    var that = this

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.user.list + 'access_token=' + data.access_token

                if (userOpenid) {
                    url += '&next_openid=' + userOpenid
                }

                request({
                        method: 'GET',
                        url: url,
                        json: true
                    })
                    .then(function(response) {
                        var _data = response.body
                        if (_data) {
                            resolve(_data)
                        } else {
                            throw new Error('listUsers failed')
                        }
                    }).catch(function(err) {
                        reject(err)
                    })
            })
    })
}

GongZhongHao.prototype.sendByTag = function(type, message, tagId) {
    var that = this
    var msg = {
        filter: {},
        msgtype: type
    }

    msg[type] = type

    if (!tagId) {
        msg.filter.is_to_all = true
    } else {
        msg.filter = {
            is_to_all: false,
            tag_id: tagId
        }
    }

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.mass.tag + 'access_token=' + data.access_token

                request({
                        method: 'POST',
                        url: url,
                        body: msg,
                        json: true
                    })
                    .then(function(response) {
                        var _data = response.body
                        if (_data) {
                            resolve(_data)
                        } else {
                            throw new Error('sendByTag failed')
                        }
                    }).catch(function(err) {
                        reject(err)
                    })
            })
    })
}

GongZhongHao.prototype.createMenu = function(menu) {
    var that = this

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.menu.create + 'access_token=' + data.access_token

                request({
                        method: 'POST',
                        url: url,
                        body: menu,
                        json: true
                    })
                    .then(function(response) {
                        var _data = response.body
                        if (_data) {
                            resolve(_data)
                        } else {
                            throw new Error('Create menu failed')
                        }
                    }).catch(function(err) {
                        reject(err)
                    })
            })
    })
}

GongZhongHao.prototype.getMenu = function() {
    var that = this

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.menu.get + 'access_token=' + data.access_token

                request({
                        method: 'GET',
                        url: url,
                        json: true
                    })
                    .then(function(response) {
                        var _data = response.body
                        if (_data) {
                            resolve(_data)
                        } else {
                            throw new Error('Get menu failed')
                        }
                    }).catch(function(err) {
                        reject(err)
                    })
            })
    })
}

GongZhongHao.prototype.deleteMenu = function() {
    var that = this
    console.log('============', that)
    console.log('ready to deleteMenu', this.fetchAccessToken())

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.menu.delete + 'access_token=' + data.access_token

                request({
                        method: 'GET',
                        url: url,
                        json: true
                    })
                    .then(function(response) {
                        console.log('delete menu success!!!')
                        var _data = response.body
                        if (_data) {
                            resolve(_data)
                        } else {
                            throw new Error('Delete menu failed')
                        }
                    }).catch(function(err) {
                        reject(err)
                    })
            })
    })
}

GongZhongHao.prototype.getCurrentMenu = function() {
    var that = this
    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.menu.current + 'access_token=' + data.access_token

                request({
                        method: 'GET',
                        url: url,
                        json: true
                    })
                    .then(function(response) {
                        var _data = response.body
                        if (_data) {
                            resolve(_data)
                        } else {
                            throw new Error('Get current menu failed')
                        }
                    }).catch(function(err) {
                        reject(err)
                    })
            })
    })
}

GongZhongHao.prototype.createQrcode = function(qr) {
    var that = this

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.qrcode.create + 'access_token=' + data.access_token

                request({
                        method: 'POST',
                        url: url,
                        body: qr,
                        json: true
                    })
                    .then(function(response) {
                        var _data = response.body
                        if (_data) {
                            resolve(_data)
                        } else {
                            throw new Error('Create qrcode failed')
                        }
                    }).catch(function(err) {
                        reject(err)
                    })
            })
    })
}

GongZhongHao.prototype.showQrcode = function(ticket) {
    return api.qrcode.show + 'ticket=' + encodeURI(ticket)
}

GongZhongHao.prototype.createShorturl = function(action, url) {
    action = action || 'long2short'

    var that = this
    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.shortUrl.create + 'access_token=' + data.access_token

                var form = {
                    action: action,
                    long_url: url
                }

                request({
                        method: 'POST',
                        url: url,
                        body: qr,
                        json: true
                    })
                    .then(function(response) {
                        var _data = response.body
                        if (_data) {
                            resolve(_data)
                        } else {
                            throw new Error('Create shorturl failed')
                        }
                    }).catch(function(err) {
                        reject(err)
                    })
            })
    })
}

GongZhongHao.prototype.semantic = function(semanticData) {
    var that = this

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.semanticUrl + 'access_token=' + data.access_token

                semanticData.appid = data.appID
                request({
                        method: 'POST',
                        url: url,
                        body: semanticData,
                        json: true
                    })
                    .then(function(response) {
                        var _data = response.body
                        if (_data) {
                            resolve(_data)
                        } else {
                            throw new Error('semantic failed')
                        }
                    }).catch(function(err) {
                        reject(err)
                    })
            })
    })
}

GongZhongHao.prototype.send = function() {
    var content = this.body
    var message = this.weixin
    console.log('send-------content', content)
    console.log('send-------message', message)

    var xml = utils.tpl(content, message)

    console.log('after compiled content--------',xml)

    this.status = 200
    this.type = 'application/xml'
    this.body = xml
}

module.exports = GongZhongHao

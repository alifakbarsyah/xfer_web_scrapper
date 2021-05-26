'use strict'

const { pathExists } = require('fs-extra')

let fn = (fw, rootpath, basepath) => {
    const path = require('path')
    const fetch = require('node-fetch')
    const lodash = require('lodash')
    var fs = require('graceful-fs')
    const fn = {}

    // attach rootpath and basepath
    fn.rootpath = rootpath
    fn.basepath = basepath

    // set main router
    fn.router = (param) => {
        const router = require('express').Router()

        param(fn, router)

        fw.use(router)
    }

    // require a route file
    fn.route = (routeName, authController) => {
        let routes = require(path.normalize(rootpath + '/' + basepath + '/routes/' + routeName.toLowerCase() + '.js'))

        const router = require('express').Router()

        let routing = routes(fn)
        routing.forEach((el) => {

            let argsArray = []
            //push route path
            argsArray.push(el.route)

            //looping inits
            //middleware that will be execute before auth checking
            for(let i = 0, len = el.inits.length; i < len; i++) {
                argsArray.push(el.inits[i])
            }

            //add auth checker middleware if auth == true
            if(el.auth == 'yes') {
                argsArray.push(authController.checkToken)
            }

            //looping middlewares
            for(let i = 0, len = el.middlewares.length; i < len; i++) {
                argsArray.push(el.middlewares[i])
            }
            router[el.method].apply(router, argsArray)
        })

        return router
    }

    // require a controller file
    fn.controller = (filename) => require(path.normalize(rootpath + '/' + basepath + '/controllers/' + filename.toLowerCase() + '.js'))(rootpath)

    // set global lib function on framework request object
    global.loadLib = (filename) => require(path.normalize(rootpath + '/' + basepath + '/libs/' + filename.toLowerCase() + '.js'))(rootpath)


    // set global message by code
    //keep it commented for future plan (if needed)
    global.getMessage = (code, lang = 'en', replacement) => {
        let langfile = path.normalize(rootpath + '/' + basepath + '/lang/' + lang + '.json')
        let langdefault = path.normalize(rootpath + '/' + basepath + '/lang/en.json')
        if (fs.existsSync(langfile)) { 
            let langId = require(path.normalize(rootpath + '/' + basepath + '/lang/' + lang + '.json'))
            let objMessage = {
                "code": code,
                "message": code
            }
            let msgId = langId.filter((row) => row[code] !== undefined).map((row) => row[code]).toString()

            // replace with regex
            if(typeof replacement === 'string') {
                msgEn = msgEn.replace(/%s/ig, replacement)
            }else if(typeof replacement === 'object') {
                for(let i = 0, len = replacement.length; i < len; i++) {
                    msgId = msgId.replace(/%s/i, replacement[i])
                }
            }

            objMessage.message = msgId != '' ? msgId : code
            return objMessage

        } else {
            let langId = require(langdefault)
            let objMessage = {
                "code": code,
                "message": code
            }
            let msgId = langId.filter((row) => row[code] !== undefined).map((row) => row[code]).toString()

            // replace with regex
            if(typeof replacement === 'string') {
                msgEn = msgEn.replace(/%s/ig, replacement)
            }else if(typeof replacement === 'object') {
                for(let i = 0, len = replacement.length; i < len; i++) {
                    msgId = msgId.replace(/%s/i, replacement[i])
                }
            }
            objMessage.message = msgId != '' ? msgId : code
            return objMessage
        }
       
    }

    // set function isEmpty
    global.isEmpty = (data) => {
        for (let item in data) {
            return false
        }
        return true
    }

    // set function isJson
    global.isJson = (data) => {
        try {
            JSON.parse(data)
            return true
        } catch(e) {
            return false
        }
    }

    // set logger
    global.myLogger = require('./logger.js')("logs/app.log", 'foreapi', 50000000, 10, 'trace');

    // get request http
    global.request = async (data) => {
        let url = data.url
        let options = data
        // delete options['url'];
        let res = await fn.fetchReq(url, options)
        if(parseInt(res.res.status) < 300 && parseInt(res.res.status) >= 200) { // dibawah 300 dan diatas/sama dengan 200
            return res.result
        }else {
            let err = ''
            if (typeof res.result === "object") {
                err = {
                    "http_code": res.res.status,
                    "error": res.result
                } 
            } else {
                err = {
                    "http_code": res.res.status,
                    "error": {
                        "statusCode":res.res.status,
                        "message":res.res.statusText,
                        "body":res.res.statusText
                    }
                }
            }
            throw err

        }
    }

    global.camelizeKeys = (obj) => {
      if (!lodash.isObject(obj)) {
        return obj;
      } 
      else if (lodash.isArray(obj)) {
        return obj.map((v) => camelizeKeys(v));
      }

      if (obj === 0 || obj === null || obj === undefined || obj === false) { return obj; } 
      
      return lodash.reduce(obj, (r, v, k) => {
        return { 
          ...r, 
          [lodash.camelCase(k)]: camelizeKeys(v) 
        };
      }, {});
    };      

    // set fetch request http
    fn.fetchReq = async (url, options) => {
        let response = await fetch(url, options).then(async (res)=>{
            let result
            try{
                result = await res.json()
            } catch(e){
                result = ''
            }
            let data = {res, result}
            return data
        })
        return response
    }

    return fn
}

module.exports = fn

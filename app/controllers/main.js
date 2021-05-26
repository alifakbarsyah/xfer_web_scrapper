"use strict"
let obj = (rootpath) => {
    const fn = {}

    fn.index = (req, res, next) => {
        try{
            // statusCode refer to this https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
            // res.error(getMessage('err001'), 401)
            // throw getMessage('err001')
            res.success(getMessage('success'))
        }catch(e) {next(e)}
    }

    return fn
}

module.exports = obj
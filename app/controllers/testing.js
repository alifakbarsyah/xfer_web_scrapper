"use strict"
let obj = (rootpath) => {
    let fn = {}
    let moment = require('moment')

    fn.getDetail = async (req, res, next) => {
        try{
            let test_id = parseInt(req.params.test_id) || 0

            // validate test_id must be greater than 1
            if(test_id <= 0) {
                throw getMessage('tst001')
            }

            let result = await req.model('testing').getTesting(test_id)

            // validate result
            if(isEmpty(result)) {
                throw getMessage('tst001')
            }
            res.success(result)
        }catch(e) {next(e)}
    }

    fn.getAll = async (req, res, next) => {
        try{
            let data = []
            let keyword = req.query.keyword || ''

            // initialize variable
            let where = " AND test_name LIKE ? "
            data.push("%" + keyword + "%")
            let order = " test_name ASC "

            let result = await req.model('testing').getAllTesting(where, data, order)
            res.success(result)
        }catch(e) {next(e)}
    }

    fn.getPaging = async (req, res, next) => {
        try{
            let data = []
            let keyword = req.query.keyword || ''
            let page = req.query.page || 1
            let perpage = req.query.perpage || 20

            // initialize variable
            let where = " AND test_name LIKE ? "
            data.push("%" + keyword + "%")
            let order = " test_name ASC "

            let result = await req.model('testing').getPagingTesting(where, data, order, page, perpage)
            res.success(result)
        }catch(e) {next(e)}
    }

    fn.create = async (req, res, next) => {
        try{
            // initialize variable
            let validator = require('validator')
            let data = {
                test_name: (req.body.test_name || '').trim(),
                test_type: (req.body.test_type == 'member' ? 'member' : 'vip').trim(),
                created_date: moment().format('YYYY-MM-DD HH:mm:ss')
            }

            // validate test_id must be greater than 1
            if(validator.isEmpty(data.test_name)) {
                throw getMessage('tst002')
            }

            // insert data & get detail
            let test_id = await req.model('testing').insertTesting(data)
            let result = await req.model('testing').getTesting(test_id)

            res.success(result)
        }catch(e) {next(e)}
    }

    fn.update = async (req, res, next) => {
        try{
            let validator = require('validator')

            // initialize variable
            let test_id = parseInt(req.params.test_id) || 0
            let data = {
                test_name: (req.body.test_name || '').trim(),
                test_type: (req.body.test_type == 'member' ? 'member' : 'vip').trim(),
                updated_date: moment().format('YYYY-MM-DD HH:mm:ss')
            }

            // validate test_id must be greater than 1
            if(test_id <= 0) {
                throw getMessage('tst001')
            }

            // validate test_id must be greater than 1
            if(validator.isEmpty(data.test_name)) {
                throw getMessage('tst002')
            }

            // get detail testing
            let detail = await req.model('testing').getTesting(test_id)

            // validate result
            if(isEmpty(detail)) {
                throw getMessage('tst001')
            }

            // insert data & get detail
            await req.model('testing').transTesting(test_id, data)

            // get detail testing
            detail = await req.model('testing').getTesting(test_id)

            res.success(detail)
        }catch(e) {next(e)}
    }

    fn.delete = async (req, res, next) => {
        try{
            let test_id = parseInt(req.params.test_id) || 0

            // validate test_id must be greater than 1
            if(test_id <= 0) {
                throw getMessage('tst001')
            }

            let result = await req.model('testing').getTesting(test_id)

            // validate result
            if(isEmpty(result)) {
                throw getMessage('tst001')
            }

            // insert data & get detail
            await req.model('testing').deleteTesting(test_id)

            res.success(getMessage('tst003', [test_id]))
        }catch(e) {next(e)}
    }

    return fn
}

module.exports = obj
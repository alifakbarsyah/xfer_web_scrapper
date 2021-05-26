'use strict'

let obj = (objDB, db, rootpath) => {

    const tbl = require(rootpath + "/config/tables.json")
    const fn = {}

    fn.getTesting = async (id) => {


        // prepare sql query
        let sql = "SELECT * FROM " + tbl.testing + " WHERE test_id = ? LIMIT 1"

        let [row] = await db.query(sql, [id])
        return row
    }

    fn.getAllTesting = async (where = '', data = [], order = '', limit = 0) => {


        // if order is empty than set default order-by
        let orderby = order ? order : " test_id ASC "

        // prepare sql query
        let sql = "SELECT * FROM " + tbl.testing + " WHERE 1=1 " + where + " ORDER BY " + orderby

        // if limit greater than 0 set the limit
        if(parseInt(limit) > 0) {
            data.push(limit)
            sql += " LIMIT ? "
        }
        return await db.query(sql, data)
    }

    fn.getPagingTesting = async (where = '', data = [], order = '', page = 1, perpage = 20) => {


        page = parseInt(page) <= 0 ? 1 : parseInt(page)
        perpage = parseInt(perpage) <= 0 ? 20 : parseInt(perpage)
        let last_row = perpage * page
        let first_row = last_row - perpage

        // if order is empty than set default order-by
        let orderby = order ? order : " test_id ASC "

        // prepare sql query
        let sql = "SELECT * FROM " + tbl.testing + " WHERE 1=1 " + where + " ORDER BY " + orderby
        let query = await db.query(sql, data)
        let total_row = query.length

        data.push(perpage)
        data.push(first_row > total_row ? total_row : first_row)
        sql += " LIMIT ? OFFSET ? "
        query = await db.query(sql, data)

        let result = {
            "data": query,
            "total_row": total_row,
            "perpage": perpage
        }
        return result
    }

    fn.insertTesting = async (data) => {
        let res = await objDB.insert(db, tbl.testing, data)
        return res.insertId
    }

    fn.updateTesting = async (id, data) => {
        let where = {"cond": "test_id = ?", "bind": [id]}
        return await objDB.update(db, tbl.testing, where, data)
    }

    fn.deleteTesting = async (id) => {
        let where = {"cond": "test_id = ?", "bind": [id]}
        return await objDB.delete(db, tbl.testing, where)
    }

    fn.transTesting = async (id, data) => {
        /*
        note :
        CASE #1
        1. update data testing di postman dengan id 5
        2. jalankan query berikut di phpmyadmin
            UPDATE `testing` SET `test_name` = CONCAT(`test_name`, 777) WHERE `testing`.`test_id` = 5;
        3. query no 2 akan di jalankan setelah no 1 selesai di postman

        CASE #2
        1. update data testing di postman dengan id 3
        2. jalankan query berikut di phpmyadmin
            UPDATE `testing` SET `test_name` = CONCAT(`test_name`, 777) WHERE `testing`.`test_id` = 5;
        3. query no 2 akan langsung di execute sebelum no 1 selesai

        CASE #3
        1. update data testing di postman dengan id 3
        2. buka new tab & update data testing di postman dengan id 4
        3. data no 1 & 2 seharusnya tidak ada yang berubah
        */

        const sleep = require('util').promisify(setTimeout)
        await db.beginTransaction()
        try{
            await fn.updateTesting(id, data)
            let detail = await fn.getTesting(id)
            console.log('====== UPDATE DETAIL ======', JSON.stringify(detail))
            await sleep(10000)
            await fn.updateTesting(id, {"test_name": "otten"})
            detail = await fn.getTesting(id)
            console.log('====== UPDATE DETAIL ======', JSON.stringify(detail))
            await sleep(10000)
            throw getMessage('tst001')

            await db.commit()
        }catch(e) {
            await db.rollback()
            throw e
        }
    }
    return fn;
}

module.exports = obj

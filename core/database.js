let mysql = require("promise-mysql")
let pool
let dbx = (rootpath) => {
    let config = require(rootpath + "/config/config.json")
    const db = {}
    let configDB = config[ENV]
    db.getPool = async () => {
        if (pool) {
            return pool
        }
        pool = await mysql.createPool({
            connectionLimit : 500,
            host: configDB.host,
            user: configDB.username,
            password: configDB.password,
            database: configDB.database,
            timezone: 'SYSTEM',
            timeout: 5,
            debug: ENV === 'development' ? ['ComQueryPacket'] : false
        })
        return pool
    }

    db.getConnection = async () => {
        let conn = await db.getPool()
        conn = await conn.getConnection()
        return conn
    }

    db.getAll = async (conn, sql, data, limit) => {
        // if limit greater than 0 set the limit
        if(parseInt(limit) > 0) {
            data.push(limit)
            sql += " LIMIT ? "
        }

        let query = await conn.query(sql, data)
        return await camelizeKeys(query)
    }

    db.getPaging = async (conn, sql, data, order_what, order_by, page_no, no_per_page) => {
        let query = await conn.query(sql, data)
        let total_row = query.length
        let last_row = no_per_page * page_no
        let first_row = last_row - no_per_page
        let total_page = Math.ceil(total_row / no_per_page)

        data.push(no_per_page)
        data.push(first_row > total_row ? total_row : first_row)
        sql += " LIMIT ? OFFSET ? "
        query = await conn.query(sql, data)

        return {
            'result': await camelizeKeys(query),
            'itemCount': total_row,
            'pageCount': total_page,
            'pageNo': page_no,
            'pageSize': no_per_page,
            "sortBy": order_what,
            "sortDirection": order_by
        }

    }

    db.insert = async (conn, tblname, data) => {
        // validate data
        if(typeof data !== 'object') {
            throw getMessage('dbins001')
        }

        // prepare var
        let cols = ""
        let vals = ""
        let binding = []
        for (let prop in data) {
            if (!data.hasOwnProperty(prop)) {
                //The current property is not a direct property of p
                continue
            }
            cols += prop + ","
            vals += "?,"
            binding.push(data[prop])
        }
        if(cols == '' || vals == '') {
            throw getMessage('dbins002')
        }else{
            cols = cols.slice(0, -1)
            vals = vals.slice(0, -1)
        }

        let sql = "INSERT INTO " + tblname + "(" + cols + ") VALUES (" + vals + ")"
        return await conn.query(sql, binding)
    }


    db.update = async (conn, tblname, where, data) => {
        // validate data
        if(typeof data !== 'object') {
            throw getMessage('dbupd001')
        }
        if(typeof where !== 'object') {
            throw getMessage('dbupd002')
        }else if(where.cond === undefined) {
            throw getMessage('dbupd003')
        }else if(where.cond == '') {
            throw getMessage('dbupd004')
        }


        // prepare var
        let setcond = ""
        let binding = []
        for (let prop in data) {
            if (!data.hasOwnProperty(prop)) {
                //The current property is not a direct property of p
                continue
            }
            setcond += prop + " = ?,"
            binding.push(data[prop])
        }
        if(setcond == '') {
            throw getMessage('dbupd005')
        }else{
            setcond = setcond.slice(0, -1)
        }

        //let where = {"cond": "test_id = ? ", "bind": [id]}
        if(where.bind !== undefined && typeof where.bind == 'object') {
            for(let i = 0, len = where.bind.length; i < len; i++) {
                binding.push(where.bind[i])
            }
        }

        let sql = "UPDATE " + tblname + " SET " + setcond + " WHERE " + where.cond
        return await conn.query(sql, binding)
    }


    db.delete = async (conn, tblname, where) => {
        // validate data
        if(typeof where !== 'object') {
            throw getMessage('dbdel001')
        }else if(where.cond === undefined) {
            throw getMessage('dbdel002')
        }else if(where.cond == '') {
            throw getMessage('dbdel003')
        }

        let binding = []
        //let where = {"cond": "test_id = ? ", "bind": [id]}
        if(where.bind !== undefined && typeof where.bind == 'object') {
            for(let i = 0, len = where.bind.length; i < len; i++) {
                binding.push(where.bind[i])
            }
        }

        let sql = "DELETE FROM " + tblname + " WHERE " + where.cond
        return await conn.query(sql, binding)
    }
    return db
}

module.exports = dbx
